# Fluvio

SaaS de reservaciones + agente IA para restaurantes. Arquitectura multi-tenant.

## Requisitos previos

- Node.js 20+
- Python 3.11+
- Cuenta en [Supabase](https://supabase.com) (gratis para empezar)
- Cuenta Meta Business con WhatsApp Cloud API habilitado
- API Key de [Anthropic](https://console.anthropic.com)

## Configuración inicial

1. Clona el repositorio y copia las variables de entorno:
   ```bash
   cp .env.example .env
   ```

2. Completa `.env` con tus credenciales de Supabase, WhatsApp y Anthropic.

3. Crea el proyecto en Supabase y ejecuta las migraciones:
   ```bash
   # En Supabase Studio > SQL Editor, pega y ejecuta:
   # packages/database/migrations/001_initial_schema.sql
   ```

## Correr en desarrollo

### Backend (FastAPI)
```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev
# Abre http://localhost:3000
```

### Bot (WhatsApp)
```bash
cd apps/bot
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
# Requiere ngrok o tunnel para recibir webhooks de WhatsApp en local
```

## Estructura del proyecto

Ver `CLAUDE.md` para la descripción completa de la arquitectura.

## Documentación

- `docs/00-vision.md` — Visión y propuesta de valor
- `docs/01-roadmap.md` — Plan de desarrollo (documento vivo)
- `docs/02-arquitectura.md` — Arquitectura detallada
- `docs/03-esquema-datos.md` — Diccionario de la base de datos
