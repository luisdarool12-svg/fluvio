/* ============================================================
   FLUVIO — Componentes reutilizables
   ============================================================ */

/* Fluvio mark — three flowing wave currents (violet → medium violet → coral).
   variant: 'color' (brand, light bg) · 'mono' (all-white, dark bg per brief). */
function Logo({ size = 26, variant = 'color', mono = false }) {
  const _mono = mono || variant === 'mono';
  const c1 = _mono ? '#FFFFFF' : '#6447F5';
  const c2 = _mono ? '#FFFFFF' : '#9B8CF8';
  const c3 = _mono ? '#FFFFFF' : '#FF6A38';
  return (
    <svg width={size * 1.15} height={size} viewBox="0 0 46 40" fill="none" style={{ flex: 'none' }}>
      <path d="M5 12 C11 7.2 16 7.2 23 11.4 C30 15.6 35 15.6 41 10.6" stroke={c1} strokeWidth="6.2" strokeLinecap="round" />
      <path d="M6 21.4 C11.4 17.2 15.8 17.2 21.6 20.8 C27 24 31 24 36 20.4" stroke={c2} strokeOpacity={_mono ? 0.65 : 1} strokeWidth="5.7" strokeLinecap="round" />
      <path d="M9.5 30.4 C13.6 27 17 27 21.6 29.8 C25.2 32 27.8 32 30.8 29.6" stroke={c3} strokeOpacity={_mono ? 0.9 : 1} strokeWidth="5.4" strokeLinecap="round" />
    </svg>
  );
}

function Wordmark({ size = 26, mono = false }) {
  return (
    <div className="row gap-10">
      <Logo size={size} variant={mono ? 'mono' : 'color'} />
      <span className="display" style={{ fontWeight: 800, fontSize: size * .82, letterSpacing: '.04em', lineHeight: 1, color: mono ? '#fff' : 'var(--violet)' }}>
        FLUVIO
      </span>
    </div>
  );
}

function Avatar({ name, size = 34, src }) {
  const fs = Math.round(size * 0.34);
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: fs }}>
      {initials(name)}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status];
  if (!s) return null;
  return <span className={'badge ' + s.cls}><span className="dot" />{s.label}</span>;
}

function ChannelTag({ channel, showLabel = true }) {
  const c = CHANNEL[channel];
  if (!c) return null;
  return (
    <span className="channel" title={c.label}>
      <Icon name={c.icon} size={14} />
      {showLabel && <span className="hide-sm">{c.label}</span>}
    </span>
  );
}

function VipTag() {
  return <span className="tag-vip"><Icon name="star" size={11} strokeWidth={2.2} />VIP</span>;
}

function RingProgress({ value, size = 56, stroke = 6, color = 'var(--violet)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset .9s var(--ease)' }} />
      </svg>
      <span className="pct">{value}%</span>
    </div>
  );
}

function StatCard({ icon, label, value, trend, trendDir, ring, sub }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-ico"><Icon name={icon} size={18} /></span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="col gap-6">
          <span className="stat-value">{value}</span>
          {trend && (
            <span className={'stat-foot ' + (trendDir === 'up' ? 'trend-up' : trendDir === 'down' ? 'trend-down' : 'trend-flat')}>
              {trendDir !== 'flat' && <Icon name={trendDir === 'up' ? 'trendUp' : 'trendDown'} size={15} strokeWidth={2} />}
              {trend}
              <span className="faint" style={{ fontWeight: 500 }}>{sub}</span>
            </span>
          )}
        </div>
        {ring != null && <RingProgress value={ring} />}
      </div>
    </div>
  );
}

function EmptyState({ icon = 'calcheck', title, body, action }) {
  return (
    <div className="empty">
      <div className="empty-art">
        <svg viewBox="0 0 92 92" fill="none" width="92" height="92">
          <rect x="8" y="14" width="76" height="68" rx="14" fill="var(--surface-2)" stroke="var(--line-2)" strokeWidth="1.5" />
          <rect x="8" y="14" width="76" height="20" rx="14" fill="var(--surface-3)" />
          <path d="M8 28h76" stroke="var(--line-2)" strokeWidth="1.5" />
          <rect x="29" y="8" width="4" height="12" rx="2" fill="var(--ink-4)" />
          <rect x="59" y="8" width="4" height="12" rx="2" fill="var(--ink-4)" />
          <circle cx="46" cy="56" r="15" fill="var(--violet-light)" stroke="var(--violet)" strokeWidth="1.5" />
          <path d="M40 56l4.2 4.2L53 51" stroke="var(--violet)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <h3 style={{ fontSize: 18 }}>{title}</h3>
      <p className="muted" style={{ maxWidth: 320, fontSize: 14 }}>{body}</p>
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}

/* ---------------- Quick actions (row) ---------------- */
function QuickActions({ res, onAction }) {
  const acts = [];
  if (res.status === 'pendiente') acts.push({ k: 'confirmar', icon: 'check', title: 'Confirmar', cls: 'btn-soft' });
  if (res.status === 'confirmada') acts.push({ k: 'sentar', icon: 'seat', title: 'Sentar', cls: 'btn-soft' });
  if (res.status !== 'no_show' && res.status !== 'cancelada' && res.status !== 'sentada')
    acts.push({ k: 'no_show', icon: 'x', title: 'No-show', cls: 'btn-subtle' });
  acts.push({ k: 'edit', icon: 'more', title: 'Más', cls: 'btn-subtle' });
  return (
    <div className="row-actions">
      {acts.map(a => (
        <button key={a.k} className={'btn btn-sm btn-icon ' + a.cls} title={a.title}
          onClick={(e) => { e.stopPropagation(); onAction(res.id, a.k); }}>
          <Icon name={a.icon} size={15} />
        </button>
      ))}
    </div>
  );
}

/* ---------------- Reservation row (table) ---------------- */
function ReservationRow({ res, onAction, onOpen }) {
  const cl = clientById(res.clientId);
  return (
    <tr style={{ cursor: 'pointer' }} onClick={() => onOpen && onOpen(res)}>
      <td style={{ width: 76 }}>
        <span className="display" style={{ fontWeight: 600, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>{res.time}</span>
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
      <td className="hide-sm"><span className="mono-num" style={{ fontWeight: 500 }}>{res.people}</span> <span className="faint">pers.</span></td>
      <td className="hide-sm"><span className="muted">{res.table}</span></td>
      <td className="hide-sm"><ChannelTag channel={res.channel} showLabel={false} /></td>
      <td><StatusBadge status={res.status} /></td>
      <td style={{ width: 150 }}><QuickActions res={res} onAction={onAction} /></td>
    </tr>
  );
}

/* ---------------- Page header ---------------- */
function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
      <div className="col gap-4">
        <h1 style={{ fontSize: 27 }}>{title}</h1>
        {subtitle && <p className="muted" style={{ fontSize: 14.5 }}>{subtitle}</p>}
      </div>
      {actions && <div className="row gap-10">{actions}</div>}
    </div>
  );
}

/* ---------------- Section card header ---------------- */
function SectionHead({ title, count, right }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: '16px 18px 14px', borderBottom: '1px solid var(--line)' }}>
      <div className="row gap-8">
        <h3 style={{ fontSize: 16.5 }}>{title}</h3>
        {count != null && <span className="chip" style={{ height: 22, fontSize: 12 }}>{count}</span>}
      </div>
      {right}
    </div>
  );
}

/* ---------------- Modal scrim wrapper ---------------- */
function Scrim({ onClose, children }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      {children}
    </>
  );
}

Object.assign(window, {
  Logo, Wordmark, Avatar, StatusBadge, ChannelTag, VipTag, RingProgress,
  StatCard, EmptyState, QuickActions, ReservationRow, PageHeader, SectionHead, Scrim,
});
