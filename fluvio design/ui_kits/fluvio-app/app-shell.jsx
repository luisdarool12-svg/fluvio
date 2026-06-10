/* ============================================================
   FLUVIO — App shell: Sidebar + Topbar
   ============================================================ */

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'reservaciones', label: 'Reservaciones', icon: 'calendar', count: 10 },
  { key: 'clientes', label: 'Clientes', icon: 'users' },
  { key: 'mesas', label: 'Mesas', icon: 'tables' },
  { key: 'configuracion', label: 'Configuración', icon: 'settings' },
];

function Sidebar({ route, onNav, business, open, onClose }) {
  return (
    <>
      <div className={'sb-backdrop' + (open ? ' show' : '')} onClick={onClose} />
      <aside className={'sidebar' + (open ? ' open' : '')}>
        <div className="sb-brand">
          <Logo size={30} mono />
          <div className="col" style={{ gap: 1, minWidth: 0 }}>
            <span className="display" style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{business}</span>
            <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500 }}>vía Fluvio</span>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-section-label">Operación</div>
          {NAV.map(n => (
            <div key={n.key} className={'nav-item' + (route === n.key ? ' active' : '')}
              onClick={() => { onNav(n.key); onClose(); }}>
              <Icon name={n.icon} size={18} />
              <span>{n.label}</span>
              {n.count != null && <span className="nav-count">{n.count}</span>}
            </div>
          ))}
        </nav>

        <div className="sb-foot">
          <div className="plan-card">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 9 }}>
              <span className="row gap-6" style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap' }}>
                <Icon name="zap" size={15} style={{ color: 'var(--violet)' }} /> Plan Starter
              </span>
              <span className="badge badge-conf" style={{ height: 20, padding: '0 8px' }}><span className="dot" />Activo</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden', marginBottom: 7 }}>
              <div style={{ width: '64%', height: '100%', background: 'var(--violet)', borderRadius: 99 }} />
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="faint" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>320 / 500 reservas</span>
              <a className="row gap-2" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--violet-ink)' }} onClick={() => onNav('configuracion')}>Mejorar</a>
            </div>
          </div>

          <div className="user-row" onClick={() => onNav('configuracion')}>
            <Avatar name="Luis Duble" size={34} />
            <div className="col" style={{ gap: 0, minWidth: 0, flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Luis Duble</span>
              <span className="faint" style={{ fontSize: 12 }}>luis@dublebistro.mx</span>
            </div>
            <Icon name="chevronDown" size={16} style={{ color: 'var(--ink-3)' }} />
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ onMenu, onNewRes, onNav, title }) {
  return (
    <div className="topbar">
      <button className="btn btn-icon btn-subtle menu-btn" onClick={onMenu}><Icon name="menu" size={20} /></button>
      <div className="search-wrap hide-sm" style={{ width: 320, maxWidth: '36vw' }}>
        <Icon name="search" className="s-ico" />
        <input className="input" style={{ height: 38, background: 'var(--surface-2)', border: '1px solid transparent' }} placeholder="Buscar reservas, clientes…" />
      </div>
      <div className="spacer" />
      <button className="btn btn-soft btn-icon" title="Notificaciones" style={{ position: 'relative' }}>
        <Icon name="bell" size={18} />
        <span style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: 99, background: 'var(--st-no-dot)', border: '1.5px solid var(--surface)' }} />
      </button>
      <button className="btn btn-primary" onClick={onNewRes}><Icon name="plus" size={17} /><span className="hide-sm">Nueva reservación</span></button>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, NAV });
