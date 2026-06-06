-- ============================================================
-- Fluvio — Chatbot panel additions (migración 005)
-- Ejecutar en: Supabase Studio > SQL Editor
-- ============================================================

-- ─── Extensiones a conversations ─────────────────────────────

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'resolved', 'escalated')),
  ADD COLUMN IF NOT EXISTS unread_count INT DEFAULT 0;

-- ─── Extensiones a messages ──────────────────────────────────

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT TRUE;

-- ─── Extensiones a businesses ────────────────────────────────
-- Guarda el estado del formulario para re-editar sin perder datos

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS prompt_form_data JSONB;

-- ─── system_prompt_versions ──────────────────────────────────
-- Historial de versiones del system prompt por negocio

CREATE TABLE IF NOT EXISTS system_prompt_versions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  system_prompt  TEXT NOT NULL,
  form_data      JSONB,
  version_label  TEXT,
  is_active      BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spv_business
  ON system_prompt_versions(business_id, created_at DESC);

ALTER TABLE system_prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spv_same_business" ON system_prompt_versions
  FOR ALL USING (
    business_id = (SELECT business_id FROM users WHERE id = auth.uid())
  );
