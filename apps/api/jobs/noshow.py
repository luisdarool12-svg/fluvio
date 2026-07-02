"""
Job nocturno de riesgo de no-show.

`run_nightly_noshow_check` está pensado para ejecutarse cada hora (vía cron
externo que llama POST /internal/noshow/run). Por cada negocio activo, solo
actúa cuando su hora local es ~22:00 — así respeta el timezone de cada tenant
con un único cron horario.

Para cada reservación del día siguiente: calcula el score, lo persiste y ejecuta
la acción graduada correspondiente (recordatorio, confirmación, alerta al dueño),
dejando rastro en noshow_actions_log.
"""
import os
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Optional

from supabase import Client

from core.db import get_db

from modules.reservations.scoring import calculate_no_show_score, recommended_action
from modules.reservations.notify import (
    enqueue_outbox,
    create_notification,
    log_action,
    get_owner_phone,
)

# Hora local del restaurante en la que corre el chequeo nocturno.
RUN_HOUR = 22


def _db() -> Client:
    return get_db()


def _fmt(dt_iso: str, tz: ZoneInfo) -> tuple[str, str]:
    """(fecha dd/mm/YYYY, hora HH:MM) en el timezone del negocio."""
    dt = datetime.fromisoformat(dt_iso).astimezone(tz)
    return dt.strftime("%d/%m/%Y"), dt.strftime("%H:%M")


def _already_processed_today(
    db: Client, reservation_id: str, today_start_utc: datetime
) -> bool:
    """True si ya se registró una acción para esta reserva hoy (idempotencia)."""
    existing = db.table("noshow_actions_log").select("id").eq(
        "reservation_id", reservation_id
    ).gte("sent_at", today_start_utc.isoformat()).limit(1).execute()
    return bool(existing.data)


def _process_reservation(
    db: Client, business: dict, tz: ZoneInfo, res: dict
) -> str:
    """Puntúa una reserva, persiste el score y ejecuta su acción. Devuelve action_type."""
    business_id = business["id"]
    biz_name    = business.get("nombre", "el restaurante")
    cust        = res.get("customers") or {}

    score = calculate_no_show_score(
        res["id"], db=db, reservation=res, customer=cust
    )
    db.table("reservations").update({"no_show_score": score}).eq("id", res["id"]).execute()

    action = recommended_action(score)
    atype  = action["action_type"]

    nombre = cust.get("nombre", "")
    phone  = cust.get("telefono", "")
    jid    = cust.get("jid")
    fecha, hora = _fmt(res["fecha_hora"], tz)
    personas = res.get("personas", "")

    if atype == "reminder_standard":
        msg = (
            f"Hola {nombre}, le recordamos su reservación en {biz_name} "
            f"el {fecha} a las {hora} para {personas} persona(s). ¡Le esperamos!"
        )
        enqueue_outbox(db, business_id, phone, msg, jid)

    elif atype == "reminder_confirm":
        msg = (
            f"Hola {nombre}, le recordamos su reservación en {biz_name} "
            f"el {fecha} a las {hora} para {personas} persona(s). "
            f"Por favor responda *SÍ* para confirmar su asistencia."
        )
        enqueue_outbox(db, business_id, phone, msg, jid)
        db.table("reservations").update({"confirmation_sent": True}).eq("id", res["id"]).execute()

    elif atype == "confirmation_required_owner":
        msg = (
            f"Hola {nombre}, necesitamos confirmar su reservación en {biz_name} "
            f"el {fecha} a las {hora} para {personas} persona(s). "
            f"Responda *SÍ* para confirmar o *NO* para cancelar."
        )
        enqueue_outbox(db, business_id, phone, msg, jid)
        db.table("reservations").update({"confirmation_sent": True}).eq("id", res["id"]).execute()
        create_notification(
            db, business_id, res["id"], "noshow_high_risk",
            "Reserva en riesgo de no-show",
            f"{nombre} — {fecha} {hora}, {personas} pax (score {score}). "
            f"Se solicitó confirmación.",
        )
        owner_phone = get_owner_phone(business)
        if owner_phone:
            enqueue_outbox(
                db, business_id, owner_phone,
                f"⚠️ Reserva en riesgo (score {score}): {nombre}, {fecha} {hora}, "
                f"{personas} pax. Se pidió confirmación al cliente.",
            )

    elif atype == "critical_owner_alert":
        create_notification(
            db, business_id, res["id"], "noshow_critical",
            "Reserva crítica — alto riesgo de no-show",
            f"{nombre} — {fecha} {hora}, {personas} pax (score {score}). "
            f"Considere activar lista de espera para esta mesa.",
        )
        owner_phone = get_owner_phone(business)
        if owner_phone:
            enqueue_outbox(
                db, business_id, owner_phone,
                f"🚨 Reserva CRÍTICA (score {score}): {nombre}, {fecha} {hora}, "
                f"{personas} pax. Riesgo alto de no-show — sugerimos activar lista "
                f"de espera para esta mesa.",
            )

    log_action(db, business_id, res["id"], atype, score)
    return atype


def run_nightly_noshow_check(now_utc: Optional[datetime] = None) -> dict:
    """
    Procesa los negocios que están a las ~22:00 en su hora local y puntúa las
    reservas del día siguiente. Pensado para invocarse cada hora.

    Devuelve un resumen {procesados, por_negocio}.
    """
    if now_utc is None:
        now_utc = datetime.now(timezone.utc)

    db = _db()
    businesses = db.table("businesses").select(
        "id,nombre,zona_horaria,bot_config"
    ).eq("activo", True).execute()

    resumen: dict = {"procesados": 0, "por_negocio": []}

    for business in businesses.data:
        try:
            tz = ZoneInfo(business.get("zona_horaria") or "America/Mexico_City")
        except Exception:
            tz = ZoneInfo("America/Mexico_City")

        now_local = now_utc.astimezone(tz)
        if now_local.hour != RUN_HOUR:
            continue  # aún no es la hora del chequeo para este negocio

        today_start_utc = now_local.replace(
            hour=0, minute=0, second=0, microsecond=0
        ).astimezone(timezone.utc)

        tomorrow = (now_local + timedelta(days=1)).date()
        day_start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 0, 0, tzinfo=tz)
        day_end   = day_start + timedelta(days=1)

        reservas = db.table("reservations").select(
            "id,fecha_hora,personas,confirmation_status,confirmation_sent,customer_id,"
            "customers(nombre,telefono,jid,visitas,no_show_history)"
        ).eq("business_id", business["id"]).gte(
            "fecha_hora", day_start.isoformat()
        ).lt("fecha_hora", day_end.isoformat()).neq(
            "estado", "cancelada"
        ).neq("estado", "no_show").execute()

        count = 0
        for res in reservas.data:
            if _already_processed_today(db, res["id"], today_start_utc):
                continue
            try:
                _process_reservation(db, business, tz, res)
                count += 1
            except Exception as e:  # noqa: BLE001 — no detener el lote por una reserva
                print(f"[noshow] Error procesando reserva {res['id']}: {e}")

        resumen["procesados"] += count
        resumen["por_negocio"].append({
            "business_id": business["id"],
            "nombre": business.get("nombre"),
            "reservas_procesadas": count,
        })

    return resumen
