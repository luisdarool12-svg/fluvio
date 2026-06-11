# Changelog — Fluvio

> Registro de todos los cambios relevantes, del más reciente al más antiguo.

---

## [Unreleased]

### Por hacer (Fase 1 — Cloud API)
- Credenciales de Meta en `.env` y app aprobada para Embedded Signup
- Conectar el número real de Dublé Bistró vía Embedded Signup
- Apagar el bridge de Baileys cuando Cloud API esté estable

---

## 2026-06-10 — Puesta a punto general

### Base de datos
- Migraciones 006–011 aplicadas en Supabase (estaban en el repo pero no ejecutadas):
  campañas, phone_number_id de Cloud API, motor de mesas, layouts temporales,
  anti-ban y Embedded Signup.
- Migración 012 (`012_security_hardening.sql`): `search_path` fijo en las 4
  funciones de Postgres señaladas por el linter de Supabase.

### Agregado
- WhatsApp Embedded Signup end-to-end: router `/whatsapp/setup` (OAuth de Meta,
  long-lived token, suscripción de la WABA), componente `EmbeddedSignup` en
  Configuración, credenciales por negocio en `businesses`.
- Protecciones anti-ban en campañas: opt-in obligatorio, límite diario por tier,
  bloqueo con quality rating rojo, rate limiting de 1.2s entre mensajes.
- Tests de caminos críticos del API: auth JWT (ES256 real), scoring de no-show,
  `build_system_prompt` — 56 tests, cobertura 39% (auth 97%, scoring 90%).
- Tests del TTL del cache del bot (5 tests).

### Corregido
- Middleware de Next.js ahora protege `/dashboard` server-side: sin sesión
  redirige a `/login` (patrón oficial @supabase/ssr con `getClaims()`).
- Cache de negocio del bot con TTL de 5 minutos: cambios al system prompt desde
  el dashboard llegan al bot sin reiniciarlo; sirve stale si Supabase falla.
- Auth del API: 401 claro cuando falta el header + logging de cada rechazo.
- Errores visibles en el panel de chatbot (inbox y System Prompt Builder).

### Seguridad
- Advisors de Supabase en cero salvo *leaked password protection*, que se activa
  manualmente en el dashboard (Authentication → Sign In / Providers → Email).

---

## 2026-05-29 — Inicio del proyecto

### Agregado
- Estructura del monorepo `optimiza-ai/`
- `CLAUDE.md` con reglas de arquitectura multi-tenant
- `README.md` con instrucciones de setup
- `.env.example` con todas las variables necesarias
- `.gitignore` para Node, Python y macOS
- Documentación inicial: visión, roadmap, arquitectura, esquema de datos
- ADR-0001: decisión de arquitectura multi-tenant
- Runbooks: alta de cliente nuevo, despliegue
- Esquema de base de datos con 6 tablas y RLS (`001_initial_schema.sql`)
- Skeleton de `apps/api/` (FastAPI)
- Skeleton de `apps/web/` (Next.js)
- Skeleton de `apps/bot/` (WhatsApp)
- Tipos TypeScript compartidos en `packages/types/`
- Lógica core compartida en `packages/core/`
