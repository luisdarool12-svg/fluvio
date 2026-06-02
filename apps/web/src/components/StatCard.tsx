import { TrendingUp, TrendingDown } from 'lucide-react'
import { RingProgress } from './RingProgress'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: string
  trendDir?: 'up' | 'down' | 'flat'
  sub?: string
  ring?: number
}

export function StatCard({ icon, label, value, trend, trendDir, sub, ring }: StatCardProps) {
  const trendCls = trendDir === 'up' ? 'trend-up' : trendDir === 'down' ? 'trend-down' : 'trend-flat'
  return (
    <div className="stat">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-ico">{icon}</span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="col gap-6">
          <span className="stat-value">{value}</span>
          {trend && (
            <span className={`stat-foot ${trendCls}`}>
              {trendDir === 'up' && <TrendingUp size={15} strokeWidth={2} />}
              {trendDir === 'down' && <TrendingDown size={15} strokeWidth={2} />}
              {trend}
              {sub && <span className="faint" style={{ fontWeight: 500 }}>{sub}</span>}
            </span>
          )}
        </div>
        {ring != null && <RingProgress value={ring} />}
      </div>
    </div>
  )
}
