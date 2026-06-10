import React from 'react';

/**
 * Fluvio StatCard — a KPI metric tile. Uppercase label, large Syne number,
 * optional trend delta, optional progress ring. Icon in a violet-light chip.
 */
export function StatCard({ icon, label, value, trend, trendDir = 'flat', ring, className = '', ...rest }) {
  const trendClass = trendDir === 'up' ? 'trend-up' : trendDir === 'down' ? 'trend-down' : '';
  const trendColor = trendDir === 'flat' ? 'var(--ink-3)' : undefined;
  return (
    <div className={['stat', className].filter(Boolean).join(' ')} {...rest}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-ico">{icon}</span>}
      </div>
      {ring != null ? (
        <Ring value={ring} />
      ) : (
        <div className="stat-value">{value}</div>
      )}
      {trend && (
        <div className={['stat-foot', trendClass].filter(Boolean).join(' ')} style={trendColor ? { color: trendColor } : undefined}>
          {trend}
        </div>
      )}
    </div>
  );
}

function Ring({ value = 0, size = 56 }) {
  const r = (size - 7) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--violet)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)',
      }}>{value}%</span>
    </div>
  );
}
