-- 007_cloud_api_phone_id.sql
-- Migra el identificador de WhatsApp de Dublé Bistró de Baileys (string interno)
-- al phone_number_id real de WhatsApp Cloud API.
--
-- El campo businesses.telefono_whatsapp es la clave que vincula mensajes
-- entrantes con el tenant. Con Cloud API, Meta envía este ID en el campo
-- value.metadata.phone_number_id del payload del webhook.
--
-- Ejecutar DESPUÉS de registrar el webhook en Meta for Developers y confirmar
-- que el WHATSAPP_PHONE_NUMBER_ID en .env coincide con este valor.

UPDATE businesses
SET telefono_whatsapp = '1244323312088545'
WHERE telefono_whatsapp = 'duble-baileys';

-- Verificar el cambio:
-- SELECT id, nombre, telefono_whatsapp FROM businesses;
