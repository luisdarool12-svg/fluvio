import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import reservations, customers, tables

load_dotenv()

app = FastAPI(
    title="OptimizaAI API",
    description="Backend multi-tenant de reservaciones para restaurantes",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reservations.router, prefix="/reservations", tags=["reservations"])
app.include_router(customers.router, prefix="/customers", tags=["customers"])
app.include_router(tables.router, prefix="/tables", tags=["tables"])


@app.get("/health")
def health():
    return {"status": "ok"}
