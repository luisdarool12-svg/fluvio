-- ============================================================
-- Fluvio — Facturación CFDI 4.0
-- Migración: 013_billing_cfdi.sql
-- Ejecutar en: Supabase Studio > SQL Editor
-- ============================================================

-- ─── Configuración fiscal del negocio ──────────────────────
-- Añade facturacion_config JSONB a businesses para almacenar
-- datos del emisor y credenciales de Facturama.
-- Estructura esperada:
-- {
--   "rfc": "AAA010101AAA",
--   "razon_social": "NOMBRE DEL NEGOCIO SA DE CV",
--   "regimen_fiscal": "601",
--   "cp_fiscal": "37000",
--   "facturama_user": "usuario",
--   "facturama_password": "contraseña",
--   "facturama_sandbox": true,
--   "serie_default": "A",
--   "folio_siguiente": 1,
--   "forma_pago_default": "03",
--   "iva_porcentaje": 16
-- }

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS facturacion_config JSONB DEFAULT '{}'::jsonb;

-- ─── CFDIs emitidos ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cfdis (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reservation_id   UUID REFERENCES reservations(id) ON DELETE SET NULL,
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Receptor (datos del cliente que solicita factura)
  receptor_rfc          TEXT NOT NULL,
  receptor_nombre       TEXT NOT NULL,
  receptor_email        TEXT,
  receptor_cp           TEXT NOT NULL,
  receptor_regimen      TEXT NOT NULL DEFAULT '616',
  receptor_uso_cfdi     TEXT NOT NULL DEFAULT 'G03',

  -- Concepto
  concepto         TEXT NOT NULL DEFAULT 'Alimentos y bebidas',
  subtotal         NUMERIC(12,2) NOT NULL,
  iva              NUMERIC(12,2) NOT NULL DEFAULT 0,
  total            NUMERIC(12,2) NOT NULL,
  forma_pago       TEXT NOT NULL DEFAULT '03',

  -- Serie y folio (del negocio)
  serie            TEXT NOT NULL DEFAULT 'A',
  folio            TEXT,

  -- Resultado del timbrado (Facturama)
  facturama_id     TEXT,
  uuid_fiscal      TEXT,
  fecha_timbrado   TIMESTAMPTZ,

  -- Estado
  estado           TEXT NOT NULL DEFAULT 'borrador'
                   CHECK (estado IN ('borrador', 'timbrado', 'cancelado', 'error')),
  error_msg        TEXT,

  -- Archivos (Supabase Storage path o URL de Facturama)
  pdf_url          TEXT,
  xml_url          TEXT,

  -- Auditoría
  created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cfdis_business_id     ON cfdis(business_id);
CREATE INDEX IF NOT EXISTS idx_cfdis_reservation_id  ON cfdis(reservation_id);
CREATE INDEX IF NOT EXISTS idx_cfdis_customer_id     ON cfdis(customer_id);
CREATE INDEX IF NOT EXISTS idx_cfdis_estado          ON cfdis(estado);
CREATE INDEX IF NOT EXISTS idx_cfdis_created_at      ON cfdis(created_at DESC);

ALTER TABLE cfdis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cfdis_same_business" ON cfdis
  FOR ALL USING (
    business_id = (
      SELECT business_id FROM users WHERE id = auth.uid()
    )
  );

-- ─── Trigger: updated_at automático ─────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cfdis_set_updated_at
  BEFORE UPDATE ON cfdis
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
