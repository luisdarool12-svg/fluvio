# Esquema de Datos — OptimizaAI

> La fuente de verdad es `packages/database/migrations/001_initial_schema.sql`.
> Este documento es el diccionario legible para humanos.

---

## businesses (negocios / tenants)

La tabla central. Cada fila = un restaurante cliente.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | Identificador único del negocio |
| nombre | TEXT | Nombre del restaurante |
| tipo | ENUM | `restaurante` \| `salon` \| `clinica` \| `otro` |
| telefono_whatsapp | TEXT | Número con código de país (ej. +524771234567) |
| zona_horaria | TEXT | Ej. `America/Mexico_City` |
| idioma_default | TEXT | `es` \| `en` |
| plan | ENUM | `starter` \| `pro` \| `premium` |
| activo | BOOLEAN | Si el tenant está activo |
| created_at | TIMESTAMPTZ | Fecha de alta |

---

## users (dueños y staff con acceso al panel)

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | Coincide con `auth.users.id` de Supabase |
| business_id | UUID FK → businesses | Tenant al que pertenece |
| nombre | TEXT | Nombre del usuario |
| email | TEXT | Email (único global) |
| rol | ENUM | `owner` \| `manager` \| `staff` |
| activo | BOOLEAN | |
| created_at | TIMESTAMPTZ | |

---

## tables (mesas / recursos reservables)

Una "mesa" en restaurante = "consultorio" en clínica = "silla" en salón.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| business_id | UUID FK → businesses | Tenant |
| nombre | TEXT | Ej. "Mesa 5", "Terraza VIP" |
| capacidad | INT | Máximo de personas |
| zona | TEXT | `interior` \| `terraza` \| `privado` |
| activo | BOOLEAN | Si acepta reservas |
| created_at | TIMESTAMPTZ | |

---

## reservations (reservaciones)

El corazón del sistema.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| business_id | UUID FK → businesses | Tenant |
| customer_id | UUID FK → customers | Cliente que reservó |
| table_id | UUID FK → tables | Mesa asignada (nullable) |
| fecha_hora | TIMESTAMPTZ | Fecha y hora de la reserva |
| personas | INT | Número de comensales |
| estado | ENUM | `pendiente` \| `confirmada` \| `sentada` \| `no_show` \| `cancelada` |
| notas | TEXT | Notas especiales (cumpleaños, alergias, etc.) |
| canal | TEXT | `whatsapp` \| `web` \| `telefono` \| `manual` |
| recordatorio_24h | BOOLEAN | Si ya se envió recordatorio de 24h |
| recordatorio_2h | BOOLEAN | Si ya se envió recordatorio de 2h |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

## customers (clientes del restaurante — CRM)

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| business_id | UUID FK → businesses | Tenant |
| nombre | TEXT | |
| telefono | TEXT | Con código de país |
| idioma | TEXT | `es` \| `en` |
| visitas | INT | Contador de reservas completadas |
| ultima_visita | TIMESTAMPTZ | Fecha de la última reserva completada |
| notas | TEXT | Notas del staff (cliente VIP, preferencias) |
| created_at | TIMESTAMPTZ | |

---

## events (eventos especiales)

Para noches temáticas, masterclasses, cenas especiales.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| business_id | UUID FK → businesses | Tenant |
| titulo | TEXT | Nombre del evento |
| descripcion | TEXT | Descripción para el bot |
| fecha_inicio | TIMESTAMPTZ | |
| fecha_fin | TIMESTAMPTZ | |
| activo | BOOLEAN | Si el bot lo menciona |
| created_at | TIMESTAMPTZ | |

---

## Reglas invariantes

1. **Toda tabla tiene `business_id`** — sin excepción.
2. **RLS activo en todas las tablas** — Supabase rechaza queries cross-tenant.
3. **`business_id` viene del JWT** — nunca del body del request.
4. **`customers.telefono` es único por `business_id`** — un número = un cliente por restaurante.
