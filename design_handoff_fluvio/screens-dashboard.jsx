/* ============================================================
   FLUVIO — Dashboard (3 variaciones + feed IA en vivo)
   ============================================================ */

function GreetHeader({ onNewRes }) {
  const hour = 9;
  const greet = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
      <div className="col gap-4">
        <span className="row gap-8 faint" style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap' }}>
          <Icon name="calendar" size={15} /> Sábado, 30 de mayo · 2026
        </span>
        <h1 style={{ fontSize: 30 }}>{greet}, Luis <span style={{ color: 'var(--accent)' }}>👋</span></h1>
        <p className="muted" style={{ fontSize: 14.5 }}>Tienes <b style={{ color: 'var(--ink)' }}>10 reservas</b> para hoy y <b style={{ color: 'var(--ink)' }}>3 pendientes</b> por confirmar.</p>
      </div>
      <button className="btn btn-primary btn-lg hide-sm" onClick={onNewRes}><Icon name="plus" size={18} /> Nueva reservación</button>
    </div>
  );
}

function MetricsRow() {
  return (
    <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 22 }}>
      <StatCard icon="calcheck" label="Reservas hoy" value="10" trend="+18%" trendDir="up" sub="vs. ayer" />
      <StatCard icon="check2" label="Confirmadas" value="" ring={70} />
      <StatCard icon="x" label="No-shows del mes" value="4" trend="−61%" trendDir="up" sub="vs. abril" />
      <StatCard icon="userplus" label="Clientes nuevos" value="12" trend="esta semana" trendDir="flat" />
    </div>
  );
}

function MetricsStrip() {
  const items = [
    { icon: 'calcheck', label: 'Reservas hoy', value: '10', t: '+18%', d: 'up' },
    { icon: 'check2', label: 'Confirmadas', value: '70%', t: '7 de 10', d: 'flat' },
    { icon: 'x', label: 'No-shows mes', value: '4', t: '−61%', d: 'up' },
    { icon: 'userplus', label: 'Nuevos', value: '12', t: 'semana', d: 'flat' },
  ];
  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18, overflow: 'hidden' }}>
      {items.map((m, i) => (
        <div key={m.label} className="row gap-12" style={{ padding: '15px 18px', borderLeft: i ? '1px solid var(--line)' : 'none' }}>
          <span className="stat-ico"><Icon name={m.icon} size={18} /></span>
          <div className="col" style={{ gap: 1 }}>
            <span className="row gap-6" style={{ alignItems: 'baseline' }}>
              <span className="display" style={{ fontSize: 23, fontWeight: 600, letterSpacing: '-0.02em' }}>{m.value}</span>
              <span className={'stat-foot ' + (m.d === 'up' ? 'trend-up' : 'trend-flat')} style={{ fontSize: 12 }}>{m.t}</span>
            </span>
            <span className="stat-label" style={{ fontSize: 12.5 }}>{m.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- AI feed (live) ---- */
const FEED_KIND = {
  new: { ico: 'whatsapp', color: '#25D366', label: 'Nueva reserva' },
  confirm: { ico: 'check', color: 'var(--st-conf)', label: 'Confirmada' },
  remind: { ico: 'bell', color: 'var(--st-pend)', label: 'Recordatorio' },
  chat: { ico: 'message', color: 'var(--st-seat)', label: 'Consulta' },
};

function AIFeedPanel({ feed, compact }) {
  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="row" style={{ justifyContent: 'space-between', padding: '15px 18px 13px', borderBottom: '1px solid var(--line)' }}>
        <div className="row gap-10">
          <div className="wa-ico"><Icon name="whatsapp" size={17} /></div>
          <div className="col" style={{ gap: 0 }}>
            <span className="row gap-6" style={{ fontWeight: 600, fontSize: 15 }}>Bot de WhatsApp</span>
            <span className="row gap-6 faint" style={{ fontSize: 12 }}><span className="ai-pulse" /> Activo · responde 24/7</span>
          </div>
        </div>
        <span className="chip" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)', fontWeight: 600, fontSize: 12 }}>
          <Icon name="sparkles" size={13} /> IA
        </span>
      </div>
      <div style={{ padding: '4px 18px', maxHeight: compact ? 'none' : 360, overflowY: 'auto', flex: 1 }}>
        {feed.map((f, i) => {
          const k = FEED_KIND[f.kind];
          return (
            <div className="feed-item" key={f.id}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', flex: 'none', color: k.color }}>
                <Icon name={k.ico} size={16} />
              </div>
              <div className="col" style={{ gap: 2, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 13.5, lineHeight: 1.4 }}><b>{f.who}</b> <span className="muted">{f.msg}</span></span>
                <span className="row gap-8 faint" style={{ fontSize: 11.5 }}>
                  <span style={{ color: k.color, fontWeight: 600 }}>{k.label}</span> · {f.t}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)' }}>
        <button className="btn btn-soft btn-sm btn-block"><Icon name="history" size={15} /> Ver toda la actividad</button>
      </div>
    </div>
  );
}

/* ---- Upcoming ---- */
function UpcomingPanel({ onNav }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <SectionHead title="Próximas reservas" right={<a className="row gap-2" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-ink)' }} onClick={() => onNav('reservaciones')}>Ver todas <Icon name="chevronRight" size={14} /></a>} />
      <div className="col" style={{ padding: '6px 0' }}>
        {UPCOMING.map(g => (
          <div key={g.id}>
            <div className="row gap-8" style={{ padding: '10px 18px 6px' }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)' }}>{g.day}</span>
              <span className="faint" style={{ fontSize: 12 }}>· {g.date}</span>
            </div>
            {g.items.map((it, i) => {
              const cl = clientById(it.clientId);
              return (
                <div className="row gap-10" key={i} style={{ padding: '8px 18px' }}>
                  <span className="display" style={{ fontWeight: 600, fontSize: 13.5, width: 42, fontVariantNumeric: 'tabular-nums' }}>{it.time}</span>
                  <Avatar name={cl.name} size={28} />
                  <div className="col" style={{ gap: 0, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cl.name}</span>
                    <span className="faint" style={{ fontSize: 11.5 }}>{it.people} personas</span>
                  </div>
                  <StatusBadge status={it.status} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Today as table ---- */
function TodayTable({ reservations, onAction, onOpen, onNewRes }) {
  const today = reservations.filter(r => r.dayLabel === 'Hoy');
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <SectionHead title="Reservas de hoy" count={today.length}
        right={
          <div className="seg">
            <button className="on">Todas</button>
            <button>Comida</button>
            <button>Cena</button>
          </div>
        } />
      {today.length === 0 ? (
        <EmptyState title="Sin reservas hoy" body="Cuando el bot agende reservas, aparecerán aquí en tiempo real." action={<button className="btn btn-primary btn-sm" onClick={onNewRes}><Icon name="plus" size={15} /> Nueva reservación</button>} />
      ) : (
        <table className="tbl">
          <thead><tr>
            <th>Hora</th><th>Cliente</th><th className="hide-sm">Pers.</th><th className="hide-sm">Mesa</th><th className="hide-sm">Canal</th><th>Estado</th><th></th>
          </tr></thead>
          <tbody>
            {today.map(r => <ReservationRow key={r.id} res={r} onAction={onAction} onOpen={onOpen} />)}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ---- Today as timeline ---- */
function TodayTimeline({ reservations, onAction, onOpen }) {
  const today = reservations.filter(r => r.dayLabel === 'Hoy');
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <SectionHead title="Agenda de hoy" count={today.length} />
      <div style={{ padding: '14px 18px 18px' }}>
        {today.map((r, i) => {
          const cl = clientById(r.clientId);
          return (
            <div className="tl-row" key={r.id}>
              <div className="tl-time">{r.time}</div>
              <div className="tl-track">
                <div className="tl-dot" style={{ borderColor: `var(--st-${r.status === 'no_show' ? 'no' : r.status === 'pendiente' ? 'pend' : r.status === 'sentada' ? 'seat' : r.status === 'cancelada' ? 'canc' : 'conf'}-dot)` }} />
                <div className="card" onClick={() => onOpen(r)} style={{ padding: '11px 13px', marginBottom: 12, cursor: 'pointer', boxShadow: 'none', background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                  <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
                    <div className="row gap-10" style={{ minWidth: 0 }}>
                      <Avatar name={cl.name} size={32} />
                      <div className="col" style={{ gap: 1, minWidth: 0 }}>
                        <span className="row gap-6" style={{ fontWeight: 600, fontSize: 14 }}>{cl.name} {cl.tags.includes('VIP') && <VipTag />}</span>
                        <span className="row gap-8 faint" style={{ fontSize: 12 }}>
                          <span className="mono-num">{r.people} pers.</span> · {r.table} · <ChannelTag channel={r.channel} showLabel={false} />
                        </span>
                      </div>
                    </div>
                    <div className="col gap-8" style={{ alignItems: 'flex-end' }}>
                      <StatusBadge status={r.status} />
                      <QuickActions res={r} onAction={onAction} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD — main, switches by layout tweak
   ============================================================ */
function Dashboard({ reservations, onAction, onOpen, onNewRes, onNav, layout, feed }) {
  return (
    <div className="page page-enter">
      <GreetHeader onNewRes={onNewRes} />

      {layout === 'focus' ? (
        <>
          <MetricsStrip />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }} className="dash-grid">
            <TodayTimeline reservations={reservations} onAction={onAction} onOpen={onOpen} />
            <div className="col gap-18" style={{ position: 'sticky', top: 84 }}>
              <AIFeedPanel feed={feed} />
              <UpcomingPanel onNav={onNav} />
            </div>
          </div>
        </>
      ) : layout === 'timeline' ? (
        <>
          <MetricsRow />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }} className="dash-grid">
            <TodayTimeline reservations={reservations} onAction={onAction} onOpen={onOpen} />
            <div className="col gap-18">
              <UpcomingPanel onNav={onNav} />
              <AIFeedPanel feed={feed} />
            </div>
          </div>
        </>
      ) : (
        <>
          <MetricsRow />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }} className="dash-grid">
            <TodayTable reservations={reservations} onAction={onAction} onOpen={onOpen} onNewRes={onNewRes} />
            <div className="col gap-18">
              <AIFeedPanel feed={feed} />
              <UpcomingPanel onNav={onNav} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { Dashboard });
