-- 011_embedded_signup.sql
-- Agrega credenciales de WhatsApp Embedded Signup a la tabla businesses.
-- Cada negocio que conecta su WABA via el flujo OAuth de Meta obtiene su
-- propio waba_id y access_token. El campo telefono_whatsapp ya existía y
-- sigue siendo la clave de ruteo del bot (phone_number_id de Meta).

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS waba_id TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_connected BOOLEAN DEFAULT false;

-- Verificar:
-- SELECT id, nombre, telefono_whatsapp, waba_id, whatsapp_connected FROM businesses;
