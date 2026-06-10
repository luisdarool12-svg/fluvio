"""
Plano del salón con overrides temporales.

Un negocio tiene un plano base (floor_plan_config, uno por tenant) y puede
activar un layout temporal (floor_plan_overrides) para eventos o reacomodos
puntuales. Mientras el override está vigente, el dashboard usa su config;
al expirar (o revertirse manualmente) vuelve el plano base.

`revert_expired_overrides` la invoca el job horario que ya dispara
POST /internal/noshow/run — no hay cron adicional.

Igual que el motor de disponibilidad, `db` se recibe por parámetro y se usa
duck-typed para poder testear sin Supabase real.
"""
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from zoneinfo import ZoneInfo

TZ_DEFAULT = ZoneInfo("America/Mexico_City")

CONFIG_BASE_VACIA: Dict = {"walls": [], "zones": [], "furniture": [], "tables": []}


class OverrideValidationError(ValueError):
    """Rango de vigencia inválido."""


class OverrideOverlapError(ValueError):
    """Ya existe un override que se traslapa con el rango solicitado."""


def _as_datetime(value: Any) -> datetime:
    if isinstance(value, str):
        value = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value


def _now_default() -> datetime:
    return datetime.now(TZ_DEFAULT)


def _find_active_override(db: Any, business_id: str, at_time: datetime) -> Optional[Dict]:
    result = db.table("floor_plan_overrides").select("*").eq(
        "business_id", business_id
    ).lte("valid_from", at_time.isoformat()).gt(
        "valid_until", at_time.isoformat()
    ).order("valid_from", desc=True).limit(1).execute()
    return result.data[0] if result.data else None


def get_active_floor_plan(
    db: Any, business_id: str, at_time: Optional[datetime] = None
) -> Dict:
    """
    Config del plano vigente en `at_time` (default: ahora en Mexico City).

    Retorna:
      {
        "config":   JSON del plano (override si hay uno vigente, base si no),
        "source":   "override" | "base",
        "override": {id, valid_from, valid_until, motivo} | None,
      }
    """
    at = _as_datetime(at_time) if at_time else _now_default()

    override = _find_active_override(db, business_id, at)
    if override:
        return {
            "config": override["config"],
            "source": "override",
            "override": {
                "id": override["id"],
                "valid_from": override["valid_from"],
                "valid_until": override["valid_until"],
                "motivo": override.get("motivo"),
            },
        }

    base = db.table("floor_plan_config").select("config").eq(
        "business_id", business_id
    ).limit(1).execute()
    config = base.data[0]["config"] if base.data else dict(CONFIG_BASE_VACIA)
    return {"config": config, "source": "base", "override": None}


def create_temporary_override(
    db: Any,
    business_id: str,
    config: Dict,
    valid_from: datetime,
    valid_until: datetime,
    motivo: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Dict:
    """
    Crea un layout temporal. Lanza OverrideValidationError si el rango es
    inválido y OverrideOverlapError si se traslapa con otro override.
    """
    valid_from = _as_datetime(valid_from)
    valid_until = _as_datetime(valid_until)

    if valid_until <= valid_from:
        raise OverrideValidationError("valid_until debe ser posterior a valid_from")

    # Traslape: existe otro override con (valid_from < nuevo_until) y (valid_until > nuevo_from)
    overlapping = db.table("floor_plan_overrides").select("id,valid_from,valid_until").eq(
        "business_id", business_id
    ).lt("valid_from", valid_until.isoformat()).gt(
        "valid_until", valid_from.isoformat()
    ).limit(1).execute()
    if overlapping.data:
        raise OverrideOverlapError(
            "Ya hay un layout temporal activo o programado que se traslapa con ese rango. "
            "Reviértelo antes de crear uno nuevo."
        )

    row: Dict = {
        "business_id": business_id,
        "config": config,
        "valid_from": valid_from.isoformat(),
        "valid_until": valid_until.isoformat(),
        "motivo": motivo,
    }
    if user_id:
        row["created_by"] = user_id

    result = db.table("floor_plan_overrides").insert(row).execute()
    return result.data[0]


def update_active_override_config(
    db: Any, business_id: str, config: Dict, at_time: Optional[datetime] = None
) -> Optional[Dict]:
    """Actualiza el config del override vigente (editor en modo temporal). None si no hay."""
    at = _as_datetime(at_time) if at_time else _now_default()
    override = _find_active_override(db, business_id, at)
    if override is None:
        return None
    result = db.table("floor_plan_overrides").update({"config": config}).eq(
        "id", override["id"]
    ).eq("business_id", business_id).execute()
    return result.data[0] if result.data else None


def delete_active_override(
    db: Any, business_id: str, at_time: Optional[datetime] = None
) -> bool:
    """Revierte manualmente el override vigente. True si había uno y se eliminó."""
    at = _as_datetime(at_time) if at_time else _now_default()
    override = _find_active_override(db, business_id, at)
    if override is None:
        return False
    db.table("floor_plan_overrides").delete().eq(
        "id", override["id"]
    ).eq("business_id", business_id).execute()
    return True


def revert_expired_overrides(db: Any, now: Optional[datetime] = None) -> int:
    """
    Elimina los overrides cuyo valid_until ya pasó (todos los tenants; lo
    invoca el job horario con service role). Devuelve cuántos eliminó.
    """
    at = _as_datetime(now) if now else _now_default()
    result = db.table("floor_plan_overrides").delete().lt(
        "valid_until", at.isoformat()
    ).execute()
    return len(result.data or [])
