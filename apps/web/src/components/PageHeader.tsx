interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
      <div className="col gap-4">
        <h1 style={{ fontSize: 27 }}>{title}</h1>
        {subtitle && <p className="muted" style={{ fontSize: 14.5 }}>{subtitle}</p>}
      </div>
      {actions && <div className="row gap-10">{actions}</div>}
    </div>
  )
}
