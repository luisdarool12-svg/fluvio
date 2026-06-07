import os
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import reservations, customers, tables, chatbot, business
from jobs.noshow import run_nightly_noshow_check

load_dotenv()

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


@app.post("/internal/noshow/run")
def trigger_noshow_check(x_internal_secret: str = Header(default="")):
    """
    Dispara el chequeo nocturno de no-show. Lo invoca un cron externo cada hora;
    el job solo actúa sobre negocios cuya hora local sea ~22:00.
    """
    expected = os.getenv("INTERNAL_JOB_SECRET", "")
    if not expected or x_internal_secret != expected:
        raise HTTPException(status_code=401, detail="Secreto interno inválido")
    return run_nightly_noshow_check()


@app.get("/health")
def health():
    return {"status": "ok"}
