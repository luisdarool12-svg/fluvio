import type { ReservationStatus, ReservationChannel } from './data'

export const AVATAR_COLORS = [
  '#4A7C59','#B0662C','#3568A0','#9C5A8C','#5C6BC0',
  '#3E7C8A','#A8553E','#6B8E4E','#8A6FB0','#C08A2A',
]

export function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase()
}

export const STATUS_MAP: Record<ReservationStatus, { label: string; cls: string }> = {
  pendiente:  { label: 'Pendiente',  cls: 'badge-pend' },
  confirmada: { label: 'Confirmada', cls: 'badge-conf' },
  sentada:    { label: 'Sentada',    cls: 'badge-seat' },
  no_show:    { label: 'No-show',    cls: 'badge-no'   },
  cancelada:  { label: 'Cancelada',  cls: 'badge-canc' },
}

export const CHANNEL_MAP: Record<ReservationChannel, { label: string }> = {
  whatsapp: { label: 'WhatsApp' },
  web:      { label: 'Web'      },
  telefono: { label: 'Teléfono' },
  manual:   { label: 'Manual'   },
}

export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === '—') return '—'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
