export type ReservationStatus = 'pendiente' | 'confirmada' | 'sentada' | 'no_show' | 'cancelada'
export type ReservationChannel = 'whatsapp' | 'web' | 'telefono' | 'manual'
export type TableZone = 'Terraza' | 'Interior' | 'Barra'
export type TableTipo = 'mesa' | 'booth'

export interface Table {
  id: string
  name: string
  cap: number
  zone: TableZone
  tipo: TableTipo
  active: boolean
  posX: number
  posY: number
  rotation: number
  ocupadoManual: boolean
  personasManual: number
}

export interface ZoneArea {
  id: string
  label: string
  color: string
  x: number
  y: number
  w: number
  h: number
}

export interface Wall {
  id: string
  x: number
  y: number
  len: number
  dir: 'h' | 'v'
}

export interface FurnitureItem {
  id: string
  tipo: 'sofa' | 'barra_fija' | 'planta'
  label: string
  x: number
  y: number
  w: number
  h: number
}

export interface FloorPlanConfig {
  zones: ZoneArea[]
  walls: Wall[]
  furniture: FurnitureItem[]
}

export interface Client {
  id: string
  name: string
  phone: string
  visits: number
  last: string
  notes: string
  tags: string[]
}

export interface Reservation {
  id: string
  time: string
  clientId: string
  people: number
  table: string
  status: ReservationStatus
  channel: ReservationChannel
  notes: string
  date?: string
  dayLabel?: string
}

export interface FeedEvent {
  id: string
  t: string
  who: string
  msg: string
  kind: 'new' | 'confirm' | 'remind' | 'chat'
}

export const TABLES: Table[] = [
  { id: 't1', name: 'Mesa 1',  cap: 2,  zone: 'Terraza',  tipo: 'mesa', active: true,  posX: 15, posY: 15, rotation: 0, ocupadoManual: false, personasManual: 0 },
  { id: 't2', name: 'Mesa 2',  cap: 2,  zone: 'Terraza',  tipo: 'mesa', active: true,  posX: 30, posY: 15, rotation: 0, ocupadoManual: false, personasManual: 0 },
  { id: 't3', name: 'Mesa 3',  cap: 4,  zone: 'Terraza',  tipo: 'mesa', active: true,  posX: 50, posY: 15, rotation: 0, ocupadoManual: false, personasManual: 0 },
  { id: 't4', name: 'Mesa 4',  cap: 4,  zone: 'Interior', tipo: 'mesa', active: true,  posX: 25, posY: 45, rotation: 0, ocupadoManual: false, personasManual: 0 },
  { id: 't5', name: 'Mesa 5',  cap: 6,  zone: 'Interior', tipo: 'mesa', active: true,  posX: 50, posY: 45, rotation: 0, ocupadoManual: false, personasManual: 0 },
  { id: 't6', name: 'Mesa 6',  cap: 4,  zone: 'Interior', tipo: 'mesa', active: true,  posX: 72, posY: 45, rotation: 0, ocupadoManual: false, personasManual: 0 },
  { id: 't7', name: 'Mesa 7',  cap: 8,  zone: 'Interior', tipo: 'mesa', active: false, posX: 72, posY: 70, rotation: 0, ocupadoManual: false, personasManual: 0 },
  { id: 'b1', name: 'Barra 1', cap: 1,  zone: 'Barra',    tipo: 'mesa', active: true,  posX: 88, posY: 50, rotation: 0, ocupadoManual: false, personasManual: 0 },
  { id: 'b2', name: 'Barra 2', cap: 1,  zone: 'Barra',    tipo: 'mesa', active: true,  posX: 88, posY: 62, rotation: 0, ocupadoManual: false, personasManual: 0 },
  { id: 'p1', name: 'Privado', cap: 12, zone: 'Interior', tipo: 'mesa', active: true,  posX: 50, posY: 75, rotation: 0, ocupadoManual: false, personasManual: 0 },
]

export const CLIENTS: Client[] = [
  { id: 'c1',  name: 'María Fernanda Ríos', phone: '+52 55 1843 2290', visits: 9,  last: '2026-05-22', notes: 'Alérgica a mariscos · prefiere terraza', tags: ['VIP'] },
  { id: 'c2',  name: 'Andrés Lozano',       phone: '+52 55 2901 7733', visits: 6,  last: '2026-05-18', notes: 'Cumpleaños en junio',                   tags: ['VIP'] },
  { id: 'c3',  name: 'Sofía Mendoza',       phone: '+52 55 3320 1188', visits: 3,  last: '2026-05-09', notes: '',                                       tags: [] },
  { id: 'c4',  name: 'Diego Navarro',       phone: '+52 55 7781 5540', visits: 12, last: '2026-05-25', notes: 'Cliente frecuente · vino tinto',          tags: ['VIP'] },
  { id: 'c5',  name: 'Valeria Castro',      phone: '+52 55 4408 9912', visits: 2,  last: '2026-04-30', notes: '',                                       tags: [] },
  { id: 'c6',  name: 'Ricardo Beltrán',     phone: '+52 55 6650 3321', visits: 1,  last: '2026-05-28', notes: 'Primera visita',                         tags: ['Nuevo'] },
  { id: 'c7',  name: 'Camila Ortiz',        phone: '+52 55 9912 4408', visits: 5,  last: '2026-05-15', notes: 'Mesa tranquila',                         tags: ['VIP'] },
  { id: 'c8',  name: 'Jorge Ramírez',       phone: '+52 55 1120 8876', visits: 4,  last: '2026-05-11', notes: '',                                       tags: [] },
  { id: 'c9',  name: 'Paola Guzmán',        phone: '+52 55 5567 2204', visits: 0,  last: '—',          notes: 'Reserva futura',                         tags: ['Nuevo'] },
  { id: 'c10', name: 'Emilio Vargas',       phone: '+52 55 3344 1190', visits: 7,  last: '2026-05-20', notes: 'Negocios · factura',                     tags: ['VIP'] },
]

export function clientById(id: string): Client | undefined {
  return CLIENTS.find(c => c.id === id)
}

export const TODAY: Reservation[] = [
  { id: 'r1',  time: '13:00', clientId: 'c3',  people: 2, table: 'Mesa 2',  status: 'confirmada', channel: 'whatsapp', notes: '' },
  { id: 'r2',  time: '13:30', clientId: 'c5',  people: 4, table: 'Mesa 4',  status: 'confirmada', channel: 'web',      notes: '' },
  { id: 'r3',  time: '14:00', clientId: 'c1',  people: 2, table: 'Mesa 1',  status: 'sentada',    channel: 'whatsapp', notes: 'Alérgica a mariscos' },
  { id: 'r4',  time: '14:00', clientId: 'c8',  people: 6, table: 'Mesa 5',  status: 'pendiente',  channel: 'telefono', notes: '' },
  { id: 'r5',  time: '14:30', clientId: 'c6',  people: 2, table: '—',       status: 'pendiente',  channel: 'whatsapp', notes: 'Primera visita' },
  { id: 'r6',  time: '15:00', clientId: 'c4',  people: 4, table: 'Mesa 6',  status: 'confirmada', channel: 'whatsapp', notes: 'Vino tinto reservado' },
  { id: 'r7',  time: '20:00', clientId: 'c2',  people: 8, table: 'Privado', status: 'confirmada', channel: 'manual',   notes: 'Cena de negocios' },
  { id: 'r8',  time: '20:30', clientId: 'c7',  people: 2, table: 'Mesa 3',  status: 'pendiente',  channel: 'web',      notes: '' },
  { id: 'r9',  time: '21:00', clientId: 'c10', people: 5, table: 'Mesa 5',  status: 'confirmada', channel: 'whatsapp', notes: '' },
  { id: 'r10', time: '21:30', clientId: 'c5',  people: 3, table: '—',       status: 'no_show',    channel: 'web',      notes: '' },
]

export const UPCOMING = [
  { id: 'u1', day: 'Mañana',         date: 'Dom 31 may', items: [
    { time: '13:30', clientId: 'c1', people: 4, status: 'confirmada' as ReservationStatus, channel: 'whatsapp' as ReservationChannel },
    { time: '14:00', clientId: 'c9', people: 2, status: 'confirmada' as ReservationStatus, channel: 'whatsapp' as ReservationChannel },
    { time: '20:00', clientId: 'c4', people: 6, status: 'pendiente'  as ReservationStatus, channel: 'web'      as ReservationChannel },
  ]},
  { id: 'u2', day: 'Pasado mañana',  date: 'Lun 1 jun', items: [
    { time: '14:00', clientId: 'c2', people: 2, status: 'confirmada' as ReservationStatus, channel: 'telefono' as ReservationChannel },
    { time: '21:00', clientId: 'c7', people: 8, status: 'confirmada' as ReservationStatus, channel: 'whatsapp' as ReservationChannel },
  ]},
]

export const ALL_RES: Reservation[] = [
  ...TODAY.map(r => ({ ...r, date: '2026-05-30', dayLabel: 'Hoy' })),
  ...UPCOMING.flatMap(g => g.items.map((it, i) => ({
    id: g.id + i, ...it,
    table: '—', notes: '',
    date: g.id === 'u1' ? '2026-05-31' : '2026-06-01',
    dayLabel: g.day,
  }))),
  { id: 'p1r', time: '14:30', clientId: 'c4',  people: 4, table: 'Mesa 6',  status: 'sentada'   as ReservationStatus, channel: 'whatsapp' as ReservationChannel, date: '2026-05-29', dayLabel: 'Ayer',   notes: '' },
  { id: 'p2r', time: '20:00', clientId: 'c10', people: 2, table: 'Mesa 3',  status: 'no_show'   as ReservationStatus, channel: 'web'      as ReservationChannel, date: '2026-05-29', dayLabel: 'Ayer',   notes: '' },
  { id: 'p3r', time: '21:00', clientId: 'c1',  people: 6, table: 'Privado', status: 'cancelada' as ReservationStatus, channel: 'whatsapp' as ReservationChannel, date: '2026-05-28', dayLabel: '28 may', notes: '' },
  { id: 'p4r', time: '13:00', clientId: 'c8',  people: 2, table: 'Mesa 1',  status: 'sentada'   as ReservationStatus, channel: 'telefono' as ReservationChannel, date: '2026-05-28', dayLabel: '28 may', notes: '' },
]

export const AI_FEED_SEED: FeedEvent[] = [
  { id: 'f1', t: 'Ahora',       who: 'Sofía Mendoza',  msg: 'reservó mesa para 2 a las 13:00',            kind: 'new' },
  { id: 'f2', t: 'hace 4 min',  who: 'Ricardo Beltrán', msg: 'confirmó su asistencia para hoy 14:30',      kind: 'confirm' },
  { id: 'f3', t: 'hace 12 min', who: 'Diego Navarro',   msg: 'recibió recordatorio anti no-show',          kind: 'remind' },
  { id: 'f4', t: 'hace 26 min', who: 'Camila Ortiz',    msg: 'preguntó por disponibilidad de terraza',     kind: 'chat' },
]

export const AI_FEED_POOL: Omit<FeedEvent, 'id' | 't'>[] = [
  { who: 'Laura Beristáin', msg: 'reservó mesa para 4 a las 21:00',      kind: 'new' },
  { who: 'Tomás Quirós',    msg: 'confirmó su reservación de mañana',    kind: 'confirm' },
  { who: 'Fernanda Ruiz',   msg: 'recibió recordatorio anti no-show',    kind: 'remind' },
  { who: 'Mateo Salas',     msg: 'reagendó su reserva para el sábado',   kind: 'chat' },
  { who: 'Lucía Paredes',   msg: 'reservó mesa para 2 en barra',         kind: 'new' },
]
