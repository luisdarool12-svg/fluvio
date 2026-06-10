import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client

from routers import reservations, customers, tables, chatbot, business, campaigns
from jobs.noshow import run_nightly_noshow_check
from modules.reservations.availability import DURACION_DEFAULT_MIN, buscar_mesa_ideal
from modules.floor_plan.availability import TZ_DEFAULT, revert_expired_overrides

app = FastAPI(
    title="OptimizaAI API",
    description="Backend multi-tenant de reservaciones para restaurantes",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reservations.router, prefix="/reservations", tags=["reservations"])
app.include_router(customers.router, prefix="/customers", tags=["customers"])
app.include_router(tables.router, prefix="/tables", tags=["tables"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
app.include_router(business.router, prefix="/business", tags=["business"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])


def _verify_internal_secret(x_internal_secret: str) -> None:
    expected = os.getenv("INTERNAL_JOB_SECRET", "")
    if not expected or x_internal_secret != expected:
        raise HTTPException(status_code=401, detail="Secreto interno inválido")


def _service_db():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


@app.post("/internal/noshow/run")
def trigger_noshow_check(x_internal_secret: str = Header(default="")):
    """
    Dispara el chequeo nocturno de no-show. Lo invoca un cron externo cada hora;
    el job solo actúa sobre negocios cuya hora local sea ~22:00.

    Aprovecha el mismo cron horario para revertir los layouts temporales
    del salón ya expirados (floor_plan_overrides).
    """
    _verify_internal_secret(x_internal_secret)
    resumen = run_nightly_noshow_check()
    try:
        resumen["floor_plan_overrides_revertidos"] = revert_expired_overrides(_service_db())
    except Exception as e:  # noqa: BLE001 — la limpieza no debe tumbar el job de no-show
        print(f"[internal] Error revirtiendo overrides expirados: {e}")
        resumen["floor_plan_overrides_revertidos"] = None
    return resumen


class InternalAvailabilityQuery(BaseModel):
    business_id: str
    personas: int = Field(ge=1)
    fecha_hora: datetime
    duracion_min: int = Field(default=DURACION_DEFAULT_MIN, ge=15, le=480)


@app.post("/internal/availability")
def internal_availability(
    body: InternalAvailabilityQuery,
    x_internal_secret: str = Header(default=""),
):
    """
    Motor de disponibilidad para servicios internos (el bot de WhatsApp).
    El caller ya resolvió el tenant (phone_number_id → business_id), por eso
    se confía en el business_id del body bajo X-Internal-Secret.
    """
    _verify_internal_secret(x_internal_secret)
    fecha_hora = body.fecha_hora
    if fecha_hora.tzinfo is None:
        fecha_hora = fecha_hora.replace(tzinfo=TZ_DEFAULT)
    return buscar_mesa_ideal(
        _service_db(), body.business_id, body.personas, fecha_hora, body.duracion_min
    )


@app.get("/health")
def health():
    return {"status": "ok"}
