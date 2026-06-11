import asyncio
import os
import httpx
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import anthropic
from supabase import create_client

from core.auth import get_business_id

router = APIRouter()

CLAUDE_MODEL = "claude-sonnet-4-6"

# Mensajes máximos por día según el tier del Business Portfolio en Meta.
# Tier 0 = sin verificación (250), luego 1k / 10k / 100k / ilimitado.
_TIER_LIMITS: dict[int, int] = {
    0: 250,
    1: 1_000,
    2: 10_000,
    3: 100_000,
    4: 10_000_000,
}

# Pausa entre mensajes en segundos.  Meta detecta ráfagas como spam.
_SEND_DELAY_SECONDS = 1.2


def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


# ─── Schemas ─────────────────────────────────────────────────────────────────

class AudienceFilter(BaseModel):
    segment: str = "all"  # all | vip | inactive | new


class CampaignCreate(BaseModel):
    nombre: str
    tipo: str  # reactivacion | promo | evento | cumpleanos | otro
    mensaje: str
    audience_filter: AudienceFilter = AudienceFilter()
    scheduled_at: Optional[datetime] = None


class GenerateRequest(BaseModel):
    tipo: str
    segment: str
    context: Optional[str] = None


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_segment_customers(db, business_id: str, segment: str) -> list[dict]:
    """Retorna sólo clientes con whatsapp_opt_in=true en el segmento dado."""
    query = (
        db.table("customers")
        .select("id,nombre,telefono,visitas,ultima_visita")
        .eq("business_id", business_id)
        .eq("whatsapp_opt_in", True)   # ← NUNCA enviar sin opt-in
    )
    if segment == "vip":
        query = query.gte("visitas", 5)
    elif segment == "new":
        query = query.eq("visitas", 1)
    elif segment == "inactive":
        cutoff = (datetime.now(timezone.utc).replace(day=1)).isoformat()
        query = query.lt("ultima_visita", cutoff)
    return query.execute().data


def _get_business_compliance(db, business_id: str) -> dict:
    """Devuelve tier, quality rating y contador diario del negocio."""
    result = db.table("businesses").select(
        "whatsapp_tier,whatsapp_quality,whatsapp_msgs_today,whatsapp_msgs_reset,telefono_whatsapp"
    ).eq("id", business_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    return result.data[0]


def _reset_daily_counter_if_needed(db, business_id: str, compliance: dict) -> int:
    """Resetea el contador diario si cambió el día UTC y devuelve el valor actual."""
    today = datetime.now(timezone.utc).date().isoformat()
    reset_date = compliance.get("whatsapp_msgs_reset") or ""
    if reset_date < today:
        db.table("businesses").update({
            "whatsapp_msgs_today": 0,
            "whatsapp_msgs_reset": today,
        }).eq("id", business_id).execute()
        return 0
    return compliance.get("whatsapp_msgs_today", 0)


def _daily_limit(tier: int) -> int:
    return _TIER_LIMITS.get(tier, _TIER_LIMITS[0])


async def _send_whatsapp_message(phone: str, message: str, phone_number_id: str, token: str) -> bool:
    url = f"https://graph.facebook.com/v20.0/{phone_number_id}/messages"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            url,
            json={
                "messaging_product": "whatsapp",
                "to": phone,
                "type": "text",
                "text": {"body": message},
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        return resp.status_code == 200


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/generate")
def generate_campaign_copy(
    body: GenerateRequest,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    biz = db.table("businesses").select("nombre,tipo").eq("id", business_id).execute()
    if not biz.data:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    biz_nombre = biz.data[0]["nombre"]

    segment_labels = {
        "all": "todos los clientes que dieron consentimiento",
        "vip": "clientes VIP (5 o más visitas)",
        "inactive": "clientes inactivos (sin visita en 30+ días)",
        "new": "clientes nuevos (primera visita)",
    }
    type_labels = {
        "reactivacion": "reactivar a clientes que no han vuelto",
        "promo": "promocionar una oferta especial del restaurante",
        "evento": "invitar a un evento especial",
        "cumpleanos": "felicitar a clientes y ofrecerles un beneficio",
        "otro": "comunicación general",
    }

    extra = f"\nContexto adicional: {body.context}" if body.context else ""
    prompt = (
        f"Eres el encargado de marketing de {biz_nombre}, un restaurante en México. "
        f"Escribe un mensaje de WhatsApp corto (máximo 3 párrafos) para "
        f"{segment_labels.get(body.segment, body.segment)}. "
        f"El objetivo de la campaña es: {type_labels.get(body.tipo, body.tipo)}.{extra}\n\n"
        "El tono debe ser cálido, amigable y profesional. Usa emojis con moderación. "
        "NO incluyas variables entre corchetes — escribe el mensaje listo para enviar. "
        "Responde solo con el texto del mensaje, sin explicaciones ni encabezados."
    )

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}],
    )
    return {"mensaje": response.content[0].text.strip()}


@router.get("/")
def list_campaigns(business_id: str = Depends(get_business_id)):
    db = get_supabase()
    result = db.table("campaigns").select("*").eq(
        "business_id", business_id
    ).order("created_at", desc=True).execute()
    return result.data


@router.post("/", status_code=201)
def create_campaign(body: CampaignCreate, business_id: str = Depends(get_business_id)):
    db = get_supabase()
    # Contar sólo clientes con opt-in — el total real que recibirá la campaña
    customers = _get_segment_customers(db, business_id, body.audience_filter.segment)

    row = {
        "business_id": business_id,
        "nombre": body.nombre,
        "tipo": body.tipo,
        "mensaje": body.mensaje,
        "audience_filter": body.audience_filter.model_dump(),
        "estado": "borrador",
        "total_destinatarios": len(customers),
    }
    if body.scheduled_at:
        row["scheduled_at"] = body.scheduled_at.isoformat()
        row["estado"] = "programada"

    result = db.table("campaigns").insert(row).execute()
    campaign = result.data[0]

    if customers:
        recipients = [
            {
                "business_id": business_id,
                "campaign_id": campaign["id"],
                "customer_id": c["id"],
            }
            for c in customers
        ]
        db.table("campaign_recipients").insert(recipients).execute()

    return campaign


@router.get("/{campaign_id}")
def get_campaign(campaign_id: str, business_id: str = Depends(get_business_id)):
    db = get_supabase()
    result = db.table("campaigns").select("*").eq(
        "id", campaign_id
    ).eq("business_id", business_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")
    return result.data[0]


@router.get("/{campaign_id}/stats")
def get_campaign_stats(campaign_id: str, business_id: str = Depends(get_business_id)):
    db = get_supabase()
    campaign = db.table("campaigns").select("*").eq(
        "id", campaign_id
    ).eq("business_id", business_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    recipients = db.table("campaign_recipients").select("enviado,entregado,leido").eq(
        "campaign_id", campaign_id
    ).execute()

    total = len(recipients.data)
    enviados = sum(1 for r in recipients.data if r["enviado"])
    entregados = sum(1 for r in recipients.data if r["entregado"])
    leidos = sum(1 for r in recipients.data if r["leido"])

    return {
        "total": total,
        "enviados": enviados,
        "entregados": entregados,
        "leidos": leidos,
        "tasa_envio": round(enviados / total * 100, 1) if total else 0,
        "tasa_lectura": round(leidos / enviados * 100, 1) if enviados else 0,
    }


@router.post("/{campaign_id}/send")
async def send_campaign(campaign_id: str, business_id: str = Depends(get_business_id)):
    """Envía la campaña respetando las reglas anti-ban de Meta."""
    db = get_supabase()

    # ── 1. Verificar que la campaña existe y está en estado enviable ──────────
    campaign_result = db.table("campaigns").select("*").eq(
        "id", campaign_id
    ).eq("business_id", business_id).execute()
    if not campaign_result.data:
        raise HTTPException(status_code=404, detail="Campaña no encontrada")

    c = campaign_result.data[0]
    if c["estado"] not in ("borrador", "programada"):
        raise HTTPException(status_code=400, detail=f"La campaña está en estado '{c['estado']}'")

    # ── 2. Verificar compliance del negocio ───────────────────────────────────
    compliance = _get_business_compliance(db, business_id)

    # Bloquear si quality rating está en rojo — enviar ahora agravaría el problema
    if compliance["whatsapp_quality"] == "red":
        raise HTTPException(
            status_code=403,
            detail=(
                "Campaña bloqueada: el Quality Rating de WhatsApp está en ROJO. "
                "Revisa Meta Business Manager, corrige el problema y actualiza "
                "el rating en Configuración antes de enviar."
            ),
        )

    phone_number_id = compliance.get("telefono_whatsapp")
    token = os.environ.get("WHATSAPP_TOKEN", "")
    if not token or not phone_number_id:
        raise HTTPException(status_code=500, detail="Configuración de WhatsApp incompleta")

    # ── 3. Verificar límite diario de mensajes según tier ─────────────────────
    msgs_today = _reset_daily_counter_if_needed(db, business_id, compliance)
    tier = compliance.get("whatsapp_tier", 1)
    daily_limit = _daily_limit(tier)

    pending_result = db.table("campaign_recipients").select(
        "id,customer_id,customers(telefono)"
    ).eq("campaign_id", campaign_id).eq("enviado", False).execute()

    pending = pending_result.data
    remaining_quota = daily_limit - msgs_today

    if remaining_quota <= 0:
        raise HTTPException(
            status_code=429,
            detail=(
                f"Límite diario alcanzado (Tier {tier}: {daily_limit} mensajes/día). "
                "Los contadores se reinician a medianoche UTC."
            ),
        )

    # Si la audiencia supera la cuota restante, enviar sólo hasta el límite
    sendable = pending[:remaining_quota]
    skipped = len(pending) - len(sendable)

    # ── 4. Enviar con rate limiting ───────────────────────────────────────────
    db.table("campaigns").update({"estado": "enviando"}).eq("id", campaign_id).execute()

    sent = 0
    errors = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    for recipient in sendable:
        cust = recipient.get("customers") or {}
        phone = cust.get("telefono", "")
        if not phone:
            continue

        ok = await _send_whatsapp_message(phone, c["mensaje"], phone_number_id, token)
        db.table("campaign_recipients").update({
            "enviado": ok,
            "sent_at": now_iso if ok else None,
        }).eq("id", recipient["id"]).execute()

        if ok:
            sent += 1
        else:
            errors += 1

        # Pausa entre mensajes — evita el patrón de velocidad que Meta detecta como spam
        await asyncio.sleep(_SEND_DELAY_SECONDS)

    # ── 5. Actualizar estado de campaña y contador del negocio ─────────────────
    new_state = "completada" if skipped == 0 else "borrador"
    db.table("campaigns").update({
        "estado": new_state,
        "total_enviados": sent,
    }).eq("id", campaign_id).execute()

    db.table("businesses").update({
        "whatsapp_msgs_today": msgs_today + sent,
    }).eq("id", business_id).execute()

    return {
        "sent": sent,
        "errors": errors,
        "skipped_quota": skipped,
        "remaining_quota": max(0, remaining_quota - sent),
        "daily_limit": daily_limit,
        "tier": tier,
    }
