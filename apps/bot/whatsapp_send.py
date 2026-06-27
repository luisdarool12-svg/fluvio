"""
Envío de mensajes vía WhatsApp Cloud API.

Compartido por el webhook (apps/bot/main.py) y el scheduler de mensajes
proactivos (apps/bot/scheduler.py). Centraliza el endpoint de Graph y el
manejo del token por-negocio (Embedded Signup) con fallback al token global.

IMPORTANTE — ventana de 24h de WhatsApp:
Los mensajes proactivos (recordatorios 2h antes, confirmaciones 24h antes) que
se envían FUERA de la ventana de servicio de 24h requieren una *plantilla
aprobada* por Meta; el texto libre será rechazado (errores 131047 / 131026).
Dentro de la ventana (el cliente nos escribió en las últimas 24h) el texto
libre funciona. `send_whatsapp_cloud` reporta el resultado para que el caller
decida si reintentar o no.
"""
import os
from typing import Optional, TypedDict

import httpx

_GRAPH_VERSION = "v20.0"
_SEND_TIMEOUT_S = 15.0


class SendResult(TypedDict):
    ok: bool            # True si Graph aceptó el mensaje (HTTP 200)
    status: Optional[int]   # status HTTP, o None si ni siquiera hubo respuesta
    body: str           # cuerpo de respuesta o mensaje de excepción
    retriable: bool     # True si vale la pena reintentar (red caída / 5xx)


async def send_whatsapp_cloud(
    to: str,
    text: str,
    phone_num_id: str,
    access_token: Optional[str] = None,
) -> SendResult:
    """
    Envía un mensaje de texto por WhatsApp Cloud API.

    Usa el token del negocio si se provee; si no, cae al token global del env.
    Nunca lanza: devuelve un SendResult que distingue rechazo definitivo
    (no reintentar) de falla transitoria (reintentar).
    """
    token = access_token or os.getenv("WHATSAPP_TOKEN", "")
    url = f"https://graph.facebook.com/{_GRAPH_VERSION}/{phone_num_id}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": text},
    }
    try:
        async with httpx.AsyncClient(timeout=_SEND_TIMEOUT_S) as client:
            resp = await client.post(
                url, json=payload, headers={"Authorization": f"Bearer {token}"}
            )
        ok = resp.status_code == 200
        if not ok:
            print(f"[send] status={resp.status_code} body={resp.text}")
        return {
            "ok": ok,
            "status": resp.status_code,
            "body": resp.text,
            # 5xx = problema temporal de Meta → reintentar; 4xx = rechazo definitivo
            "retriable": (not ok) and resp.status_code >= 500,
        }
    except Exception as e:  # noqa: BLE001 — red caída / timeout: reintentar luego
        print(f"[send] ERROR enviando a {to}: {type(e).__name__}: {e}")
        return {"ok": False, "status": None, "body": str(e), "retriable": True}
