# Runbook: Configurar WhatsApp Cloud API (Meta)

> Tiempo estimado total: 3–7 días (la mayor parte es espera de verificación de Meta).
> Tiempo activo tuyo: ~3 horas repartidas en varios días.

---

## Resumen del proceso

```
1. Crear cuenta Meta Business Manager
2. Verificar tu empresa ante Meta
3. Crear app en Meta for Developers
4. Agregar el producto "WhatsApp"
5. Conseguir número dedicado y registrarlo
6. Configurar webhook (apunta a tu bot)
7. Crear plantillas de mensaje (recordatorios)
8. Probar end-to-end
9. Llenar .env con las credenciales
```

---

## PASO 1 — Crear Meta Business Manager

**URL:** https://business.facebook.com

1. Inicia sesión con tu cuenta personal de Facebook.
2. Si no tienes una cuenta de empresa, haz clic en **"Crear cuenta"**.
3. Llena:
   - Nombre del negocio: `OptimizaAI` (o el nombre legal de tu empresa)
   - Tu nombre completo
   - Email de empresa
4. Confirma el email.

> Si ya tienes Meta Business Manager activo (por ads de Duble, por ejemplo), puedes usar esa misma cuenta. No necesitas crear otra.

---

## PASO 2 — Verificar tu empresa ante Meta

Este paso desbloquea límites más altos de mensajes. Para el MVP no es obligatorio, pero hazlo desde ya porque tarda.

1. En Business Manager → **Configuración del negocio** → **Información del negocio**
2. Haz clic en **"Iniciar verificación"**
3. Meta pedirá alguno de estos documentos:
   - Constancia de Situación Fiscal del SAT (RFC activo)
   - Acta constitutiva si es SA/SAPI
   - Para persona física con actividad empresarial: Constancia del SAT es suficiente
4. Sube el documento y espera. Puede tardar de 1 a 5 días hábiles.

> Mientras esperas la verificación, puedes continuar con los pasos 3-6 y probar con el número de sandbox que Meta te da gratis.

---

## PASO 3 — Crear App en Meta for Developers

**URL:** https://developers.facebook.com/apps

1. Haz clic en **"Crear app"**
2. Tipo de app: **"Business"** (no "Consumer")
3. Nombre de la app: `OptimizaAI` (o `optimizaai-bot`)
4. Email de contacto: el tuyo
5. Cuenta de Business Manager: selecciona la que creaste en el Paso 1
6. Haz clic en **"Crear app"**

---

## PASO 4 — Agregar el producto WhatsApp

Dentro de tu app recién creada:

1. En el menú izquierdo busca **"Agregar productos"**
2. Encuentra **"WhatsApp"** y haz clic en **"Configurar"**
3. Meta te asignará automáticamente:
   - Un **número de prueba** (sandbox) — ya puedes recibir/enviar mensajes de prueba
   - Un **token de acceso temporal** (válido 24h) para probar
4. En la sección **"Primeros pasos"** verás:
   - `Phone Number ID` — guárdalo (lo necesitas en `.env`)
   - `WhatsApp Business Account ID` — guárdalo también

---

## PASO 5 — Conseguir y registrar un número dedicado

> El número de sandbox de Meta solo puede enviar mensajes a números pre-registrados como testers. Para producción necesitas un número real.

### Opciones para el número

| Opción | Costo | Velocidad |
|---|---|---|
| Línea Telcel/AT&T prepago nueva (SIM) | ~$50 MXN | Inmediato |
| Número virtual (ej. Twilio, OpenPhone) | ~$5 USD/mes | Inmediato |
| El número actual de WhatsApp de Duble | Gratis | Requiere migración (ver nota) |

**Recomendación para el MVP:** Compra una SIM Telcel prepago nueva (~$50 MXN). Simple, sin dependencias, fácil de escalar.

> **Nota importante:** Si quieres usar el número actual de WhatsApp de Duble, ese número NO puede estar activo en la app de WhatsApp al mismo tiempo. La migración desinstala la app. Para el MVP con una SIM nueva evitas este problema.

### Registrar el número en Meta

1. En tu app → WhatsApp → **"Configuración del teléfono"**
2. Haz clic en **"Agregar número de teléfono"**
3. Llena el perfil del número:
   - Nombre del negocio que verán los clientes: `Duble Bistró Moderne` (o `OptimizaAI`)
   - Categoría: `Restaurant` o `Technology`
   - Descripción breve
4. Ingresa el número nuevo y verifica con el código SMS

---

## PASO 6 — Configurar el Webhook

El webhook es la URL donde WhatsApp entregará los mensajes entrantes a tu bot.

### En desarrollo (sin servidor publicado)

Usa **ngrok** para exponer tu bot local:

```bash
# Instalar ngrok (solo una vez)
brew install ngrok   # macOS

# En una terminal: correr el bot
cd apps/bot
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# En otra terminal: exponer al internet
ngrok http 8001
# Copia la URL que te da, ej: https://abc123.ngrok-free.app
```

### En Meta for Developers

1. Ve a tu app → WhatsApp → **"Configuración"** → **"Webhooks"**
2. Haz clic en **"Editar"**
3. URL del webhook: `https://abc123.ngrok-free.app/webhook`
4. Token de verificación: inventa una cadena secreta, ej. `optimizaai_secret_2026`
   - Este valor va a tu `.env` como `WHATSAPP_VERIFY_TOKEN`
5. Haz clic en **"Verificar y guardar"**
   - Meta hace un GET a tu URL con el token — tu bot responde correctamente (ya está programado)
6. Suscríbete a los campos:
   - ✅ `messages` (obligatorio)
   - ✅ `message_deliveries` (opcional pero útil)

### En producción (cuando tengas servidor)

Reemplaza la URL de ngrok por tu dominio real: `https://api.tudominio.com/webhook`

---

## PASO 7 — Crear Token de Acceso Permanente

El token temporal dura 24h. Para producción necesitas uno permanente.

1. En Business Manager → **"Configuración del sistema"** → **"Usuarios del sistema"**
2. Haz clic en **"Agregar"** → nombre: `optimizaai-bot` → Rol: **Admin**
3. Haz clic en **"Generar token de acceso nuevo"**
4. Selecciona tu app
5. Permisos a activar:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
6. Haz clic en **"Generar token"** → **Cópialo ahora**, Meta no lo vuelve a mostrar
7. Este valor va a tu `.env` como `WHATSAPP_TOKEN`

---

## PASO 8 — Crear Plantillas de Mensaje (Recordatorios)

Los mensajes que TÚ inicias (recordatorios anti no-show) requieren plantillas aprobadas por Meta.
Los mensajes en respuesta a un cliente entrante no necesitan plantilla.

### Cómo crear una plantilla

1. En Business Manager → **"Herramientas de cuenta"** → **"Plantillas de mensaje de WhatsApp"**
2. Haz clic en **"Crear plantilla"**
3. Crea estas dos plantillas:

**Plantilla 1: Recordatorio 24 horas**
- Nombre: `recordatorio_reserva_24h`
- Categoría: `UTILITY`
- Idioma: Español (México)
- Cuerpo del mensaje:
  ```
  Hola {{1}}, te recordamos tu reservación en {{2}} mañana {{3}} a las {{4}} para {{5}} personas. 
  Responde CONFIRMAR para confirmar o CANCELAR si no podrás asistir. ¡Te esperamos!
  ```
- Variables: nombre_cliente, nombre_restaurante, fecha, hora, num_personas

**Plantilla 2: Recordatorio 2 horas**
- Nombre: `recordatorio_reserva_2h`
- Categoría: `UTILITY`
- Idioma: Español (México)
- Cuerpo:
  ```
  Hola {{1}}, tu mesa en {{2}} está lista para hoy a las {{3}}. ¡Te vemos pronto! 🍽️
  ```

4. Envía a revisión. Meta aprueba en 24–48h generalmente.

---

## PASO 9 — Llenar el .env

Con todo lo anterior, tu `.env` quedará así:

```env
# WhatsApp Cloud API
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxx          # Token permanente del Paso 7
WHATSAPP_VERIFY_TOKEN=optimizaai_secret_2026  # El que inventaste en Paso 6
WHATSAPP_PHONE_NUMBER_ID=1234567890123      # Del Paso 4
WHATSAPP_BUSINESS_ACCOUNT_ID=9876543210    # Del Paso 4
```

---

## PASO 10 — Probar end-to-end

1. Con el bot corriendo y ngrok activo, envía un WhatsApp al número registrado desde tu celular personal.
2. Deberías ver en la terminal del bot el mensaje entrante.
3. El bot debería responder via Claude.

**Checklist de verificación:**
- [ ] El webhook está verificado en Meta (palomita verde)
- [ ] El bot recibe mensajes en `/webhook` (ves el log)
- [ ] El bot responde en WhatsApp
- [ ] El token no expira (es el permanente, no el de 24h)

---

## Resumen de credenciales que vas a obtener

| Variable .env | Dónde encontrarla |
|---|---|
| `WHATSAPP_TOKEN` | Paso 7 — Usuario del sistema |
| `WHATSAPP_VERIFY_TOKEN` | Tú lo inventas en Paso 6 |
| `WHATSAPP_PHONE_NUMBER_ID` | Paso 4 — Primeros pasos de la app |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Paso 4 — Primeros pasos de la app |

---

## Costos aproximados (Cloud API)

| Tipo de mensaje | Costo |
|---|---|
| Primeras 1,000 conversaciones/mes | **Gratis** |
| Conversación iniciada por el cliente | ~$0.006 USD |
| Conversación iniciada por tú (recordatorio) | ~$0.045 USD |

Para el volumen de Duble en el MVP, el costo será prácticamente cero.

---

*Cuando llegues al Paso 6 (webhook) dime y lo conectamos juntos con el código del bot.*
