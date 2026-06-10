# Fluvio — Design System

> **"Todo fluye."** — Business management SaaS for restaurants. First market: Mexico.
> Remote management of reservations, clients, reputation and AI-powered marketing,
> with **WhatsApp as the primary channel**. Pilot restaurant: *Duble Bistró*.

Fluvio should feel **modern and accessible — sophisticated but not intimidating**. The
restaurant owner should feel it's *their* tool, not a tech company's product. Reference
aesthetic: Notion, Linear, Loom. Clean, humanist, spacious. Never corporate, never cold.

**Brand voice:** Fluid · Reliable · Clear · Yours.

---

## Product context

Fluvio is a multi-tenant SaaS. A restaurant connects its WhatsApp line; an AI agent
takes reservations, confirms them, answers questions, sends reminders, and predicts
no-shows — 24/7, in Mexican Spanish. The owner manages everything from a calm web
dashboard. Surfaces represented in this system:

- **App (web dashboard)** — the core product. Sidebar + topbar shell, KPI dashboard,
  reservations table with status workflow, clients CRM, table/floor management, settings,
  and a **live WhatsApp/AI activity feed**. This is the single UI kit in `ui_kits/fluvio-app/`.

> The marketing site and login flow exist in the source repo but are **not** rebuilt here —
> the app is the heart of the product and where the design system earns its keep.

## Sources (for whoever maintains this)

This system was distilled from the product's own repository. You may not have access; URLs
are recorded so you can explore further and build higher-fidelity work.

- **GitHub:** `luisdarool12-svg/fluvio` — Fluvio monorepo (private).
  - `design_handoff_fluvio/` — the original Spanish design handoff (screens, mock data,
    icon set, copy) that the app UI kit is reskinned from.
  - `CLAUDE.md` — product/architecture notes.
- **Brand brief** — the violet/coral rebrand (color, type, logo, component spec) provided
  by the user. This is the visual source of truth and supersedes the repo's older
  olive-green palette.
- **`uploads/ChatGPT Image 8 jun 2026…png`** — the logo reference (three flowing waves).

> The repo's original screens used a different (olive) palette. The brand brief is the
> authority: everything here is the **Fluvio Violet** system below. Explore the repo to
> recover additional screens (marketing site, login, reputation, marketing modules) if you
> need to extend the kit.

---

## CONTENT FUNDAMENTALS

**Language:** Mexican Spanish, always. UI copy, data, and microcopy are in Spanish; this
design-system documentation is in English for the maintainer.

**Tone:** warm, plainspoken, confident. Talks *to* the owner like a competent colleague,
not a manual. Calm, never breathless.

- **Person:** addresses the user directly and informally — *"Tienes 10 reservas para hoy"*,
  *"Buenas tardes, Luis"*. Tú, not usted. First name in greetings.
- **Casing:** **Sentence case** everywhere — buttons, headings, menus (*"Nueva reservación"*,
  not "Nueva Reservación"). The only uppercase is the small tracked **labels/eyebrows**
  (`RESERVAS HOY`) and the **FLUVIO** wordmark.
- **Numbers carry the message.** Copy is spare; the big Syne metric does the talking.
  *"10 reservas · 3 pendientes"*. Prefer concrete counts over adjectives.
- **Verbs for actions:** *Confirmar, Sentar, Cancelar, Mejorar plan, Ver toda la actividad.*
  Short, imperative, specific.
- **Spanish status vocabulary** (never translate in UI): Confirmada · Pendiente · Sentada ·
  No-show · Cancelada · Riesgo alto · Crítico.
- **Emoji:** essentially none. A single 👋 in the dashboard greeting is the lone, deliberate
  exception — warmth, used once. Don't sprinkle emoji into UI.
- **AI framing:** the assistant is *"el bot de WhatsApp"* / *"el agente"* — friendly,
  never anthropomorphized beyond that. Activity reads as events: *"Sofía Mendoza reservó
  mesa para 2 a las 13:00."*

**Voice in four words, made concrete:**
- *Fluid* — copy flows, no jargon walls. *Reliable* — states are explicit and honest
  (a no-show is a no-show). *Clear* — one idea per line, numbers up front. *Yours* — it's
  the owner's restaurant, the owner's data, the owner's tool.

---

## VISUAL FOUNDATIONS

### Color — the five-color system (and nothing else)
- **Violet `#6447F5` (Fluvio Violet, primary)** — active nav, links, focus rings, brand
  accents, avatar fills, progress. *Never* used for body text on white.
- **Coral `#FF6A38` (Corriente, accent)** — the **single action color**. Primary CTAs
  ("Nueva reservación", "Mejorar plan"), alerts, the third logo wave. Used **sparingly**
  for maximum impact — usually one coral element per view.
- **Deep Plum `#180F2E` (Fondo)** — sidebar background, primary text, dark cards. A warm
  purple-black; **never pure `#000`**.
- **Margen `#FAF9F5` (warm off-white)** — the main content background. Warmer than white;
  hospitality feel. The app canvas is **never pure white** — white is reserved for cards.
- **Niebla `#9487B0` (mist)** — labels, captions, placeholders, disabled. Never primary text.
- **Supporting:** White `#FFFFFF` (cards), Line `#EAE6F2` (all borders), Violet-light
  `#EDE9FE` (badges/avatars), Coral-light `#FFEDD5` (warning badges).
- **Status & risk** have their own fixed palettes (see the Colors cards in the DS tab).
- **Forbidden:** pure blue primaries, gradients in UI (the logo mark is the only gradient,
  and it's faked via three solid waves), pure black, pure-white app backgrounds, any color
  outside this system.

### Typography
- **Display — Syne (700 / 800).** Page titles, section heads, KPI numbers, the wordmark.
  Tracking tightens as size grows (`-0.01em` on large titles/metrics, slightly positive
  on small heads). Geometric, confident, a little characterful — the brand's "voice."
- **Body/UI — Outfit (300 / 400 / 500).** Body, labels, nav, table data — all UI copy.
  Humanist, spacious, calm.
- **Scale:** H1 22–28 · H2 18 · metric 28–36 · body 14–15 · nav 13/500 · label 10–12 ·
  badge 10.5. Minimum readable body is 13px. Numbers are tabular where they align.
- **Substitution note:** both families load from **Google Fonts** (no local files shipped).
  If you need offline binaries, pull Syne + Outfit and add `@font-face` rules.

### Surfaces, borders & elevation
- **Elevation = border, not shadow.** Cards are white, `1px solid #EAE6F2`, radius **12px**
  (14px for prominent). **No drop shadows on cards.** Shadows exist *only* for floating
  overlays: `--shadow-pop` (menus/popovers) and `--shadow-overlay` (drawers/dialogs).
- **Corner radii:** badges 6 · controls/nav 9 · buttons 10 · cards 12–14 · hero 20 · pills 999.
- **Backgrounds:** flat warm color. No imagery, no texture, no gradients, no patterns in
  the app chrome. The plum sidebar and warm-white canvas do all the spatial work.

### Layout & density
- **Notion-spacious.** Generous whitespace, never dense. Sidebar is a fixed **224px** plum
  rail (no hamburger / no collapse at desktop). Topbar **64px**, white, bottom border.
  Content max-width ~1380px. KPIs in a 2×2 (desktop) / 1×4 (narrow) grid.
- Two-column dashboard: work on the left, the live WhatsApp feed + upcoming on the right.

### Motion
- **Calm and quick.** Easing `cubic-bezier(.32,.72,0,1)` (gentle, decisive). Durations
  140ms (micro) / 220ms / 340ms (page reveal). Page/feed entrances are **transform-only**
  (slide a few px) — never fade content from `opacity:0`, so print/PDF/throttled captures
  always show content. The only loops are the tiny WhatsApp "active" pulse. No bounces.

### States
- **Hover:** buttons darken to the `-ink` shade (coral→`#EC5524`, violet→`#5235E0`); soft/
  ghost surfaces step one shade up (`surface-2`→`surface-3`); rows tint to `surface-2`;
  nav items lighten text + faint white wash. **Focus:** 3.5px violet ring
  (`rgba(100,71,245,.22)`). **Pressed:** color shift, no shrink. **Disabled:** 55% opacity.
- **Imagery vibe:** none in-product. Where photography appears (marketing), keep it warm and
  hospitable to match Margen — never cold or blue.

---

## ICONOGRAPHY

- **System:** a hand-authored **Lucide-style** stroke set (~50 glyphs) lives in the app kit
  (`ui_kits/fluvio-app/lib.jsx`, `ICONS` map + `<Icon name size>` renderer). Outlined,
  **1.75px stroke**, round caps and joins, on a 24px grid, drawn with `currentColor` so they
  inherit text color. See the **Iconography** card in the DS tab.
- **Why hand-rolled:** it keeps the bundle dependency-free and lets a few restaurant-specific
  glyphs (`utensils`, `armchair`, `tables`, `seat`, `whatsapp`) sit beside the standard set.
  If you prefer a CDN, **Lucide** is the closest match (same weight/feel) — swap freely.
- **WhatsApp** has a dedicated filled glyph and brand green `#25D366` for bot/chat surfaces —
  the one place a non-system color is allowed, because it's a platform mark.
- **No emoji as icons** (the single greeting 👋 aside). No unicode-glyph icons. No PNG icons.
- Icon chips: 34px violet-light square w/ violet-dark glyph (`.stat-ico`); inline icons
  inherit ink color and sit at 15–18px.

### Logo
Three horizontal flowing wave currents stacked vertically — river currents from above —
carrying the brand **violet → medium violet → coral** without a CSS gradient. On dark
(sidebar) the waves go white at 100% / 65% / 90% opacity. Wordmark **FLUVIO**, uppercase,
Syne 800, violet (or white on dark). App icon = violet `#6447F5` rounded square + white mark.
Component: `Logo` (`components/brand/`). Static SVGs in `assets/`.

---

## Index / manifest

**Root**
- `styles.css` — global entry point (import this one file). `@import`s the tokens + base layer.
- `base.css` — reset, utilities, and the component class layer (`.btn`, `.card`, `.badge`,
  `.stat`, `.avatar`, `.input`, `.ftab`, sidebar/topbar, drawer, toast…).
- `tokens/` — `colors.css` · `typography.css` (loads Syne + Outfit) · `spacing.css`
  (radii, spacing, motion, layout).
- `readme.md` (this file) · `SKILL.md` (Agent Skill wrapper).
- `assets/` — `logo-mark.svg`, `logo-mark-white.svg`, `logo-icon.svg`, `fluvio-logo-lockup.png`.

**Components** (`components/<group>/` — `.jsx` + `.d.ts` + `.prompt.md` + a card):
- `buttons/` — **Button** (coral/violet/soft/ghost/subtle/danger · sm/md/lg · icons)
- `feedback/` — **Badge** (reservation status) · **Avatar** (initials, VIP)
- `surfaces/` — **Card** (border-only) · **StatCard** (KPI + trend + ring)
- `forms/` — **Input** · **Switch** · **Chip** (filter tab)
- `brand/` — **Logo** (mark + wordmark, color/mono)

Access in card HTML via `window.DesignSystem_578428` after loading `_ds_bundle.js`.

**Foundation cards** (`guidelines/*.card.html`) — Colors (primary, accent, neutrals, status,
risk), Type (display, body), Spacing (radii, scale, elevation), Brand (logo, app icon,
iconography). These populate the **Design System** tab.

**UI kit** (`ui_kits/fluvio-app/`) — interactive app recreation. `index.html` boots the full
shell with routing across Dashboard · Reservaciones · Clientes · Mesas · Configuración, a
live WhatsApp/AI feed, reservation status workflow, and a reservation drawer. `README.md`
inside documents it.
