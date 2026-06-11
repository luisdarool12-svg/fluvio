import os
import re
import time
import unicodedata
from datetime import datetime, date, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Optional
from pathlib import Path

import anthropic
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

from system_prompt import get_system_prompt
from sheets_service import register_event_inscription

load_dotenv(Path(__file__).parent.parent.parent / ".env")

TZ = ZoneInfo("America/Mexico_City")
CLAUDE_MODEL = "claude-haiku-4-5-20251001"

# API interno (motor de disponibilidad de mesas)
API_URL = os.getenv("API_URL", "http://localhost:8000")
_AVAILABILITY_TIMEOUT_S = 5.0

# ─── Clientes ────────────────────────────────────────────────────────────────

def _claude() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])


def _db() -> Client:
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


# ─── Cache de negocio ────────────────────────────────────────────────────────
# Entradas (data, fetched_at) con TTL: cambios a businesses.bot_config desde el
# dashboard llegan al bot en ≤ BUSINESS_CACHE_TTL_SECONDS sin reiniciar.
# Si Supabase no responde al refrescar, se sirve la entrada vencida (stale)
# antes que tirar la conversación.

BUSINESS_CACHE_TTL_SECONDS = 300

_business_cache: dict[str, tuple[dict, float]] = {}

# ─── Estado de pausa (en memoria, por business_id) ───────────────────────────

_paused_businesses: set[str] = set()


def pause_business(business_id: str) -> None:
    _paused_businesses.add(business_id)


def resume_business(business_id: str) -> None:
    _paused_businesses.discard(business_id)


def is_paused(business_id: str) -> bool:
    return business_id in _paused_businesses


def get_business(phone_number_id: str) -> Optional[dict]:
    cached = _business_cache.get(phone_number_id)
    if cached is not None:
        data, fetched_at = cached
        if time.monotonic() - fetched_at < BUSINESS_CACHE_TTL_SECONDS:
            return data

    try:
        result = _db().table("businesses").select("*").eq(
            "telefono_whatsapp", phone_number_id
        ).eq("activo", True).execute()
    except Exception as e:
        if cached is not None:
            print(f"[get_business] Supabase falló, sirviendo cache stale: {e}")
            return cached[0]
        raise

    if result.data:
        _business_cache[phone_number_id] = (result.data[0], time.monotonic())
        return result.data[0]
    return None


# ─── Conversaciones ──────────────────────────────────────────────────────────

def get_or_create_conversation(
    db: Client, business_id: str, phone: str,
    platform: str = "whatsapp",
    name: Optional[str] = None,
    jid: Optional[str] = None,
) -> dict:
    result = db.table("conversations").select("*").eq(
        "business_id", business_id
    ).eq("phone", phone).execute()

    if result.data:
        conv = result.data[0]
        patch: dict = {}
        if name and name != conv.get("name"):
            patch["name"] = name
        if jid and jid != conv.get("jid"):
            patch["jid"] = jid
        if patch:
            db.table("conversations").update(patch).eq("id", conv["id"]).execute()
            conv.update(patch)
        return conv

    new_conv = db.table("conversations").insert({
        "business_id": business_id,
        "phone": phone,
        "platform": platform,
        "name": name,
        "jid": jid,
        "mode": "AI",
    }).execute()
    return new_conv.data[0]


def save_message(db: Client, business_id: str, conv_id: int, role: str, content: str) -> None:
    db.table("messages").insert({
        "business_id": business_id,
        "conversation_id": conv_id,
        "role": role,
        "content": content,
    }).execute()
    patch: dict = {"last_message_at": datetime.now(timezone.utc).isoformat()}
    if role == "user":
        conv = db.table("conversations").select("unread_count").eq("id", conv_id).single().execute()
        patch["unread_count"] = (conv.data.get("unread_count") or 0) + 1
    db.table("conversations").update(patch).eq("id", conv_id).execute()


def get_recent_history(db: Client, conv_id: int, limit: int = 20) -> list[dict]:
    rows = db.table("messages").select("role,content").eq(
        "conversation_id", conv_id
    ).order("created_at", desc=True).limit(limit).execute()
    return list(reversed(rows.data))


# ─── Clientes ────────────────────────────────────────────────────────────────

def upsert_customer(db: Client, business_id: str, phone: str, nombre: str, jid: Optional[str] = None) -> str:
    """Upsert customer and return their UUID.

    El hecho de que el cliente nos escriba primero es opt-in válido según la política
    de WhatsApp (el usuario inició la conversación).  Por eso siempre marcamos
    whatsapp_opt_in=True aquí — nunca en mensajes outbound sin consentimiento previo.
    """
    existing = db.table("customers").select("id,visitas,whatsapp_opt_in").eq(
        "business_id", business_id
    ).eq("telefono", phone).execute()

    now_iso = datetime.now(timezone.utc).isoformat()
    if existing.data:
        cid = existing.data[0]["id"]
        visitas = existing.data[0]["visitas"] + 1
        patch: dict = {"nombre": nombre, "visitas": visitas, "ultima_visita": now_iso}
        if jid:
            patch["jid"] = jid
        # Marcar opt-in si aún no estaba — el cliente acaba de escribirnos
        if not existing.data[0].get("whatsapp_opt_in"):
            patch["whatsapp_opt_in"] = True
            patch["opt_in_date"] = now_iso
        db.table("customers").update(patch).eq("id", cid).execute()
        return cid

    row: dict = {
        "business_id": business_id,
        "telefono": phone,
        "nombre": nombre,
        "visitas": 1,
        "ultima_visita": now_iso,
        "whatsapp_opt_in": True,
        "opt_in_date": now_iso,
    }
    if jid:
        row["jid"] = jid
    result = db.table("customers").insert(row).execute()
    return result.data[0]["id"]


# ─── Reservaciones ───────────────────────────────────────────────────────────

def _fecha_to_date(fecha: str) -> Optional[date]:
    """Parse DD/MM/YYYY → date."""
    try:
        dd, mm, yyyy = fecha.split("/")
        return date(int(yyyy), int(mm), int(dd))
    except (ValueError, AttributeError):
        return None


def _reserva_datetime(fecha: str, hora: str) -> Optional[datetime]:
    """DD/MM/YYYY + HH:MM → datetime tz-aware en Mexico City."""
    d = _fecha_to_date(fecha)
    if d is None:
        return None
    try:
        hh, mm = hora.split(":")
        return datetime(d.year, d.month, d.day, int(hh), int(mm), tzinfo=TZ)
    except (ValueError, AttributeError):
        return None


def save_reservation(
    db: Client, business_id: str, conv_id: int,
    phone: str, reserva: dict, jid: Optional[str] = None,
    table_id: Optional[str] = None,
    mesas_combinadas: Optional[list] = None,
) -> None:
    customer_id = upsert_customer(db, business_id, phone, reserva["nombre"], jid)
    fecha_hora = _reserva_datetime(reserva["fecha"], reserva["hora"])
    if fecha_hora is None:
        print(f"[agent] Fecha/hora inválida: {reserva.get('fecha')} {reserva.get('hora')}")
        return

    row: dict = {
        "business_id":  business_id,
        "customer_id":  customer_id,
        "fecha_hora":   fecha_hora.isoformat(),
        "personas":     reserva["personas"],
        "estado":       "pendiente",
        "canal":        "whatsapp",
        "zona":         reserva.get("zona"),
        "requisicion":  reserva.get("requisicion"),
        "notas":        reserva.get("requisicion"),
    }
    if table_id:
        row["table_id"] = table_id
    if mesas_combinadas:
        row["mesas_combinadas"] = mesas_combinadas

    db.table("reservations").insert(row).execute()


# ─── Disponibilidad de mesas (vía API interno) ───────────────────────────────
# El motor vive en apps/api/modules/reservations/availability.py; el bot lo
# consulta por HTTP porque api y bot se despliegan en contenedores separados.

def consultar_disponibilidad_api(
    business_id: str, personas: int, fecha_hora: datetime, duracion_min: int = 90,
) -> Optional[dict]:
    """
    Consulta el motor de disponibilidad. Devuelve None si el API no responde
    (fail-open: ante una falla técnica la reserva se acepta sin mesa asignada,
    como antes de existir el motor — nunca se rechaza a un cliente por un error
    de infraestructura).
    """
    try:
        resp = httpx.post(
            f"{API_URL}/internal/availability",
            json={
                "business_id": business_id,
                "personas": personas,
                "fecha_hora": fecha_hora.isoformat(),
                "duracion_min": duracion_min,
            },
            headers={"X-Internal-Secret": os.getenv("INTERNAL_JOB_SECRET", "")},
            timeout=_AVAILABILITY_TIMEOUT_S,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[agent] No se pudo verificar disponibilidad: {e}")
        return None


def _hora_local(iso_dt: str) -> str:
    """ISO datetime → 'HH:MM' en hora de Mexico City."""
    return datetime.fromisoformat(iso_dt).astimezone(TZ).strftime("%H:%M")


def _disponibilidad_tool_result(business_id: str, tinput: dict) -> str:
    """Texto de tool_result para la tool consultar_disponibilidad."""
    fecha = tinput.get("fecha", "")
    hora = tinput.get("hora", "")
    personas = tinput.get("personas", 2)

    fecha_hora = _reserva_datetime(fecha, hora)
    if fecha_hora is None:
        return "ERROR: Formato de fecha u hora inválido. Pide al cliente fecha (DD/MM/YYYY) y hora (HH:MM) nuevamente."

    disp = consultar_disponibilidad_api(business_id, personas, fecha_hora)
    if disp is None or disp.get("sin_mesas_configuradas"):
        return (
            "AVISO: No fue posible verificar la disponibilidad en este momento. "
            "Continúa con la reservación normalmente."
        )

    if not disp.get("restaurante_lleno"):
        combinadas = disp.get("mesas_combinadas") or []
        extra = " (se unirán dos mesas para el grupo)" if combinadas else ""
        return (
            f"DISPONIBLE: Sí hay mesa para {personas} persona(s) el {fecha} "
            f"a las {hora}{extra}. Puedes continuar con la reservación."
        )

    proxima = disp.get("proxima_disponibilidad")
    if proxima:
        return (
            f"LLENO: No hay mesa para {personas} persona(s) el {fecha} a las {hora}. "
            f"La próxima disponibilidad ese día es a las {_hora_local(proxima)}. "
            "Ofrece esa hora al cliente como alternativa."
        )
    return (
        f"LLENO: No hay mesa para {personas} persona(s) el {fecha} a las {hora} "
        "ni en las horas siguientes. Sugiere al cliente otra fecha."
    )


def _find_reservation(db: Client, business_id: str, phone: str, fecha: str, hora: str) -> Optional[dict]:
    cust = db.table("customers").select("id").eq("business_id", business_id).eq("telefono", phone).execute()
    if not cust.data:
        return None
    cid = cust.data[0]["id"]

    d = _fecha_to_date(fecha)
    if d is None:
        return None
    hh, mm = hora.split(":")
    fecha_hora = datetime(d.year, d.month, d.day, int(hh), int(mm), tzinfo=TZ).isoformat()

    result = db.table("reservations").select("*").eq("business_id", business_id).eq(
        "customer_id", cid
    ).eq("fecha_hora", fecha_hora).neq("estado", "cancelada").order(
        "created_at", desc=True
    ).limit(1).execute()
    return result.data[0] if result.data else None


def _update_reservation(db: Client, res_id: str, patch: dict) -> None:
    db.table("reservations").update(patch).eq("id", res_id).execute()


def _cancel_reservation(db: Client, res_id: str) -> None:
    db.table("reservations").update({"estado": "cancelada"}).eq("id", res_id).execute()


def get_upcoming_reservation(db: Client, business_id: str, phone: str) -> Optional[dict]:
    """Próxima reservación pendiente de confirmar para este teléfono."""
    cust = db.table("customers").select("id,nombre").eq("business_id", business_id).eq("telefono", phone).execute()
    if not cust.data:
        return None
    cid = cust.data[0]["id"]
    nombre = cust.data[0]["nombre"]

    now_mx = datetime.now(TZ)
    yesterday = (now_mx - timedelta(days=1)).isoformat()

    result = db.table("reservations").select("*").eq("business_id", business_id).eq(
        "customer_id", cid
    ).eq("estado", "pendiente").gte("fecha_hora", yesterday).order("fecha_hora").limit(1).execute()

    if result.data:
        r = result.data[0]
        r["_nombre"] = nombre
        r["_phone"] = phone
        return r
    return None


def mark_confirmed(db: Client, res_id: str) -> None:
    db.table("reservations").update({"estado": "confirmada"}).eq("id", res_id).execute()


# ─── Validación ──────────────────────────────────────────────────────────────

def validate_reservation(reserva: dict) -> str:
    fecha = reserva.get("fecha", "")
    hora  = reserva.get("hora", "")

    d = _fecha_to_date(fecha)
    if d is None:
        return "ERROR: Formato de fecha inválido. Pide al cliente la fecha nuevamente en formato DD/MM/YYYY."

    today = datetime.now(TZ).date()
    if d < today:
        return "ERROR: La fecha ya pasó. El cliente debe elegir una fecha futura."
    if d.weekday() == 0:  # Monday
        return "ERROR: La fecha solicitada cae en lunes, día de cierre. Informa al cliente e invítalo a elegir otro día (martes a domingo)."

    try:
        hh, mi = map(int, hora.split(":"))
    except (ValueError, AttributeError):
        return "ERROR: Formato de hora inválido. Pide al cliente la hora nuevamente."

    minutes = hh * 60 + mi
    is_sunday = d.weekday() == 6
    open_start = 14 * 60
    open_end   = 18 * 60 if is_sunday else 23 * 60

    if minutes < open_start or minutes > open_end:
        rng = "14:00 a 18:00" if is_sunday else "14:00 a 23:00"
        return (
            f"ERROR: La hora {hora} está fuera del horario de atención ({rng}). "
            "Informa al cliente e invítalo a elegir otra hora dentro del rango."
        )

    return "Reservación registrada exitosamente en el sistema."


# ─── Tools para Claude ───────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "consultar_disponibilidad",
        "description": (
            "Consulta si hay mesa disponible para una fecha, hora y número de personas. "
            "Úsala cuando el cliente pregunte por disponibilidad, o antes de confirmar "
            "una reservación si ya tienes fecha, hora y personas. Si el restaurante está "
            "lleno, la respuesta incluye la próxima hora disponible para ofrecérsela al "
            "cliente (ej. 'Las 20:00 está lleno, tenemos a las 21:00')."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "fecha":    {"type": "string",  "description": "Fecha en formato DD/MM/YYYY"},
                "hora":     {"type": "string",  "description": "Hora en formato HH:MM (24 horas)"},
                "personas": {"type": "integer", "description": "Número de personas"},
            },
            "required": ["fecha", "hora", "personas"],
        },
    },
    {
        "name": "confirmar_reservacion",
        "description": (
            "Llama a esta función ÚNICAMENTE cuando tengas los 4 datos obligatorios: "
            "nombre completo, fecha, hora y número de personas. Registra la reservación. "
            "El sistema verifica la disponibilidad automáticamente: si no hay mesa, "
            "recibirás la próxima hora disponible para ofrecerla al cliente."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "nombre":      {"type": "string",  "description": "Nombre completo del cliente"},
                "fecha":       {"type": "string",  "description": "Fecha en formato DD/MM/YYYY"},
                "hora":        {"type": "string",  "description": "Hora en formato HH:MM (24 horas)"},
                "personas":    {"type": "integer", "description": "Número de personas"},
                "zona":        {"type": "string",  "description": "terraza, comedor o sin preferencia"},
                "requisicion": {"type": "string",  "description": "Requisición especial o NINGUNA"},
            },
            "required": ["nombre", "fecha", "hora", "personas", "zona", "requisicion"],
        },
    },
    {
        "name": "modificar_reservacion",
        "description": "Modifica una reservación existente.",
        "input_schema": {
            "type": "object",
            "properties": {
                "nombre":          {"type": "string",  "description": "Nombre completo del cliente"},
                "fecha":           {"type": "string",  "description": "Fecha original DD/MM/YYYY"},
                "hora_original":   {"type": "string",  "description": "Hora original HH:MM"},
                "hora_nueva":      {"type": "string",  "description": "Nueva hora HH:MM"},
                "fecha_nueva":     {"type": "string",  "description": "Nueva fecha DD/MM/YYYY"},
                "personas_nuevas": {"type": "integer", "description": "Nuevo número de personas"},
            },
            "required": ["nombre", "fecha", "hora_original"],
        },
    },
    {
        "name": "cancelar_reservacion",
        "description": "Cancela una reservación. Solo después de confirmación explícita del cliente.",
        "input_schema": {
            "type": "object",
            "properties": {
                "nombre": {"type": "string", "description": "Nombre completo del cliente"},
                "fecha":  {"type": "string", "description": "Fecha DD/MM/YYYY"},
                "hora":   {"type": "string", "description": "Hora HH:MM"},
            },
            "required": ["nombre", "fecha", "hora"],
        },
    },
    {
        "name": "registrar_en_evento",
        "description": "Registra a un cliente en la Master Class.",
        "input_schema": {
            "type": "object",
            "properties": {
                "nombre": {"type": "string", "description": "Nombre completo del cliente"},
                "turno":  {"type": "string", "description": "matutino o vespertino"},
            },
            "required": ["nombre", "turno"],
        },
    },
]


# ─── Llamada de segundo turno (tool result → reply final) ────────────────────

def _second_turn(
    client: anthropic.Anthropic,
    system: str,
    messages: list,
    first_response_content: list,
    tool_use_id: str,
    tool_result: str,
) -> str:
    messages2 = messages + [
        {"role": "assistant", "content": first_response_content},
        {
            "role": "user",
            "content": [{"type": "tool_result", "tool_use_id": tool_use_id, "content": tool_result}],
        },
    ]
    resp = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=600,
        system=system,
        tools=TOOLS,
        messages=messages2,
    )
    for block in resp.content:
        if block.type == "text":
            return block.text.strip()
    return ""


# ─── Normalización para SI/NO ─────────────────────────────────────────────────

def _normalize(text: str) -> str:
    nfd = unicodedata.normalize("NFD", text.strip().lower())
    return "".join(c for c in nfd if unicodedata.category(c) != "Mn")


_RE_SI = re.compile(r"^(si|yes|confirmo|confirmado|de acuerdo|ok|okay|claro|correcto|perfecto)$")
_RE_NO = re.compile(r"^(no|cancel|cancelo|cancelar|no puedo|no voy|ya no)$")


# ─── Handler principal ───────────────────────────────────────────────────────

def handle_message(
    business_phone_number_id: str,
    customer_phone: str,
    text: str,
    push_name: Optional[str] = None,
    jid: Optional[str] = None,
) -> str:
    business = get_business(business_phone_number_id)
    if not business:
        return "Lo sentimos, este número no está configurado. Contáctanos directamente."

    business_id: str = business["id"]

    if is_paused(business_id):
        return ""

    db = _db()

    conv = get_or_create_conversation(db, business_id, customer_phone, "whatsapp", push_name, jid)
    save_message(db, business_id, conv["id"], "user", text)

    # Leer mode fresco
    mode_row = db.table("conversations").select("mode").eq("id", conv["id"]).execute()
    if not mode_row.data or mode_row.data[0]["mode"] != "AI":
        return ""  # Modo HUMAN — sin respuesta automática

    # ── Interceptor SI/NO para confirmaciones pendientes ─────────────────────
    norm = _normalize(text)
    is_si = bool(_RE_SI.match(norm))
    is_no = bool(_RE_NO.match(norm))

    if is_si or is_no:
        upcoming = get_upcoming_reservation(db, business_id, customer_phone)
        if upcoming:
            nombre  = upcoming.get("_nombre", "")
            fecha_h: str = upcoming["fecha_hora"]
            dt_mx   = datetime.fromisoformat(fecha_h).astimezone(TZ)
            fecha_display = dt_mx.strftime("%d/%m/%Y")
            hora_display  = dt_mx.strftime("%H:%M")
            biz_name = business.get("nombre", "el restaurante")

            if is_si:
                mark_confirmed(db, upcoming["id"])
                reply = (
                    f"Perfecto, {nombre}. Su reservación del {fecha_display} "
                    f"a las {hora_display} queda confirmada. "
                    f"Le esperamos en {biz_name}."
                )
                save_message(db, business_id, conv["id"], "assistant", reply)
                return reply
            else:
                _cancel_reservation(db, upcoming["id"])
                reply = (
                    f"Entendido, {nombre}. Su reservación del {fecha_display} "
                    "ha sido cancelada. Si desea reagendar o tiene alguna duda, "
                    "aquí mismo le atendemos."
                )
                save_message(db, business_id, conv["id"], "assistant", reply)
                return reply

    # ── Historial y llamada a Claude ─────────────────────────────────────────
    history = get_recent_history(db, conv["id"], 20)
    messages = [
        {"role": m["role"] if m["role"] != "human" else "user", "content": m["content"]}
        for m in history
    ]

    system = get_system_prompt(business)
    client = _claude()

    try:
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=600,
            system=system,
            tools=TOOLS,
            messages=messages,
        )
    except Exception as e:
        print(f"[agent] Error Claude: {e}")
        return ""

    reply = ""
    tool_block = None

    for block in response.content:
        if block.type == "text":
            reply = block.text.strip()
        elif block.type == "tool_use":
            tool_block = block

    # ── Manejar tool calls ────────────────────────────────────────────────────
    if tool_block:
        tname  = tool_block.name
        tinput = tool_block.input

        if tname == "consultar_disponibilidad":
            tool_resp = _disponibilidad_tool_result(business_id, tinput)
            reply = _second_turn(client, system, messages, response.content, tool_block.id, tool_resp)

        elif tname == "confirmar_reservacion":
            tool_resp = validate_reservation(tinput)

            if not tool_resp.startswith("ERROR"):
                # Motor de disponibilidad: rechazar si está lleno, asignar mesa si hay
                table_id: Optional[str] = None
                mesas_combinadas: Optional[list] = None
                fecha_hora = _reserva_datetime(tinput["fecha"], tinput["hora"])
                disp = consultar_disponibilidad_api(
                    business_id, tinput["personas"], fecha_hora
                ) if fecha_hora else None

                if disp and disp.get("restaurante_lleno"):
                    proxima = disp.get("proxima_disponibilidad")
                    if proxima:
                        tool_resp = (
                            f"ERROR: No hay mesas disponibles el {tinput['fecha']} a las "
                            f"{tinput['hora']} para {tinput['personas']} persona(s). "
                            f"La próxima disponibilidad ese día es a las {_hora_local(proxima)}. "
                            "Informa al cliente y ofrécele esa hora como alternativa."
                        )
                    else:
                        tool_resp = (
                            f"ERROR: No hay mesas disponibles el {tinput['fecha']} a las "
                            f"{tinput['hora']} para {tinput['personas']} persona(s), ni en las "
                            "horas siguientes. Informa al cliente e invítalo a elegir otra fecha."
                        )
                else:
                    if disp:
                        table_id = disp.get("mesa_id")
                        mesas_combinadas = disp.get("mesas_combinadas") or None
                    try:
                        tinput["telefono"] = customer_phone
                        save_reservation(
                            db, business_id, conv["id"], customer_phone, tinput, jid,
                            table_id=table_id, mesas_combinadas=mesas_combinadas,
                        )
                    except Exception as e:
                        print(f"[agent] Error guardando reservación: {e}")
                        tool_resp = (
                            "ERROR: Ocurrió un problema técnico al registrar la reservación. "
                            "Discúlpate con el cliente y pídele que lo intente de nuevo en unos minutos."
                        )

            reply = _second_turn(client, system, messages, response.content, tool_block.id, tool_resp)

        elif tname == "modificar_reservacion":
            fecha_eff = tinput.get("fecha_nueva") or tinput["fecha"]
            hora_eff  = tinput.get("hora_nueva")  or tinput["hora_original"]
            check = {"nombre": tinput["nombre"], "fecha": fecha_eff, "hora": hora_eff, "personas": tinput.get("personas_nuevas", 2)}
            tool_resp = validate_reservation(check)
            reply = _second_turn(client, system, messages, response.content, tool_block.id, tool_resp)
            if not tool_resp.startswith("ERROR"):
                row = _find_reservation(db, business_id, customer_phone, tinput["fecha"], tinput["hora_original"])
                if row:
                    patch: dict = {}
                    if tinput.get("hora_nueva") or tinput.get("fecha_nueva"):
                        new_d = _fecha_to_date(tinput.get("fecha_nueva") or tinput["fecha"])
                        hh2, mm2 = (tinput.get("hora_nueva") or tinput["hora_original"]).split(":")
                        patch["fecha_hora"] = datetime(
                            new_d.year, new_d.month, new_d.day, int(hh2), int(mm2), tzinfo=TZ
                        ).isoformat()
                    if tinput.get("personas_nuevas"):
                        patch["personas"] = tinput["personas_nuevas"]
                    if patch:
                        _update_reservation(db, row["id"], patch)

        elif tname == "cancelar_reservacion":
            reply = _second_turn(client, system, messages, response.content, tool_block.id, "Cancelación registrada exitosamente.")
            row = _find_reservation(db, business_id, customer_phone, tinput["fecha"], tinput["hora"])
            if row:
                _cancel_reservation(db, row["id"])

        elif tname == "registrar_en_evento":
            reply = _second_turn(client, system, messages, response.content, tool_block.id, "Inscripción registrada exitosamente.")
            try:
                bot_config = business.get("bot_config") or {}
                if bot_config.get("sheets_id"):
                    register_event_inscription(business, tinput, customer_phone)
            except Exception as e:
                print(f"[agent] Error sheets: {e}")

    if reply:
        save_message(db, business_id, conv["id"], "assistant", reply)

    return reply
