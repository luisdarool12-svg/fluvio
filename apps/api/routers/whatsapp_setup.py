import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client

from core.auth import get_business_id

router = APIRouter()

META_GRAPH = "https://graph.facebook.com/v21.0"


def _db():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


class EmbeddedSignupCallback(BaseModel):
    code: str
    waba_id: str
    phone_number_id: str


@router.post("/callback")
def embedded_signup_callback(
    body: EmbeddedSignupCallback,
    business_id: str = Depends(get_business_id),
):
    app_id = os.environ.get("META_APP_ID", "")
    app_secret = os.environ.get("META_APP_SECRET", "")

    if not app_id or not app_secret:
        raise HTTPException(status_code=500, detail="META_APP_ID / META_APP_SECRET no configurados")

    # Intercambiar code por short-lived user token
    resp = httpx.get(
        f"{META_GRAPH}/oauth/access_token",
        params={
            "client_id": app_id,
            "client_secret": app_secret,
            "code": body.code,
        },
        timeout=10.0,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Error al intercambiar código: {resp.text}")

    short_token = resp.json().get("access_token")
    if not short_token:
        raise HTTPException(status_code=400, detail="Meta no devolvió access_token")

    # Convertir a long-lived token (válido 60 días)
    resp2 = httpx.get(
        "https://graph.facebook.com/oauth/access_token",
        params={
            "grant_type": "fb_exchange_token",
            "client_id": app_id,
            "client_secret": app_secret,
            "fb_exchange_token": short_token,
        },
        timeout=10.0,
    )
    access_token = short_token
    if resp2.status_code == 200:
        access_token = resp2.json().get("access_token", short_token)

    # Suscribir la WABA a los webhooks de nuestra app
    try:
        httpx.post(
            f"{META_GRAPH}/{body.waba_id}/subscribed_apps",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10.0,
        )
    except Exception as e:
        print(f"[whatsapp_setup] Warning: no se pudo suscribir WABA a webhooks: {e}")

    # Persistir credenciales — telefono_whatsapp es la clave de ruteo del bot
    _db().table("businesses").update({
        "waba_id": body.waba_id,
        "telefono_whatsapp": body.phone_number_id,
        "whatsapp_access_token": access_token,
        "whatsapp_connected": True,
    }).eq("id", business_id).execute()

    return {"ok": True, "phone_number_id": body.phone_number_id, "waba_id": body.waba_id}


@router.get("/status")
def get_whatsapp_status(business_id: str = Depends(get_business_id)):
    result = (
        _db().table("businesses")
        .select("waba_id, telefono_whatsapp, whatsapp_connected")
        .eq("id", business_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    biz = result.data
    return {
        "connected": biz.get("whatsapp_connected", False),
        "phone_number_id": biz.get("telefono_whatsapp"),
        "waba_id": biz.get("waba_id"),
    }


@router.delete("/disconnect")
def disconnect_whatsapp(business_id: str = Depends(get_business_id)):
    _db().table("businesses").update({
        "waba_id": None,
        "whatsapp_access_token": None,
        "whatsapp_connected": False,
    }).eq("id", business_id).execute()
    return {"ok": True}
