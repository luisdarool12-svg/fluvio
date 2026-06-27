"""
Cliente para la API REST de Facturama (PAC de timbrado CFDI 4.0).

Documentación: https://apisandbox.facturama.mx/docs
Auth: HTTP Basic con usuario:contraseña de la cuenta Facturama.

Modos:
  - Sandbox: https://apisandbox.facturama.mx
  - Producción: https://api.facturama.mx
"""
import base64
import logging
from dataclasses import dataclass
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

SANDBOX_URL = "https://apisandbox.facturama.mx"
PROD_URL = "https://api.facturama.mx"

# Códigos SAT para restaurantes
CLAVE_PROD_SERV_ALIMENTOS = "90111500"  # Servicios de restaurantes y bares
UNIDAD_SERVICIO = "E48"                  # Unidad de servicio

# RFC genérico para público en general (CFDI 4.0)
RFC_PUBLICO_GENERAL = "XAXX010101000"
RFC_EXTRANJERO = "XEXX010101000"


@dataclass
class FacturamaConfig:
    user: str
    password: str
    sandbox: bool = True

    @property
    def base_url(self) -> str:
        return SANDBOX_URL if self.sandbox else PROD_URL

    @property
    def auth(self) -> tuple[str, str]:
        return (self.user, self.password)


@dataclass
class ItemCFDI:
    descripcion: str
    cantidad: float
    precio_unitario: float
    descuento: float = 0.0
    iva_porcentaje: float = 16.0
    clave_prod_serv: str = CLAVE_PROD_SERV_ALIMENTOS
    clave_unidad: str = UNIDAD_SERVICIO
    unidad: str = "Servicio"

    @property
    def subtotal(self) -> float:
        return round(self.cantidad * self.precio_unitario - self.descuento, 2)

    @property
    def iva(self) -> float:
        return round(self.subtotal * self.iva_porcentaje / 100, 2)

    @property
    def total(self) -> float:
        return round(self.subtotal + self.iva, 2)


@dataclass
class ReceptorCFDI:
    rfc: str
    nombre: str
    cp: str
    regimen_fiscal: str
    uso_cfdi: str
    email: Optional[str] = None

    @classmethod
    def publico_general(cls, cp: str = "99999") -> "ReceptorCFDI":
        return cls(
            rfc=RFC_PUBLICO_GENERAL,
            nombre="PUBLICO EN GENERAL",
            cp=cp,
            regimen_fiscal="616",
            uso_cfdi="S01",
        )


class FacturamaError(Exception):
    def __init__(self, message: str, status_code: int = 0):
        super().__init__(message)
        self.status_code = status_code


class FacturamaClient:
    def __init__(self, config: FacturamaConfig):
        self.config = config

    def _build_cfdi_payload(
        self,
        emisor_rfc: str,
        emisor_nombre: str,
        emisor_regimen: str,
        receptor: ReceptorCFDI,
        items: list[ItemCFDI],
        serie: str,
        folio: str,
        forma_pago: str = "03",
        metodo_pago: str = "PUE",
        moneda: str = "MXN",
    ) -> dict:
        items_payload = []
        for item in items:
            taxes = []
            if item.iva_porcentaje > 0:
                taxes.append({
                    "Total": item.iva,
                    "Name": "IVA",
                    "Base": item.subtotal,
                    "Rate": item.iva_porcentaje / 100,
                    "IsRetention": False,
                })
            items_payload.append({
                "ProductCode": item.clave_prod_serv,
                "IdentificationNumber": "001",
                "Description": item.descripcion,
                "Unit": item.unidad,
                "UnitCode": item.clave_unidad,
                "UnitPrice": item.precio_unitario,
                "Quantity": item.cantidad,
                "Subtotal": item.subtotal,
                "Discount": item.descuento,
                "Taxes": taxes,
                "Total": item.total,
            })

        return {
            "NameId": "1",
            "CfdiType": "I",
            "PaymentMethod": metodo_pago,
            "PaymentForm": forma_pago,
            "Currency": moneda,
            "Serie": serie,
            "Folio": folio,
            "Issuer": {
                "FiscalRegime": emisor_regimen,
                "Rfc": emisor_rfc,
                "Name": emisor_nombre,
            },
            "Receiver": {
                "Rfc": receptor.rfc,
                "Name": receptor.nombre,
                "CfdiUse": receptor.uso_cfdi,
                "TaxZipCode": receptor.cp,
                "FiscalRegime": receptor.regimen_fiscal,
            },
            "Items": items_payload,
        }

    def timbrar(
        self,
        emisor_rfc: str,
        emisor_nombre: str,
        emisor_regimen: str,
        receptor: ReceptorCFDI,
        items: list[ItemCFDI],
        serie: str,
        folio: str,
        forma_pago: str = "03",
    ) -> dict:
        """Crea y timbra un CFDI 4.0 en Facturama. Devuelve el dict de la respuesta."""
        payload = self._build_cfdi_payload(
            emisor_rfc=emisor_rfc,
            emisor_nombre=emisor_nombre,
            emisor_regimen=emisor_regimen,
            receptor=receptor,
            items=items,
            serie=serie,
            folio=folio,
            forma_pago=forma_pago,
        )
        logger.info("[facturama] Timbrando CFDI %s-%s para RFC %s", serie, folio, receptor.rfc)

        try:
            resp = httpx.post(
                f"{self.config.base_url}/api/cfdis",
                json=payload,
                auth=self.config.auth,
                timeout=30,
            )
        except httpx.RequestError as exc:
            raise FacturamaError(f"Error de conexión con Facturama: {exc}") from exc

        if resp.status_code not in (200, 201):
            detail = _extract_error(resp)
            logger.error("[facturama] Error %s: %s", resp.status_code, detail)
            raise FacturamaError(detail, status_code=resp.status_code)

        return resp.json()

    def descargar_pdf(self, facturama_id: str, tipo: str = "issued") -> bytes:
        """Descarga el PDF del CFDI desde Facturama y lo devuelve como bytes."""
        try:
            resp = httpx.get(
                f"{self.config.base_url}/api-lite/cfdis/{tipo}/{facturama_id}/pdf",
                auth=self.config.auth,
                timeout=30,
            )
        except httpx.RequestError as exc:
            raise FacturamaError(f"Error descargando PDF: {exc}") from exc

        if resp.status_code != 200:
            raise FacturamaError(_extract_error(resp), status_code=resp.status_code)

        data = resp.json()
        return base64.b64decode(data.get("Content", ""))

    def descargar_xml(self, facturama_id: str, tipo: str = "issued") -> str:
        """Descarga el XML del CFDI y lo devuelve como string."""
        try:
            resp = httpx.get(
                f"{self.config.base_url}/api-lite/cfdis/{tipo}/{facturama_id}/xml",
                auth=self.config.auth,
                timeout=30,
            )
        except httpx.RequestError as exc:
            raise FacturamaError(f"Error descargando XML: {exc}") from exc

        if resp.status_code != 200:
            raise FacturamaError(_extract_error(resp), status_code=resp.status_code)

        data = resp.json()
        xml_b64 = data.get("Content", "")
        return base64.b64decode(xml_b64).decode("utf-8")

    def cancelar(self, facturama_id: str, motivo: str = "02", tipo: str = "issued") -> dict:
        """
        Cancela un CFDI.
        Motivos: 01=comprobante emitido con errores con relación,
                 02=comprobante emitido con errores sin relación,
                 03=no se llevó a cabo la operación,
                 04=operación nominativa relacionada en una factura global.
        """
        try:
            resp = httpx.delete(
                f"{self.config.base_url}/api/cfdis/{tipo}/{facturama_id}?motive={motivo}",
                auth=self.config.auth,
                timeout=30,
            )
        except httpx.RequestError as exc:
            raise FacturamaError(f"Error cancelando CFDI: {exc}") from exc

        if resp.status_code not in (200, 204):
            raise FacturamaError(_extract_error(resp), status_code=resp.status_code)

        return resp.json() if resp.content else {}


def _extract_error(resp: httpx.Response) -> str:
    try:
        body = resp.json()
        if isinstance(body, dict):
            return body.get("message") or body.get("Message") or str(body)
        return str(body)
    except Exception:
        return resp.text or f"HTTP {resp.status_code}"
