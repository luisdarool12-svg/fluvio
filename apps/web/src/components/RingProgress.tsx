interface RingProgressProps {
  value: number
  size?: number
  stroke?: number
  color?: string
}

export function RingProgress({ value, size = 56, stroke = 6, color = 'var(--accent)' }: RingProgressProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - value / 100)
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .9s var(--ease)' }}
        />
      </svg>
      <span className="pct">{value}%</span>
    </div>
  )
}
