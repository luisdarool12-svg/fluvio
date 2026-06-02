-- ============================================================
-- Fluvio — Sistema de riesgo de no-show (migración 003)
-- Ejecutar en: Supabase Studio > SQL Editor
-- ============================================================
-- Agrega:
--   • Scoring de no-show (0-100) por reservación.
--   • Estado de confirmación explícita del cliente.
--   • Contador histórico de no-shows por cliente (auto-mantenido).
--   • Auditoría de acciones tomadas (noshow_actions_log).
--   • Cola de notificaciones para el dashboard del dueño (notifications).
-- ============================================================

-- ─── Tipos ENUM ──────────────────────────────────────────────
-- confirmation_status complementa (no reemplaza) a reservation_estado.
-- estado = ciclo de vida de la reserva; confirmation_status = respuesta
-- explícita del cliente al mensaje de confirmación.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'confirmation_status') THEN
    CREATE TYPE confirmation_status AS ENUM ('pending', 'confirmed', 'rejected');
  END IF;
END$$;

-- ─── Extensiones a reservations ──────────────────────────────

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS no_show_score INTEGER
    CHECK (no_show_score IS NULL OR no_show_score BETWEEN 0 AND 100);

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS confirmation_status confirmation_status NOT NULL DEFAULT 'pending';

-- Índice para ordenar el risk-report por score
CREATE INDEX IF NOT EXISTS idx_reservations_score
  ON reservations(business_id, no_show_score DESC NULLS LAST);

-- ─── Extensiones a customers ─────────────────────────────────

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS no_show_history INTEGER NOT NULL DEFAULT 0;

-- ─── outbox: permitir mensajes originados por el sistema ─────
-- El job nocturno encola alertas al dueño y recordatorios a reservas
-- que pueden no tener conversación previa (canal manual/web).
-- El bridge solo lee phone,jid,content,platform, así que esto es seguro.

ALTER TABLE outbox ALTER COLUMN conversation_id DROP NOT NULL;

-- ─── noshow_actions_log (auditoría de acciones) ──────────────

CREATE TABLE IF NOT EXISTS noshow_actions_log (
  id             BIGSERIAL PRIMARY KEY,
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  action_type    TEXT NOT NULL,
  score          INTEGER,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  response       TEXT
);

CREATE INDEX IF NOT EXISTS idx_noshow_log_business     ON noshow_actions_log(business_id);
CREATE INDEX IF NOT EXISTS idx_noshow_log_reservation  ON noshow_actions_log(reservation_id, sent_at);

ALTER TABLE noshow_actions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "noshow_log_same_business" ON noshow_actions_log
  FOR ALL USING (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  );

-- ─── notifications (alertas para el dashboard del dueño) ─────

CREATE TABLE IF NOT EXISTS notifications (
  id             BIGSERIAL PRIMARY KEY,
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  tipo           TEXT NOT NULL,  -- 'noshow_high_risk' | 'noshow_critical'
  titulo         TEXT,
  mensaje        TEXT,
  leida          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(business_id, leida, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_same_business" ON notifications
  FOR ALL USING (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  );

-- ─── Trigger: mantener customers.no_show_history ─────────────
-- Cuando una reservación pasa a estado 'no_show', incrementa el
-- contador histórico del cliente. Alimenta el peso "+30" del scoring.

CREATE OR REPLACE FUNCTION bump_no_show_history()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'no_show' AND OLD.estado IS DISTINCT FROM 'no_show' THEN
    UPDATE customers
      SET no_show_history = no_show_history + 1
      WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reservations_bump_noshow ON reservations;
CREATE TRIGGER reservations_bump_noshow
  AFTER UPDATE OF estado ON reservations
  FOR EACH ROW EXECUTE FUNCTION bump_no_show_history();
