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
        <span className="mono-num" style={{ fontWeight: 500 }}>{res.people}</span>{' '}
        <span className="faint">pers.</span>
      </td>
      <td className="hide-sm"><span className="muted">{res.table}</span></td>
      <td className="hide-sm"><ChannelTag channel={res.channel} showLabel={false} /></td>
      <td><StatusBadge status={res.status} /></td>
      <td style={{ width: 150 }}><QuickActions res={res} onAction={onAction} /></td>
    </tr>
  )
}
