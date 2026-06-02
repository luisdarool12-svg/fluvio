"""
Motor de scoring de riesgo de no-show.

`calculate_no_show_score` produce un entero 0-100 donde mayor = más riesgo de
que el cliente no se presente. `recommended_action` mapea ese score al rango de
acción correspondiente; es la única fuente de verdad de los rangos, usada tanto
por el job nocturno como por el endpoint de risk-report.
"""
import os
from datetime import datetime, timezone
from typing import Optional

from supabase import create_client, Client


def get_supabase() -> Client:
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


def _days_since(iso_ts: Optional[str], now: datetime) -> Optional[float]:
    """Días transcurridos desde un timestamp ISO hasta `now` (UTC-aware)."""
    if not iso_ts:
        return None
    dt = datetime.fromisoformat(iso_ts)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return (now - dt).total_seconds() / 86400.0


def calculate_no_show_score(
    reservation_id: str,
    db: Optional[Client] = None,
    reservation: Optional[dict] = None,
    customer: Optional[dict] = None,
    now: Optional[datetime] = None,
) -> int:
    """
    Calcula el score de no-show (0-100) de una reservación.

    `db`, `reservation` y `customer` son inyectables para testeo y para que el
    job reutilice filas ya cargadas sin volver a consultar la BD.
    """
    if now is None:
        now = datetime.now(timezone.utc)
    if db is None:
        db = get_supabase()

    if reservation is None:
        res = db.table("reservations").select(
            "id,created_at,personas,confirmation_status,confirmation_sent,customer_id"
        ).eq("id", reservation_id).limit(1).execute()
        if not res.data:
            raise ValueError(f"Reservación no encontrada: {reservation_id}")
        reservation = res.data[0]

    if customer is None:
        cust = db.table("customers").select("visitas,no_show_history").eq(
            "id", reservation["customer_id"]
        ).limit(1).execute()
        customer = cust.data[0] if cust.data else {}

    visitas         = customer.get("visitas", 0) or 0
    no_show_history = customer.get("no_show_history", 0) or 0
    personas        = reservation.get("personas", 0) or 0
    conf_status     = reservation.get("confirmation_status", "pending")
    conf_sent       = bool(reservation.get("confirmation_sent", False))

    score = 0

    # ── Historial del cliente ──
    if visitas == 0:
        score += 25                       # cliente nuevo, sin historial
    if no_show_history > 0:
        score += 30                       # tiene no-shows previos
    if visitas >= 5 and no_show_history == 0:
        score -= 30                       # cliente frecuente impecable

    # ── Lead time: antigüedad de la reserva (created_at) ──
    age_days = _days_since(reservation.get("created_at"), now)
    if age_days is not None:
        if age_days > 14:
            score += 20
        elif age_days > 7:
            score += 10
        elif age_days <= 1:
            score -= 15                   # reserva hecha hoy o ayer

    # ── Tamaño del grupo ──
    if 1 <= personas <= 2:
        score += 15

    # ── Respuesta a la confirmación ──
    if conf_status == "confirmed":
        score -= 25                       # confirmó activamente
    elif conf_sent and conf_status == "pending":
        score += 20                       # se le pidió confirmar y no respondió

    return max(0, min(100, score))


# ─── Rangos de acción (fuente de verdad única) ──────────────────────────────

def recommended_action(score: int) -> dict:
    """Mapea un score a su rango y acción recomendada."""
    if score <= 30:
        return {
            "rango": "0-30",
            "action_type": "reminder_standard",
            "label": "Recordatorio estándar por WhatsApp",
        }
    if score <= 60:
        return {
            "rango": "31-60",
            "action_type": "reminder_confirm",
            "label": "Recordatorio + solicitud de confirmación de asistencia",
        }
    if score <= 80:
        return {
            "rango": "61-80",
            "action_type": "confirmation_required_owner",
            "label": "Confirmación requerida + notificación al dueño",
        }
    return {
        "rango": "81-100",
        "action_type": "critical_owner_alert",
        "label": "Alerta inmediata al dueño + sugerir lista de espera",
    }
