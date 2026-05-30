import os
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


class CustomerCreate(BaseModel):
    nombre: str
    telefono: str
    idioma: str = "es"
    notas: Optional[str] = None


@router.get("/")
def list_customers(
    q: Optional[str] = None,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    query = db.table("customers").select("*").eq("business_id", business_id)
    if q:
        query = query.ilike("nombre", f"%{q}%")
    result = query.order("nombre").execute()
    return result.data


@router.post("/", status_code=201)
def create_or_get_customer(
    body: CustomerCreate,
    business_id: str = Depends(get_business_id),
):
    db = get_supabase()
    existing = db.table("customers").select("*").eq("business_id", business_id).eq("telefono", body.telefono).execute()
    if existing.data:
        return existing.data[0]

    result = db.table("customers").insert({
        "business_id": business_id,
        **body.model_dump(),
    }).execute()
    return result.data[0]
