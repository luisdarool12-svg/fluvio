-- ============================================================
-- Fluvio — Motor de disponibilidad de mesas (migración 008)
-- Ejecutar en: Supabase Studio > SQL Editor
-- ============================================================
-- Nota: la tarea original pedía "006_table_availability.sql", pero
-- 006_campaigns.sql y 007_cloud_api_phone_id.sql ya existen y fueron
-- ejecutadas. Por la regla de "siguiente número secuencial", esta es 008.
--
-- Contenido:
--   1. tables.tiempo_promedio_estancia — minutos que una mesa permanece
--      ocupada por reserva (usado para calcular traslapes).
--   2. tables.combinable_con — UUIDs de mesas que pueden juntarse con
--      esta para grupos grandes.
--   3. reservations.mesas_combinadas — cuando una reserva usa una
--      combinación, aquí quedan TODAS las mesas de la combinación.
--      Sin esta columna, la segunda mesa de una combinación seguiría
--      apareciendo libre para el motor de disponibilidad.
--   4. Índice (business_id, fecha_hora, estado) para la query de
--      traslapes del motor.
-- ============================================================

-- ─── tables: tiempo promedio de estancia (minutos) ───────────

ALTER TABLE tables
  ADD COLUMN IF NOT EXISTS tiempo_promedio_estancia INT NOT NULL DEFAULT 90;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'tables_estancia_positiva'
  ) THEN
    ALTER TABLE tables
      ADD CONSTRAINT tables_estancia_positiva
      CHECK (tiempo_promedio_estancia > 0);
  END IF;
END$$;

-- ─── tables: con qué mesas se puede combinar ─────────────────

ALTER TABLE tables
  ADD COLUMN IF NOT EXISTS combinable_con UUID[] NOT NULL DEFAULT '{}';

-- ─── reservations: mesas de una combinación ──────────────────
-- table_id queda como la mesa principal; mesas_combinadas lista
-- todas las mesas bloqueadas (incluida la principal) cuando la
-- reserva ocupa más de una mesa. Vacío para reservas de mesa única.

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS mesas_combinadas UUID[] NOT NULL DEFAULT '{}';

-- ─── Índice para la query de traslapes del motor ─────────────
-- (001 ya creó (business_id, fecha_hora) y (business_id, estado);
-- este cubre el filtro combinado rango de fecha + estado.)

CREATE INDEX IF NOT EXISTS idx_reservations_business_fecha_estado
  ON reservations (business_id, fecha_hora, estado);
