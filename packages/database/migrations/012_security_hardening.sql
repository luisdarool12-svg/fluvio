-- 012_security_hardening.sql
-- Corrige el aviso "Function Search Path Mutable" del linter de Supabase:
-- una función SECURITY DEFINER (o invocada por triggers) sin search_path fijo
-- puede ser secuestrada creando objetos homónimos en otro schema.
--
-- Patrón recomendado por el linter: SET search_path = '' + referencias
-- totalmente calificadas (pg_catalog siempre se resuelve implícitamente,
-- por eso now() y CURRENT_DATE no necesitan calificarse).
--
-- CREATE OR REPLACE conserva los triggers que ya apuntan a estas funciones.
-- https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- ── update_updated_at (001) — trigger updated_at genérico ────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── set_updated_at (006) — trigger updated_at de campaigns ───────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── bump_no_show_history (003) — contador de no-shows del cliente ────────────

CREATE OR REPLACE FUNCTION public.bump_no_show_history()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.estado = 'no_show' AND OLD.estado IS DISTINCT FROM 'no_show' THEN
    UPDATE public.customers
      SET no_show_history = no_show_history + 1
      WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$;

-- ── reset_daily_message_count (010) — reset del contador anti-ban ────────────

CREATE OR REPLACE FUNCTION public.reset_daily_message_count(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE public.businesses
  SET
    whatsapp_msgs_today = 0,
    whatsapp_msgs_reset = CURRENT_DATE
  WHERE id = p_business_id
    AND whatsapp_msgs_reset < CURRENT_DATE;
END;
$$;

-- ── Pendiente manual (no se puede via SQL) ───────────────────────────────────
-- Leaked password protection: activar en el dashboard de Supabase:
-- Authentication > Sign In / Providers > Email > "Prevent use of leaked passwords".
