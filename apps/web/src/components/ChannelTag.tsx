import { MessageCircle, Globe, Phone, PenLine } from 'lucide-react'
import type { ReservationChannel } from '@/lib/data'

const icons: Record<ReservationChannel, React.ReactNode> = {
  whatsapp: <MessageCircle size={14} />,
  web:      <Globe size={14} />,
  telefono: <Phone size={14} />,
  manual:   <PenLine size={14} />,
}

const labels: Record<ReservationChannel, string> = {
  whatsapp: 'WhatsApp',
  web:      'Web',
  telefono: 'Teléfono',
  manual:   'Manual',
}

export function ChannelTag({ channel, showLabel = true }: { channel: ReservationChannel; showLabel?: boolean }) {
  return (
    <span className="channel" title={labels[channel]}>
      {icons[channel]}
      {showLabel && <span className="hide-sm">{labels[channel]}</span>}
    </span>
  )
}
