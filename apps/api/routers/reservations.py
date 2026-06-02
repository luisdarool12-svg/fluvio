import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client

from core.auth import get_business_id
from modules.reservations.scoring import calculate_no_show_score, recommended_action
from modules.reservations.notify import log_action

router = APIRouter()


def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


class ReservationCreate(BaseModel):
    customer_id: str
    table_id: Optional[str] = None
    fecha_hora: datetime
    personas: int
    notas: Optional[str] = None
    canal: str = "whatsapp"


class ReservationUpdate(BaseModel):
    estado: Optional[str] = None
    table_id: Optional[str] = None
    fecha_hora: Optional[datetime] = None
    personas: Optional[int] = None
    notas: Optional[str] = None


@router.get("/")
def list_reservations(
    fecha: Optional[str] = None,
    estado: Optional[str] = None,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    query = db.table("reservations").select(
        "*, customers(nombre, telefono), tables(nombre, zona)"
    ).eq("business_id", business_id)

    if fecha:
        query = query.gte("fecha_hora", f"{fecha}T00:00:00").lte("fecha_hora", f"{fecha}T23:59:59")
    if estado:
        query = query.eq("estado", estado)

    result = query.order("fecha_hora").execute()
    return result.data


@router.post("/", status_code=201)
def create_reservation(
    body: ReservationCreate,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    result = db.table("reservations").insert({
        "business_id": business_id,
        **body.model_dump(),
        "fecha_hora": body.fecha_hora.isoformat(),
    }).execute()
    return result.data[0]


@router.patch("/{reservation_id}")
def update_reservation(
    reservation_id: str,
    body: ReservationUpdate,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Sin campos para actualizar")

    result = db.table("reservations").update(updates).eq("id", reservation_id).eq("business_id", business_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return result.data[0]


@router.delete("/{reservation_id}", status_code=204)
def cancel_reservation(
    reservation_id: str,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    db.table("reservations").update({"estado": "cancelada"}).eq("id", reservation_id).eq("business_id", business_id).execute()


# ─── Sistema de riesgo de no-show ─────────────────────────────────────────────

@router.get("/{business_id}/risk-report")
def risk_report(
    business_id: str,
    jwt_business_id: str = Depends(get_business_id),
):
    """
    Reservas del día siguiente ordenadas por riesgo de no-show (score DESC),
    con datos del cliente y la acción recomendada.
    """
    if business_id != jwt_business_id:
        raise HTTPException(status_code=403, detail="business_id no coincide con el token")

    db = get_supabase()

    biz = db.table("businesses").select("zona_horaria").eq("id", business_id).limit(1).execute()
    if not biz.data:
        raise HTTPException(status_code=404, detail="Negocio no encontrado")
    try:
        tz = ZoneInfo(biz.data[0].get("zona_horaria") or "America/Mexico_City")
    except Exception:
        tz = ZoneInfo("America/Mexico_City")

    tomorrow = (datetime.now(tz) + timedelta(days=1)).date()
    day_start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 0, 0, tzinfo=tz)
    day_end = day_start + timedelta(days=1)

    result = db.table("reservations").select(
        "id,fecha_hora,personas,estado,confirmation_status,confirmation_sent,"
        "no_show_score,customer_id,customers(nombre,telefono,visitas,no_show_history)"
    ).eq("business_id", business_id).gte(
        "fecha_hora", day_start.isoformat()
    ).lt("fecha_hora", day_end.isoformat()).neq(
        "estado", "cancelada"
    ).neq("estado", "no_show").execute()

    report = []
    for res in result.data:
        cust = res.get("customers") or {}
        score = res.get("no_show_score")
        if score is None:
            score = calculate_no_show_score(
                res["id"], db=db, reservation=res, customer=cust
            )
        report.append({
            **res,
            "no_show_score": score,
            "recommended_action": recommended_action(score),
        })

    report.sort(key=lambda r: r["no_show_score"], reverse=True)
    return report


@router.post("/{reservation_id}/confirm")
def confirm_reservation(
    reservation_id: str,
    business_id: str = Depends(get_business_id),
):
    """
    Marca la reserva como confirmada por el cliente y recalcula el score
    (el peso -25 de "confirmó activamente" lo aplica el motor de scoring).
    """
    db = get_supabase()

    updated = db.table("reservations").update({
        "confirmation_status": "confirmed",
        "estado": "confirmada",
    }).eq("id", reservation_id).eq("business_id", business_id).execute()

    if not updated.data:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    score = calculate_no_show_score(reservation_id, db=db)
    db.table("reservations").update({"no_show_score": score}).eq("id", reservation_id).execute()
    log_action(db, business_id, reservation_id, "manual_confirm", score)

    row = updated.data[0]
    row["no_show_score"] = score
    return row
