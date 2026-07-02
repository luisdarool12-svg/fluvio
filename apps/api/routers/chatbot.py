import os
import json
import base64
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
import httpx
import anthropic
from core.db import get_db

from core.auth import get_business_id

router = APIRouter()


def get_supabase():
    return get_db()


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
        .select("id, role, content, created_at")
        .eq("conversation_id", conv_id)
        .order("created_at")
        .execute()
    )

    # Mark as read
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
    status = body.status.lower()
    if status not in ("active", "resolved", "escalated"):
        raise HTTPException(status_code=400, detail="status debe ser active, resolved o escalated")

    db = get_supabase()
    result = (
        db.table("conversations")
        .update({"status": status})
        .eq("id", conv_id)
        .eq("business_id", business_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    return {"status": status}


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


_MENU_JSON_SYSTEM = (
    "Eres un asistente que extrae menús de restaurante y los convierte a JSON estructurado. "
    "Devuelve ÚNICAMENTE un JSON válido con este formato exacto (sin markdown, sin explicaciones):\n"
    '{"categories": [{"name": "Nombre categoría", "items": [{"name": "Platillo", "description": "", "price": 0, "tags": [], "available": true}]}]}\n'
    "Las tags válidas son: vegetarian, spicy, recommended. El precio debe ser número sin símbolo $. "
    "Si no hay precio visible usa 0. Extrae todos los platillos disponibles."
)

_CLAUDE_CLIENT = None


def _claude_client() -> anthropic.Anthropic:
    global _CLAUDE_CLIENT
    if _CLAUDE_CLIENT is None:
        _CLAUDE_CLIENT = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _CLAUDE_CLIENT


def _parse_menu_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        text = text.rsplit("```", 1)[0].strip()
    return json.loads(text)


@router.post("/config/parse-menu")
def parse_menu(body: ParseMenuBody, business_id: str = Depends(get_business_id)):
    """Uses Claude to parse free-text menu into structured categories."""
    response = _claude_client().messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        system=_MENU_JSON_SYSTEM,
        messages=[{"role": "user", "content": body.menu_text}],
    )
    try:
        return _parse_menu_json(response.content[0].text)
    except Exception:
        raise HTTPException(status_code=422, detail="No se pudo parsear el menú. Intenta con un formato más claro.")


_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_MAX_FILE_BYTES = 20 * 1024 * 1024  # 20 MB


@router.post("/config/parse-menu-file")
async def parse_menu_file(
    file: UploadFile = File(...),
    business_id: str = Depends(get_business_id),
):
    """Extracts a structured menu from an uploaded image (JPG/PNG/WEBP) or PDF using Claude vision."""
    content = await file.read()
    if len(content) > _MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="El archivo no puede superar 20 MB")

    mime = (file.content_type or "").lower()
    if mime in _ALLOWED_IMAGE_TYPES:
        content_block = {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": mime,
                "data": base64.b64encode(content).decode(),
            },
        }
    elif mime == "application/pdf":
        content_block = {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": base64.b64encode(content).decode(),
            },
        }
    else:
        raise HTTPException(
            status_code=415,
            detail="Solo se aceptan imágenes (JPG, PNG, WEBP) y archivos PDF",
        )

    response = _claude_client().messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        system=_MENU_JSON_SYSTEM,
        messages=[{
            "role": "user",
            "content": [
                content_block,
                {"type": "text", "text": "Extrae el menú completo de este archivo y devuélvelo en el formato JSON indicado."},
            ],
        }],
    )

    try:
        return _parse_menu_json(response.content[0].text)
    except Exception:
        raise HTTPException(
            status_code=422,
            detail="No se pudo extraer el menú. Intenta con una imagen más clara o un PDF con texto seleccionable.",
        )


# ─── Stats ───────────────────────────────────────────────────

@router.get("/stats")
def get_stats(business_id: str = Depends(get_business_id)):
    """Estadísticas con queries de conteo — nunca descarga las tablas completas
    (con meses de operación, conversations/messages crecen sin límite)."""
    db = get_supabase()

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    def _count(table: str, **eq_filters) -> int:
        q = db.table(table).select("id", count="exact", head=True).eq("business_id", business_id)
        for col, val in eq_filters.items():
            q = q.eq(col, val)
        return q.execute().count or 0

    total_convs = _count("conversations")
    month_convs = (
        db.table("conversations").select("id", count="exact", head=True)
        .eq("business_id", business_id).gte("created_at", month_start)
        .execute().count or 0
    )
    ai_convs = _count("conversations", mode="AI")
    human_convs = _count("conversations", mode="HUMAN")
    escalated = 0  # Requires migration 005 (status column)

    received = _count("messages", role="user")
    sent = (
        db.table("messages").select("id", count="exact", head=True)
        .eq("business_id", business_id).in_("role", ["assistant", "human"])
        .execute().count or 0
    )

    # Conversations per day for last 30 days — solo se traen los created_at
    # de la ventana, no todo el historial.
    from datetime import timedelta
    window_start = (now - timedelta(days=30)).isoformat()
    recent = (
        db.table("conversations").select("created_at")
        .eq("business_id", business_id).gte("created_at", window_start)
        .execute()
    )
    by_day: dict = {}
    for c in recent.data or []:
        by_day[c["created_at"][:10]] = by_day.get(c["created_at"][:10], 0) + 1
    days_data = []
    for i in range(29, -1, -1):
        d = (now - timedelta(days=i)).date().isoformat()
        days_data.append({"date": d, "count": by_day.get(d, 0)})

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


def build_system_prompt(form: dict) -> str:  # noqa: C901
    # ── campos base ────────────────────────────────────────────
    name        = form.get("restaurant_name", "el restaurante")
    bot_name    = form.get("bot_name") or f"Asistente de {name}"
    cuisine     = form.get("cuisine_type", "restaurante")
    address     = form.get("address", "")
    neighborhood = form.get("neighborhood", "")
    city        = form.get("city", "")
    location    = ", ".join(p for p in [address, neighborhood, city] if p)
    phone       = form.get("phone", "")
    website     = form.get("website", "")
    instagram   = form.get("instagram", "")

    tone_key     = form.get("tone", "formal")
    language_key = form.get("language", "bilingual")
    length_key   = form.get("response_length", "concise")

    pronoun = "usted" if tone_key in ("formal", "semiformal") else "tú"
    tone_label  = _TONE_MAP.get(tone_key, "formal usando usted")
    length_str  = _LENGTH_MAP.get(length_key, "2-3 líneas máximo")

    # ── horario ────────────────────────────────────────────────
    hours_list = form.get("hours", [])
    hours_note = form.get("hours_note", "")
    hours_str  = _format_hours(hours_list)
    if hours_note:
        hours_str += f"\nNota: {hours_note}"

    # detectar días cerrados para mencionarlos en el flujo de reservación
    closed_days = [
        h["day"].capitalize() for h in hours_list if not h.get("open")
    ]

    # ── menú ───────────────────────────────────────────────────
    menu_mode = form.get("menu_mode", "manual")
    menu_str  = (
        _format_menu(form.get("menu_categories", []))
        if menu_mode == "manual"
        else form.get("menu_text", "Menú no especificado.")
    )
    can_recommend = form.get("can_recommend", True)
    show_prices   = form.get("show_prices", True)

    # ── eventos ────────────────────────────────────────────────
    events_str = _format_events(form.get("events", []))

    # ── escalación ─────────────────────────────────────────────
    escalation_rules   = form.get("escalation_rules", {})
    escalation_str     = _format_escalation(escalation_rules)
    escalation_msg     = form.get("escalation_message", "Un momento, te voy a conectar con alguien de nuestro equipo que podrá ayudarte mejor.")
    escalation_contact = form.get("escalation_contact", phone)
    large_group_threshold = (
        escalation_rules.get("large_group_threshold", 13)
        if escalation_rules.get("large_group")
        else None
    )

    # ── reservaciones ──────────────────────────────────────────
    accepts_res = form.get("accepts_reservations", False)
    max_p       = form.get("reservation_max_people", 12)
    advance     = form.get("reservation_advance_hours", 2)

    # ── contacto ───────────────────────────────────────────────
    contact_lines = [f"Teléfono: {phone}"] if phone else []
    if website:
        contact_lines.append(f"Sitio web: {website}")
    if instagram:
        contact_lines.append(f"Instagram: {instagram}")
    contact_str = "\n".join(contact_lines) if contact_lines else "Sin información de contacto adicional."

    # ══════════════════════════════════════════════════════════
    # Construcción del prompt por secciones
    # ══════════════════════════════════════════════════════════

    # ── 1. Identidad ───────────────────────────────────────────
    identity = (
        f"Eres {bot_name}, el asistente virtual de {name}, {cuisine}"
        + (f" ubicado en {location}" if location else "")
        + ".\n"
        "Tu función es atender a los clientes vía WhatsApp respondiendo preguntas sobre "
        "el menú, horarios, reservaciones y cualquier duda sobre el restaurante. "
        "Nunca inventes información que no esté en este prompt."
    )

    # ── 2. Idioma ──────────────────────────────────────────────
    if language_key == "bilingual":
        language_section = """---

IDIOMA

- Detecta automáticamente el idioma del cliente (español o inglés) desde su primer mensaje.
- Responde siempre en el mismo idioma que el cliente usa.
- Si el cliente mezcla idiomas, usa el predominante.
- Mantén el mismo nivel de formalidad y calidez en ambos idiomas."""
    elif language_key == "english":
        language_section = "---\n\nIDIOMO\n\n- Respond always in English."
    else:
        language_section = "---\n\nIDIOMA\n\n- Responde siempre en español."

    # ── 3. Tono y estilo ───────────────────────────────────────
    tone_section = f"""---

TONO Y ESTILO

- Usa tratamiento de {pronoun} con cada cliente en todo momento.
- Limita tus respuestas a {length_str}; si la información es extensa, divídela en bloques.
- Actúa con calidez genuina: atento y preciso, nunca frío ni robótico.
- Evita frases genéricas de chatbot: «¡Claro que sí!», «¡Por supuesto!», «¡Excelente pregunta!».
- En su lugar, expresa calidez con naturalidad: «Con mucho gusto», «Será un placer», «Le esperamos».
- Nunca empieces una respuesta repitiendo lo que el cliente acaba de decir.
- Usa el nombre del cliente con moderación — máximo una vez por conversación."""

    # ── 4. Información del restaurante ─────────────────────────
    info_lines = [f"- Nombre: {name}", f"- Concepto: {cuisine}"]
    if location:
        info_lines.append(f"- Dirección: {location}")
    if phone:
        info_lines.append(f"- Teléfono: {phone}")
    if instagram:
        info_lines.append(f"- Instagram: {instagram}")
    if website:
        info_lines.append(f"- Sitio web: {website}")
    info_section = "---\n\nINFORMACIÓN DEL RESTAURANTE\n\n" + "\n".join(info_lines)

    # ── 5. Horarios ────────────────────────────────────────────
    hours_section = f"---\n\nHORARIOS DE OPERACIÓN\n\n{hours_str}"

    # ── 6. Menú ────────────────────────────────────────────────
    menu_rules = []
    if can_recommend:
        menu_rules.append("- Puedes sugerir platillos según las preferencias o restricciones del cliente.")
    if show_prices:
        menu_rules.append("- Menciona precios cuando el cliente los pida directamente; no los menciones de forma espontánea.")
    else:
        menu_rules.append("- No menciones precios; indica al cliente que consulte directamente con el staff.")
    menu_rules += [
        "- Describe ingredientes y preparación cuando el cliente lo solicite.",
        "- Nunca inventes platillos, precios ni especiales que no estén en este menú.",
        "- Preguntas sobre alergias o restricciones específicas: remite siempre al equipo del restaurante.",
    ]
    menu_section = (
        f"---\n\nMENÚ COMPLETO\n\n{menu_str}\n\n"
        "CÓMO RESPONDER SOBRE EL MENÚ\n\n" + "\n".join(menu_rules)
    )

    # ── 7. Eventos ─────────────────────────────────────────────
    events_section = f"---\n\nEVENTOS Y PROMOCIONES VIGENTES\n\n{events_str}"

    # ── 8. Reservaciones ───────────────────────────────────────
    if accepts_res:
        large_group_rule = ""
        if large_group_threshold:
            large_group_rule = (
                f"\n- Si el cliente solicita mesa para {large_group_threshold} o más personas: "
                "escala a humano inmediatamente sin continuar el flujo."
            )

        closed_note = ""
        if closed_days:
            closed_note = (
                f"\n- La función de confirmación rechazará fechas en días cerrados "
                f"({', '.join(closed_days)}). Si eso ocurre, infórmalo al cliente con naturalidad."
            )

        reservation_section = f"""---

FLUJO DE RESERVACIÓN

Cuando el cliente desee reservar, recopila la información paso a paso, **una pregunta a la vez**. No hagas dos preguntas en el mismo mensaje.

Datos obligatorios (en orden):
1. Nombre completo
2. Fecha deseada — acepta cualquier fecha sin rechazarla. La función validará si el restaurante abre ese día.{closed_note}
3. Hora — convierte siempre a formato HH:MM de 24 horas. Nunca pidas aclaración de AM/PM; infiere según el contexto:
   - «de la noche», «pm» → suma 12. Ej: «8 de la noche» → 20:00, «7 pm» → 19:00.
   - «de la tarde» → suma 12 si la hora es entre 1 y 6. Ej: «2 de la tarde» → 14:00.
   - «de la mañana», «am», «madrugada» → no sumes nada.
   - Sin contexto AM/PM: si el restaurante abre en la tarde, asume PM para horas entre 1 y 11.
4. Número de personas (máximo {max_p} por este canal).{large_group_rule}

Preguntas adicionales obligatorias — SIEMPRE antes de confirmar:
5. Zona preferida — pregunta si prefieren alguna zona (ej. terraza, comedor). Si no importa, usa «sin preferencia».
6. Requisición especial — pregunta: «¿Tiene algún requerimiento especial?» Si no, usa «NINGUNA».

REGLA CRÍTICA — CONFIRMACIÓN:
Nunca digas «su reservación está confirmada» sin haber llamado primero a confirmar_reservacion y recibido respuesta exitosa. Si la función regresa ERROR, NO confirmes — informa al cliente del problema con naturalidad.

---

FLUJO DE MODIFICACIÓN

Cuando el cliente quiera cambiar una reservación existente:
1. Identifica la reservación (fecha y hora). Si no están claras en el contexto, pregunta.
2. Pregunta qué desea cambiar — una cosa a la vez.
3. Recoge el nuevo valor en el mismo formato (hora → HH:MM 24h, fecha → DD/MM/YYYY).
4. Llama a modificar_reservacion con los datos originales y los campos nuevos.
5. Confirma el cambio solo si la función regresa éxito. Si hay ERROR, informa al cliente.

REGLA CRÍTICA — MODIFICACIÓN: Nunca confirmes un cambio sin llamar a modificar_reservacion y recibir éxito.

---

FLUJO DE CANCELACIÓN

Cuando el cliente quiera cancelar:
1. Identifica la reservación (fecha y hora). Si no están claras, pregunta.
2. Pide confirmación explícita: «¿Confirma que desea cancelar su reservación del [fecha] a las [hora]?»
3. Solo si el cliente confirma: llama a cancelar_reservacion.
4. Confirma la cancelación. Si hay error, informa al cliente."""
    else:
        reservation_section = (
            "---\n\nRESERVACIONES\n\n"
            "No aceptamos reservaciones. Los clientes son atendidos por orden de llegada."
        )

    # ── 9. Escalación ──────────────────────────────────────────
    contact_note = f"\nContacto para escalación: {escalation_contact}" if escalation_contact else ""
    escalation_section = f"""---

ESCALACIÓN A HUMANO

Cuando debas escalar, envía exactamente este mensaje:
«{escalation_msg}»

Escala en los siguientes casos:
{escalation_str}{contact_note}"""

    # ── 10. Contacto ───────────────────────────────────────────
    contact_section = f"---\n\nINFORMACIÓN DE CONTACTO\n\n{contact_str}"

    # ── 11. Comportamientos prohibidos ─────────────────────────
    prohibited = [
        "- Nunca inventes platillos, precios, horarios ni información del restaurante.",
        "- Nunca hagas más de una pregunta en el mismo mensaje durante cualquier flujo.",
        f"- Nunca uses tratamiento distinto a {pronoun} salvo que el cliente lo pida explícitamente.",
        "- Nunca respondas con más líneas de las indicadas a preguntas simples.",
        "- Nunca cambies de idioma a mitad de conversación sin que el cliente lo solicite.",
    ]
    if accepts_res:
        prohibited += [
            "- Nunca confirmes una reserva, modificación o cancelación sin haber llamado a la función correspondiente y recibido éxito.",
            "- Nunca rechaces ni cuestiones la hora o fecha que pida el cliente — acéptala siempre y conviértela al formato correcto.",
        ]
    prohibited_section = "---\n\nCOMPORTAMIENTOS PROHIBIDOS\n\n" + "\n".join(prohibited)

    # ── 12. Saludo inicial ─────────────────────────────────────
    if language_key == "bilingual":
        greeting_section = (
            "---\n\nSALUDO INICIAL\n\n"
            f"En español: «Bienvenido a {name}. Es un placer recibirle. ¿En qué puedo asistirle hoy?»\n"
            f"En inglés: «Welcome to {name}. It's a pleasure to have you here. How may I help you today?»"
        )
    elif language_key == "english":
        greeting_section = (
            "---\n\nINITIAL GREETING\n\n"
            f"«Welcome to {name}. It's a pleasure to have you here. How may I help you today?»"
        )
    else:
        greeting_section = (
            "---\n\nSALUDO INICIAL\n\n"
            f"«Bienvenido a {name}. Es un placer recibirle. ¿En qué puedo asistirle hoy?»"
        )

    sections = [
        identity,
        language_section,
        tone_section,
        info_section,
        hours_section,
        menu_section,
        events_section,
        reservation_section,
        escalation_section,
        contact_section,
        prohibited_section,
        greeting_section,
    ]
    return "\n\n".join(sections)


# ─── Bot service control (EasyPanel) ─────────────────────────

_EP_URL     = os.environ.get("EASYPANEL_URL", "")
_EP_TOKEN   = os.environ.get("EASYPANEL_API_TOKEN", "")
_EP_PROJECT = os.environ.get("EASYPANEL_PROJECT", "")
_EP_SERVICE = os.environ.get("EASYPANEL_BOT_SERVICE", "bot")
_BOT_URL    = os.environ.get("BOT_INTERNAL_URL", "http://bot:8000")


@router.get("/bot/status")
async def get_bot_status(business_id: str = Depends(get_business_id)):
    running = False
    paused = False
    try:
        secret = os.environ.get("INTERNAL_JOB_SECRET", "")
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{_BOT_URL}/health")
            running = r.status_code == 200
            if running:
                rp = await client.get(
                    f"{_BOT_URL}/internal/bot/paused",
                    params={"business_id": business_id},
                    headers={"X-Internal-Secret": secret},
                )
                paused = rp.json().get("paused", False) if rp.status_code == 200 else False
    except Exception:
        running = False
    return {
        "running": running,
        "paused": paused,
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
    secret = os.environ.get("INTERNAL_JOB_SECRET", "")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.post(
                f"{_BOT_URL}/internal/bot/resume",
                json={"business_id": business_id},
                headers={"X-Internal-Secret": secret},
            )
            if r.status_code == 200:
                return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"No se pudo conectar al bot: {e}")
    raise HTTPException(status_code=502, detail="El bot no respondió")


@router.post("/bot/stop")
async def stop_bot(business_id: str = Depends(get_business_id)):
    secret = os.environ.get("INTERNAL_JOB_SECRET", "")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.post(
                f"{_BOT_URL}/internal/bot/pause",
                json={"business_id": business_id},
                headers={"X-Internal-Secret": secret},
            )
            if r.status_code == 200:
                return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"No se pudo conectar al bot: {e}")
    raise HTTPException(status_code=502, detail="El bot no respondió")
