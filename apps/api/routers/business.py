import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client
from typing import Optional

from core.auth import get_business_id

router = APIRouter()


def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


class BusinessSettingsUpdate(BaseModel):
    nombre: Optional[str] = None
    zona_horaria: Optional[str] = None
    idioma_default: Optional[str] = None
    telefono_contacto: Optional[str] = None
    mensaje_bienvenida: Optional[str] = None
    tomar_24h: Optional[bool] = None
    notif_recordatorio: Optional[bool] = None
    notif_nueva_reserva: Optional[bool] = None
    notif_alerta_noshow: Optional[bool] = None
    notif_resumen_semanal: Optional[bool] = None


@router.get("/me")
def get_settings(business_id: str = Depends(get_business_id)):
    db = get_supabase()
    result = (
        db.table("businesses")
        .select("id, nombre, zona_horaria, idioma_default, telefono_whatsapp, bot_config, whatsapp_connected")
        .eq("id", business_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    biz = result.data
    bot_config = biz.get("bot_config") or {}

    # Campo de expiración de token (migración 014 — puede no existir aún)
    token_days_left: Optional[int] = None
    token_warning = False
    try:
        exp_result = (
            db.table("businesses")
            .select("whatsapp_token_expires_at")
            .eq("id", business_id)
            .single()
            .execute()
        )
        token_expires_raw = (exp_result.data or {}).get("whatsapp_token_expires_at")
        if token_expires_raw:
            expires_dt = datetime.fromisoformat(token_expires_raw.replace("Z", "+00:00"))
            delta = expires_dt - datetime.now(timezone.utc)
            token_days_left = max(0, delta.days)
            token_warning = token_days_left <= 7
    except Exception:
        pass

    return {
        "nombre": biz.get("nombre", ""),
        "zona_horaria": biz.get("zona_horaria", "America/Mexico_City"),
        "idioma_default": biz.get("idioma_default", "es"),
        "telefono_contacto": biz.get("telefono_whatsapp", ""),
        "mensaje_bienvenida": bot_config.get("mensaje_bienvenida", ""),
        "tomar_24h": bot_config.get("tomar_24h", True),
        "notif_recordatorio": bot_config.get("notif_recordatorio", True),
        "notif_nueva_reserva": bot_config.get("notif_nueva_reserva", True),
        "notif_alerta_noshow": bot_config.get("notif_alerta_noshow", True),
        "notif_resumen_semanal": bot_config.get("notif_resumen_semanal", False),
        "whatsapp_connected": bool(biz.get("whatsapp_connected")),
        "whatsapp_token_days_left": token_days_left,
        "whatsapp_token_warning": token_warning,
    }


@router.patch("/me")
def update_settings(
    body: BusinessSettingsUpdate,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()

    biz_result = (
        db.table("businesses")
        .select("bot_config")
        .eq("id", business_id)
        .single()
        .execute()
    )
    if not biz_result.data:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")

    bot_config = (biz_result.data.get("bot_config") or {}).copy()
    biz_update: dict = {}

    if body.nombre is not None:
        biz_update["nombre"] = body.nombre
    if body.zona_horaria is not None:
        biz_update["zona_horaria"] = body.zona_horaria
    if body.idioma_default is not None:
        biz_update["idioma_default"] = body.idioma_default

    if body.mensaje_bienvenida is not None:
        bot_config["mensaje_bienvenida"] = body.mensaje_bienvenida
    if body.tomar_24h is not None:
        bot_config["tomar_24h"] = body.tomar_24h
    if body.notif_recordatorio is not None:
        bot_config["notif_recordatorio"] = body.notif_recordatorio
    if body.notif_nueva_reserva is not None:
        bot_config["notif_nueva_reserva"] = body.notif_nueva_reserva
    if body.notif_alerta_noshow is not None:
        bot_config["notif_alerta_noshow"] = body.notif_alerta_noshow
    if body.notif_resumen_semanal is not None:
        bot_config["notif_resumen_semanal"] = body.notif_resumen_semanal

    biz_update["bot_config"] = bot_config

    db.table("businesses").update(biz_update).eq("id", business_id).execute()

    return {"ok": True}
