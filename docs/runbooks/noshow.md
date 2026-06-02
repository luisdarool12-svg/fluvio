# Runbook — Sistema de riesgo de no-show

Motor de scoring (0-100) + job nocturno que prioriza reservas por riesgo de no-show y
ejecuta acciones graduadas (recordatorio → confirmación → alerta al dueño).

## Componentes

| Pieza | Ubicación |
|---|---|
| Migración | `packages/database/migrations/003_noshow_system.sql` |
| Scoring | `apps/api/modules/reservations/scoring.py` |
| Acciones / encolado | `apps/api/modules/reservations/notify.py` |
| Job nocturno | `apps/api/jobs/noshow.py` |
| Endpoints | `apps/api/routers/reservations.py` |
| Trigger del job | `POST /internal/noshow/run` (en `apps/api/main.py`) |

## Puesta en marcha

1. **Migración**: ejecutar `003_noshow_system.sql` en Supabase Studio > SQL Editor.

2. **Variables de entorno** (`.env`):
   - `INTERNAL_JOB_SECRET` — secreto que protege `POST /internal/noshow/run`.
     Sin él configurado, el endpoint responde 401 a todo.

3. **Teléfono del dueño** (opcional, para alertas por WhatsApp en score 61-100):
   guardarlo en `businesses.bot_config.owner_phone`. El esquema `users` no tiene
   teléfono. Si no se configura, la alerta queda solo en la tabla `notifications`
   (visible en el dashboard).
   ```sql
   UPDATE businesses
     SET bot_config = jsonb_set(coalesce(bot_config, '{}'), '{owner_phone}', '"5214771234567"')
     WHERE id = '<business_id>';
   ```

4. **Cron externo (horario)**: invocar el endpoint cada hora. El job respeta el
   timezone de cada negocio (`zona_horaria`) y solo actúa sobre los que están a las
   ~22:00 locales, así que un único cron horario sirve para todos los tenants.
   ```bash
   curl -X POST https://<api-host>/internal/noshow/run \
     -H "X-Internal-Secret: $INTERNAL_JOB_SECRET"
   ```
   Opciones: cron del SO, Supabase `pg_cron` + extensión `http`, o Trigger.dev.

## Rangos de acción

| Score | Acción |
|---|---|
| 0-30 | Recordatorio estándar por WhatsApp |
| 31-60 | Recordatorio + solicitud de confirmación (responder SÍ) |
| 61-80 | Confirmación requerida + notificación al dueño |
| 81-100 | Alerta inmediata al dueño + sugerir lista de espera |

Las confirmaciones del cliente (SÍ/NO) las procesa el interceptor ya existente en
`apps/bot/agent.py`.

## Pesos del scoring

Definidos en `calculate_no_show_score` (`scoring.py`). Aditivos, con clamp final 0-100:

| Señal | Peso |
|---|---|
| Cliente nuevo (sin visitas) | +25 |
| Cliente con no-show previo | +30 |
| Reserva hecha hace >14 días | +20 |
| Reserva hecha hace >7 días (y ≤14) | +10 |
| Grupo de 1-2 personas | +15 |
| Confirmación enviada sin respuesta | +20 |
| Cliente frecuente (≥5 visitas, 0 no-shows) | -30 |
| Confirmó activamente | -25 |
| Reserva hecha hoy o ayer | -15 |

`customers.no_show_history` se mantiene solo: un trigger lo incrementa cuando una
reserva pasa a estado `no_show`.

## Endpoints

- `GET /reservations/{business_id}/risk-report` — reservas de mañana ordenadas por
  score DESC con acción recomendada. Valida que `business_id` coincida con el JWT (403).
- `POST /reservations/{reservation_id}/confirm` — marca `confirmation_status=confirmed`,
  `estado=confirmada` y recalcula el score.

## Idempotencia

El job no reprocesa una reserva si ya existe una fila en `noshow_actions_log` para ella
en el día local actual. Reintentar el cron en la misma noche es seguro.
