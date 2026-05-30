import os
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client

from core.auth import get_business_id

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
