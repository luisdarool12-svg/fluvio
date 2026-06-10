-- 006_campaigns.sql
-- Módulo de campañas de marketing con IA.
-- Permite al dueño crear campañas de WhatsApp masivas segmentando su CRM.

-- ── Campañas ──────────────────────────────────────────────────────────────────

CREATE TABLE campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('reactivacion', 'promo', 'evento', 'cumpleanos', 'otro')),
  mensaje       TEXT NOT NULL,
  audience_filter JSONB DEFAULT '{"segment": "all"}'::jsonb,
  -- segment: 'all' | 'vip' | 'inactive' | 'new'
  -- vip: visitas >= 5
  -- inactive: ultima_visita < now() - interval '30 days'
  -- new: visitas = 1
  estado        TEXT NOT NULL DEFAULT 'borrador'
                CHECK (estado IN ('borrador', 'programada', 'enviando', 'completada', 'cancelada')),
  scheduled_at  TIMESTAMPTZ,
  total_destinatarios INT NOT NULL DEFAULT 0,
  total_enviados      INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX idx_campaigns_estado ON campaigns(business_id, estado);

-- ── Destinatarios de campaña ──────────────────────────────────────────────────

CREATE TABLE campaign_recipients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  enviado     BOOLEAN NOT NULL DEFAULT FALSE,
  entregado   BOOLEAN NOT NULL DEFAULT FALSE,
  leido       BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at     TIMESTAMPTZ,
  UNIQUE (campaign_id, customer_id)
);

CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_pending ON campaign_recipients(campaign_id, enviado) WHERE enviado = FALSE;

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_same_business"
  ON campaigns
  USING (business_id = (auth.jwt() -> 'app_metadata' ->> 'business_id')::uuid);

CREATE POLICY "campaign_recipients_same_business"
  ON campaign_recipients
  USING (business_id = (auth.jwt() -> 'app_metadata' ->> 'business_id')::uuid);

-- ── Trigger updated_at ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
