# Handoff: FLUVIO — SaaS de reservaciones con IA para restaurantes

> Paquete de entrega para implementar el frontend de **Fluvio** en un proyecto real.
> Stack objetivo declarado por el cliente: **Next.js 14 + TypeScript + Tailwind CSS** (sin shadcn ni otras librerías de componentes).

---

## Overview

Fluvio es un SaaS que toma reservaciones de restaurante a través de un **bot de WhatsApp con IA** (24/7), elimina los no-shows con recordatorios automáticos y ofrece un **panel de gestión** en tiempo real. Este handoff cubre las **8 vistas** del producto: landing, login y las 6 pantallas de la app (dashboard, reservaciones, clientes, mesas, configuración) más sus componentes reutilizables.

Producto de ejemplo en los datos: restaurante **"Duble Bistró"**, usuario **"Luis"**.

---

## About the Design Files

Los archivos de este bundle son **referencias de diseño hechas en HTML/React (Babel in-browser)** — prototipos que muestran el look & feel y el comportamiento esperado, **no código de producción para copiar tal cual**. La tarea es **recrear estos diseños en Next.js 14 con TypeScript y Tailwind**, usando componentes `.tsx` idiomáticos (Server/Client Components según corresponda) y las convenciones del proyecto. Los datos son mock; la conexión a Supabase viene después, así que deja los datos como placeholders tipados y aísla el acceso a datos en funciones/hooks fáciles de sustituir.

El prototipo usa CSS plano con variables (tokens). Al portar a Tailwind, mapea los tokens a `tailwind.config` (ver sección **Design Tokens**) en vez de hardcodear hex en el markup.

---

## Fidelity

**Alta fidelidad (hifi).** Colores, tipografía, espaciado, radios, sombras, estados e interacciones están definidos. Recréalo fielmente con Tailwind. Los iconos del prototipo son SVG stroke estilo Lucide — en el codebase usa **lucide-react** (equivalencias indicadas más abajo).

---

## Design Tokens

Definidos en `styles.css` con variables CSS. Mapea a `tailwind.config.ts`:

### Colores — superficies cálidas (tema claro, por defecto)
| Token | Hex | Uso |
|---|---|---|
| `bg` | `#FAFAF8` | Fondo de la app |
| `surface` | `#FFFFFF` | Cards, sidebar, inputs |
| `surface-2` | `#F4F3EF` | Fondos suaves, hover de filas, chips |
| `surface-3` | `#EFEEE9` | Pistas de progreso, fondos hundidos |
| `surface-sunken` | `#EBEAE3` | — |

### Tinta (texto)
| Token | Hex |
|---|---|
| `ink` | `#1A1A1A` (texto principal / titulares) |
| `ink-2` | `#5C5A54` (texto secundario) |
| `ink-3` | `#908E86` (terciario / placeholders suaves) |
| `ink-4` | `#B6B4AB` (placeholders, iconos apagados) |

### Líneas
| Token | Hex |
|---|---|
| `line` | `#E7E5DE` (bordes de cards, divisores) |
| `line-2` | `#DBD9D0` (bordes de inputs) |
| `line-strong` | `#CFCDC3` (bordes en hover, track de switch off) |

### Acento — verde oliva (primario)
| Token | Hex |
|---|---|
| `accent` | `#4A7C59` (botones, activos, foco) |
| `accent-ink` | `#3A6347` (hover de botón primario, links) |
| `accent-deep` | `#2E4F39` (fondos oscuros: hero CTA, sidebar de login, plan card) |
| `accent-soft` | `#EAF1EC` (tints de fondo, nav activo) |
| `accent-soft-2` | `#DCE8DF` (acentos sutiles) |
| `accent-contrast` | `#FFFFFF` |

> El prototipo permite alternar el acento a **naranja `#E0632F`** o **azul `#2F6CC4`** y a **tema oscuro** vía panel de Tweaks. No es requisito de producto; impleméntalo solo si quieres theming. (Sets completos en `app.jsx` → `ACCENTS` y `DARK`/`LIGHT`.)

### Estados de reservación (badges)
| Estado | Texto | Texto hex | Fondo hex | Dot hex |
|---|---|---|---|---|
| `pendiente` | Pendiente | `#B07A12` | `#FBF2DE` | `#D69A1E` |
| `confirmada` | Confirmada | `#2F8A5B` | `#E5F2EA` | `#2F8A5B` |
| `sentada` | Sentada | `#3568A0` | `#E7EEF7` | `#3568A0` |
| `no_show` | No-show | `#BE3A2B` | `#FAE9E6` | `#BE3A2B` |
| `cancelada` | Cancelada | `#7C7A72` | `#EDECE6` | `#9C9A90` |

### Color de marca de WhatsApp
- Verde WhatsApp `#25D366` (icono del bot), header de chat `#075E54`, burbuja saliente `#DCF8C6`, fondo de chat `#E5DDD5`.

### Tipografía
- **Display / titulares:** `Bricolage Grotesque` (Google Fonts), pesos 400–700, `letter-spacing: -0.02em` a `-0.035em` en tamaños grandes, `line-height: 1.08`. Usada en h1–h5, números de métricas, horas, logo.
- **UI / cuerpo:** `Hanken Grotesk` (Google Fonts), pesos 400/500/600/700. Base del body, tablas, inputs, labels.
- Base body: `15px`, `line-height: 1.5`. Densidad "compacta" = `14px`.
- Números tabulares (`font-variant-numeric: tabular-nums`) en horas, conteos y métricas.

### Radios
`--r-xs 6px` · `--r-sm 9px` · `--r 12px` · `--r-lg 16px` · `--r-xl 22px` · `--r-pill 999px`

### Sombras (cálidas, base `rgba(40,34,18,*)`)
- `shadow-xs`: `0 1px 2px rgba(40,34,18,.05)`
- `shadow-sm`: `0 1px 2px rgba(40,34,18,.05), 0 1px 1px rgba(40,34,18,.04)`
- `shadow`: `0 1px 3px rgba(40,34,18,.06), 0 6px 16px -6px rgba(40,34,18,.10)`
- `shadow-lg`: `0 10px 34px -10px rgba(40,34,18,.20), 0 4px 10px -4px rgba(40,34,18,.08)`
- `shadow-xl`: `0 24px 60px -16px rgba(40,34,18,.28)`

### Easing
- Curva estándar: `cubic-bezier(.32, .72, 0, 1)` (usada en todas las transiciones y entradas).

### Espaciado / layout
- Sidebar: `256px` de ancho, fija, `100vh`, sticky.
- Topbar: `68px` de alto, sticky, fondo `rgba(250,250,248,.82)` + `backdrop-filter: blur(12px)`.
- Contenido `.page`: padding `28px`, `max-width: 1400px` centrado. Variante angosta (config): `880px`.
- Drawer lateral: `460px` (max `94vw`).
- Modal centrado: `480px`.

---

## Componentes reutilizables

Recréalos como componentes `.tsx`. (En el prototipo viven en `components.jsx`, `app-shell.jsx`, `lib.jsx`.)

- **`<StatusBadge status>`** — pill 24px alto, `border-radius: pill`, dot 6px + label. Una clase de color por estado (tabla arriba). `font-size 12.5px, weight 600`.
- **`<Avatar name size>`** — círculo con iniciales (2 letras), color de fondo determinístico por hash del nombre. Paleta: `['#4A7C59','#B0662C','#3568A0','#9C5A8C','#5C6BC0','#3E7C8A','#A8553E','#6B8E4E','#8A6FB0','#C08A2A']`. `font-size ≈ size*0.4`, texto blanco, weight 600.
- **`<StatCard icon label value trend trendDir sub ring>`** — card `r-lg`, padding `17px 18px`. Header: label (ink-2, 13px) + icono en cuadro 34px `surface-2`. Valor: display 33px weight 600 `letter-spacing -0.03em`. `trend` con flecha (verde up / rojo down / gris flat). Opcional `ring` = anillo de progreso SVG (56px, stroke 6, color acento, transición de 0.9s).
- **`<RingProgress value size stroke color>`** — dos círculos SVG; el de progreso rota -90° con `stroke-dasharray`/`offset`; `%` centrado, weight 700 tabular.
- **`<ReservationRow res>`** — fila de tabla: Hora (display 15px) · Cliente (avatar 32 + nombre weight 600 + VipTag si aplica + teléfono ink-3 12.5px) · Personas · Mesa · Canal (icono) · Estado (badge) · Acciones rápidas (aparecen en hover de la fila: `opacity 0→1`, `translateX(4px)→0`).
- **`QuickActions`** — botones-icono 31px según estado: pendiente→**Confirmar** (check), confirmada→**Sentar** (silla), + **No-show** (x) salvo en sentada/no_show/cancelada, + **Más** (3 puntos → abre drawer de edición). Click hace `stopPropagation`.
- **`<ChannelTag channel>`** — icono + label opcional. Canales: `whatsapp` (icono WhatsApp), `web` (globo), `telefono` (teléfono), `manual` (lápiz).
- **`<VipTag>`** — pill dorada 22px: gradiente `#F6EBD4→#EFDFBF`, texto `#8A6A1C`, borde `#E6D3A8`, estrella + "VIP", weight 700.
- **`<EmptyState icon title body action>`** — ilustración SVG (calendario con check en círculo de acento, 92px), título 18px, body ink-2 max 320px, CTA opcional.
- **`<Sidebar route business open>`** — ver vista Dashboard.
- **`<Topbar onMenu onNewRes>`** — ver vista Dashboard.
- **`<PageHeader title subtitle actions>`** — h1 27px + subtítulo ink-2 + acciones a la derecha.
- **`<SectionHead title count right>`** — header de card: título 16.5px + chip de conteo + slot derecho, borde inferior.
- **Botones (`.btn`)** — alto 40px (sm 33, lg 48), `r-sm`, weight 600, `font-size 14`, gap 8, transición de la curva estándar, `:active` micro-scale. Variantes: `primary` (acento, texto blanco, hover `accent-ink`), `ghost` (borde `line-2`, hover `surface-2`), `soft` (`surface-2`), `subtle` (transparente→`surface-2`), `danger` (`st-no-bg`/`st-no`). `btn-icon` cuadrado.
- **Inputs (`.input/.select/.textarea`)** — alto 42px, borde `line-2`, `r-sm`, foco = borde acento + halo `0 0 0 3.5px accent-soft`. Select con chevron SVG embebido.
- **Switch** — 40×23px, off `line-strong` / on `accent`, thumb 18px con transición de la curva estándar.
- **Chip / segmented control / search-wrap** — ver `styles.css`.

---

## Screens / Views

### 1. Landing (`/`)
- **Propósito:** convertir; explicar el bot de WhatsApp y llevar a registro/demo.
- **Layout:** ancho máx 1180px centrado. Secciones apiladas: nav sticky → hero → franja de social proof → features → cómo funciona → CTA → footer.
- **Nav (sticky, blur):** wordmark (logo 28 + "Fluvio") · links "Funciones / Cómo funciona / Precios" · botones "Iniciar sesión" (ghost) y "Empezar gratis" (primario) → ambos a `/login`.
- **Hero (2 columnas, wrap):**
  - Izq: chip "● Bot de WhatsApp con IA" (con pulso) · **H1** `clamp(40px,6vw,62px)`: "Tu restaurante, / siempre lleno. / **Sin esfuerzo.**" (última línea en color acento) · subhead 19px ink-2: "Bot de WhatsApp con IA que toma reservaciones 24/7 y elimina los no-shows automáticamente." · CTAs "Empezar gratis" (primario lg → /login) + "Ver demo" (ghost lg → /dashboard) · checks "14 días gratis · Sin tarjeta · Listo en 5 min".
  - Der: **maqueta de teléfono** (290px, bisel `#1A1A1A` r-38, glow de acento detrás). Pantalla de WhatsApp: header verde `#075E54` con logo + "Duble Bistró · en línea". Conversación animada (burbujas entran escalonadas 0.1–2.2s): cliente pregunta por mesa para 2, bot responde y confirma, + indicador "Fluvio agendó la reserva" con pulso. Burbuja entrante blanca (`r 4/14/14/14`), saliente `#DCF8C6` (`r 14/4/14/14`).
- **Social proof:** franja `surface` con 4 stats display 27px: `+38%` reservas confirmadas · `−61%` no-shows · `24/7` atención · `4.9★` satisfacción.
- **Features (3 cols, auto-fit minmax 280px):** cards con icono en cuadro `accent-soft` 44px. (1) **Bot de WhatsApp 24/7** (badge "Estrella"), (2) **Recordatorios anti no-show**, (3) **Panel en tiempo real**. Copys completos en `screens-landing.jsx`.
- **Cómo funciona:** fondo `surface`, 2 cols. Izq: 3 pasos numerados (badge cuadrado acento 38px): (1) Conecta tu WhatsApp, (2) El bot toma las reservas, (3) Gestiona desde el panel + botón "Crear mi cuenta". Der: mini-preview de dashboard (card con 3 filas de reserva con badges).
- **CTA / precio:** bloque `accent-deep` r-xl, H2 "Llena tu restaurante esta misma semana", "Plan Starter desde **$99/mes**…", botones blanco + translúcido.
- **Footer:** wordmark + tagline + links + "© 2026 Fluvio".

### 2. Login / Auth (`/login`)
- **Propósito:** entrar al panel. (Demo: cualquier submit navega a `/dashboard` tras ~850ms con spinner.)
- **Layout split 50/50** (lado izquierdo se oculta en móvil):
  - **Izq (oscuro `accent-deep`):** logo+wordmark (clic → landing), H1 "Reservaciones inteligentes para tu restaurante.", card-testimonio translúcido (badge "● FLUVIO · EN VIVO", cita de Luis Duble + avatar), footer legal. Dos glows radiales blancos sutiles.
  - **Der (formulario):** botón "Volver" arriba-derecha. Centro: logo, H1 "Bienvenido de vuelta" / "Crea tu cuenta", subtítulo. Form: (signup añade "Nombre del restaurante"), **Email** (icono mail, prefilled `luis@dublebistro.mx`), **Contraseña** (icono lock, link "¿Olvidaste?"), botón primario lg full. Divisor "o". Botón "Continuar con WhatsApp Business" (icono verde). Toggle login↔signup.
- **Estado:** `mode` (login/signup), `email`, `pass`, `loading`.

### 3. Dashboard (`/dashboard`)
- **Propósito:** vista de mando del día.
- **Shell (compartido por las 6 pantallas de app):**
  - **Sidebar 256px fija:** marca (logo 32 + "Duble Bistró" / "vía Fluvio") · label "OPERACIÓN" · nav: Dashboard, Reservaciones (count 10), Clientes, Mesas, Configuración. Item activo = fondo `accent-soft`, texto `accent-deep`, weight 600. Pie: **plan card** (`surface-2`: "⚡ Plan Starter" + badge "Activo", barra 64%, "320/500 reservas", link "Mejorar") + **user row** (avatar "Luis Duble" + email + chevron → config). En móvil (≤900px) es off-canvas con backdrop y botón hamburguesa.
  - **Topbar 68px sticky:** hamburguesa (móvil) · buscador `surface-2` 320px · spacer · botón campana (con punto de notificación) · **"+ Nueva reservación"** (primario, abre drawer).
- **Contenido (variante por defecto "Métricas"):**
  - **Saludo:** fecha (nowrap "Sábado, 30 de mayo · 2026"), **H1** "Buenos días, Luis 👋", línea resumen "Tienes **10 reservas** para hoy y **3 pendientes** por confirmar." + botón primario lg.
  - **4 métricas (grid 4 cols → 2 en ≤900 → 1 en ≤560):** Reservas hoy `10` (+18% vs ayer) · Confirmadas (anillo 70%) · No-shows del mes `4` (−61% vs abril) · Clientes nuevos `12` (esta semana).
  - **Grid 1.6fr / 1fr:**
    - Izq: card **"Reservas de hoy"** (count 10) con segmented "Todas/Comida/Cena" y **tabla** de las 10 reservas de hoy (columnas: Hora, Cliente, Pers., Mesa, Canal, Estado, Acciones). EmptyState si vacío.
    - Der (col): **panel de feed IA** + **próximas reservas**.
  - **Panel de feed IA (WhatsApp):** card con header (cuadro verde WhatsApp + "Bot de WhatsApp" + "● Activo · responde 24/7" con pulso + chip "✦ IA"). Lista de eventos que **se actualizan en vivo** (cada ~6.5s se inserta uno nuevo arriba y los tiempos envejecen). Cada item: icono por tipo (`new`=whatsapp/verde, `confirm`=check/verde, `remind`=campana/ámbar, `chat`=mensaje/azul), "<b>Nombre</b> <acción>", etiqueta de tipo + tiempo. Pie: "Ver toda la actividad".
  - **Próximas reservas:** agrupadas por "Mañana / Pasado mañana" con hora, avatar, nombre, personas y badge.
- **Variantes de layout (Tweak, opcional):** además de "Métricas", existen **"Agenda"** (timeline vertical de hoy como protagonista, con dot por estado + card por reserva) e **"IA"** (franja compacta de métricas + timeline + feed IA en columna sticky). Si no implementas Tweaks, entrega la variante **Métricas**.

### 4. Reservaciones (`/dashboard/reservaciones`)
- **Propósito:** gestionar todas las reservas.
- **Layout:** PageHeader "Reservaciones" + subtítulo de conteos + botón "+ Nueva". **Card de filtros:** buscador (nombre/teléfono) + select de fecha (Hoy/Mañana/Pasado/Ayer) + select de estado. **Chips de estado** rápidos (el activo = fondo `ink` texto blanco). **Tabla** paginada (Hora, Cliente, Día, Pers., Mesa, Canal, Estado, Acciones). Footer con "Mostrando X de Y" + paginación. EmptyState (icono search) si no hay resultados.
- **Drawer "Nueva/Editar reservación"** (lateral 460px, entra con slide + scrim con blur, Esc cierra):
  - Header: icono + título + subtítulo + cerrar.
  - Campos: **Cliente** (input con autocompletado: muestra coincidencias de la lista con avatar/teléfono/visitas, o "Crear «texto»") · **Fecha** (date) + **Hora** (time) · **Número de personas** (botones 1–8 y +8, seleccionado = primario) · **Mesa** (select, opcional, "Asignar automáticamente" + mesas activas) · **Canal** (chips seleccionables) · **Notas** (textarea).
  - Footer: "Cancelar" (ghost) + "Crear reservación/Guardar cambios" (primario).
- **Estado:** `q`, `status`, `day` (filtros); drawer con `client/time/people/channel/...`.

### 5. Clientes (`/dashboard/clientes`)
- **Propósito:** CRM ligero.
- **Layout:** PageHeader (conteo total + nº VIP) + "Nuevo cliente". Card de búsqueda. **Tabla:** Nombre (avatar + nombre + VipTag + "recurrente/nuevo"), Teléfono, Visitas (tabular), Última visita (fecha es-MX), Notas (truncadas), chevron.
- **Panel lateral al hacer clic** (drawer 460px): cabecera con avatar 44 + nombre + VipTag + teléfono. 3 mini-stats (Visitas / Última / Canal fav.). Card de **Notas** (ámbar) si hay. **Historial de reservaciones** (filtra reservas por `clientId`: día+hora, personas+mesa, badge). Footer: "Escribir" (WhatsApp) + "Nueva reserva". **Badge VIP** cuando `visits ≥ 5`.

### 6. Mesas (`/dashboard/mesas`)
- **Propósito:** administrar mesas.
- **Layout:** PageHeader (mesas activas + aforo total) + "Agregar mesa". **Chips de zona** (Todas/Terraza/Interior/Barra; activo = fondo `ink`). **Grid auto-fill minmax(248px):** una card por mesa: icono por zona (Terraza=sol, Interior=cubiertos, Barra=sillón) + nombre (display 17) + zona; **switch activo/inactivo** (toggle real de estado); pie con capacidad ("N personas") + badge Activa/Inactiva. Card inactiva al 62% de opacidad. Última celda = card punteada "Agregar mesa".
- **Estado:** lista de mesas con `active` toggleable; filtro `zone`.

### 7. Configuración (`/dashboard/configuracion`)
- **Propósito:** ajustes del negocio.
- **Layout:** ancho angosto 880px. PageHeader. **Tabs** (subrayado acento en activo): Perfil · WhatsApp · Notificaciones · Plan.
  - **Perfil:** filas (label izq + control der): Nombre del restaurante, Teléfono, Zona horaria (select), Idioma (select).
  - **WhatsApp:** banner verde "conectado" (número + "Bot activo · 1.284 mensajes" + "Reconectar") + filas: número, mensaje de bienvenida (textarea), switch "Tomar reservas 24/7".
  - **Notificaciones:** 4 switches (recordatorios anti no-show, nueva reserva del bot, alerta de no-show, resumen semanal) con estado.
  - **Plan:** card oscura `accent-deep` (Plan Starter, "500 reservas/mes · 1 número", **$99/mes**, barra 64%, "320/500 usadas") + filas "Método de pago" y "Mejorar a Pro".
- **Zona de peligro (siempre al fondo):** card roja (`#FCF3F1`, borde `#EBC9C2`): icono alerta + "Zona de peligro" + "Cancelar cuenta" con botón danger.
- **Estado:** `section` (tab activa), `notif` (toggles).

---

## Interactions & Behavior

- **Navegación:** SPA por estado `route` en el prototipo. En Next.js usa rutas reales del App Router (`/`, `/login`, `/dashboard`, `/dashboard/reservaciones`, etc.). El prototipo **persiste la ruta en `localStorage`** solo para conveniencia de demo — no es necesario en producción.
- **Acciones de reserva:** Confirmar→`confirmada`, Sentar→`sentada`, No-show→`no_show`, Cancelar→`cancelada`, Editar→abre drawer. Cada cambio dispara un **toast** inferior (verde, o rojo para no-show) ~2.4s.
- **Feed IA en vivo:** intervalo ~6.5s inserta un evento nuevo arriba y "envejece" los tiempos; tope ~12 items. Solo corre dentro de la app (no en landing/login). En producción esto sería un socket/polling a backend; déjalo como hook reemplazable.
- **Filtros:** búsqueda y selects filtran la lista en cliente, en vivo.
- **Drawer/Modal:** entran con slide/pop sobre scrim con blur; cierran con botón, clic en scrim o **Esc**.
- **Hover de filas:** las acciones rápidas aparecen (`opacity`+`translateX`).
- **Autocompletado de cliente:** filtra `CLIENTS` por nombre; si no hay match, ofrece crear.
- **Toggles:** switches de mesa y notificaciones cambian estado real.
- **Animaciones:** entradas de página (`pageIn`, opacity+translateY 6px, 0.34s), feed (`feedIn`), drawer (`slideIn` 0.34s), modal (`pop`), pulso de "en vivo" (`pulse` 1.8s). Curva `cubic-bezier(.32,.72,0,1)`.
- **Responsive:** mobile-first. Sidebar colapsa <900px (off-canvas + hamburguesa). Grids de métricas/dashboard colapsan a 1 columna <1080px. Clase `hide-sm` oculta columnas secundarias de tabla en móvil.

---

## State Management

Mock/local en el prototipo. Para Next.js + Supabase:
- **Reservaciones:** lista tipada con `{ id, time, clientId, people, table, status, channel, notes, date, dayLabel }`. Acciones mutan `status`. → tabla `reservations`.
- **Clientes:** `{ id, name, phone, visits, last, notes, tags[] }`. VIP derivado de `visits ≥ 5`. → tabla `clients`.
- **Mesas:** `{ id, name, cap, zone, active }`. → tabla `tables`.
- **Feed IA:** stream de eventos `{ id, who, msg, kind, t }`. → realtime/webhook del bot.
- **Config/Notif:** ajustes del negocio. → tabla `settings`.
- Aísla el acceso a datos (p. ej. `lib/data.ts` / hooks) para sustituir mock por Supabase sin tocar UI.

---

## Assets

- **Iconos:** estilo Lucide (stroke 1.7, linecap/join round) — en `lib.jsx` (`ICONS`). Usa **lucide-react**. Equivalencias: dashboard→`LayoutDashboard`, calendar→`Calendar`, calcheck→`CalendarCheck`, users→`Users`, user→`User`, userplus→`UserPlus`, tables/grid→`LayoutGrid`, settings→`Settings`, plus→`Plus`, search→`Search`, chevron*→`Chevron*`, arrowUpRight→`ArrowUpRight`, trendUp→`TrendingUp`, trendDown→`TrendingDown`, check→`Check`, x→`X`, clock→`Clock`, phone→`Phone`, whatsapp→`MessageCircle`/icono propio, globe→`Globe`, monitor→`Monitor`, bell→`Bell`, logout→`LogOut`, menu→`Menu`, more→`MoreHorizontal`, sparkles→`Sparkles`, utensils→`Utensils`, mappin→`MapPin`, armchair→`Armchair`, sun→`Sun`, edit→`SquarePen`, trash→`Trash2`, seat→`Armchair`, filter→`Filter`, star→`Star`, shield→`ShieldCheck`, alert→`TriangleAlert`, zap/bolt→`Zap`, smartphone→`Smartphone`, mail→`Mail`, lock→`Lock`, building→`Building2`, card→`CreditCard`, dollar→`DollarSign`, history→`History`, message→`MessageSquare`, list→`List`, flame→`Flame`.
- **Logo Fluvio:** SVG propio (cuadro acento r-8.5 con 3 trazos blancos decrecientes + punto) en `components.jsx` → `<Logo>`. Recréalo como componente SVG.
- **Ilustración de EmptyState:** SVG inline (calendario con check). En `components.jsx`.
- **Fuentes:** Google Fonts — `Bricolage Grotesque` y `Hanken Grotesk` (más Instrument Serif/Spectral/Fraunces solo si implementas el Tweak de tipografía). En Next.js usa `next/font/google`.
- **Sin imágenes raster.** No hay fotos; si más adelante agregan fotos de platillos/local, reserva slots.

---

## Files (referencias del prototipo)

| Archivo | Contenido |
|---|---|
| `Fluvio.html` | Shell: carga fuentes, React/Babel y todos los scripts. |
| `styles.css` | **Todos los tokens y estilos base** (colores, tipografía, botones, cards, badges, inputs, layout app, tabla, drawer/modal, feed, timeline, responsive). |
| `lib.jsx` | Set de iconos (`ICONS`/`<Icon>`), helpers (`STATUS`, `CHANNEL`, `avatarColor`, `initials`) y **datos mock** (`TABLES`, `CLIENTS`, `TODAY`, `UPCOMING`, `ALL_RES`, feed IA). |
| `components.jsx` | Componentes reutilizables (Logo, Avatar, StatusBadge, StatCard, RingProgress, EmptyState, ReservationRow, QuickActions, PageHeader, SectionHead, Scrim, etc.). |
| `app-shell.jsx` | `Sidebar` + `Topbar` + definición de `NAV`. |
| `screens-landing.jsx` | Landing completa (nav, hero, phone demo, features, pasos, CTA, footer). |
| `screens-login.jsx` | Login split. |
| `screens-dashboard.jsx` | Dashboard + 3 variantes + paneles (métricas, feed IA, próximas, timeline). |
| `screens-reservaciones.jsx` | Reservaciones + `ReservationDrawer`. |
| `screens-misc.jsx` | Clientes (+ panel lateral), Mesas, Configuración. |
| `app.jsx` | Router, estado global, acciones, toasts, feed en vivo, theming (`ACCENTS`/`DARK`/`LIGHT`) y panel de Tweaks. |
| `tweaks-panel.jsx` | Panel de Tweaks (solo herramienta de exploración; no portar a producción). |

> **Nota de implementación:** los datos de ejemplo (Duble Bistró, Luis, clientes, reservas) están en `lib.jsx` — úsalos como seed/fixtures tipados mientras llega Supabase. Mantén la separación tokens→Tailwind config, y prioriza la **variante "Métricas"** del dashboard como entrega base.
