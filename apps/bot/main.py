import os
import asyncio
import hashlib
import hmac
import json
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException, Query, Header, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client

from agent import handle_message, get_business, _db, pause_business, resume_business, is_paused, _paused_businesses
from whatsapp_send import send_whatsapp_cloud
from scheduler import (
    start_scheduler, stop_scheduler,
    pending_reminders, pending_confirmations,
    job_outbox_flush,
)

load_dotenv(Path(__file__).parent.parent.parent / ".env")

TZ = ZoneInfo("America/Mexico_City")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Arranca el scheduler de mensajes proactivos (anti-no-show) dentro del bot.
    start_scheduler()
    try:
        yield
    finally:
        stop_scheduler()


app = FastAPI(title="Fluvio WhatsApp Bot", lifespan=lifespan)

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "")
_INTERNAL_SECRET = os.getenv("INTERNAL_JOB_SECRET", "")
_META_APP_SECRET = os.getenv("META_APP_SECRET", "")

if not _META_APP_SECRET:
    print(
        "[webhook] ADVERTENCIA: META_APP_SECRET no configurado — el webhook "
        "aceptará POSTs sin validar la firma de Meta. Configúralo antes de producción."
    )


def _verify_internal(x_internal_secret: str = Header(default="")):
    if not _INTERNAL_SECRET or not hmac.compare_digest(x_internal_secret, _INTERNAL_SECRET):
        raise HTTPException(status_code=401, detail="Secreto interno inválido")


def _valid_meta_signature(raw_body: bytes, signature_header: str) -> bool:
    """Valida el header X-Hub-Signature-256 (HMAC-SHA256 con el App Secret)."""
    if not signature_header.startswith("sha256="):
        return False
    expected = hmac.new(_META_APP_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header[len("sha256="):])


# Dedupe de mensajes: Meta reintenta la entrega si no respondemos rápido y un
# reintento no debe crear reservaciones duplicadas. Ventana en memoria de los
# últimos wamids procesados (suficiente para el intervalo de reintentos).
_SEEN_MAX = 2000
_seen_wamids: set[str] = set()
_seen_order: deque = deque()


def _already_processed(wamid: str) -> bool:
    if not wamid:
        return False
    if wamid in _seen_wamids:
        return True
    _seen_wamids.add(wamid)
    _seen_order.append(wamid)
    if len(_seen_order) > _SEEN_MAX:
        _seen_wamids.discard(_seen_order.popleft())
    return False


# ─── WhatsApp Cloud API webhook (para cuando se migre a Cloud API) ────────────

@app.get("/webhook")
def verify_webhook(
    hub_mode: str = Query(default="", alias="hub.mode"),
    hub_verify_token: str = Query(default="", alias="hub.verify_token"),
    hub_challenge: str = Query(default="", alias="hub.challenge"),
):
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Token inválido")


@app.post("/webhook")
async def receive_message(request: Request):
    raw_body = await request.body()

    # Autenticidad: Meta firma cada POST con HMAC-SHA256 del App Secret.
    # Sin firma válida, cualquiera que conozca la URL podría inyectar
    # mensajes falsos (crear/cancelar reservas suplantando clientes).
    if _META_APP_SECRET:
        signature = request.headers.get("X-Hub-Signature-256", "")
        if not _valid_meta_signature(raw_body, signature):
            print("[webhook] Rechazado: firma X-Hub-Signature-256 inválida o ausente")
            raise HTTPException(status_code=403, detail="Firma inválida")

    try:
        body = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="JSON inválido")

    # Meta puede agrupar varios entries/changes/messages en un solo POST.
    try:
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                phone_num_id = value.get("metadata", {}).get("phone_number_id", "")
                for msg in value.get("messages", []):
                    await _process_incoming(msg, phone_num_id)
    except Exception as e:
        # Nunca devolver 5xx a Meta por errores internos: reintentaría el
        # payload completo y duplicaría el trabajo. El dedupe cubre el resto.
        print(f"[webhook] ERROR: {type(e).__name__}: {e}")
    return {"status": "ok"}


async def _process_incoming(msg: dict, phone_num_id: str) -> None:
    from_number = msg.get("from", "")
    wamid = msg.get("id", "")
    if _already_processed(wamid):
        print(f"[webhook] Duplicado ignorado wamid={wamid}")
        return

    print(f"[webhook] msg from={from_number} phone_num_id={phone_num_id} type={msg.get('type')}")
    if msg.get("type") != "text":
        return

    text = msg.get("text", {}).get("body", "")
    if not text:
        return
    print(f"[webhook] text={text!r}")
    reply = await asyncio.to_thread(handle_message, phone_num_id, from_number, text)
    print(f"[webhook] reply={reply!r}")
    if reply:
        biz = get_business(phone_num_id)
        biz_token = (biz or {}).get("whatsapp_access_token")
        await send_whatsapp_cloud(from_number, reply, phone_num_id, biz_token)


# ─── Endpoint interno para Baileys bridge ────────────────────────────────────

class BridgeMessage(BaseModel):
    customer_phone: str
    text: str
    business_phone_number_id: str
    push_name: Optional[str] = None
    jid: Optional[str] = None


@app.post("/internal/process")
async def process_from_bridge(body: BridgeMessage, _: None = Depends(_verify_internal)):
    reply = await asyncio.to_thread(
        handle_message,
        body.business_phone_number_id,
        body.customer_phone,
        body.text,
        body.push_name,
        body.jid,
    )
    return {"reply": reply or ""}


# ─── Outbox: pendientes para enviar vía Baileys (legado) ─────────────────────

@app.get("/internal/outbox/{business_phone_number_id}")
def get_outbox(business_phone_number_id: str, limit: int = 20, _: None = Depends(_verify_internal)):
    business = get_business(business_phone_number_id)
    if not business:
        return {"items": []}
    db = _db()
    result = db.table("outbox").select(
        "id,phone,jid,content,platform"
    ).eq("business_id", business["id"]).eq("sent", False).eq(
        "platform", "whatsapp"
    ).order("created_at").limit(limit).execute()
    return {"items": result.data}


@app.post("/internal/outbox/{item_id}/sent")
def mark_outbox_sent(item_id: int, _: None = Depends(_verify_internal)):
    _db().table("outbox").update({"sent": True}).eq("id", item_id).execute()
    return {"ok": True}


# ─── Outbox flush: envía pendientes vía WhatsApp Cloud API ───────────────────

@app.post("/internal/outbox/flush")
async def flush_outbox(_: None = Depends(_verify_internal)):
    """
    Lee mensajes pendientes del outbox y los envía via WhatsApp Cloud API.
    Reutiliza la lógica del scheduler (una sola implementación, sin N+1).
    """
    return await job_outbox_flush()


# ─── Recordatorios (2h antes) ────────────────────────────────────────────────

@app.get("/internal/reminders/{business_phone_number_id}")
def get_pending_reminders(business_phone_number_id: str, _: None = Depends(_verify_internal)):
    """
    Retorna reservaciones que deben recibir recordatorio
    entre 90 y 150 minutos antes de su hora.
    """
    business = get_business(business_phone_number_id)
    if not business:
        return {"items": []}

    db = _db()
    items = []
    for r in pending_reminders(db, business["id"]):
        cust = r.get("reservations_customers") or {}
        dt_mx = datetime.fromisoformat(r["fecha_hora"]).astimezone(TZ)
        items.append({
            "id":      r["id"],
            "phone":   cust.get("telefono", ""),
            "jid":     cust.get("jid"),
            "nombre":  cust.get("nombre", ""),
            "hora":    dt_mx.strftime("%H:%M"),
            "fecha":   dt_mx.strftime("%d/%m/%Y"),
            "personas": r["personas"],
        })
    return {"items": items}


@app.post("/internal/reminders/{reservation_id}/sent")
def mark_reminder_sent(reservation_id: str, _: None = Depends(_verify_internal)):
    _db().table("reservations").update({"reminder_sent": True}).eq("id", reservation_id).execute()
    return {"ok": True}


# ─── Confirmaciones (24h antes) ───────────────────────────────────────────────

@app.get("/internal/confirmations/{business_phone_number_id}")
def get_pending_confirmations(business_phone_number_id: str, _: None = Depends(_verify_internal)):
    """
    Retorna reservaciones que deben recibir mensaje de confirmación
    entre 23 y 25 horas antes.
    """
    business = get_business(business_phone_number_id)
    if not business:
        return {"items": []}

    db = _db()
    items = []
    for r in pending_confirmations(db, business["id"]):
        cust = r.get("reservations_customers") or {}
        dt_mx = datetime.fromisoformat(r["fecha_hora"]).astimezone(TZ)
        items.append({
            "id":      r["id"],
            "phone":   cust.get("telefono", ""),
            "jid":     cust.get("jid"),
            "nombre":  cust.get("nombre", ""),
            "hora":    dt_mx.strftime("%H:%M"),
            "fecha":   dt_mx.strftime("%d/%m/%Y"),
            "personas": r["personas"],
        })
    return {"items": items}


@app.post("/internal/confirmations/{reservation_id}/sent")
def mark_confirmation_sent(reservation_id: str, _: None = Depends(_verify_internal)):
    _db().table("reservations").update({"confirmation_sent": True}).eq("id", reservation_id).execute()
    return {"ok": True}


# ─── Modo de conversación ─────────────────────────────────────────────────────

class ModeUpdate(BaseModel):
    conversation_id: int
    mode: str  # "AI" | "HUMAN"


@app.post("/internal/mode")
def update_mode(body: ModeUpdate, _: None = Depends(_verify_internal)):
    if body.mode not in ("AI", "HUMAN"):
        raise HTTPException(status_code=400, detail="mode debe ser AI o HUMAN")
    _db().table("conversations").update({"mode": body.mode}).eq("id", body.conversation_id).execute()
    return {"ok": True}


# ─── Control de pausa ────────────────────────────────────────────────────────

class PauseBody(BaseModel):
    business_id: str


@app.post("/internal/bot/pause")
def bot_pause(body: PauseBody, _: None = Depends(_verify_internal)):
    pause_business(body.business_id)
    return {"paused": True, "business_id": body.business_id}


@app.post("/internal/bot/resume")
def bot_resume(body: PauseBody, _: None = Depends(_verify_internal)):
    resume_business(body.business_id)
    return {"paused": False, "business_id": body.business_id}


@app.get("/internal/bot/paused")
def bot_paused_state(business_id: str, _: None = Depends(_verify_internal)):
    return {"paused": is_paused(business_id)}


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "paused_count": len(_paused_businesses)}
