# Roadmap — Fluvio

> Documento vivo. Actualiza el estado de cada tarea al completarla.
> Estados: `[ ]` pendiente · `[~]` en curso · `[x]` completado
>
> Última actualización: 2026-06-10 (puesta a punto general del proyecto)

---

## Base construida (MVP ~70%) — completado

*Lo que ya existe y funciona en `platform/`:*

- [x] Estructura del monorepo y repositorio git
- [x] CLAUDE.md con reglas de arquitectura multi-tenant
- [x] Esquema de base de datos multi-tenant (Supabase + RLS) — migraciones 001–012 aplicadas
- [x] Bot de WhatsApp funcional (Claude Haiku, tool calls: crear/cancelar reserva, disponibilidad)
- [x] Endpoints FastAPI: reservaciones, clientes, mesas, chatbot, negocio, campañas
- [x] Recordatorios automáticos anti no-show (24h y 2h antes, WhatsApp)
- [x] Scoring de riesgo de no-show (0–100) + job nocturno + reporte de riesgo
- [x] Dashboard completo (Next.js): reservaciones, clientes, mesas, chatbot, riesgo, configuración
- [x] CRM básico: historial de visitas, frecuencia, no-shows por cliente
- [x] Motor de disponibilidad de mesas (combinaciones, estancia promedio, traslapes)
- [x] Layouts temporales del salón (floor_plan_overrides con expiración)
- [x] Panel de chatbot: inbox de conversaciones, modo AI/HUMAN, System Prompt Builder, estadísticas
- [x] PWA manifest + íconos
- [x] Protección server-side de rutas del dashboard (middleware con redirect a /login)
- [x] Tests de caminos críticos: auth JWT, scoring, prompt builder, motor de mesas (56 tests)

---

## Fase 1 — Migración a WhatsApp Cloud API · EN CURSO

*Meta: dejar Baileys y operar 100% sobre la Cloud API oficial de Meta*

- [x] Webhook de Cloud API en el bot (verificación + ruteo por `phone_number_id`)
- [x] Envío por Cloud API con token por negocio (fallback al token global)
- [x] Embedded Signup end-to-end (OAuth de Meta → waba_id + access_token por tenant)
- [x] Protecciones anti-ban: opt-in obligatorio, límites por tier, rate limiting, quality rating
- [x] Migraciones 010 (anti-ban) y 011 (embedded signup) aplicadas
- [ ] Credenciales de Meta en `.env` (`META_APP_ID`, `META_APP_SECRET`, `NEXT_PUBLIC_META_APP_ID`)
- [ ] App de Meta aprobada para Embedded Signup (revisión de Meta)
- [ ] Conectar el número real de Dublé Bistró vía Embedded Signup
- [ ] Apagar el bridge de Baileys cuando Cloud API esté estable

## Fase 2 — PWA para iPad · pendiente

*Meta: el dashboard se usa como app nativa en el iPad del restaurante*

- [x] Manifest + íconos
- [ ] Service worker / offline básico
- [ ] Ajustes de UI para uso táctil (mesas, reservaciones del día)
- [ ] Instrucciones de instalación en iPad para el staff

## Fase 3 — Deploy a producción · pendiente

*Meta: Fluvio corre en infraestructura propia, no en la laptop*

- [ ] Frontend en Vercel
- [ ] API + bot en Railway (o EasyPanel, según costo)
- [ ] Variables de entorno y secretos en cada plataforma
- [ ] Webhook de Meta apuntando al dominio de producción
- [ ] Monitoreo básico (health checks + alertas)

## Fase 4 — Inbox unificado · pendiente

*Meta: WhatsApp + Instagram + Messenger en un solo inbox del dashboard*

- [ ] Webhook de Instagram Direct
- [ ] Webhook de Messenger
- [ ] Inbox multiplataforma (campo `platform` ya existe en conversations)
- [ ] Respuestas del bot por plataforma

## Fase 5 — Módulo de Campañas con IA · base lista, pendiente de UI final

*Meta: el dueño lanza campañas segmentadas generadas por IA*

- [x] Tablas campaigns + campaign_recipients (migración 006)
- [x] Generación de copy con Claude (claude-sonnet-4-6)
- [x] Segmentación: all / vip / inactive / new (solo con opt-in)
- [x] Envío con compliance anti-ban (tier, cuota diaria, rate limit)
- [ ] Programación de envío (scheduled_at → job)
- [ ] Métricas de entrega/lectura en el dashboard
- [ ] Plantillas aprobadas de Meta (HSM) para mensajes fuera de la ventana de 24h

---

## Después (sin fecha)

- [ ] Onboarding self-service de un negocio nuevo
- [ ] Panel de administración interno (gestionar tenants)
- [ ] Sistema de pagos (Stripe o Conekta)
- [ ] Primer cliente externo + caso de estudio
- [ ] Abstracción a salones/spas/clínicas

---

## Registro de fechas

| Hito | Fecha objetivo | Fecha real |
|---|---|---|
| Repositorio creado | 2026-05-29 | 2026-05-29 |
| Esquema de BD en Supabase | 2026-06-05 | 2026-05-30 |
| Bot funcional con BD propia | 2026-06-12 | 2026-06-01 |
| Recordatorios funcionando | 2026-06-19 | 2026-06-02 |
| Dashboard completo | 2026-06-26 | 2026-06-03 |
| Motor de mesas + layouts temporales | — | 2026-06-09 |
| Puesta a punto (BD sync, seguridad, tests) | — | 2026-06-10 |
| Cloud API en producción | 2026-06-30 | |
| Deploy a producción | 2026-07-15 | |
| Primer cliente externo | 2026-08-20 | |
