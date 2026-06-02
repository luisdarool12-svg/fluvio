import type { Reservation, Client, Table, ReservationStatus, ReservationChannel, TableZone, TableTipo, FloorPlanConfig } from './data'

export type { FloorPlanConfig }

function dayLabel(date: Date): string {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  if (d.getTime() === today.getTime()) return 'Hoy'
  if (d.getTime() === tomorrow.getTime()) return 'Mañana'
  if (d.getTime() === yesterday.getTime()) return 'Ayer'
  return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toReservation(row: any): Reservation {
  const fecha = new Date(row.fecha_hora)
  const c = row.customers
  const t = row.tables
  return {
    id: row.id,
    time: fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
    clientId: row.customer_id ?? c?.id ?? '',
    people: row.personas,
    table: t?.nombre ?? '—',
    status: row.estado as ReservationStatus,
    channel: row.canal as ReservationChannel,
    notes: row.notas ?? '',
    date: fecha.toISOString().split('T')[0],
    dayLabel: dayLabel(fecha),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toClient(row: any): Client {
  return {
    id: row.id,
    name: row.nombre,
    phone: row.telefono,
    visits: row.visitas ?? 0,
    last: row.ultima_visita ? row.ultima_visita.split('T')[0] : '—',
    notes: row.notas ?? '',
    tags: (row.visitas ?? 0) >= 5 ? ['VIP'] : [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toTable(row: any): Table {
  return {
    id: row.id,
    name: row.nombre,
    cap: row.capacidad,
    zone: (row.zona ?? 'Interior') as TableZone,
    tipo: (row.tipo ?? 'mesa') as TableTipo,
    active: row.activo,
    posX: row.pos_x ?? 10,
    posY: row.pos_y ?? 10,
    rotation: row.rotation ?? 0,
    ocupadoManual: row.ocupado_manual ?? false,
    personasManual: row.personas_manual ?? 0,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clientFromReservation(row: any): Client | null {
  const c = row.customers
  if (!c) return null
  return toClient(c)
}
