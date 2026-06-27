-- 014_whatsapp_token_expiry.sql
-- Agrega columna para rastrear la fecha de expiración del token de WhatsApp.
-- Los tokens long-lived de Meta duran ~60 días; sin refresh el bot deja de funcionar.
-- El endpoint GET /business/me calcula días restantes y emite una advertencia
-- cuando quedan ≤7 días, visible en el dashboard de Configuración > WhatsApp.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS whatsapp_token_expires_at TIMESTAMPTZ;

-- Para los negocios que ya tienen token conectado pero sin fecha de expiración,
-- asumimos que el token fue emitido recientemente y les damos 60 días desde hoy.
-- Ejecutar esto después de aplicar la migración si hay negocios ya conectados:
--
-- UPDATE public.businesses
--   SET whatsapp_token_expires_at = NOW() + INTERVAL '60 days'
-- WHERE whatsapp_connected = true AND whatsapp_token_expires_at IS NULL;
