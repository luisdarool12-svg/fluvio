-- ============================================================
-- Fluvio — Plano del salón (migración 004)
-- Ejecutar en: Supabase Studio > SQL Editor
-- ============================================================
-- Documenta la tabla floor_plan_config, que hasta ahora existía
-- solo en la base de datos (creada a mano) sin migración que la
-- respaldara. Esta migración la deja asentada en el repo para que
-- la BD pueda recrearse desde cero sin perderla.
--
-- Usada por: apps/web/src/app/dashboard/mesas/page.tsx
--   • config jsonb guarda { walls, zones, furniture } del editor de salón.
--   • UNIQUE(business_id) → un solo plano por negocio (upsert por tenant).
--
-- Incluye también el fix del FK a ON DELETE CASCADE, para que sea
-- consistente con el resto de tablas del esquema (al borrar un
-- negocio, su plano se elimina en cascada).
-- ============================================================

-- ─── floor_plan_config ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS floor_plan_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  config      JSONB NOT NULL DEFAULT '{"walls": [], "zones": [], "furniture": []}'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE (business_id)  -- un plano por negocio
);

ALTER TABLE floor_plan_config ENABLE ROW LEVEL SECURITY;

-- Aislamiento por tenant (mismo patrón que el resto del esquema)
DROP POLICY IF EXISTS "fp_owner" ON floor_plan_config;
CREATE POLICY "fp_owner" ON floor_plan_config
  FOR ALL USING (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  );

-- ─── Fix de consistencia: FK a ON DELETE CASCADE ─────────────
-- En BD existentes el FK pudo haberse creado con NO ACTION.
-- Lo normalizamos a CASCADE como el resto de tablas del esquema.
-- (En una BD nueva el CREATE TABLE de arriba ya lo deja en CASCADE;
--  este bloque solo corrige instalaciones previas.)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.referential_constraints
    WHERE constraint_name = 'floor_plan_config_business_id_fkey'
      AND delete_rule <> 'CASCADE'
  ) THEN
    ALTER TABLE floor_plan_config
      DROP CONSTRAINT floor_plan_config_business_id_fkey;
    ALTER TABLE floor_plan_config
      ADD CONSTRAINT floor_plan_config_business_id_fkey
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
  END IF;
END$$;
