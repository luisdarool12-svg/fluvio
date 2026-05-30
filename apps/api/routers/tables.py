import os
from fastapi import APIRouter, Depends
from supabase import create_client

from core.auth import get_business_id

router = APIRouter()


def get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


@router.get("/")
def list_tables(business_id: str = Depends(get_business_id)):
    db = get_supabase()
    result = db.table("tables").select("*").eq("business_id", business_id).eq("activo", True).order("nombre").execute()
    return result.data
