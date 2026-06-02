-- ============================================================
-- Fluvio — Bot additions (migración 002)
-- Ejecutar en: Supabase Studio > SQL Editor
-- ============================================================

-- ─── Extensiones a businesses ────────────────────────────────
-- bot_config almacena: system_prompt, calendar_id,
-- google_credentials_json, sheets_id, timezone, etc.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS bot_config JSONB;

-- ─── Extensiones a customers ─────────────────────────────────

ALTER TABLE customers ADD COLUMN IF NOT EXISTS jid TEXT;
-- notas ya existe en el schema base

-- ─── Extensiones a reservations ──────────────────────────────

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS zona TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS requisicion TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;
-- "confirmed" = cliente respondió SI al mensaje de confirmación 24h
-- Lo mapeamos con: estado = 'confirmada' ya en el schema
-- Pero necesitamos los flags de envío de notificaciones:
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS reminder_sent     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── conversations ────────────────────────────────────────────
-- Una por número de teléfono por negocio (canal de chat)

CREATE TABLE IF NOT EXISTS conversations (
  id              BIGSERIAL PRIMARY KEY,
  business_id     UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  phone           TEXT NOT NULL,
  name            TEXT,
  platform        TEXT NOT NULL DEFAULT 'whatsapp',
  jid             TEXT,
  mode            TEXT CHECK(mode IN ('AI','HUMAN')) NOT NULL DEFAULT 'AI',
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_conversations_business ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(business_id, last_message_at DESC NULLS LAST);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_same_business" ON conversations
  FOR ALL USING (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  );

-- ─── messages ─────────────────────────────────────────────────
-- Historial de mensajes de cada conversación

CREATE TABLE IF NOT EXISTS messages (
  id              BIGSERIAL PRIMARY KEY,
  business_id     UUID NOT NULL,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT CHECK(role IN ('user','assistant','human')) NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_same_business" ON messages
  FOR ALL USING (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  );

-- ─── outbox ───────────────────────────────────────────────────
-- Cola de mensajes del operador humano pendientes de enviar

CREATE TABLE IF NOT EXISTS outbox (
  id              BIGSERIAL PRIMARY KEY,
  business_id     UUID NOT NULL,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  phone           TEXT NOT NULL,
  platform        TEXT NOT NULL DEFAULT 'whatsapp',
  jid             TEXT,
  content         TEXT NOT NULL,
  sent            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox(business_id, sent, created_at);

ALTER TABLE outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outbox_same_business" ON outbox
  FOR ALL USING (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  );
