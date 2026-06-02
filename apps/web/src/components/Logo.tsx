interface LogoProps {
  size?: number
  mono?: boolean
}

export function Logo({ size = 26, mono = false }: LogoProps) {
  const c = mono ? 'currentColor' : 'var(--accent)'
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flex: 'none' }}>
      <rect width="32" height="32" rx="8.5" fill={c} />
      <path d="M10 9.5h12M10 16h9M10 22.5h6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="22.5" cy="22.5" r="2.1" fill="#fff" />
    </svg>
  )
}

interface WordmarkProps {
  size?: number
  business?: string
}

export function Wordmark({ size = 26, business }: WordmarkProps) {
  return (
    <div className="row gap-10">
      <Logo size={size} />
      <div className="col" style={{ gap: 0 }}>
        <span className="display" style={{ fontWeight: 700, fontSize: size * 0.72, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {business || 'Fluvio'}
        </span>
        {business && (
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500, marginTop: 2 }}>
            vía Fluvio
          </span>
        )}
      </div>
    </div>
  )
}
