'use client'
import type { Reservation, Client } from '@/lib/data'
import { clientById } from '@/lib/data'
import { Avatar } from './Avatar'
import { StatusBadge } from './StatusBadge'
import { ChannelTag } from './ChannelTag'
import { VipTag } from './VipTag'
import { QuickActions } from './QuickActions'

interface ReservationRowProps {
  res: Reservation
  client?: Client
  onAction: (id: string, action: string) => void
  onOpen?: (res: Reservation) => void
}

const ZONA_COLORS: Record<string, string> = {
  terraza: '#0891b2',
  interior: '#7c3aed',
  barra:    '#b45309',
}

function zonaColor(zona: string): string {
  return ZONA_COLORS[zona.toLowerCase()] ?? '#6b7280'
}

export function ReservationRow({ res, client: clientProp, onAction, onOpen }: ReservationRowProps) {
  const cl = clientProp ?? clientById(res.clientId)
  if (!cl) return null
  return (
    <tr style={{ cursor: 'pointer' }} onClick={() => onOpen?.(res)}>
      <td style={{ width: 76 }}>
        <span className="display" style={{ fontWeight: 600, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
          {res.time}
        </span>
      </td>
      <td>
        <div className="row gap-10">
          <Avatar name={cl.name} size={32} />
          <div className="col" style={{ gap: 1, minWidth: 0 }}>
            <span className="row gap-6" style={{ fontWeight: 600, fontSize: 14 }}>
              {cl.name}{cl.tags.includes('VIP') && <VipTag />}
            </span>
            <span className="faint" style={{ fontSize: 12.5 }}>{cl.phone}</span>
          </div>
        </div>
      </td>
      <td className="hide-sm">
        <span className="faint" style={{ fontSize: 13 }}>{res.dayLabel ?? '—'}</span>
      </td>
      <td className="hide-sm">
        <span className="mono-num" style={{ fontWeight: 500 }}>{res.people}</span>{' '}
        <span className="faint">pers.</span>
      </td>
      <td className="hide-sm">
        <div className="col" style={{ gap: 2 }}>
          <span className="muted">{res.table}</span>
          {res.zona && (
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
              color: zonaColor(res.zona), textTransform: 'capitalize',
            }}>
              {res.zona}
            </span>
          )}
        </div>
      </td>
      <td className="hide-sm"><ChannelTag channel={res.channel} showLabel={false} /></td>
      <td>
        <div className="col" style={{ gap: 3, alignItems: 'flex-start' }}>
          <StatusBadge status={res.status} />
          {(res.reminderSent || res.confirmationSent) && (
            <div className="row gap-4" style={{ marginTop: 2 }}>
              {res.reminderSent && (
                <span title="Recordatorio enviado" style={{ fontSize: 10, color: '#16a34a', fontWeight: 600, letterSpacing: '0.02em' }}>
                  ✓ rec.
                </span>
              )}
              {res.confirmationSent && (
                <span title="Confirmación enviada" style={{ fontSize: 10, color: '#2563eb', fontWeight: 600, letterSpacing: '0.02em' }}>
                  ✓ conf.
                </span>
              )}
            </div>
          )}
        </div>
      </td>
      <td style={{ width: 150 }}><QuickActions res={res} onAction={onAction} /></td>
    </tr>
  )
}
