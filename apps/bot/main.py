import os
import asyncio
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException, Query, Header, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client

from agent import handle_message, get_business, _db, pause_business, resume_business, is_paused, _paused_businesses

load_dotenv(Path(__file__).parent.parent.parent / ".env")

TZ = ZoneInfo("America/Mexico_City")
app = FastAPI(title="Fluvio WhatsApp Bot")

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "")
_INTERNAL_SECRET = os.getenv("INTERNAL_JOB_SECRET", "")


def _verify_internal(x_internal_secret: str = Header(default="")):
    if not _INTERNAL_SECRET or x_internal_secret != _INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Secreto interno inválido")


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
    body = await request.json()
    try:
        entry  = body["entry"][0]
        change = entry["changes"][0]
        value  = change["value"]
        if "messages" not in value:
            return {"status": "no_message"}
        msg          = value["messages"][0]
        from_number  = msg["from"]
        phone_num_id = value["metadata"]["phone_number_id"]
        print(f"[webhook] msg from={from_number} phone_num_id={phone_num_id} type={msg['type']}")
        if msg["type"] == "text":
            text = msg["text"]["body"]
            print(f"[webhook] text={text!r}")
            reply = await asyncio.to_thread(
                handle_message, phone_num_id, from_number, text
            )
            print(f"[webhook] reply={reply!r}")
            if reply:
                await _send_whatsapp_cloud(from_number, reply, phone_num_id)
    except Exception as e:
        print(f"[webhook] ERROR: {type(e).__name__}: {e}")
    return {"status": "ok"}


async def _send_whatsapp_cloud(to: str, text: str, phone_num_id: str):
    import httpx
    token = os.getenv("WHATSAPP_TOKEN", "")
    url = f"https://graph.facebook.com/v20.0/{phone_num_id}/messages"
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            url,
            json={"messaging_product": "whatsapp", "to": to, "type": "text", "text": {"body": text}},
            headers={"Authorization": f"Bearer {token}"},
        )
        print(f"[send] status={resp.status_code} body={resp.text}")


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
    Reemplaza el polling de Baileys para el envío de recordatorios.
    """
    db = _db()
    items = db.table("outbox").select(
        "id,phone,content,business_id"
    ).eq("sent", False).eq("platform", "whatsapp").order("created_at").limit(100).execute()

    sent_count = 0
    error_count = 0

    for item in items.data:
        biz = db.table("businesses").select("telefono_whatsapp").eq(
            "id", item["business_id"]
        ).execute()
        if not biz.data:
            continue
        phone_num_id = biz.data[0]["telefono_whatsapp"]
        try:
            await _send_whatsapp_cloud(item["phone"], item["content"], phone_num_id)
            db.table("outbox").update({"sent": True}).eq("id", item["id"]).execute()
            sent_count += 1
        except Exception as e:
            print(f"[outbox/flush] Error enviando a {item['phone']}: {e}")
            error_count += 1

    return {"sent": sent_count, "errors": error_count}


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
    now_mx   = datetime.now(TZ)
    win_min  = now_mx + timedelta(minutes=90)
    win_max  = now_mx + timedelta(minutes=150)

    result = db.table("reservations").select(
        "id,fecha_hora,personas,zona,reservations_customers:customer_id(nombre,telefono,jid)"
    ).eq("business_id", business["id"]).eq("reminder_sent", False).neq(
        "estado", "cancelada"
    ).gte("fecha_hora", win_min.isoformat()).lte("fecha_hora", win_max.isoformat()).execute()

    items = []
    for r in result.data:
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
def get_pending_confirmations(business_phone_number_id: str):
    """
    Retorna reservaciones que deben recibir mensaje de confirmación
    entre 23 y 25 horas antes.
    """
    business = get_business(business_phone_number_id)
    if not business:
        return {"items": []}

    db = _db()
    now_mx  = datetime.now(TZ)
    win_min = now_mx + timedelta(hours=23)
    win_max = now_mx + timedelta(hours=25)

    result = db.table("reservations").select(
        "id,fecha_hora,personas,reservations_customers:customer_id(nombre,telefono,jid)"
    ).eq("business_id", business["id"]).eq("confirmation_sent", False).eq(
        "estado", "pendiente"
    ).gte("fecha_hora", win_min.isoformat()).lte("fecha_hora", win_max.isoformat()).execute()

    items = []
    for r in result.data:
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
