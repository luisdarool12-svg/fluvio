# Changelog — OptimizaAI

> Registro de todos los cambios relevantes, del más reciente al más antiguo.

---

## [Unreleased]

### Por hacer (Fase 1)
- Migrar bot de Google Calendar a BD propia
- Endpoints CRUD de reservaciones en FastAPI
- Recordatorios automáticos anti no-show
- Dashboard mínimo en Next.js

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
