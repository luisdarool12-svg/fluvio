# Runbook: Despliegue a Producción

> Proceso para publicar cambios de manera segura.

---

## Reglas antes de desplegar

- `main` siempre debe estar funcional.
- Nunca desplegar directo a `main` — siempre desde `dev` o `feature/*`.
- Si hay migración de BD: ejecutarla ANTES del deploy del código.

---

## Flujo de Git

```bash
# 1. Crear rama de la funcionalidad
git checkout -b feature/nombre-de-la-funcion

# 2. Desarrollar y commitear
git add <archivos específicos>
git commit -m "feat: descripción del cambio"

# 3. Merge a dev
git checkout dev
git merge feature/nombre-de-la-funcion

# 4. Probar en dev/staging

# 5. Merge a main
git checkout main
git merge dev
git push origin main
```

---

## Despliegue del backend (apps/api y apps/bot)

*Plataforma objetivo: Railway, Render, o VPS propio.*

```bash
# Railway (si está configurado con auto-deploy desde main):
git push origin main
# → Railway detecta el push y redespliega automáticamente

# Manual en VPS:
ssh usuario@servidor
cd /opt/optimiza-ai
git pull origin main
cd apps/api
pip install -r requirements.txt
sudo systemctl restart optimiza-api
```

---

## Despliegue del frontend (apps/web)

*Plataforma objetivo: Vercel.*

```bash
# Vercel con auto-deploy desde main:
git push origin main
# → Vercel redespliega automáticamente

# Verificar en: https://tu-dominio.vercel.app
```

---

## Migraciones de base de datos

```bash
# Antes de desplegar código que requiere cambios en el esquema:
# 1. Crear el archivo de migración en packages/database/migrations/
# 2. Ejecutarlo en Supabase Studio > SQL Editor
# 3. Verificar que no rompió datos existentes
# 4. Luego desplegar el código
```

---

## Verificación post-deploy

- [ ] Health check de la API: `GET /health` responde 200
- [ ] El dashboard carga sin errores
- [ ] Crear una reserva de prueba vía WhatsApp
- [ ] Reserva aparece en el dashboard
- [ ] Monitorear logs los primeros 10 minutos
