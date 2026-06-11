-- 010_anti_ban_compliance.sql
-- Protecciones contra baneos de WhatsApp.
-- Añade opt-in explícito en customers y controles de tier/quality en businesses.

-- ── Opt-in en customers ──────────────────────────────────────────────────────
-- Un cliente tiene opt-in si alguna vez nos envió un mensaje (inbound = consentimiento implícito)
-- o si el negocio lo marcó manualmente (consentimiento recolectado en caja, web, etc.)

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in   BOOLEAN    NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS opt_in_date       TIMESTAMPTZ;

-- Índice para filtrar sólo opt-in al construir audiencias de campañas
CREATE INDEX IF NOT EXISTS idx_customers_opt_in
  ON customers(business_id, whatsapp_opt_in)
  WHERE whatsapp_opt_in = TRUE;

-- ── Controles de tier y calidad en businesses ────────────────────────────────
-- whatsapp_tier:         0=no verificado (250/día), 1=verificado (1k), 2=10k, 3=100k, 4=ilimitado
-- whatsapp_quality:      'green' | 'yellow' | 'red'  (actualizar manualmente desde Meta Business)
-- whatsapp_msgs_today:   contador reset cada día UTC — no es autoritativo, es guardia local
-- whatsapp_msgs_reset:   fecha del último reset del contador

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS whatsapp_tier        INT        NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS whatsapp_quality     TEXT       NOT NULL DEFAULT 'green'
    CHECK (whatsapp_quality IN ('green', 'yellow', 'red')),
  ADD COLUMN IF NOT EXISTS whatsapp_msgs_today  INT        NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS whatsapp_msgs_reset  DATE       NOT NULL DEFAULT CURRENT_DATE;

-- ── Función para resetear contador diario ────────────────────────────────────
-- Se llama desde el código Python antes de cada campaña.
-- Si la fecha guardada es anterior a hoy, pone el contador a cero.
CREATE OR REPLACE FUNCTION reset_daily_message_count(p_business_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE businesses
  SET
    whatsapp_msgs_today = 0,
    whatsapp_msgs_reset = CURRENT_DATE
  WHERE id = p_business_id
    AND whatsapp_msgs_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
