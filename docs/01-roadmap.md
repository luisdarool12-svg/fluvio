# Roadmap — OptimizaAI

> Documento vivo. Actualiza el estado de cada tarea al completarla.
> Estados: `[ ]` pendiente · `[~]` en curso · `[x]` completado

---

## Fase 1 — MVP funcional (Duble Bistró) · Semanas 1–4
*Meta: el sistema reemplaza Google Calendar + reduce no-shows en Duble*

- [x] Estructura del monorepo y repositorio git
- [x] CLAUDE.md con reglas de arquitectura
- [x] Esquema de base de datos multi-tenant (Supabase + RLS)
- [ ] Migrar bot actual de Google Calendar → base de datos propia
- [ ] Endpoints FastAPI: crear/listar/cancelar reservas
- [ ] Recordatorios automáticos anti no-show (24h y 2h antes, WhatsApp)
- [ ] Dashboard mínimo (Next.js): ver y editar reservas del día
- [ ] Deploy inicial (Vercel + Railway o similar)

---

## Fase 2 — Producto vendible · Semanas 5–8
*Meta: el sistema soporta múltiples restaurantes y tiene onboarding*

- [ ] Soporte multi-restaurante real (segundo negocio se registra solo)
- [ ] Onboarding: alta de un negocio sin configuración manual
- [ ] CRM básico: historial de visitas, frecuencia, notas del cliente
- [ ] Reportes: tasa de no-shows, ocupación, horas pico
- [ ] Panel de administración interno (gestionar tenants)

---

## Fase 3 — Primer cliente externo · Semanas 9–12
*Meta: 1 restaurante externo pagando, con caso de estudio documentado*

- [ ] Conseguir 1 restaurante piloto externo (conocido, con descuento 50%)
- [ ] Proceso de onboarding probado con cliente real
- [ ] Medir y documentar reducción de no-shows → caso de estudio
- [ ] Pricing validado con mercado real

---

## Fase 4 — Escalar · Post semana 12
*Meta: 5–10 restaurantes en León, expansión a otros nichos*

- [ ] Sistema de pagos (Stripe o Conekta)
- [ ] 5–10 restaurantes en León
- [ ] Módulo de IA de optimización (demanda, mesas, pricing dinámico)
- [ ] Abstracción a salones/spas (configuración, sin código nuevo)
- [ ] Abstracción a clínicas/consultorios

---

## Registro de fechas

| Hito | Fecha objetivo | Fecha real |
|---|---|---|
| Repositorio creado | 2026-05-29 | 2026-05-29 |
| Esquema de BD en Supabase | 2026-06-05 | |
| Bot migrado a BD propia | 2026-06-12 | |
| Recordatorios funcionando | 2026-06-19 | |
| Dashboard mínimo | 2026-06-26 | |
| Primer cliente externo | 2026-08-20 | |
