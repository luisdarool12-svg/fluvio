import os
import asyncio
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException, Query
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client

from agent import handle_message, get_business, _db

load_dotenv(Path(__file__).parent.parent.parent / ".env")

TZ = ZoneInfo("America/Mexico_City")
app = FastAPI(title="Fluvio WhatsApp Bot")

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "")


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
        if msg["type"] == "text":
            text = msg["text"]["body"]
            reply = await asyncio.to_thread(
                handle_message, phone_num_id, from_number, text
            )
            if reply:
                await _send_whatsapp_cloud(from_number, reply, phone_num_id)
    except (KeyError, IndexError):
        pass
    return {"status": "ok"}


async def _send_whatsapp_cloud(to: str, text: str, phone_num_id: str):
    import httpx
    token = os.getenv("WHATSAPP_TOKEN", "")
    url = f"https://graph.facebook.com/v20.0/{phone_num_id}/messages"
    async with httpx.AsyncClient() as client:
        await client.post(
            url,
            json={"messaging_product": "whatsapp", "to": to, "type": "text", "text": {"body": text}},
            headers={"Authorization": f"Bearer {token}"},
        )


# ─── Endpoint interno para Baileys bridge ────────────────────────────────────

class BridgeMessage(BaseModel):
    customer_phone: str
    text: str
    business_phone_number_id: str
    push_name: Optional[str] = None
    jid: Optional[str] = None


@app.post("/internal/process")
async def process_from_bridge(body: BridgeMessage):
    reply = await asyncio.to_thread(
        handle_message,
        body.business_phone_number_id,
        body.customer_phone,
        body.text,
        body.push_name,
        body.jid,
    )
    return {"reply": reply or ""}


# ─── Outbox: pendientes para enviar vía Baileys ───────────────────────────────

@app.get("/internal/outbox/{business_phone_number_id}")
def get_outbox(business_phone_number_id: str, limit: int = 20):
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
def mark_outbox_sent(item_id: int):
    _db().table("outbox").update({"sent": True}).eq("id", item_id).execute()
    return {"ok": True}


# ─── Recordatorios (2h antes) ────────────────────────────────────────────────

@app.get("/internal/reminders/{business_phone_number_id}")
def get_pending_reminders(business_phone_number_id: str):
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
def mark_reminder_sent(reservation_id: str):
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
def mark_confirmation_sent(reservation_id: str):
    _db().table("reservations").update({"confirmation_sent": True}).eq("id", reservation_id).execute()
    return {"ok": True}


# ─── Modo de conversación ─────────────────────────────────────────────────────

class ModeUpdate(BaseModel):
    conversation_id: int
    mode: str  # "AI" | "HUMAN"


@app.post("/internal/mode")
def update_mode(body: ModeUpdate):
    if body.mode not in ("AI", "HUMAN"):
        raise HTTPException(status_code=400, detail="mode debe ser AI o HUMAN")
    _db().table("conversations").update({"mode": body.mode}).eq("id", body.conversation_id).execute()
    return {"ok": True}


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}
