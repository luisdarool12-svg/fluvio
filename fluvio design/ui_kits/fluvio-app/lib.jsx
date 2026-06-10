/* ============================================================
   FLUVIO — Iconos (Lucide-style stroke) + datos mock + helpers
   ============================================================ */

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  calcheck: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4M9 15l2 2 4-4"/>',
  users: '<path d="M16 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19"/><circle cx="9" cy="7" r="3.2"/><path d="M22 19v-1.5a4 4 0 0 0-3-3.85M16 3.6a4 4 0 0 1 0 7.3"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/>',
  userplus: '<path d="M14 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19"/><circle cx="8" cy="7" r="3.2"/><path d="M18 8v6M21 11h-6"/>',
  tables: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  settings: '<path d="M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z"/><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-2.7 1.13V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 2.6 14H2.5a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 2.6h.1A2 2 0 0 1 13 2.5v.1A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 21.4 9h.1a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 2Z" transform="scale(.92) translate(1 1)"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  trendUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
  trendDown: '<path d="m3 7 6 6 4-4 8 8"/><path d="M17 17h4v-4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  phone: '<path d="M16.5 21A14.5 14.5 0 0 1 3 7.5 2.5 2.5 0 0 1 5.5 5h2A1.6 1.6 0 0 1 9 6.2c.13.9.36 1.78.7 2.6a1.6 1.6 0 0 1-.4 1.7L8.1 11.8a13 13 0 0 0 4.1 4.1l1.3-1.2a1.6 1.6 0 0 1 1.7-.4c.82.34 1.7.57 2.6.7A1.6 1.6 0 0 1 19 16.5v2A2.5 2.5 0 0 1 16.5 21Z"/>',
  whatsapp: '<path d="M12 3a8.7 8.7 0 0 0-7.5 13.1L3 21l5-1.4A8.7 8.7 0 1 0 12 3Z"/><path d="M8.9 8.4c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.5l.6 1.4c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3 0 .6.5.8 1.2 1.4 2 1.8.3.1.4.1.6-.1l.5-.6c.2-.2.3-.2.5-.1l1.3.7c.2.1.4.2.4.3.1.5-.1 1.3-.5 1.6-.4.3-1 .5-1.6.4-1.8-.3-3.4-1.2-4.6-2.6-.8-.9-1.3-1.9-1.4-3 0-.6.2-1.1.5-1.5Z" fill="currentColor" stroke="none"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 14 18 8Z"/><path d="M10.5 19a1.8 1.8 0 0 0 3 0"/>',
  logout: '<path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  sparkles: '<path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15l-1.6-4.2L6 9.2l4.4-1.6L12 3Z"/><path d="M19 13l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2ZM5 14l.6 1.6L7 16l-1.4.5L5 18l-.6-1.5L3 16l1.4-.4L5 14Z"/>',
  utensils: '<path d="M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M6 12v9M14 3c-1.5 0-2.5 1.8-2.5 4s1 4 2.5 4M14 11v10"/>',
  mappin: '<path d="M20 10c0 5.5-8 11-8 11s-8-5.5-8-11a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  armchair: '<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M4 11a2 2 0 0 1 2 2v2h12v-2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"/><path d="M6 19v2M18 19v2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  edit: '<path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
  seat: '<path d="M5 18v3M19 18v3M4 18h16M6 18v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3M8 13V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z"/>',
  star: '<path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.7l1-5.8L3.5 9.8l5.9-.9L12 3Z"/>',
  shield: '<path d="M12 3l7.5 2.5v5.5c0 4.5-3 7.8-7.5 9.5C7.5 18.8 4.5 15.5 4.5 11V5.5L12 3Z"/><path d="M9.5 12l1.8 1.8L15 10"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  smartphone: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/>',
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 9 6 9-6"/>',
  lock: '<rect x="4.5" y="11" width="15" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h2M9 12h2M9 16h2M14 8h1M14 12h1M14 16h1"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  check2: '<path d="M20 6 9 17l-5-5"/>',
  dollar: '<path d="M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1-5 3.2c0 4.8 10 2.8 10 7.6 0 2.2-2.2 3.2-5 3.2s-5-1-5-3"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 4v4h4"/><path d="M12 8v4l3 2"/>',
  message: '<path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.6L3 21l1.9-5.8A8.5 8.5 0 1 1 21 11.5Z"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  columns: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
  flame: '<path d="M12 3c1 3-1.5 4-1.5 6.5A2.5 2.5 0 0 0 13 12c1.5-1 1-3 1-3 2 1.5 3 3.8 3 6a5.5 5.5 0 0 1-11 0c0-3 2.5-4.5 3-7.5.2-1.4 1.5-3 3-4.5Z"/>',
};

function Icon({ name, size, style, className, strokeWidth }) {
  const s = size || 20;
  return React.createElement('svg', {
    width: s, height: s, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: strokeWidth || 1.7,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    style, className,
    dangerouslySetInnerHTML: { __html: ICONS[name] || '' },
  });
}

/* ============================================================
   HELPERS
   ============================================================ */
const STATUS = {
  pendiente:  { label: 'Pendiente',  cls: 'badge-pend' },
  confirmada: { label: 'Confirmada', cls: 'badge-conf' },
  sentada:    { label: 'Sentada',    cls: 'badge-seat' },
  no_show:    { label: 'No-show',    cls: 'badge-no' },
  cancelada:  { label: 'Cancelada',  cls: 'badge-canc' },
};

const CHANNEL = {
  whatsapp: { label: 'WhatsApp', icon: 'whatsapp' },
  web:      { label: 'Web',      icon: 'globe' },
  telefono: { label: 'Teléfono', icon: 'phone' },
  manual:   { label: 'Manual',   icon: 'edit' },
};

const AVATAR_COLORS = ['#4A7C59','#B0662C','#3568A0','#9C5A8C','#5C6BC0','#3E7C8A','#A8553E','#6B8E4E','#8A6FB0','#C08A2A'];
function avatarColor(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase();
}

/* ============================================================
   DATOS MOCK — Duble Bistró
   ============================================================ */
const TABLES = [
  { id: 't1', name: 'Mesa 1', cap: 2, zone: 'Terraza',  active: true },
  { id: 't2', name: 'Mesa 2', cap: 2, zone: 'Terraza',  active: true },
  { id: 't3', name: 'Mesa 3', cap: 4, zone: 'Terraza',  active: true },
  { id: 't4', name: 'Mesa 4', cap: 4, zone: 'Interior', active: true },
  { id: 't5', name: 'Mesa 5', cap: 6, zone: 'Interior', active: true },
  { id: 't6', name: 'Mesa 6', cap: 4, zone: 'Interior', active: true },
  { id: 't7', name: 'Mesa 7', cap: 8, zone: 'Interior', active: false },
  { id: 'b1', name: 'Barra 1', cap: 1, zone: 'Barra',   active: true },
  { id: 'b2', name: 'Barra 2', cap: 1, zone: 'Barra',   active: true },
  { id: 'p1', name: 'Privado', cap: 12, zone: 'Interior', active: true },
];

const CLIENTS = [
  { id: 'c1', name: 'María Fernanda Ríos', phone: '+52 55 1843 2290', visits: 9, last: '2026-05-22', notes: 'Alérgica a mariscos · prefiere terraza', tags: ['VIP'] },
  { id: 'c2', name: 'Andrés Lozano', phone: '+52 55 2901 7733', visits: 6, last: '2026-05-18', notes: 'Cumpleaños en junio', tags: ['VIP'] },
  { id: 'c3', name: 'Sofía Mendoza', phone: '+52 55 3320 1188', visits: 3, last: '2026-05-09', notes: '', tags: [] },
  { id: 'c4', name: 'Diego Navarro', phone: '+52 55 7781 5540', visits: 12, last: '2026-05-25', notes: 'Cliente frecuente · vino tinto', tags: ['VIP'] },
  { id: 'c5', name: 'Valeria Castro', phone: '+52 55 4408 9912', visits: 2, last: '2026-04-30', notes: '', tags: [] },
  { id: 'c6', name: 'Ricardo Beltrán', phone: '+52 55 6650 3321', visits: 1, last: '2026-05-28', notes: 'Primera visita', tags: ['Nuevo'] },
  { id: 'c7', name: 'Camila Ortiz', phone: '+52 55 9912 4408', visits: 5, last: '2026-05-15', notes: 'Mesa tranquila', tags: ['VIP'] },
  { id: 'c8', name: 'Jorge Ramírez', phone: '+52 55 1120 8876', visits: 4, last: '2026-05-11', notes: '', tags: [] },
  { id: 'c9', name: 'Paola Guzmán', phone: '+52 55 5567 2204', visits: 0, last: '—', notes: 'Reserva futura', tags: ['Nuevo'] },
  { id: 'c10', name: 'Emilio Vargas', phone: '+52 55 3344 1190', visits: 7, last: '2026-05-20', notes: 'Negocios · factura', tags: ['VIP'] },
];

function clientById(id) { return CLIENTS.find(c => c.id === id); }

// Reservas de HOY (30 may 2026)
const TODAY = [
  { id: 'r1', time: '13:00', clientId: 'c3', people: 2, table: 'Mesa 2', status: 'confirmada', channel: 'whatsapp', notes: '' },
  { id: 'r2', time: '13:30', clientId: 'c5', people: 4, table: 'Mesa 4', status: 'confirmada', channel: 'web', notes: '' },
  { id: 'r3', time: '14:00', clientId: 'c1', people: 2, table: 'Mesa 1', status: 'sentada', channel: 'whatsapp', notes: 'Alérgica a mariscos' },
  { id: 'r4', time: '14:00', clientId: 'c8', people: 6, table: 'Mesa 5', status: 'pendiente', channel: 'telefono', notes: '' },
  { id: 'r5', time: '14:30', clientId: 'c6', people: 2, table: '—', status: 'pendiente', channel: 'whatsapp', notes: 'Primera visita' },
  { id: 'r6', time: '15:00', clientId: 'c4', people: 4, table: 'Mesa 6', status: 'confirmada', channel: 'whatsapp', notes: 'Vino tinto reservado' },
  { id: 'r7', time: '20:00', clientId: 'c2', people: 8, table: 'Privado', status: 'confirmada', channel: 'manual', notes: 'Cena de negocios' },
  { id: 'r8', time: '20:30', clientId: 'c7', people: 2, table: 'Mesa 3', status: 'pendiente', channel: 'web', notes: '' },
  { id: 'r9', time: '21:00', clientId: 'c10', people: 5, table: 'Mesa 5', status: 'confirmada', channel: 'whatsapp', notes: '' },
  { id: 'r10', time: '21:30', clientId: 'c5', people: 3, table: '—', status: 'no_show', channel: 'web', notes: '' },
];

// Próximas (mañana / pasado)
const UPCOMING = [
  { id: 'u1', day: 'Mañana', date: 'Dom 31 may', items: [
    { time: '13:30', clientId: 'c1', people: 4, status: 'confirmada', channel: 'whatsapp' },
    { time: '14:00', clientId: 'c9', people: 2, status: 'confirmada', channel: 'whatsapp' },
    { time: '20:00', clientId: 'c4', people: 6, status: 'pendiente', channel: 'web' },
  ]},
  { id: 'u2', day: 'Pasado mañana', date: 'Lun 1 jun', items: [
    { time: '14:00', clientId: 'c2', people: 2, status: 'confirmada', channel: 'telefono' },
    { time: '21:00', clientId: 'c7', people: 8, status: 'confirmada', channel: 'whatsapp' },
  ]},
];

// Historial completo de reservas (para tabla de reservaciones)
const ALL_RES = [
  ...TODAY.map(r => ({ ...r, date: '2026-05-30', dayLabel: 'Hoy' })),
  ...UPCOMING.flatMap(g => g.items.map((it, i) => ({ id: g.id + i, ...it, date: g.id === 'u1' ? '2026-05-31' : '2026-06-01', dayLabel: g.day, table: '—', notes: '' }))),
  { id: 'p1r', time: '14:30', clientId: 'c4', people: 4, table: 'Mesa 6', status: 'sentada', channel: 'whatsapp', date: '2026-05-29', dayLabel: 'Ayer', notes: '' },
  { id: 'p2r', time: '20:00', clientId: 'c10', people: 2, table: 'Mesa 3', status: 'no_show', channel: 'web', date: '2026-05-29', dayLabel: 'Ayer', notes: '' },
  { id: 'p3r', time: '21:00', clientId: 'c1', people: 6, table: 'Privado', status: 'cancelada', channel: 'whatsapp', date: '2026-05-28', dayLabel: '28 may', notes: '' },
  { id: 'p4r', time: '13:00', clientId: 'c8', people: 2, table: 'Mesa 1', status: 'sentada', channel: 'telefono', date: '2026-05-28', dayLabel: '28 may', notes: '' },
];

// Feed de actividad del bot IA
const AI_FEED_SEED = [
  { t: 'Ahora', who: 'Sofía Mendoza', msg: 'reservó mesa para 2 a las 13:00', kind: 'new' },
  { t: 'hace 4 min', who: 'Ricardo Beltrán', msg: 'confirmó su asistencia para hoy 14:30', kind: 'confirm' },
  { t: 'hace 12 min', who: 'Diego Navarro', msg: 'recibió recordatorio anti no-show', kind: 'remind' },
  { t: 'hace 26 min', who: 'Camila Ortiz', msg: 'preguntó por disponibilidad de terraza', kind: 'chat' },
];

const AI_FEED_POOL = [
  { who: 'Laura Beristáin', msg: 'reservó mesa para 4 a las 21:00', kind: 'new' },
  { who: 'Tomás Quirós', msg: 'confirmó su reservación de mañana', kind: 'confirm' },
  { who: 'Fernanda Ruiz', msg: 'recibió recordatorio anti no-show', kind: 'remind' },
  { who: 'Mateo Salas', msg: 'reagendó su reserva para el sábado', kind: 'chat' },
  { who: 'Lucía Paredes', msg: 'reservó mesa para 2 en barra', kind: 'new' },
];

Object.assign(window, {
  Icon, ICONS, STATUS, CHANNEL, avatarColor, initials,
  TABLES, CLIENTS, clientById, TODAY, UPCOMING, ALL_RES, AI_FEED_SEED, AI_FEED_POOL,
});
