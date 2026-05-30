# Arquitectura — OptimizaAI

## Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTES                              │
│                                                              │
│  Cliente final         Dueño del restaurante                 │
│  (WhatsApp)            (navegador web)                       │
└────────┬───────────────────────┬────────────────────────────┘
         │                       │
         ▼                       ▼
┌────────────────┐    ┌──────────────────────┐
│ WhatsApp Cloud │    │   apps/web (Next.js)  │
│      API       │    │   Dashboard del dueño │
└────────┬───────┘    └──────────┬────────────┘
         │                       │
         ▼                       │
┌────────────────┐               │
│  apps/bot      │               │
│  (FastAPI)     │               │
│  Webhook +     │               │
│  agente IA     │               │
└────────┬───────┘               │
         │                       │
         └──────────┬────────────┘
                    ▼
         ┌──────────────────────┐
         │   apps/api (FastAPI) │
         │   API REST principal │
         │   Lógica de negocio  │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Supabase           │
         │   PostgreSQL + Auth  │
         │   + RLS              │
         └──────────────────────┘
```

## Componentes

### apps/web (Next.js)
Dashboard del dueño del restaurante. Permite ver/editar reservas, ver métricas, gestionar mesas y horarios. Autenticación vía Supabase Auth.

### apps/api (FastAPI)
API REST que centraliza toda la lógica de negocio. Valida el JWT de Supabase, extrae el `business_id`, y aplica filtros de tenant en cada operación. No expone datos cross-tenant bajo ninguna circunstancia.

### apps/bot (FastAPI)
Webhook receptor de mensajes de WhatsApp Cloud API. Procesa el mensaje del cliente, llama a Claude para interpretar la intención, y ejecuta acciones via `apps/api`. Devuelve respuestas al cliente vía WhatsApp.

### packages/database
Migraciones SQL de Supabase, cliente Supabase preconfigurado, y helpers de conexión.

### packages/types
Interfaces TypeScript compartidas entre `apps/web` y cualquier cliente que consuma la API. Alineadas 1:1 con el esquema SQL.

### packages/core
Reglas de negocio puras (sin framework): validación de disponibilidad, cálculo de recordatorios, lógica de estados de reserva.

## Decisiones de arquitectura

Ver `docs/adr/` para el detalle de cada decisión clave.

| Decisión | Elegido | Alternativa descartada |
|---|---|---|
| Multi-tenant | Una BD, `business_id` en filas | Una BD por tenant |
| Auth | Supabase Auth (JWT) | Auth0, Firebase Auth |
| Bot | FastAPI + WhatsApp Cloud API | Twilio, WATI |
| IA | Claude API (Anthropic) | OpenAI GPT-4 |

## Seguridad

- Row Level Security (RLS) en Supabase: aislamiento físico de datos por tenant.
- JWT verificado en cada request a `apps/api`.
- `business_id` extraído del JWT, nunca del body del request (no spoofeable).
- Variables sensibles solo en `.env`, nunca en código.
- Webhook de WhatsApp verificado con `WHATSAPP_VERIFY_TOKEN`.
