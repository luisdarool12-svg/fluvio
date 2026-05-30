# OptimizaAI — SaaS de Reservaciones + IA para Restaurantes

## Objetivo
Plataforma multi-tenant de reservaciones con agente de IA vía WhatsApp para restaurantes.
Piloto: Duble Bistró Moderne (León, Gto.). Escalable a cualquier negocio con flujo de clientes.

---

## REGLAS DE ARQUITECTURA — NO ROMPER JAMÁS

### Multi-tenant obligatorio
- **UN solo código base.** Los negocios son RENGLONES en la tabla `businesses`, NO carpetas.
- NUNCA crear una carpeta, repositorio o copia de código por cliente.
- Dar de alta un cliente nuevo = un `INSERT` en `businesses`. Nada más.
- Toda consulta a la BD filtra por `business_id`. Sin excepción.
- Usar Row Level Security (RLS) de Supabase para aislar datos entre tenants a nivel de BD.

### Regla del business_id
Cada tabla lleva `business_id UUID NOT NULL REFERENCES businesses(id)`.
Cada query lleva `WHERE business_id = :business_id` o equivalente en ORM.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend (dashboard dueño) | Next.js 14+ · TypeScript · Tailwind CSS |
| Backend (API REST) | FastAPI · Python 3.11+ |
| Bot WhatsApp | WhatsApp Cloud API · Python |
| Base de datos | PostgreSQL vía Supabase |
| Auth | Supabase Auth (JWT) |
| IA | Claude API (Anthropic) |
| Automatizaciones | n8n / Make |

---

## Estructura del monorepo

```
optimiza-ai/
├── apps/
│   ├── web/        → Next.js: panel del dueño del restaurante
│   ├── api/        → FastAPI: lógica de negocio, endpoints REST
│   └── bot/        → Agente WhatsApp: recibe mensajes, gestiona reservas
├── packages/
│   ├── database/   → Migraciones SQL y cliente Supabase
│   ├── types/      → Tipos TypeScript compartidos entre web y api
│   └── core/       → Reglas de negocio reutilizables
├── docs/           → Centro de control: roadmap, arquitectura, runbooks
└── automations/    → Flujos exportados de n8n / Make
```

---

## Convenciones de commits

```
feat: <nueva funcionalidad>
fix: <corrección de bug>
docs: <cambio en documentación>
refactor: <refactorización sin cambio de comportamiento>
test: <tests>
chore: <tareas de mantenimiento>
```

Ejemplos:
- `feat: recordatorios anti no-show vía WhatsApp`
- `fix: zona horaria en confirmación de reservas`
- `docs: runbook alta de cliente nuevo`

---

## Convenciones de código

- Lógica compartida va en `packages/core`, NUNCA duplicada entre apps.
- Variables de entorno: siempre desde `.env`, nunca hardcodeadas.
- Nombres de tablas y columnas: snake_case en BD, camelCase en TypeScript.
- No crear endpoints sin autenticación (excepto webhook de WhatsApp y health check).

---

## Flujo de datos principal

```
Cliente WhatsApp → WhatsApp Cloud API → apps/bot → apps/api → Supabase
                                                           ↕
                                        apps/web ← ─ ─ ─ ┘
```

---

## Variables de entorno requeridas

Ver `.env.example` en la raíz. Las críticas son:
- `SUPABASE_URL` y `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_TOKEN` y `WHATSAPP_VERIFY_TOKEN`
- `ANTHROPIC_API_KEY`
