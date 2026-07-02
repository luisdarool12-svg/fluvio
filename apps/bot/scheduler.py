"""
Scheduler de mensajes proactivos (anti-no-show) — corre dentro del bot.

Reemplaza los pollers `setInterval` del bridge Baileys (legado, solo-dev) por
jobs in-process que envían vía WhatsApp Cloud API y son **multi-tenant**:
cada job recorre todos los negocios activos, no un solo número hardcodeado.

Jobs:
  - reminders     (cada 60s)  → recordatorio ~2h antes de la reserva
  - confirmations (cada 120s) → confirmación 24h antes (responder SÍ/NO)
  - outbox_flush  (cada 30s)  → vacía el outbox (mensajes del job de no-show y
                                del operador humano) por Cloud API
  - noshow        (cada hora) → dispara POST {API_URL}/internal/noshow/run, que
                                puntúa reservas y encola mensajes al outbox

Se activa solo si BOT_SCHEDULER_ENABLED es truthy (default: "true"). En
desarrollo, si corres el bridge Baileys, ponlo en "false" para no duplicar
envíos.
"""
import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Optional

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from agent import _db, is_paused
from whatsapp_send import send_whatsapp_cloud

TZ_DEFAULT = ZoneInfo("America/Mexico_City")
API_URL = os.getenv("API_URL", "http://localhost:8000")
INTERNAL_SECRET = os.getenv("INTERNAL_JOB_SECRET", "")

# Ventanas (minutos antes de la reserva) — espejo de la lógica original del bridge.
_REMINDER_MIN = 90
_REMINDER_MAX = 150
_CONFIRM_MIN_H = 23
_CONFIRM_MAX_H = 25

_scheduler: Optional[AsyncIOScheduler] = None


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _active_businesses(db) -> list[dict]:
    """Negocios activos con lo necesario para enviar por Cloud API."""
    result = db.table("businesses").select(
        "id,nombre,telefono_whatsapp,whatsapp_access_token,zona_horaria"
    ).eq("activo", True).execute()
    return result.data or []


def _biz_tz(business: dict) -> ZoneInfo:
    try:
        return ZoneInfo(business.get("zona_horaria") or "America/Mexico_City")
    except Exception:  # noqa: BLE001
        return TZ_DEFAULT


def _pax(personas: int) -> str:
    return "1 persona" if personas == 1 else f"{personas} personas"


def _customer(row: dict) -> dict:
    return row.get("reservations_customers") or {}


def pending_reminders(db, business_id: str) -> list[dict]:
    """Reservas que deben recibir recordatorio (entre 90 y 150 min antes)."""
    now = datetime.now(TZ_DEFAULT)
    win_min = now + timedelta(minutes=_REMINDER_MIN)
    win_max = now + timedelta(minutes=_REMINDER_MAX)
    result = db.table("reservations").select(
        "id,fecha_hora,personas,reservations_customers:customer_id(nombre,telefono,jid)"
    ).eq("business_id", business_id).eq("reminder_sent", False).neq(
        "estado", "cancelada"
    ).gte("fecha_hora", win_min.isoformat()).lte("fecha_hora", win_max.isoformat()).execute()
    return result.data or []


def pending_confirmations(db, business_id: str) -> list[dict]:
    """Reservas que deben recibir confirmación 24h antes (entre 23 y 25 h)."""
    now = datetime.now(TZ_DEFAULT)
    win_min = now + timedelta(hours=_CONFIRM_MIN_H)
    win_max = now + timedelta(hours=_CONFIRM_MAX_H)
    result = db.table("reservations").select(
        "id,fecha_hora,personas,reservations_customers:customer_id(nombre,telefono,jid)"
    ).eq("business_id", business_id).eq("confirmation_sent", False).eq(
        "estado", "pendiente"
    ).gte("fecha_hora", win_min.isoformat()).lte("fecha_hora", win_max.isoformat()).execute()
    return result.data or []


def _reminder_msg(business: dict, nombre: str, hora: str, personas: int) -> str:
    biz = business.get("nombre", "el restaurante")
    return (
        f"Hola {nombre}, le recordamos su reservación en {biz} hoy a las {hora} "
        f"para {_pax(personas)}. ¡Le esperamos!"
    )


def _confirmation_msg(business: dict, nombre: str, fecha: str, hora: str, personas: int) -> str:
    biz = business.get("nombre", "el restaurante")
    return (
        f"Hola {nombre}, le confirmamos su reservación en {biz} para mañana "
        f"{fecha} a las {hora} para {_pax(personas)}.\n\n"
        f"Por favor responda *SÍ* para confirmar su lugar o *NO* si necesita "
        f"cancelar. Si tiene cambios, con gusto le ayudamos aquí mismo."
    )


async def _send_and_mark(
    db, business: dict, phone: str, msg: str, table: str, res_id: str, flag: str
) -> None:
    """Envía por Cloud API y marca la bandera (reminder_sent/confirmation_sent).

    Solo deja la reserva sin marcar si la falla es transitoria (red/5xx), para
    que el siguiente tick reintente. Un rechazo definitivo (4xx) se marca para
    no spamear reintentos inútiles — pero queda registrado en el log.
    """
    phone_num_id = business["telefono_whatsapp"]
    token = business.get("whatsapp_access_token")
    result = await send_whatsapp_cloud(phone, msg, phone_num_id, token)

    if result["ok"]:
        db.table(table).update({flag: True}).eq("id", res_id).execute()
    elif not result["retriable"]:
        print(f"[scheduler] Rechazo definitivo {flag} res={res_id} "
              f"status={result['status']} — marcando para no reintentar. "
              f"¿Falta plantilla aprobada de WhatsApp? body={result['body'][:200]}")
        db.table(table).update({flag: True}).eq("id", res_id).execute()
    # else: transitorio → no marcar, reintenta el próximo tick.


# ─── Jobs ─────────────────────────────────────────────────────────────────────

async def job_reminders() -> None:
    db = _db()
    for business in _active_businesses(db):
        if is_paused(business["id"]):
            continue
        tz = _biz_tz(business)
        for r in pending_reminders(db, business["id"]):
            cust = _customer(r)
            phone = cust.get("telefono", "")
            if not phone:
                continue
            dt = datetime.fromisoformat(r["fecha_hora"]).astimezone(tz)
            msg = _reminder_msg(business, cust.get("nombre", ""), dt.strftime("%H:%M"), r["personas"])
            await _send_and_mark(db, business, phone, msg, "reservations", r["id"], "reminder_sent")


async def job_confirmations() -> None:
    db = _db()
    for business in _active_businesses(db):
        if is_paused(business["id"]):
            continue
        tz = _biz_tz(business)
        for r in pending_confirmations(db, business["id"]):
            cust = _customer(r)
            phone = cust.get("telefono", "")
            if not phone:
                continue
            dt = datetime.fromisoformat(r["fecha_hora"]).astimezone(tz)
            msg = _confirmation_msg(
                business, cust.get("nombre", ""),
                dt.strftime("%d/%m/%Y"), dt.strftime("%H:%M"), r["personas"],
            )
            await _send_and_mark(db, business, phone, msg, "reservations", r["id"], "confirmation_sent")


async def job_outbox_flush() -> dict:
    """Vacía el outbox (mensajes encolados por el job de no-show / operador).

    Devuelve conteos para que el endpoint interno del bot pueda reutilizar
    esta misma lógica (única implementación del flush).
    """
    db = _db()
    items = db.table("outbox").select(
        "id,phone,content,business_id"
    ).eq("sent", False).eq("platform", "whatsapp").order("created_at").limit(100).execute()

    # Cache de negocios para no consultar uno por cada mensaje.
    biz_by_id = {b["id"]: b for b in _active_businesses(db)}

    sent_count = 0
    error_count = 0
    for item in items.data or []:
        business = biz_by_id.get(item["business_id"])
        if not business:
            continue
        result = await send_whatsapp_cloud(
            item["phone"], item["content"],
            business["telefono_whatsapp"], business.get("whatsapp_access_token"),
        )
        if result["ok"] or not result["retriable"]:
            db.table("outbox").update({"sent": True}).eq("id", item["id"]).execute()
        # transitorio → se queda en el outbox para el próximo flush.
        if result["ok"]:
            sent_count += 1
        else:
            error_count += 1
    return {"sent": sent_count, "errors": error_count}


async def job_noshow_hourly() -> None:
    """Dispara el chequeo de no-show + limpieza de overrides en el API."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{API_URL}/internal/noshow/run",
                headers={"X-Internal-Secret": INTERNAL_SECRET},
            )
        print(f"[scheduler] noshow/run status={resp.status_code}")
    except Exception as e:  # noqa: BLE001
        print(f"[scheduler] Error disparando noshow/run: {e}")


# ─── Arranque / parada ────────────────────────────────────────────────────────

def _enabled() -> bool:
    return os.getenv("BOT_SCHEDULER_ENABLED", "true").lower() in ("1", "true", "yes", "on")


def start_scheduler() -> Optional[AsyncIOScheduler]:
    global _scheduler
    if not _enabled():
        print("[scheduler] Deshabilitado (BOT_SCHEDULER_ENABLED=false).")
        return None
    if _scheduler is not None:
        return _scheduler

    sched = AsyncIOScheduler(timezone="UTC")
    sched.add_job(job_reminders, "interval", seconds=60, id="reminders",
                  max_instances=1, coalesce=True)
    sched.add_job(job_confirmations, "interval", seconds=120, id="confirmations",
                  max_instances=1, coalesce=True)
    sched.add_job(job_outbox_flush, "interval", seconds=30, id="outbox_flush",
                  max_instances=1, coalesce=True)
    sched.add_job(job_noshow_hourly, "cron", minute=0, id="noshow",
                  max_instances=1, coalesce=True)
    sched.start()
    _scheduler = sched
    print("[scheduler] Activo: reminders(60s) confirmations(120s) "
          "outbox(30s) noshow(@:00).")
    return sched


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
