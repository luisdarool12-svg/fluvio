import os
import json
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
import httpx
import anthropic
from supabase import create_client

from core.auth import get_business_id

router = APIRouter()


def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


# ─── Schemas ─────────────────────────────────────────────────

class SendMessageBody(BaseModel):
    content: str


class ModeBody(BaseModel):
    mode: str  # "AI" | "HUMAN"


class StatusBody(BaseModel):
    status: str  # "active" | "resolved" | "escalated"


class SaveConfigBody(BaseModel):
    system_prompt: str
    form_data: dict
    version_label: Optional[str] = None


class GeneratePromptBody(BaseModel):
    form_data: dict


class ParseMenuBody(BaseModel):
    menu_text: str = Field(..., max_length=20000)


# ─── Conversations ────────────────────────────────────────────

@router.get("/conversations")
def list_conversations(
    status: Optional[str] = None,
    mode: Optional[str] = None,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    q = (
        db.table("conversations")
        .select("id, phone, name, platform, mode, status, unread_count, last_message_at, created_at")
        .eq("business_id", business_id)
        .order("last_message_at", desc=True, nullsfirst=False)
    )
    if status:
        q = q.eq("status", status)
    if mode:
        q = q.eq("mode", mode.upper())
    result = q.execute()
    return result.data


@router.get("/conversations/{conv_id}/messages")
def get_messages(
    conv_id: int,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    conv = (
        db.table("conversations")
        .select("id")
        .eq("id", conv_id)
        .eq("business_id", business_id)
        .single()
        .execute()
    )
    if not conv.data:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

    msgs = (
        db.table("messages")
        .select("id, role, content, read, created_at")
        .eq("conversation_id", conv_id)
        .order("created_at")
        .execute()
    )
    # Mark incoming messages as read
    db.table("messages").update({"read": True}).eq("conversation_id", conv_id).eq("role", "user").execute()
    db.table("conversations").update({"unread_count": 0}).eq("id", conv_id).execute()
    return msgs.data


@router.post("/conversations/{conv_id}/messages", status_code=201)
def send_message(
    conv_id: int,
    body: SendMessageBody,
    business_id: str = Depends(get_business_id),
):
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")

    db = get_supabase()
    conv = (
        db.table("conversations")
        .select("id, phone, jid, platform, mode")
        .eq("id", conv_id)
        .eq("business_id", business_id)
        .single()
        .execute()
    )
    if not conv.data:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    if conv.data["mode"] != "HUMAN":
        raise HTTPException(status_code=400, detail="La conversación debe estar en modo HUMAN para responder manualmente")

    now = datetime.now(timezone.utc).isoformat()

    # Insert message in history
    db.table("messages").insert({
        "business_id": business_id,
        "conversation_id": conv_id,
        "role": "human",
        "content": body.content,
        "read": True,
    }).execute()

    # Enqueue for sending via WhatsApp
    db.table("outbox").insert({
        "business_id": business_id,
        "conversation_id": conv_id,
        "phone": conv.data["phone"],
        "jid": conv.data.get("jid"),
        "platform": conv.data.get("platform", "whatsapp"),
        "content": body.content,
        "sent": False,
    }).execute()

    # Update last_message_at
    db.table("conversations").update({"last_message_at": now}).eq("id", conv_id).execute()

    return {"ok": True}


@router.patch("/conversations/{conv_id}/mode")
def set_mode(
    conv_id: int,
    body: ModeBody,
    business_id: str = Depends(get_business_id),
):
    mode = body.mode.upper()
    if mode not in ("AI", "HUMAN"):
        raise HTTPException(status_code=400, detail="mode debe ser AI o HUMAN")

    db = get_supabase()
    result = (
        db.table("conversations")
        .update({"mode": mode})
        .eq("id", conv_id)
        .eq("business_id", business_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    return {"mode": mode}


@router.patch("/conversations/{conv_id}/status")
def set_status(
    conv_id: int,
    body: StatusBody,
    business_id: str = Depends(get_business_id),
):
    if body.status not in ("active", "resolved", "escalated"):
        raise HTTPException(status_code=400, detail="status inválido")

    db = get_supabase()
    result = (
        db.table("conversations")
        .update({"status": body.status})
        .eq("id", conv_id)
        .eq("business_id", business_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    return {"status": body.status}


# ─── Config ──────────────────────────────────────────────────

@router.get("/config")
def get_config(business_id: str = Depends(get_business_id)):
    db = get_supabase()
    biz = (
        db.table("businesses")
        .select("bot_config, prompt_form_data")
        .eq("id", business_id)
        .single()
        .execute()
    )
    versions = (
        db.table("system_prompt_versions")
        .select("id, version_label, is_active, created_at")
        .eq("business_id", business_id)
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )
    return {
        "bot_config": biz.data.get("bot_config") or {},
        "prompt_form_data": biz.data.get("prompt_form_data"),
        "versions": versions.data,
    }


@router.post("/config")
def save_config(
    body: SaveConfigBody,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()

    # Deactivate previous active version
    db.table("system_prompt_versions").update({"is_active": False}).eq("business_id", business_id).eq("is_active", True).execute()

    # Insert new version
    label = body.version_label or datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M")
    db.table("system_prompt_versions").insert({
        "business_id": business_id,
        "system_prompt": body.system_prompt,
        "form_data": body.form_data,
        "version_label": label,
        "is_active": True,
    }).execute()

    # Update businesses
    biz = db.table("businesses").select("bot_config").eq("id", business_id).single().execute()
    bot_config = (biz.data.get("bot_config") or {})
    bot_config["system_prompt"] = body.system_prompt

    db.table("businesses").update({
        "bot_config": bot_config,
        "prompt_form_data": body.form_data,
    }).eq("id", business_id).execute()

    # Keep only last 5 versions
    old = (
        db.table("system_prompt_versions")
        .select("id")
        .eq("business_id", business_id)
        .order("created_at", desc=True)
        .offset(5)
        .execute()
    )
    if old.data:
        ids = [r["id"] for r in old.data]
        db.table("system_prompt_versions").delete().in_("id", ids).execute()

    return {"ok": True, "version_label": label}


@router.post("/config/restore/{version_id}")
def restore_version(
    version_id: str,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    ver = (
        db.table("system_prompt_versions")
        .select("*")
        .eq("id", version_id)
        .eq("business_id", business_id)
        .single()
        .execute()
    )
    if not ver.data:
        raise HTTPException(status_code=404, detail="Versión no encontrada")

    db.table("system_prompt_versions").update({"is_active": False}).eq("business_id", business_id).execute()
    db.table("system_prompt_versions").update({"is_active": True}).eq("id", version_id).execute()

    biz = db.table("businesses").select("bot_config").eq("id", business_id).single().execute()
    bot_config = (biz.data.get("bot_config") or {})
    bot_config["system_prompt"] = ver.data["system_prompt"]

    db.table("businesses").update({
        "bot_config": bot_config,
        "prompt_form_data": ver.data.get("form_data"),
    }).eq("id", business_id).execute()

    return {"ok": True}


@router.post("/config/generate-prompt")
def generate_prompt(body: GeneratePromptBody, business_id: str = Depends(get_business_id)):
    prompt = build_system_prompt(body.form_data)
    return {"system_prompt": prompt, "char_count": len(prompt)}


@router.post("/config/parse-menu")
def parse_menu(body: ParseMenuBody, business_id: str = Depends(get_business_id)):
    """Uses Claude to parse free-text menu into structured categories."""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system=(
            "Eres un asistente que convierte menús de restaurante en formato texto a JSON estructurado. "
            "Devuelve ÚNICAMENTE un JSON válido con este formato exacto (sin markdown, sin explicaciones):\n"
            '{"categories": [{"name": "Nombre categoría", "items": [{"name": "Platillo", "description": "", "price": 0, "tags": [], "available": true}]}]}\n'
            "Las tags válidas son: vegetarian, spicy, recommended. El precio debe ser número, sin símbolo $."
        ),
        messages=[{"role": "user", "content": body.menu_text}],
    )
    import json
    try:
        parsed = json.loads(response.content[0].text)
    except Exception:
        raise HTTPException(status_code=422, detail="No se pudo parsear el menú. Intenta con un formato más claro.")
    return parsed


# ─── Stats ───────────────────────────────────────────────────

@router.get("/stats")
def get_stats(business_id: str = Depends(get_business_id)):
    db = get_supabase()

    convs = db.table("conversations").select("id, mode, created_at").eq("business_id", business_id).execute()
    msgs = db.table("messages").select("id, role, created_at").eq("business_id", business_id).execute()

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    total_convs = len(convs.data)
    month_convs = sum(1 for c in convs.data if c["created_at"] >= month_start)
    ai_convs = sum(1 for c in convs.data if c.get("mode") == "AI")
    human_convs = sum(1 for c in convs.data if c.get("mode") == "HUMAN")
    escalated = 0  # Requires migration 005 (status column)

    sent = sum(1 for m in msgs.data if m["role"] in ("assistant", "human"))
    received = sum(1 for m in msgs.data if m["role"] == "user")

    # Conversations per day for last 30 days
    from datetime import timedelta
    days_data = []
    for i in range(29, -1, -1):
        d = (now - timedelta(days=i)).date().isoformat()
        count = sum(1 for c in convs.data if c["created_at"][:10] == d)
        days_data.append({"date": d, "count": count})

    return {
        "total_conversations": total_convs,
        "month_conversations": month_convs,
        "messages_sent": sent,
        "messages_received": received,
        "ai_conversations": ai_convs,
        "human_conversations": human_convs,
        "escalated_conversations": escalated,
        "escalated_pct": round(escalated / total_convs * 100, 1) if total_convs else 0,
        "daily_conversations": days_data,
    }


# ─── Prompt builder ──────────────────────────────────────────

_DAYS_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
_TONE_MAP = {"formal": "formal usando usted", "semiformal": "semi-formal", "casual": "casual usando tú"}
_LENGTH_MAP = {"concise": "2-3 líneas máximo", "normal": "4-5 líneas máximo", "detailed": "respuestas detalladas cuando sea necesario"}
_LANG_MAP = {"spanish": "Español", "english": "English", "bilingual": "el idioma que use el cliente (auto-detección)"}


def _format_hours(hours: list) -> str:
    lines = []
    for h in hours:
        if not h.get("open"):
            lines.append(f"- {h['day'].capitalize()}: Cerrado")
        else:
            lines.append(f"- {h['day'].capitalize()}: {h.get('from', '?')} – {h.get('to', '?')}")
    return "\n".join(lines) if lines else "Horario no especificado."


def _format_menu(categories: list) -> str:
    if not categories:
        return "Menú no especificado."
    parts = []
    for cat in categories:
        parts.append(f"\n**{cat['name'].upper()}**")
        for item in cat.get("items", []):
            if not item.get("available", True):
                continue
            price = f"${item['price']}" if item.get("price") else ""
            desc = f" — {item['description']}" if item.get("description") else ""
            tags = item.get("tags", [])
            tag_str = ""
            if "vegetarian" in tags:
                tag_str += " 🌱"
            if "spicy" in tags:
                tag_str += " 🌶️"
            if "recommended" in tags:
                tag_str += " ⭐"
            parts.append(f"- {item['name']}{tag_str}{desc} {price}".strip())
    return "\n".join(parts)


def _format_escalation(rules: dict) -> str:
    items = []
    if rules.get("negative_feedback"):
        items.append("- Quejas o comentarios negativos sobre el servicio o la comida")
    if rules.get("refund_request"):
        items.append("- Solicitudes de reembolso o compensación")
    threshold = rules.get("large_group_threshold", 10)
    if rules.get("large_group"):
        items.append(f"- Grupos grandes (más de {threshold} personas)")
    if rules.get("private_events"):
        items.append("- Preguntas sobre eventos privados o presupuestos especiales")
    if rules.get("customer_requests_human"):
        items.append("- El cliente pide explícitamente hablar con una persona")
    if rules.get("repeated_unknown"):
        items.append("- El asistente no puede responder la misma pregunta 2 veces seguidas")
    return "\n".join(items) if items else "- Cuando el cliente solicite hablar con una persona"


def _format_events(events: list) -> str:
    active = [e for e in events if e.get("active")]
    if not active:
        return "Sin eventos o promociones vigentes en este momento."
    lines = []
    for e in active:
        date_range = ""
        if e.get("date_start"):
            date_range = f" ({e['date_start']}"
            if e.get("date_end"):
                date_range += f" al {e['date_end']}"
            date_range += ")"
        lines.append(f"- **{e['name']}**{date_range}: {e.get('description', '')}")
    return "\n".join(lines)


def build_system_prompt(form: dict) -> str:
    name = form.get("restaurant_name", "el restaurante")
    bot_name = form.get("bot_name") or f"Asistente de {name}"
    cuisine = form.get("cuisine_type", "restaurante")
    address = form.get("address", "")
    neighborhood = form.get("neighborhood", "")
    city = form.get("city", "")
    location = ", ".join(p for p in [address, neighborhood, city] if p)
    phone = form.get("phone", "")
    website = form.get("website", "")
    instagram = form.get("instagram", "")

    tone = _TONE_MAP.get(form.get("tone", "formal"), "formal usando usted")
    language = _LANG_MAP.get(form.get("language", "bilingual"), "el idioma del cliente")
    length = _LENGTH_MAP.get(form.get("response_length", "concise"), "2-3 líneas máximo")

    hours_list = form.get("hours", [])
    hours_note = form.get("hours_note", "")
    hours_str = _format_hours(hours_list)
    if hours_note:
        hours_str += f"\nNota: {hours_note}"

    menu_mode = form.get("menu_mode", "manual")
    if menu_mode == "manual":
        menu_str = _format_menu(form.get("menu_categories", []))
    else:
        menu_str = form.get("menu_text", "Menú no especificado.")

    accepts_res = form.get("accepts_reservations", False)
    if accepts_res:
        max_p = form.get("reservation_max_people", 12)
        advance = form.get("reservation_advance_hours", 2)
        res_contact = form.get("reservation_contact", phone)
        reservations_str = (
            f"Sí aceptamos reservaciones.\n"
            f"- Máximo {max_p} personas por reservación\n"
            f"- Anticipación mínima: {advance} horas\n"
            f"- Para confirmar: {res_contact}"
        )
    else:
        reservations_str = "No aceptamos reservaciones en este momento. Los clientes son atendidos por orden de llegada."

    events_str = _format_events(form.get("events", []))

    escalation_rules = form.get("escalation_rules", {})
    escalation_str = _format_escalation(escalation_rules)
    escalation_msg = form.get("escalation_message", "Un momento, te voy a conectar con alguien de nuestro equipo que podrá ayudarte mejor. 🙏")
    escalation_contact = form.get("escalation_contact", phone)

    can_recommend = "Puedes sugerir platillos según las preferencias o restricciones del cliente." if form.get("can_recommend", True) else ""
    show_prices = "Menciona precios cuando el cliente pregunte directamente." if form.get("show_prices", True) else "No menciones precios; indica al cliente que pregunte al staff."

    contact_lines = [f"Teléfono: {phone}"] if phone else []
    if website:
        contact_lines.append(f"Sitio web: {website}")
    if instagram:
        contact_lines.append(f"Instagram: {instagram}")
    contact_str = "\n".join(contact_lines) if contact_lines else "Sin información de contacto adicional."

    return f"""Eres {bot_name}, el asistente virtual de {name}, un {cuisine} ubicado en {location}.

Tu función es atender a los clientes vía WhatsApp de manera {tone}, respondiendo preguntas sobre el menú, horarios, reservaciones y cualquier duda general sobre el restaurante. Nunca inventes información que no esté en este prompt.

---

HORARIOS DE OPERACIÓN:
{hours_str}

---

MENÚ COMPLETO:
{menu_str}

---

RESERVACIONES:
{reservations_str}

---

EVENTOS Y PROMOCIONES VIGENTES:
{events_str}

---

REGLAS DE COMUNICACIÓN:
- Responde siempre en {language}
- Usa tratamiento {tone} en todo momento
- Limita tus respuestas a {length}
- {can_recommend}
- {show_prices}
- Nunca inventes precios, horarios, platillos ni información del restaurante
- Si no sabes algo, dilo con honestidad y ofrece alternativas

---

ESCALACIÓN A HUMANO:
Transfiere inmediatamente la conversación a un agente humano en estos casos:
{escalation_str}

Cuando escales, envía exactamente este mensaje: "{escalation_msg}"
Número de contacto para escalación: {escalation_contact}

---

INFORMACIÓN DE CONTACTO:
{contact_str}"""


# ─── Bot service control (EasyPanel) ─────────────────────────

_EP_URL     = os.environ.get("EASYPANEL_URL", "")
_EP_TOKEN   = os.environ.get("EASYPANEL_API_TOKEN", "")
_EP_PROJECT = os.environ.get("EASYPANEL_PROJECT", "")
_EP_SERVICE = os.environ.get("EASYPANEL_BOT_SERVICE", "bot")
_BOT_URL    = os.environ.get("BOT_INTERNAL_URL", "http://bot:8000")


@router.get("/bot/status")
async def get_bot_status(business_id: str = Depends(get_business_id)):
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{_BOT_URL}/health")
            running = r.status_code == 200
    except Exception:
        running = False
    return {
        "running": running,
        "easypanel_configured": bool(_EP_URL and _EP_TOKEN and _EP_PROJECT),
    }


async def _easypanel(action: str) -> dict:
    if not all([_EP_URL, _EP_TOKEN, _EP_PROJECT]):
        raise HTTPException(
            status_code=501,
            detail="EasyPanel no configurado. Agrega EASYPANEL_URL, EASYPANEL_API_TOKEN y EASYPANEL_PROJECT al .env",
        )
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            f"{_EP_URL}/api/trpc/{action}",
            json={"json": {"projectName": _EP_PROJECT, "serviceName": _EP_SERVICE}},
            headers={"Authorization": f"Bearer {_EP_TOKEN}", "Content-Type": "application/json"},
        )
        if r.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"EasyPanel error {r.status_code}: {r.text[:200]}")
    return {"ok": True}


@router.post("/bot/restart")
async def restart_bot(business_id: str = Depends(get_business_id)):
    return await _easypanel("services.restartService")


@router.post("/bot/start")
async def start_bot(business_id: str = Depends(get_business_id)):
    return await _easypanel("services.startService")


@router.post("/bot/stop")
async def stop_bot(business_id: str = Depends(get_business_id)):
    return await _easypanel("services.stopService")
