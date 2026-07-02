import os
from datetime import datetime
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from core.db import get_db

from core.auth import get_business_id
from modules.reservations.availability import (
    DURACION_DEFAULT_MIN,
    buscar_mesa_ideal,
    get_ocupacion_actual,
)
from modules.floor_plan.availability import (
    TZ_DEFAULT,
    OverrideOverlapError,
    OverrideValidationError,
    create_temporary_override,
    delete_active_override,
    get_active_floor_plan,
    update_active_override_config,
)

router = APIRouter()


def get_supabase():
    return get_db()


def _business_tz(db, business_id: str) -> ZoneInfo:
    result = db.table("businesses").select("zona_horaria").eq("id", business_id).limit(1).execute()
    try:
        return ZoneInfo(result.data[0].get("zona_horaria") or "America/Mexico_City")
    except Exception:
        return TZ_DEFAULT


@router.get("/")
def list_tables(business_id: str = Depends(get_business_id)):
    db = get_supabase()
    result = db.table("tables").select("*").eq("business_id", business_id).eq("activo", True).order("nombre").execute()
    return result.data


# ─── Disponibilidad (motor de mesas) ─────────────────────────────────────────

@router.get("/availability")
def table_availability(
    fecha: str,
    hora: str,
    personas: int = Query(default=2, ge=1),
    duracion_min: int = Query(default=DURACION_DEFAULT_MIN, ge=15, le=480),
    business_id: str = Depends(get_business_id),
):
    """
    Disponibilidad en tiempo real para el dashboard.
    GET /tables/availability?fecha=YYYY-MM-DD&hora=HH:MM&personas=N
    """
    db = get_supabase()
    tz = _business_tz(db, business_id)
    try:
        fecha_hora = datetime.strptime(f"{fecha} {hora}", "%Y-%m-%d %H:%M").replace(tzinfo=tz)
    except ValueError:
        raise HTTPException(status_code=400, detail="fecha (YYYY-MM-DD) u hora (HH:MM) inválida")

    disponibilidad = buscar_mesa_ideal(db, business_id, personas, fecha_hora, duracion_min)
    ocupacion = get_ocupacion_actual(db, business_id, fecha_hora)
    return {**disponibilidad, "ocupacion": ocupacion}


# ─── Plano del salón: overrides temporales ───────────────────────────────────

class FloorPlanOverrideCreate(BaseModel):
    config: dict
    valid_from: Optional[datetime] = None  # default: ahora
    valid_until: datetime
    motivo: Optional[str] = None


class FloorPlanOverridePatch(BaseModel):
    config: dict


def _ensure_tz(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=TZ_DEFAULT)


@router.post("/floor-plan/override", status_code=201)
def create_floor_plan_override(
    body: FloorPlanOverrideCreate,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    valid_from = _ensure_tz(body.valid_from) if body.valid_from else datetime.now(TZ_DEFAULT)
    valid_until = _ensure_tz(body.valid_until)
    try:
        return create_temporary_override(
            db, business_id, body.config, valid_from, valid_until, body.motivo
        )
    except OverrideOverlapError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except OverrideValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/floor-plan/override/active")
def update_floor_plan_override(
    body: FloorPlanOverridePatch,
    business_id: str = Depends(get_business_id),
):
    """Guarda los cambios del editor mientras el layout temporal está activo."""
    db = get_supabase()
    updated = update_active_override_config(db, business_id, body.config)
    if updated is None:
        raise HTTPException(status_code=404, detail="No hay layout temporal activo")
    return updated


@router.delete("/floor-plan/override/active", status_code=204)
def revert_floor_plan_override(business_id: str = Depends(get_business_id)):
    """Revierte manualmente el layout temporal antes de que expire."""
    db = get_supabase()
    if not delete_active_override(db, business_id):
        raise HTTPException(status_code=404, detail="No hay layout temporal activo")


@router.get("/floor-plan/current")
def current_floor_plan(
    at: Optional[str] = None,
    business_id: str = Depends(get_business_id),
):
    """
    Plano vigente (temporal o base).
    GET /tables/floor-plan/current?at=YYYY-MM-DDTHH:MM (opcional, default ahora)
    """
    db = get_supabase()
    at_time = None
    if at:
        try:
            at_time = datetime.fromisoformat(at)
        except ValueError:
            raise HTTPException(status_code=400, detail="at debe ser YYYY-MM-DDTHH:MM")
        at_time = _ensure_tz(at_time)
    return get_active_floor_plan(db, business_id, at_time)
