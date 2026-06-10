# Fluvio — App UI kit

Interactive, high-fidelity recreation of the Fluvio web app (the restaurant owner's
dashboard). Open `index.html` to boot the full product as a click-through.

## What's here
- `index.html` — entry; loads React + Babel, the brand `styles.css`, and the scripts below.
- `lib.jsx` — Lucide-style `Icon` set (`ICONS` + `<Icon>`), mock data (clients, reservations,
  tables, AI feed), and helpers (`clientById`, `initials`, status/channel maps).
- `components.jsx` — kit-local pieces: `Logo`, `Wordmark`, `Avatar`, `StatusBadge`, `StatCard`,
  `ReservationRow`, `QuickActions`, `ChannelTag`, `VipTag`, `SectionHead`, `EmptyState`,
  `ReservationDrawer`, etc.
- `app-shell.jsx` — `Sidebar` (plum rail, nav, plan card, user row) + `Topbar` (search, CTA).
- `screens-dashboard.jsx` — KPI row, today's reservations, live WhatsApp/AI feed, upcoming.
- `screens-reservaciones.jsx` — filterable reservations table + drawer.
- `screens-misc.jsx` — Clientes (CRM), Mesas (floor), Configuración (settings).
- `screens-landing.jsx`, `screens-login.jsx` — marketing + auth (carried from source; not the
  focus of this system).
- `app.jsx` — routing, reservation status workflow, the live feed interval, and toasts.

## Interactions
- Switch sections from the sidebar. The dashboard runs a **live WhatsApp feed** that adds an
  event every few seconds.
- In Reservaciones / Dashboard, hover a row for quick actions: **Confirmar · Sentar · No-show ·
  Cancelar** — each updates the status badge and fires a toast.
- "Nueva reservación" (topbar/CTA) and clicking any row open the **reservation drawer**.

## Notes
- This is a cosmetic recreation: data is mock, the WhatsApp bot is simulated. It composes the
  brand styling from the root design system (`../../styles.css`).
- The richer source (marketing site, reputation, marketing modules, auth) lives in
  `luisdarool12-svg/fluvio → design_handoff_fluvio/`. Extend from there for more surfaces.
