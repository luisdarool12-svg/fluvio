-- ============================================================
-- Fluvio — Layouts temporales del salón (migración 009)
-- Ejecutar en: Supabase Studio > SQL Editor
-- ============================================================
-- floor_plan_overrides guarda configuraciones temporales del croquis
-- (eventos privados, reacomodos puntuales). Mientras un override está
-- vigente (valid_from <= now < valid_until), el dashboard y el motor
-- de plano usan su config en lugar de floor_plan_config.
--
-- El job horario (POST /internal/noshow/run) elimina los overrides
-- expirados vía revert_expired_overrides().
-- ============================================================

CREATE TABLE IF NOT EXISTS floor_plan_overrides (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  -- Mismo shape que floor_plan_config.config, más "tables":
  -- posiciones temporales de mesas [{id, posX, posY, rotation}]
  config      JSONB NOT NULL DEFAULT '{"walls": [], "zones": [], "furniture": [], "tables": []}'::jsonb,
  valid_from  TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL,
  motivo      TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT floor_plan_overrides_rango CHECK (valid_until > valid_from)
);

CREATE INDEX IF NOT EXISTS idx_fp_overrides_business_vigencia
  ON floor_plan_overrides (business_id, valid_from, valid_until);

ALTER TABLE floor_plan_overrides ENABLE ROW LEVEL SECURITY;

-- Aislamiento por tenant (mismo patrón que el resto del esquema)
DROP POLICY IF EXISTS "fp_overrides_same_business" ON floor_plan_overrides;
CREATE POLICY "fp_overrides_same_business" ON floor_plan_overrides
  FOR ALL USING (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  );
