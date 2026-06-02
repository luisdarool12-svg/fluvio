# Runbook — Deploy en staging (híbrido: Vercel + EasyPanel)

Arquitectura del deploy:

```
        VERCEL                          EASYPANEL (tu servidor)
   ┌──────────────┐          ┌──────────────────────────────────────┐
   │  apps/web    │          │  fluvio-bot   (FastAPI :8001) ←──┐    │
   │  (dashboard) │          │  fluvio-bridge (Baileys 24/7) ───┘    │
   └──────┬───────┘          │  [fluvio-api  (FastAPI :8000) opc.]   │
          │                  │  volumen persistente: /app/auth_info  │
          └────────► SUPABASE ◄──────────────────────────────────────┘
```

Repo: `https://github.com/luisdarool12-svg/fluvio` (privado, rama `main`).
Todos los servicios se construyen desde su propio `Dockerfile` (excepto el web, que Vercel detecta como Next.js).

---

## Parte 1 — Dashboard en Vercel (`apps/web`)

1. Entra a [vercel.com](https://vercel.com) → **Add New… → Project**.
2. **Import** el repo de GitHub `luisdarool12-svg/fluvio` (autoriza el acceso de Vercel a GitHub si te lo pide).
3. En la configuración del proyecto:
   - **Root Directory** → `apps/web`  ← (clave, es un monorepo)
   - **Framework Preset** → Next.js (se detecta solo)
   - Build/Output → dejar por defecto
4. **Environment Variables** → agrega (valores reales de tu `.env`/Supabase):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. **Deploy**. En ~2 min tendrás una URL tipo `https://fluvio-xxx.vercel.app`.
6. Cada `git push` a `main` redespliega solo.

> Verificación: abre la URL `/login`, inicia sesión con `luis@dublebistro.mx` → debe entrar a `/dashboard` con datos reales de Supabase.

---

## Parte 2 — bot + bridge en EasyPanel

### 2.1 Crear el proyecto
En EasyPanel → **Create Project** → nómbralo `fluvio`.

### 2.2 Servicio `fluvio-bot` (App desde GitHub)
- **Source**: GitHub → repo `luisdarool12-svg/fluvio`, rama `main`.
- **Build**: tipo **Dockerfile**.
  - **Build context / path**: `apps/bot`
  - **Dockerfile path**: `apps/bot/Dockerfile` (relativo al context: `Dockerfile`)
- **Port**: `8001`
- **Environment**:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`
- Deploy. Health check: `GET /health`.

### 2.3 Servicio `fluvio-bridge` (App desde GitHub) — Baileys
- **Source**: mismo repo y rama.
- **Build**: Dockerfile.
  - **Build context / path**: `apps/bot/baileys-bridge`
  - **Dockerfile path**: `Dockerfile`
- **Port**: ninguno (no escucha; es cliente).
- **Volumen persistente** (¡crítico!): monta `/app/auth_info` para no perder la sesión de WhatsApp en cada redeploy.
- **Environment**:
  - `BOT_API_URL` → dirección **interna** del bot, p. ej. `http://fluvio-bot:8001`
    (usa el hostname interno que EasyPanel muestra para el servicio `fluvio-bot`).
  - `DUBLE_PHONE_NUMBER_ID=duble-baileys`
- Deploy y abre los **logs**: Baileys imprime un **QR**. Escanéalo con el WhatsApp de Duble (Dispositivos vinculados). La sesión queda guardada en el volumen.

### 2.4 (Opcional) Servicio `fluvio-api`
Hoy ni el web ni el bot la consumen (solo el job nocturno de no-show), así que puede esperar.
- Build context: `apps/api` · Dockerfile: `Dockerfile` · Port: `8000`
- Environment: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `INTERNAL_JOB_SECRET`

---

## Parte 3 — Verificación end-to-end
1. Manda un WhatsApp al número de Duble → el bridge lo recibe → POST a `fluvio-bot` → se guarda en Supabase.
2. Abre el dashboard en Vercel → la reserva/conversación aparece.
3. ✅ Flujo completo: WhatsApp → bot → Supabase → dashboard, en la nube.

## Notas
- La sesión de Baileys (`auth_info/`) NO se commitea ni se mete en la imagen; vive solo en el volumen del servidor.
- Secrets: se cargan como variables de entorno en cada panel, nunca en el repo.
- `apps/web` usa `.env.local` en local; en Vercel se configuran como Environment Variables.
