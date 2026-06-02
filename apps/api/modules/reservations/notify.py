"""
Helpers de acciones del sistema de no-show: encolado de WhatsApp (vía outbox),
notificaciones para el dashboard del dueño, y auditoría de acciones.

Mantiene `apps/api` desacoplado de `apps/bot`: el envío real de WhatsApp lo hace
el puente Baileys haciendo polling a la tabla `outbox`.
"""
from typing import Optional

from supabase import Client


def get_owner_phone(business: dict) -> Optional[str]:
    """
    Teléfono del dueño para alertas por WhatsApp.

    El esquema `users` no guarda teléfono, así que se toma de
    `businesses.bot_config.owner_phone`. Si no está configurado, se devuelve
    None y la alerta queda solo en la tabla `notifications`.
    """
    bot_config = business.get("bot_config") or {}
    phone = bot_config.get("owner_phone")
    return phone or None


def enqueue_outbox(
    db: Client,
    business_id: str,
    phone: str,
    content: str,
    jid: Optional[str] = None,
    conversation_id: Optional[int] = None,
) -> None:
    """Encola un mensaje de WhatsApp saliente (lo envía el puente Baileys)."""
    if not phone:
        return
    db.table("outbox").insert({
        "business_id":     business_id,
        "conversation_id": conversation_id,
        "phone":           phone,
        "platform":        "whatsapp",
        "jid":             jid,
        "content":         content,
        "sent":            False,
    }).execute()


def create_notification(
    db: Client,
    business_id: str,
    reservation_id: Optional[str],
    tipo: str,
    titulo: str,
    mensaje: str,
) -> None:
    """Crea una notificación para el dashboard del dueño."""
    db.table("notifications").insert({
        "business_id":    business_id,
        "reservation_id": reservation_id,
        "tipo":           tipo,
        "titulo":         titulo,
        "mensaje":        mensaje,
        "leida":          False,
    }).execute()


def log_action(
    db: Client,
    business_id: str,
    reservation_id: str,
    action_type: str,
    score: Optional[int] = None,
    response: Optional[str] = None,
) -> None:
    """Registra una acción tomada en noshow_actions_log (auditoría)."""
    db.table("noshow_actions_log").insert({
        "business_id":    business_id,
        "reservation_id": reservation_id,
        "action_type":    action_type,
        "score":          score,
        "response":       response,
    }).execute()
