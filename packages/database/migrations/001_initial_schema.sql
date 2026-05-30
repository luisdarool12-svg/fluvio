-- ============================================================
-- OptimizaAI — Esquema inicial multi-tenant
-- Migración: 001_initial_schema.sql
-- Ejecutar en: Supabase Studio > SQL Editor
-- ============================================================

-- ─── Tipos ENUM ──────────────────────────────────────────────

CREATE TYPE business_tipo AS ENUM ('restaurante', 'salon', 'clinica', 'otro');
CREATE TYPE business_plan AS ENUM ('starter', 'pro', 'premium');
CREATE TYPE user_rol AS ENUM ('owner', 'manager', 'staff');
CREATE TYPE reservation_estado AS ENUM ('pendiente', 'confirmada', 'sentada', 'no_show', 'cancelada');
CREATE TYPE reservation_canal AS ENUM ('whatsapp', 'web', 'telefono', 'manual');

-- ─── businesses (tenants) ────────────────────────────────────

CREATE TABLE businesses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            TEXT NOT NULL,
  tipo              business_tipo NOT NULL DEFAULT 'restaurante',
  telefono_whatsapp TEXT,
  zona_horaria      TEXT NOT NULL DEFAULT 'America/Mexico_City',
  idioma_default    TEXT NOT NULL DEFAULT 'es',
  plan              business_plan NOT NULL DEFAULT 'starter',
  activo            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Solo service_role puede insertar negocios (onboarding interno)
CREATE POLICY "businesses_service_only" ON businesses
  USING (false)
  WITH CHECK (false);

-- ─── users (dueños y staff) ──────────────────────────────────

CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  rol         user_rol NOT NULL DEFAULT 'staff',
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_business_id ON users(business_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Usuario ve solo los de su propio negocio
CREATE POLICY "users_same_business" ON users
  FOR ALL USING (
    business_id = (
      SELECT business_id FROM users WHERE id = auth.uid()
    )
  );

-- ─── tables (mesas / recursos reservables) ───────────────────

CREATE TABLE tables (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  capacidad   INT NOT NULL CHECK (capacidad > 0),
  zona        TEXT,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tables_business_id ON tables(business_id);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tables_same_business" ON tables
  FOR ALL USING (
    business_id = (
      SELECT business_id FROM users WHERE id = auth.uid()
    )
  );

-- ─── customers (CRM — clientes del restaurante) ──────────────

CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  idioma        TEXT NOT NULL DEFAULT 'es',
  visitas       INT NOT NULL DEFAULT 0,
  ultima_visita TIMESTAMPTZ,
  notas         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (business_id, telefono)  -- un número = un cliente por negocio
);

CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_telefono ON customers(business_id, telefono);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_same_business" ON customers
  FOR ALL USING (
    business_id = (
      SELECT business_id FROM users WHERE id = auth.uid()
    )
  );

-- ─── reservations ────────────────────────────────────────────

CREATE TABLE reservations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id      UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  table_id         UUID REFERENCES tables(id) ON DELETE SET NULL,
  fecha_hora       TIMESTAMPTZ NOT NULL,
  personas         INT NOT NULL CHECK (personas > 0),
  estado           reservation_estado NOT NULL DEFAULT 'pendiente',
  notas            TEXT,
  canal            reservation_canal NOT NULL DEFAULT 'whatsapp',
  recordatorio_24h BOOLEAN NOT NULL DEFAULT false,
  recordatorio_2h  BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_business_id ON reservations(business_id);
CREATE INDEX idx_reservations_fecha ON reservations(business_id, fecha_hora);
CREATE INDEX idx_reservations_estado ON reservations(business_id, estado);
CREATE INDEX idx_reservations_customer ON reservations(business_id, customer_id);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_same_business" ON reservations
  FOR ALL USING (
    business_id = (
      SELECT business_id FROM users WHERE id = auth.uid()
    )
  );

-- Trigger: actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── events (eventos especiales) ─────────────────────────────

CREATE TABLE events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  titulo       TEXT NOT NULL,
  descripcion  TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin    TIMESTAMPTZ NOT NULL,
  activo       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_business_id ON events(business_id);
CREATE INDEX idx_events_fechas ON events(business_id, fecha_inicio, fecha_fin);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_same_business" ON events
  FOR ALL USING (
    business_id = (
      SELECT business_id FROM users WHERE id = auth.uid()
    )
  );

-- ─── Política de acceso del bot (service_role) ───────────────
-- El bot usa service_role key y BYPASS RLS para operar sin JWT de usuario.
-- La validación del tenant en el bot la hace el código Python (apps/bot),
-- nunca confiando en datos del mensaje entrante.

-- ─── Vista de utilidad: reservas de hoy ──────────────────────

CREATE OR REPLACE VIEW reservations_today AS
SELECT
  r.*,
  c.nombre  AS customer_nombre,
  c.telefono AS customer_telefono,
  t.nombre  AS table_nombre,
  t.zona    AS table_zona
FROM reservations r
JOIN customers c ON c.id = r.customer_id
LEFT JOIN tables t ON t.id = r.table_id
WHERE r.fecha_hora::date = CURRENT_DATE
  AND r.estado NOT IN ('cancelada');
