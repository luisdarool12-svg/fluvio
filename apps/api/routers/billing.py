"""
Router de facturación CFDI 4.0 — Fluvio

Rutas:
  GET    /billing/config              → leer configuración fiscal del negocio
  PUT    /billing/config              → guardar configuración fiscal
  GET    /billing/cfdis               → listar CFDIs del negocio
  POST   /billing/cfdis               → generar y timbrar nuevo CFDI
  GET    /billing/cfdis/{id}          → detalle de un CFDI
  GET    /billing/cfdis/{id}/pdf      → descargar PDF como binario
  GET    /billing/cfdis/{id}/xml      → descargar XML como texto
  POST   /billing/cfdis/{id}/cancel   → cancelar un CFDI timbrado
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from core.db import get_db

from core.auth import get_business_id
from services.facturama import (
    FacturamaClient,
    FacturamaConfig,
    FacturamaError,
    ItemCFDI,
    ReceptorCFDI,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _db():
    return get_db()


def _get_facturacion_config(business_id: str) -> dict:
    db = _db()
    res = db.table("businesses").select("facturacion_config").eq("id", business_id).single().execute()
    return res.data.get("facturacion_config") or {}


def _build_client(cfg: dict) -> FacturamaClient:
    user = cfg.get("facturama_user", "")
    pwd = cfg.get("facturama_password", "")
    if not user or not pwd:
        raise HTTPException(
            status_code=400,
            detail="Configura las credenciales de Facturama en Ajustes > Facturación antes de timbrar.",
        )
    return FacturamaClient(FacturamaConfig(
        user=user,
        password=pwd,
        sandbox=cfg.get("facturama_sandbox", True),
    ))


# ─── Schemas ──────────────────────────────────────────────────────────────────

class FiscalConfigUpdate(BaseModel):
    rfc: str
    razon_social: str
    regimen_fiscal: str
    cp_fiscal: str
    facturama_user: str
    facturama_password: str
    facturama_sandbox: bool = True
    serie_default: str = "A"
    forma_pago_default: str = "03"
    iva_porcentaje: float = 16.0


class CFDICreate(BaseModel):
    # Receptor
    receptor_rfc: str
    receptor_nombre: str
    receptor_cp: str
    receptor_regimen: str = "616"
    receptor_uso_cfdi: str = "G03"
    receptor_email: Optional[str] = None

    # Concepto
    concepto: str = "Alimentos y bebidas"
    subtotal: float
    forma_pago: str = "03"

    # Opcional: vincular a reservación o cliente
    reservation_id: Optional[str] = None
    customer_id: Optional[str] = None


class CFDICancelRequest(BaseModel):
    motivo: str = "02"


# ─── Endpoints de configuración ───────────────────────────────────────────────

@router.get("/config")
def get_billing_config(business_id: str = Depends(get_business_id)):
    cfg = _get_facturacion_config(business_id)
    # Ocultar contraseña en la respuesta
    safe = {k: v for k, v in cfg.items() if k != "facturama_password"}
    safe["tiene_credenciales"] = bool(cfg.get("facturama_user") and cfg.get("facturama_password"))
    return safe


@router.put("/config")
def update_billing_config(body: FiscalConfigUpdate, business_id: str = Depends(get_business_id)):
    db = _db()
    res = db.table("businesses").select("facturacion_config").eq("id", business_id).single().execute()
    existing = res.data.get("facturacion_config") or {}

    # Merge preservando folio_siguiente si ya existe
    merged = {
        **existing,
        **body.model_dump(),
        "folio_siguiente": existing.get("folio_siguiente", 1),
    }

    db.table("businesses").update({"facturacion_config": merged}).eq("id", business_id).execute()
    safe = {k: v for k, v in merged.items() if k != "facturama_password"}
    safe["tiene_credenciales"] = True
    return safe


# ─── Endpoints de CFDIs ───────────────────────────────────────────────────────

@router.get("/cfdis")
def list_cfdis(
    estado: Optional[str] = None,
    limit: int = 50,
    business_id: str = Depends(get_business_id),
):
    db = _db()
    q = (
        db.table("cfdis")
        .select("*, reservations(fecha_hora, personas), customers(nombre, telefono)")
        .eq("business_id", business_id)
        .order("created_at", desc=True)
        .limit(limit)
    )
    if estado:
        q = q.eq("estado", estado)
    return q.execute().data


@router.post("/cfdis", status_code=201)
def create_cfdi(body: CFDICreate, business_id: str = Depends(get_business_id)):
    db = _db()
    cfg = _get_facturacion_config(business_id)

    rfc_emisor = cfg.get("rfc", "")
    if not rfc_emisor:
        raise HTTPException(
            status_code=400,
            detail="Configura el RFC y datos fiscales del negocio en Ajustes > Facturación.",
        )

    client = _build_client(cfg)

    # Calcular IVA y total
    iva_pct = cfg.get("iva_porcentaje", 16.0)
    iva = round(body.subtotal * iva_pct / 100, 2)
    total = round(body.subtotal + iva, 2)

    serie = cfg.get("serie_default", "A")
    # Folio atómico vía RPC (migración 015): dos timbrados simultáneos ya no
    # pueden compartir folio. Fallback al valor leído si la RPC aún no existe.
    folio_atomico = True
    try:
        folio_num = db.rpc("next_cfdi_folio", {"p_business_id": business_id}).execute().data
    except Exception as exc:
        logger.warning("[billing] RPC next_cfdi_folio no disponible (%s); usando folio no atómico", exc)
        folio_num = cfg.get("folio_siguiente", 1)
        folio_atomico = False
    folio = str(folio_num)

    receptor = ReceptorCFDI(
        rfc=body.receptor_rfc.upper().strip(),
        nombre=body.receptor_nombre.upper().strip(),
        cp=body.receptor_cp.strip(),
        regimen_fiscal=body.receptor_regimen,
        uso_cfdi=body.receptor_uso_cfdi,
        email=body.receptor_email,
    )

    item = ItemCFDI(
        descripcion=body.concepto,
        cantidad=1,
        precio_unitario=body.subtotal,
        iva_porcentaje=iva_pct,
    )

    # Crear el registro en BD primero (en estado borrador)
    insert_res = db.table("cfdis").insert({
        "business_id": business_id,
        "reservation_id": body.reservation_id,
        "customer_id": body.customer_id,
        "receptor_rfc": receptor.rfc,
        "receptor_nombre": receptor.nombre,
        "receptor_email": body.receptor_email,
        "receptor_cp": body.receptor_cp,
        "receptor_regimen": body.receptor_regimen,
        "receptor_uso_cfdi": body.receptor_uso_cfdi,
        "concepto": body.concepto,
        "subtotal": body.subtotal,
        "iva": iva,
        "total": total,
        "forma_pago": body.forma_pago,
        "serie": serie,
        "folio": folio,
        "estado": "borrador",
    }).execute()

    cfdi_id = insert_res.data[0]["id"]

    # Intentar timbrar
    try:
        resultado = client.timbrar(
            emisor_rfc=rfc_emisor,
            emisor_nombre=cfg.get("razon_social", ""),
            emisor_regimen=cfg.get("regimen_fiscal", "601"),
            receptor=receptor,
            items=[item],
            serie=serie,
            folio=folio,
            forma_pago=body.forma_pago,
        )

        facturama_id = resultado.get("Id", "")
        uuid_fiscal = resultado.get("Complement", {}).get("TaxStamp", {}).get("Uuid", "")

        # Actualizar con datos del timbrado
        db.table("cfdis").update({
            "estado": "timbrado",
            "facturama_id": facturama_id,
            "uuid_fiscal": uuid_fiscal,
            "fecha_timbrado": datetime.now(timezone.utc).isoformat(),
        }).eq("id", cfdi_id).execute()

        # Avanzar el folio del negocio (la RPC ya lo avanzó de forma atómica;
        # solo se hace a mano en el fallback para no pisar el valor nuevo)
        if not folio_atomico:
            new_cfg = {**cfg, "folio_siguiente": folio_num + 1}
            db.table("businesses").update({"facturacion_config": new_cfg}).eq("id", business_id).execute()

        logger.info("[billing] CFDI timbrado: %s UUID=%s", cfdi_id, uuid_fiscal)

        return db.table("cfdis").select("*").eq("id", cfdi_id).single().execute().data

    except FacturamaError as exc:
        # Guardar el error pero no eliminar el registro
        db.table("cfdis").update({
            "estado": "error",
            "error_msg": str(exc),
        }).eq("id", cfdi_id).execute()
        logger.error("[billing] Error timbrando CFDI %s: %s", cfdi_id, exc)
        raise HTTPException(status_code=422, detail=str(exc))


@router.get("/cfdis/{cfdi_id}")
def get_cfdi(cfdi_id: str, business_id: str = Depends(get_business_id)):
    db = _db()
    res = (
        db.table("cfdis")
        .select("*, reservations(fecha_hora, personas), customers(nombre, telefono)")
        .eq("id", cfdi_id)
        .eq("business_id", business_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="CFDI no encontrado")
    return res.data


@router.get("/cfdis/{cfdi_id}/pdf")
def download_pdf(cfdi_id: str, business_id: str = Depends(get_business_id)):
    db = _db()
    row = db.table("cfdis").select("facturama_id, estado").eq("id", cfdi_id).eq("business_id", business_id).single().execute().data
    if not row:
        raise HTTPException(status_code=404, detail="CFDI no encontrado")
    if row["estado"] != "timbrado" or not row["facturama_id"]:
        raise HTTPException(status_code=400, detail="El CFDI aún no está timbrado")

    cfg = _get_facturacion_config(business_id)
    client = _build_client(cfg)

    try:
        pdf_bytes = client.descargar_pdf(row["facturama_id"])
    except FacturamaError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="factura-{cfdi_id[:8]}.pdf"'},
    )


@router.get("/cfdis/{cfdi_id}/xml")
def download_xml(cfdi_id: str, business_id: str = Depends(get_business_id)):
    db = _db()
    row = db.table("cfdis").select("facturama_id, estado").eq("id", cfdi_id).eq("business_id", business_id).single().execute().data
    if not row:
        raise HTTPException(status_code=404, detail="CFDI no encontrado")
    if row["estado"] != "timbrado" or not row["facturama_id"]:
        raise HTTPException(status_code=400, detail="El CFDI aún no está timbrado")

    cfg = _get_facturacion_config(business_id)
    client = _build_client(cfg)

    try:
        xml_str = client.descargar_xml(row["facturama_id"])
    except FacturamaError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return Response(
        content=xml_str.encode("utf-8"),
        media_type="application/xml",
        headers={"Content-Disposition": f'attachment; filename="factura-{cfdi_id[:8]}.xml"'},
    )


@router.post("/cfdis/{cfdi_id}/cancel")
def cancel_cfdi(
    cfdi_id: str,
    body: CFDICancelRequest,
    business_id: str = Depends(get_business_id),
):
    db = _db()
    row = db.table("cfdis").select("facturama_id, estado").eq("id", cfdi_id).eq("business_id", business_id).single().execute().data
    if not row:
        raise HTTPException(status_code=404, detail="CFDI no encontrado")
    if row["estado"] != "timbrado":
        raise HTTPException(status_code=400, detail="Solo se pueden cancelar CFDIs timbrados")

    cfg = _get_facturacion_config(business_id)
    client = _build_client(cfg)

    try:
        client.cancelar(row["facturama_id"], motivo=body.motivo)
    except FacturamaError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    db.table("cfdis").update({"estado": "cancelado"}).eq("id", cfdi_id).execute()
    logger.info("[billing] CFDI cancelado: %s", cfdi_id)
    return {"ok": True, "cfdi_id": cfdi_id}
