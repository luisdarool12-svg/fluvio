# ADR-0001: Arquitectura Multi-Tenant (un código, muchos clientes)

**Estado:** Aceptado  
**Fecha:** 2026-05-29  
**Decidido por:** Luis Daroo

---

## Contexto

El producto atiende a múltiples restaurantes. Hay dos enfoques posibles para aislar los datos de cada cliente:

1. **Una instancia por cliente** — copia del código + BD separada por restaurante.
2. **Multi-tenant** — un solo código, los clientes son filas en una BD compartida filtrada por `business_id`.

## Decisión

**Multi-tenant con una sola BD y RLS.** Cada negocio es un renglón en la tabla `businesses`. Toda tabla lleva `business_id`. Supabase RLS aísla los datos a nivel de motor de BD.

## Consecuencias positivas

- Un bug arreglado = arreglado para todos los clientes.
- Una mejora desplegada = disponible para todos.
- Dar de alta cliente nuevo = un `INSERT`. Sin configuración de infraestructura.
- Costo de infraestructura no crece linealmente con el número de clientes.

## Consecuencias negativas / riesgos

- **Riesgo de fuga de datos cross-tenant:** mitigado por RLS en Supabase + validación de `business_id` desde JWT en la API.
- **Una migración de BD afecta a todos:** mitigado con migraciones versionadas y entorno de staging antes de producción.
- **Cliente "ruidoso" puede afectar rendimiento:** mitigado con índices en `business_id` y límites de rate en la API.

## Alternativas descartadas

**Una BD por cliente:** Operativamente inmanejable después de 5 clientes. Cada deploy, migración y bug fix se multiplica por N. Descartado definitivamente.

## Implementación

- Tabla `businesses` como raíz de la jerarquía.
- Columna `business_id UUID NOT NULL` en toda tabla secundaria.
- RLS en Supabase: `USING (business_id = auth.jwt() ->> 'business_id')`.
- En `apps/api`: middleware extrae `business_id` del JWT verificado y lo inyecta en cada query.
