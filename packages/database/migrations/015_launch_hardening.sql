-- 015_launch_hardening.sql
-- Endurecimiento previo al lanzamiento público.
-- Ejecutar manualmente en Supabase Studio > SQL Editor.

-- ─── 1. telefono_whatsapp único ───────────────────────────────────────────────
-- telefono_whatsapp (phone_number_id de Cloud API) es la clave de ruteo del
-- bot: dos negocios con el mismo valor significa que uno intercepta las
-- conversaciones del otro. El API ya verifica propiedad contra Meta en el
-- Embedded Signup; este índice es la última línea de defensa.
CREATE UNIQUE INDEX IF NOT EXISTS businesses_telefono_whatsapp_unique
  ON businesses (telefono_whatsapp)
  WHERE telefono_whatsapp IS NOT NULL;

-- ─── 2. Folio de CFDI atómico ─────────────────────────────────────────────────
-- Antes el API leía folio_siguiente, timbraba y lo escribía de vuelta: dos
-- timbrados simultáneos compartían folio. Esta función incrementa y devuelve
-- el folio en un solo UPDATE (atómico a nivel de fila).
CREATE OR REPLACE FUNCTION next_cfdi_folio(p_business_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE businesses
  SET facturacion_config = jsonb_set(
    COALESCE(facturacion_config, '{}'::jsonb),
    '{folio_siguiente}',
    to_jsonb(COALESCE((facturacion_config->>'folio_siguiente')::int, 1) + 1)
  )
  WHERE id = p_business_id
  RETURNING (facturacion_config->>'folio_siguiente')::int - 1;
$$;

-- Solo el service role (API) debe poder llamarla.
REVOKE ALL ON FUNCTION next_cfdi_folio(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION next_cfdi_folio(uuid) FROM anon, authenticated;

-- ─── 3. Índice para el outbox ─────────────────────────────────────────────────
-- El scheduler del bot consulta pendientes cada 30s; sin índice es un scan
-- completo de la tabla que solo crece.
CREATE INDEX IF NOT EXISTS outbox_pending_idx
  ON outbox (created_at)
  WHERE sent = false;
