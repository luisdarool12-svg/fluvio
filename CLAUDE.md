# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Fluvio — SaaS de Reservaciones + IA para Restaurantes

Plataforma multi-tenant de reservaciones con agente IA vía WhatsApp para restaurantes.
Piloto: Dublé Bistró (León, Gto.). Escalable a cualquier negocio sin cambios de código.

---

## Reglas de arquitectura — NO romper jamás

- **Multi-tenant estricto.** Los negocios son filas en `businesses`, nunca carpetas ni repos separados.
- Dar de alta un cliente nuevo = `INSERT INTO businesses (...)`. Nada más.
- Toda query sobre una tabla de tenant lleva `.eq("business_id", business_id)` o `WHERE business_id = $1`. Sin excepción.
- Supabase RLS está habilitado en todas las tablas; es la segunda capa de aislamiento (no la única).
- El campo `businesses.telefono_whatsapp` es la clave que vincula un número de WhatsApp con un tenant.

---

## Comandos de desarrollo

### Frontend — `apps/web/`
```bash
cd apps/web
npm install
npm run dev          # http://localhost:3001
npm run build
npm run lint
```

### API — `apps/api/`
```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Docs interactivos en `http://localhost:8000/docs`.

### Bot (agente WhatsApp) — `apps/bot/`
```bash
cd apps/bot
source ../.venv/bin/activate   # comparte .venv con apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Baileys bridge — `apps/bot/baileys-bridge/`
```bash
cd apps/bot/baileys-bridge
npm install
npm run dev    # escanea QR en terminal, luego escucha mensajes de WhatsApp
```
El bridge envía mensajes al bot vía `POST /internal/process` con el header `X-Internal-Secret`.

---

## Variables de entorno

Todas se leen desde `.env` en la raíz de `platform/`. Las tres apps cargan el mismo archivo.

| Variable | Quién la usa | Dónde obtenerla |
|---|---|---|
| `SUPABASE_URL` | api, bot, web | Supabase > Settings > API |
| `SUPABASE_ANON_KEY` | web (cliente browser) | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | api, bot (bypasa RLS) | Supabase > Settings > API |
| `SUPABASE_JWT_SECRET` | api (valida tokens) | Supabase > Settings > API > JWT Secret — **requerido, el api no arranca sin él** |
| `ANTHROPIC_API_KEY` | api, bot | console.anthropic.com |
| `WHATSAPP_TOKEN` | bot | Meta for Developers |
| `WHATSAPP_VERIFY_TOKEN` | bot | definido por ti, registrado en Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | bot | Meta for Developers |
| `INTERNAL_JOB_SECRET` | api, bot | valor aleatorio; enviado como header `X-Internal-Secret` |
| `FRONTEND_URL` | api (CORS) | URL del dashboard, ej. `http://localhost:3001` |
| `BOT_API_URL` | baileys bridge | URL del bot, ej. `http://localhost:8001` |
| `API_URL` | bot | URL del API, ej. `http://localhost:8000` — el bot consulta `POST /internal/availability` (motor de mesas) ahí; si el API no responde, el bot hace fail-open (acepta la reserva sin mesa asignada) |

---

## Arquitectura

### Flujo principal de un mensaje WhatsApp

```
Cliente WhatsApp
  → Baileys bridge (Node.js, puerto 8001-bridge)
    → POST /internal/process   [header: X-Internal-Secret]
      → apps/bot/main.py
        → agent.handle_message()
          → get_business(phone_number_id)   [cache en memoria, ver nota abajo]
          → get_or_create_conversation()
          → Claude claude-haiku-4-5-20251001
            [tool calls: crear_reserva, cancelar_reserva, ver_disponibilidad, etc.]
          → persiste mensajes en Supabase
        → respuesta al cliente vía Baileys / WhatsApp Cloud API
```

**Cache de negocio:** `agent._business_cache` es un dict en memoria por `phone_number_id`. No expira en runtime; si se actualiza `businesses.bot_config` o `system_prompt` en el dashboard, el bot usa el valor stale hasta reiniciarse.

### Autenticación del dashboard (apps/api)

1. El browser autentica en Supabase Auth y obtiene un JWT.
2. El JWT contiene un custom claim `business_id` inyectado via Supabase hook (Auth > Hooks).
3. `apps/api/core/auth.py:get_business_id()` valida el JWT con `SUPABASE_JWT_SECRET` y extrae `business_id`.
4. Todos los endpoints del API usan `business_id: str = Depends(get_business_id)`.
5. **Excepción:** `POST /webhook/whatsapp` y `GET /health` son los únicos endpoints públicos.

**Nota importante:** el middleware de Next.js (`apps/web/src/middleware.ts`) solo refresca la sesión pero no redirige a `/login`. La protección de rutas es cliente-side en `DashboardLayout`. Un fix server-side en el middleware está pendiente.

### Endpoints internos del bot (`/internal/*`)

Los endpoints `/internal/*` de `apps/bot/main.py` se comunican con el bridge Baileys y con el job nocturno. Se protegen con el header `X-Internal-Secret` verificado contra `INTERNAL_JOB_SECRET`. Usa el mismo secreto en el bridge y en el job nocturno (`apps/api/main.py` → `POST /internal/noshow/run` usa el mismo patrón con `X-Internal-Secret`).

### Sistema de no-show scoring

`apps/api/modules/reservations/scoring.py` calcula un score 0-100 (mayor = más riesgo) considerando:
- Historial de no-shows del cliente
- Días desde la última visita
- Hora y día de la semana de la reserva
- Si confirmó activamente (-25 puntos)

`recommended_action(score)` es la única fuente de verdad de los rangos. Se usa tanto en el job nocturno (`jobs/noshow.py`) como en el endpoint `GET /reservations/{business_id}/risk-report`.

### Motor de disponibilidad de mesas

`apps/api/modules/reservations/availability.py` decide si hay mesa para un grupo:
- `buscar_mesa_ideal()` — mesa libre de menor capacidad suficiente; si no alcanza, combina pares vía `tables.combinable_con`; si está lleno devuelve `proxima_disponibilidad`.
- Una reserva bloquea su mesa `tables.tiempo_promedio_estancia` minutos; las combinaciones bloquean todas sus mesas vía `reservations.mesas_combinadas`.
- Consumidores: dashboard (`GET /tables/availability`, JWT) y bot (`POST /internal/availability`, X-Internal-Secret). El bot hace **fail-open**: si el API no responde, acepta la reserva sin mesa (nunca rechaza clientes por fallas técnicas).

### Layouts temporales del salón

`apps/api/modules/floor_plan/availability.py` + tabla `floor_plan_overrides`: el dashboard puede activar un croquis temporal (eventos) sin tocar el plano base. Expira solo (limpieza en el job horario de `POST /internal/noshow/run`) o se revierte manualmente. El plano base solo se edita entrando desde Configuración (`/dashboard/mesas?editarBase=1`).

### Sistema de prompts del bot

`apps/bot/system_prompt.py` construye el prompt en dos capas:
- **Contexto dinámico:** fecha actual (Mexico City), calendario 60 días con lunes marcados CERRADO.
- **Prompt base:** leído de `businesses.bot_config.system_prompt` en Supabase.

El System Prompt Builder en el dashboard (`/dashboard/chatbot` > Configuración) genera el prompt vía `build_system_prompt()` en `apps/api/routers/chatbot.py`. Las versiones se guardan en `system_prompt_versions` (máximo 5 historial).

---

## Esquema de base de datos

Las migraciones se ejecutan manualmente en **Supabase Studio > SQL Editor** en orden numérico:

| Migración | Contenido |
|---|---|
| `001_initial_schema.sql` | businesses, users, tables, customers, reservations + RLS |
| `002_bot_additions.sql` | conversations, messages, outbox |
| `003_noshow_system.sql` | no_show_score, reminder_sent, confirmation_sent en reservations |
| `004_floor_plan_config.sql` | floor_plan en businesses |
| `005_chatbot_panel.sql` | system_prompt_versions, campos bot_config expandidos |
| `006_campaigns.sql` | campañas de marketing |
| `007_cloud_api_phone_id.sql` | phone_number_id de Cloud API |
| `008_table_availability.sql` | tiempo_promedio_estancia y combinable_con en tables; mesas_combinadas en reservations; índice de traslapes |
| `009_floor_plan_overrides.sql` | floor_plan_overrides (layouts temporales del salón) + RLS |

**Nueva migración:** crear `0XX_<nombre>.sql` con el siguiente número secuencial. Nunca modificar migraciones ya ejecutadas.

El modelo `businesses.bot_config` es un JSONB que contiene `system_prompt`, `google_credentials_json` (Google Sheets), y configuración del bot.

---

## Claude API en este proyecto

- **Bot** usa `claude-haiku-4-5-20251001` — conversaciones WhatsApp en tiempo real, alta frecuencia.
- **parse-menu** (`POST /chatbot/config/parse-menu`) usa `claude-haiku-4-5-20251001` con `max_tokens=2048`.
- Para nuevas funcionalidades que requieran más razonamiento, usar `claude-sonnet-4-6`.
- El `ANTHROPIC_API_KEY` se lee siempre de `os.environ["ANTHROPIC_API_KEY"]`.

---

## Estructura real del monorepo

```
platform/
├── apps/
│   ├── web/                → Next.js 14, puerto 3001
│   │   └── src/
│   │       ├── app/dashboard/  → chatbot, clientes, configuracion, mesas, reservaciones, riesgo
│   │       ├── components/     → Sidebar, Topbar, StatCard, ReservationDrawer, etc.
│   │       └── utils/supabase/ → client.ts, server.ts, middleware.ts
│   ├── api/                → FastAPI, puerto 8000
│   │   ├── core/auth.py    → get_business_id() dependency
│   │   ├── routers/        → reservations, customers, tables, chatbot
│   │   ├── modules/reservations/ → scoring.py, notify.py
│   │   └── jobs/noshow.py  → job nocturno de riesgo
│   └── bot/                → FastAPI, puerto 8001
│       ├── agent.py        → handle_message(), tool calls Claude, cache de negocio
│       ├── system_prompt.py → construcción del prompt con contexto de fecha/calendario
│       ├── sheets_service.py → integración Google Sheets (eventos especiales)
│       └── baileys-bridge/ → Node.js, recibe mensajes de WhatsApp vía Baileys
├── packages/
│   └── database/migrations/ → SQLs numerados, ejecutar en Supabase Studio
└── docs/                   → roadmap, arquitectura, runbooks
```

---

## Convenciones clave

- Tablas y columnas: `snake_case`. TypeScript: `camelCase`.
- Lógica de negocio reutilizable va en `packages/core` (actualmente vacío; extraer cuando haya duplicación real entre api y bot).
- Cada nueva tabla lleva `business_id UUID NOT NULL REFERENCES businesses(id)` y RLS habilitado.
- Los endpoints del API que no tienen `Depends(get_business_id)` son un bug de seguridad, no una excepción.

---

## Convenciones de commits

```
feat: <nueva funcionalidad>
fix: <corrección de bug>
refactor: <sin cambio de comportamiento>
docs: <documentación>
test: <tests>
chore: <mantenimiento>
```
