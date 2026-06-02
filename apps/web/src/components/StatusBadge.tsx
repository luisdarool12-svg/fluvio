import type { ReservationStatus } from '@/lib/data'
import { STATUS_MAP } from '@/lib/helpers'

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const s = STATUS_MAP[status]
  if (!s) return null
  return (
    <span className={`badge ${s.cls}`}>
      <span className="dot" />
      {s.label}
    </span>
  )
}
