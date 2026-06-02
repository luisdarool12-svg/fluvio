interface SectionHeadProps {
  title: string
  count?: number
  right?: React.ReactNode
}

export function SectionHead({ title, count, right }: SectionHeadProps) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: '16px 18px 14px', borderBottom: '1px solid var(--line)' }}>
      <div className="row gap-8">
        <h3 style={{ fontSize: 16.5 }}>{title}</h3>
        {count != null && <span className="chip" style={{ height: 22, fontSize: 12 }}>{count}</span>}
      </div>
      {right}
    </div>
  )
}
