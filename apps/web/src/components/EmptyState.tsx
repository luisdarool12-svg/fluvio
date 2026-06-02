interface EmptyStateProps {
  title: string
  body: string
  action?: React.ReactNode
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty-art">
        <svg viewBox="0 0 92 92" fill="none" width="92" height="92">
          <rect x="8" y="14" width="76" height="68" rx="14" fill="var(--surface-2)" stroke="var(--line-2)" strokeWidth="1.5" />
          <rect x="8" y="14" width="76" height="20" rx="14" fill="var(--surface-3)" />
          <path d="M8 28h76" stroke="var(--line-2)" strokeWidth="1.5" />
          <rect x="29" y="8" width="4" height="12" rx="2" fill="var(--ink-4)" />
          <rect x="59" y="8" width="4" height="12" rx="2" fill="var(--ink-4)" />
          <circle cx="46" cy="56" r="15" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M40 56l4.2 4.2L53 51" stroke="var(--accent)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <h3 style={{ fontSize: 18 }}>{title}</h3>
      <p className="muted" style={{ maxWidth: 320, fontSize: 14 }}>{body}</p>
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  )
}
