import type { ReservationEstado } from '../types'

export const ESTADOS_ACTIVOS: ReservationEstado[] = ['pendiente', 'confirmada', 'sentada']
export const ESTADOS_FINALES: ReservationEstado[] = ['no_show', 'cancelada']

export function isReservationActive(estado: ReservationEstado): boolean {
  return ESTADOS_ACTIVOS.includes(estado)
}

export function canSendReminder(
  fechaHora: Date,
  recordatorio24h: boolean,
  recordatorio2h: boolean,
  now = new Date(),
): { send24h: boolean; send2h: boolean } {
  const msUntil = fechaHora.getTime() - now.getTime()
  const hoursUntil = msUntil / (1000 * 60 * 60)

  return {
    send24h: !recordatorio24h && hoursUntil <= 24 && hoursUntil > 2,
    send2h: !recordatorio2h && hoursUntil <= 2 && hoursUntil > 0,
  }
}

export function formatReservationSummary(params: {
  customerName: string
  fecha_hora: string
  personas: number
  tableName?: string
}): string {
  const fecha = new Date(params.fecha_hora)
  const fechaStr = fecha.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const horaStr = fecha.toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  })

  let msg = `Reservación confirmada para ${params.customerName}:\n`
  msg += `📅 ${fechaStr} a las ${horaStr}\n`
  msg += `👥 ${params.personas} persona${params.personas > 1 ? 's' : ''}`
  if (params.tableName) msg += `\n🪑 ${params.tableName}`
  return msg
}
