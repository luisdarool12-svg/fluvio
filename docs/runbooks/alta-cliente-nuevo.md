# Runbook: Alta de Cliente Nuevo

> Proceso para onboardear un restaurante nuevo en OptimizaAI.
> Objetivo: cliente operativo en menos de 30 minutos.

---

## Requisitos previos

- Número de WhatsApp Business del restaurante
- Nombre del dueño y email de acceso
- Zona horaria del negocio
- Plan contratado (starter/pro/premium)

---

## Pasos

### 1. Crear el negocio en la BD

```sql
INSERT INTO businesses (nombre, tipo, telefono_whatsapp, zona_horaria, idioma_default, plan, activo)
VALUES (
  'Nombre del Restaurante',
  'restaurante',
  '+52477XXXXXXX',
  'America/Mexico_City',
  'es',
  'pro',
  true
);
```

Guarda el `id` generado — es el `business_id` de este tenant.

### 2. Crear el usuario del dueño

Crear usuario en Supabase Auth (desde el panel o con la API de admin):

```bash
# Desde Supabase Dashboard > Authentication > Users > Invite user
# Email: email_del_dueno@ejemplo.com
```

Luego insertar en la tabla `users`:

```sql
INSERT INTO users (id, business_id, nombre, email, rol, activo)
VALUES (
  'UUID_DEL_AUTH_USER',   -- viene de Supabase Auth
  'BUSINESS_ID',
  'Nombre del Dueño',
  'email_del_dueno@ejemplo.com',
  'owner',
  true
);
```

### 3. Configurar las mesas

```sql
INSERT INTO tables (business_id, nombre, capacidad, zona, activo)
VALUES
  ('BUSINESS_ID', 'Mesa 1', 4, 'interior', true),
  ('BUSINESS_ID', 'Mesa 2', 4, 'interior', true),
  ('BUSINESS_ID', 'Terraza 1', 6, 'terraza', true);
  -- agregar según layout del restaurante
```

### 4. Conectar WhatsApp

1. En Meta Business Manager, asignar el número del restaurante al WhatsApp Business Account.
2. Configurar el webhook de OptimizaAI como destino del número.
3. Actualizar `.env` (o config en producción) con el `PHONE_NUMBER_ID` del restaurante.

### 5. Verificar que funciona

- Enviar un WhatsApp de prueba al número → el bot debe responder.
- Crear una reserva de prueba vía el bot.
- Verificar que aparece en el dashboard del dueño.

### 6. Briefing al dueño (10 min)

- Mostrar el dashboard: cómo ver y editar reservas.
- Mostrar cómo el bot maneja las reservas de sus clientes.
- Dejar grabado el runbook de uso básico.

---

## Verificación final

- [ ] Negocio aparece en `businesses` con `activo = true`
- [ ] Usuario del dueño puede iniciar sesión en el dashboard
- [ ] Mesas configuradas correctamente
- [ ] Bot responde en WhatsApp
- [ ] Reserva de prueba creada y visible en dashboard
