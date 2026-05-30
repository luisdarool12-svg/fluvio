import os
import hmac
import hashlib
import httpx
from fastapi import FastAPI, Request, HTTPException, Query
from dotenv import load_dotenv

from agent import handle_message

load_dotenv()

app = FastAPI(title="OptimizaAI WhatsApp Bot")

VERIFY_TOKEN = os.environ["WHATSAPP_VERIFY_TOKEN"]
WHATSAPP_TOKEN = os.environ["WHATSAPP_TOKEN"]
PHONE_NUMBER_ID = os.environ["WHATSAPP_PHONE_NUMBER_ID"]


@app.get("/webhook")
def verify_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
    hub_challenge: str = Query(alias="hub.challenge"),
):
    """Verificación inicial del webhook por Meta."""
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Token inválido")


@app.post("/webhook")
async def receive_message(request: Request):
    """Recibe mensajes entrantes de WhatsApp Cloud API."""
    body = await request.json()

    try:
        entry = body["entry"][0]
        change = entry["changes"][0]
        value = change["value"]

        if "messages" not in value:
            return {"status": "no_message"}

        message = value["messages"][0]
        from_number = message["from"]
        business_phone_number_id = value["metadata"]["phone_number_id"]

        if message["type"] == "text":
            text = message["text"]["body"]
            reply = await handle_message(
                business_phone_number_id=business_phone_number_id,
                customer_phone=from_number,
                text=text,
            )
            await send_whatsapp_message(from_number, reply)

    except (KeyError, IndexError):
        pass

    return {"status": "ok"}


async def send_whatsapp_message(to: str, text: str):
    url = f"https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages"
    headers = {"Authorization": f"Bearer {WHATSAPP_TOKEN}"}
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text},
    }
    async with httpx.AsyncClient() as client:
        await client.post(url, json=payload, headers=headers)


@app.get("/health")
def health():
    return {"status": "ok"}
