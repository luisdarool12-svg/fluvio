/* ============================================================
   FLUVIO — Clientes · Mesas · Configuración
   ============================================================ */

/* ---------------- CLIENTES ---------------- */
function ClientPanel({ client, reservations, onClose }) {
  const hist = reservations.filter(r => r.clientId === client.id);
  return (
    <Scrim onClose={onClose}>
      <div className="drawer">
        <div className="drawer-head">
          <Avatar name={client.name} size={44} />
          <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
            <span className="row gap-6" style={{ fontWeight: 700, fontSize: 17 }}>{client.name} {client.tags.includes('VIP') && <VipTag />}</span>
            <span className="faint" style={{ fontSize: 13 }}>{client.phone}</span>
          </div>
          <button className="btn btn-icon btn-subtle" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="drawer-body">
          <div className="row gap-12">
            {[['Visitas', client.visits],['Última', client.last === '—' ? '—' : new Date(client.last).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })],['Canal fav.', 'WhatsApp']].map(([l,v]) => (
              <div key={l} className="card" style={{ flex: 1, padding: '12px 14px', boxShadow: 'none', background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                <div className="display" style={{ fontSize: 21, fontWeight: 600 }}>{v}</div>
                <div className="faint" style={{ fontSize: 12 }}>{l}</div>
              </div>
            ))}
          </div>
          {client.notes && (
            <div className="card" style={{ padding: 14, boxShadow: 'none', background: 'var(--st-pend-bg)', border: '1px solid #EFE0BE' }}>
              <span className="row gap-6" style={{ fontSize: 12, fontWeight: 700, color: 'var(--st-pend)', marginBottom: 5 }}><Icon name="alert" size={14} /> NOTAS</span>
              <p style={{ fontSize: 13.5, color: '#7A5A12' }}>{client.notes}</p>
            </div>
          )}
          <div className="col gap-10">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>Historial de reservaciones</span>
            {hist.length ? hist.map(r => (
              <div className="row gap-10" key={r.id} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name="calendar" size={17} style={{ color: 'var(--ink-2)' }} /></div>
                <div className="col" style={{ gap: 1, flex: 1 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.dayLabel} · {r.time}</span>
                  <span className="faint" style={{ fontSize: 12 }}>{r.people} personas · {r.table}</span>
                </div>
                <StatusBadge status={r.status} />
              </div>
            )) : <p className="faint" style={{ fontSize: 13.5 }}>Sin reservaciones registradas todavía.</p>}
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-ghost grow"><Icon name="whatsapp" size={17} style={{ color: '#25D366' }} /> Escribir</button>
          <button className="btn btn-primary grow"><Icon name="plus" size={17} /> Nueva reserva</button>
        </div>
      </div>
    </Scrim>
  );
}

function Clientes({ reservations }) {
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(null);
  const list = CLIENTS.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));

  return (
    <div className="page page-enter">
      <PageHeader title="Clientes" subtitle={`${CLIENTS.length} clientes · ${CLIENTS.filter(c=>c.visits>=5).length} VIP`}
        actions={<button className="btn btn-primary"><Icon name="userplus" size={17} /> Nuevo cliente</button>} />

      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div className="search-wrap">
          <Icon name="search" className="s-ico" />
          <input className="input" placeholder="Buscar por nombre o teléfono…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead><tr><th>Nombre</th><th className="hide-sm">Teléfono</th><th>Visitas</th><th className="hide-sm">Última visita</th><th className="hide-sm">Notas</th><th></th></tr></thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSel(c)}>
                <td>
                  <div className="row gap-10">
                    <Avatar name={c.name} size={34} />
                    <div className="col" style={{ gap: 1 }}>
                      <span className="row gap-6" style={{ fontWeight: 600, fontSize: 14 }}>{c.name} {c.tags.includes('VIP') && <VipTag />}</span>
                      <span className="faint hide-sm" style={{ fontSize: 12 }} >{c.tags.includes('Nuevo') ? 'Cliente nuevo' : 'Cliente recurrente'}</span>
                    </div>
                  </div>
                </td>
                <td className="hide-sm"><span className="muted">{c.phone}</span></td>
                <td><span className="mono-num" style={{ fontWeight: 600 }}>{c.visits}</span></td>
                <td className="hide-sm"><span className="muted">{c.last === '—' ? '—' : new Date(c.last).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                <td className="hide-sm"><span className="faint" style={{ fontSize: 13, maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.notes || '—'}</span></td>
                <td style={{ width: 44 }}><Icon name="chevronRight" size={17} style={{ color: 'var(--ink-3)' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && <ClientPanel client={sel} reservations={reservations} onClose={() => setSel(null)} />}
    </div>
  );
}

/* ---------------- MESAS ---------------- */
const ZONE_ICON = { 'Terraza': 'sun', 'Interior': 'utensils', 'Barra': 'armchair' };

function TableCard({ table, onToggle }) {
  return (
    <div className="card card-pad col gap-14" style={{ opacity: table.active ? 1 : 0.62 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row gap-10">
          <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'grid', placeItems: 'center' }}>
            <Icon name={ZONE_ICON[table.zone] || 'tables'} size={20} />
          </div>
          <div className="col" style={{ gap: 1 }}>
            <span className="display" style={{ fontWeight: 600, fontSize: 17 }}>{table.name}</span>
            <span className="faint" style={{ fontSize: 12.5 }}>{table.zone}</span>
          </div>
        </div>
        <div className={'switch' + (table.active ? ' on' : '')} onClick={() => onToggle(table.id)} />
      </div>
      <div className="row" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        <span className="row gap-6 muted" style={{ fontSize: 13.5 }}><Icon name="users" size={15} /> {table.cap} {table.cap === 1 ? 'persona' : 'personas'}</span>
        <span className={'badge ' + (table.active ? 'badge-conf' : 'badge-canc')}><span className="dot" />{table.active ? 'Activa' : 'Inactiva'}</span>
      </div>
    </div>
  );
}

function Mesas() {
  const [tables, setTables] = React.useState(TABLES);
  const [zone, setZone] = React.useState('Todas');
  const toggle = (id) => setTables(ts => ts.map(t => t.id === id ? { ...t, active: !t.active } : t));
  const zones = ['Todas', 'Terraza', 'Interior', 'Barra'];
  const list = zone === 'Todas' ? tables : tables.filter(t => t.zone === zone);
  const activeCount = tables.filter(t => t.active).length;
  const totalCap = tables.filter(t => t.active).reduce((s, t) => s + t.cap, 0);

  return (
    <div className="page page-enter">
      <PageHeader title="Mesas" subtitle={`${activeCount} mesas activas · ${totalCap} comensales de aforo`}
        actions={<button className="btn btn-primary"><Icon name="plus" size={17} /> Agregar mesa</button>} />

      <div className="row gap-8" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
        {zones.map(z => (
          <button key={z} className={'chip' + (zone === z ? '' : '')} onClick={() => setZone(z)}
            style={zone === z ? { background: 'var(--ink)', color: '#fff', cursor: 'pointer' } : { cursor: 'pointer' }}>
            {z !== 'Todas' && <Icon name={ZONE_ICON[z]} size={14} />}{z}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 16 }}>
        {list.map(t => <TableCard key={t.id} table={t} onToggle={toggle} />)}
        <button className="card col" style={{ alignItems: 'center', justifyContent: 'center', gap: 8, padding: 22, border: '1.5px dashed var(--line-strong)', background: 'transparent', boxShadow: 'none', color: 'var(--ink-2)', minHeight: 150, cursor: 'pointer' }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}><Icon name="plus" size={20} /></div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Agregar mesa</span>
        </button>
      </div>
    </div>
  );
}

/* ---------------- CONFIGURACIÓN ---------------- */
function ConfigRow({ label, hint, children }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--line)', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="col" style={{ gap: 2, maxWidth: 320 }}>
        <span style={{ fontWeight: 600, fontSize: 14.5 }}>{label}</span>
        {hint && <span className="faint" style={{ fontSize: 13 }}>{hint}</span>}
      </div>
      <div style={{ minWidth: 240, flex: '0 1 320px' }}>{children}</div>
    </div>
  );
}

function ConfigSection({ icon, title, desc, children }) {
  return (
    <div className="card card-pad" style={{ padding: '20px 24px' }}>
      <div className="row gap-12" style={{ marginBottom: 4 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={icon} size={19} /></div>
        <div className="col" style={{ gap: 1 }}>
          <h3 style={{ fontSize: 17 }}>{title}</h3>
          {desc && <span className="faint" style={{ fontSize: 13 }}>{desc}</span>}
        </div>
      </div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}

function Configuracion() {
  const [section, setSection] = React.useState('perfil');
  const [notif, setNotif] = React.useState({ reminders: true, newRes: true, noshow: true, weekly: false });
  const tog = (k) => setNotif(n => ({ ...n, [k]: !n[k] }));
  const tabs = [['perfil','Perfil','building'],['whatsapp','WhatsApp','whatsapp'],['notif','Notificaciones','bell'],['plan','Plan','card']];

  return (
    <div className="page page-narrow page-enter">
      <PageHeader title="Configuración" subtitle="Administra tu restaurante, integraciones y plan" />

      <div className="row gap-6" style={{ marginBottom: 20, borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
        {tabs.map(([k,l,ic]) => (
          <button key={k} onClick={() => setSection(k)} className="row gap-8"
            style={{ padding: '11px 14px', fontWeight: 600, fontSize: 14, color: section === k ? 'var(--ink)' : 'var(--ink-3)', borderBottom: section === k ? '2px solid var(--accent)' : '2px solid transparent', marginBottom: -1 }}>
            <Icon name={ic} size={16} /> {l}
          </button>
        ))}
      </div>

      <div className="col gap-18">
        {section === 'perfil' && (
          <ConfigSection icon="building" title="Perfil del negocio" desc="Cómo aparece tu restaurante en Fluvio y WhatsApp">
            <ConfigRow label="Nombre del restaurante"><input className="input" defaultValue="Duble Bistró" /></ConfigRow>
            <ConfigRow label="Teléfono de contacto"><input className="input" defaultValue="+52 55 4040 1212" /></ConfigRow>
            <ConfigRow label="Zona horaria"><select className="select" defaultValue="cdmx"><option value="cdmx">(GMT−6) Ciudad de México</option><option>(GMT−7) Tijuana</option><option>(GMT−5) Cancún</option></select></ConfigRow>
            <ConfigRow label="Idioma"><select className="select" defaultValue="es"><option value="es">Español</option><option value="en">English</option></select></ConfigRow>
          </ConfigSection>
        )}

        {section === 'whatsapp' && (
          <ConfigSection icon="whatsapp" title="WhatsApp Business" desc="El número desde el que el bot atiende a tus clientes">
            <div className="card" style={{ padding: 16, boxShadow: 'none', background: 'var(--st-conf-bg)', border: '1px solid #C7E3D3', marginBottom: 4 }}>
              <div className="row gap-10">
                <div className="wa-ico" style={{ width: 36, height: 36 }}><Icon name="whatsapp" size={20} /></div>
                <div className="col" style={{ gap: 1, flex: 1 }}>
                  <span className="row gap-6" style={{ fontWeight: 600, fontSize: 14 }}>+52 55 4040 1212 <span className="badge badge-conf" style={{ height: 20 }}><span className="dot" />Conectado</span></span>
                  <span className="faint" style={{ fontSize: 12.5 }}>Bot activo · 1.284 mensajes este mes</span>
                </div>
                <button className="btn btn-ghost btn-sm">Reconectar</button>
              </div>
            </div>
            <ConfigRow label="Número de WhatsApp" hint="El bot responde desde este número"><input className="input" defaultValue="+52 55 4040 1212" /></ConfigRow>
            <ConfigRow label="Mensaje de bienvenida" hint="Lo primero que recibe un cliente nuevo"><textarea className="textarea" defaultValue="¡Hola! 👋 Bienvenido a Duble Bistró. ¿Te ayudo a reservar mesa?" /></ConfigRow>
            <ConfigRow label="Tomar reservas 24/7" hint="El bot atiende incluso fuera de horario"><div className="row" style={{ justifyContent: 'flex-end' }}><div className="switch on" /></div></ConfigRow>
          </ConfigSection>
        )}

        {section === 'notif' && (
          <ConfigSection icon="bell" title="Notificaciones" desc="Cuándo y cómo te avisamos">
            <ConfigRow label="Recordatorios anti no-show" hint="Mensaje automático antes de cada reserva"><div className="row" style={{ justifyContent: 'flex-end' }}><div className={'switch' + (notif.reminders ? ' on' : '')} onClick={() => tog('reminders')} /></div></ConfigRow>
            <ConfigRow label="Nueva reserva del bot" hint="Aviso cuando el bot agenda una mesa"><div className="row" style={{ justifyContent: 'flex-end' }}><div className={'switch' + (notif.newRes ? ' on' : '')} onClick={() => tog('newRes')} /></div></ConfigRow>
            <ConfigRow label="Alerta de no-show" hint="Cuando un cliente no se presenta"><div className="row" style={{ justifyContent: 'flex-end' }}><div className={'switch' + (notif.noshow ? ' on' : '')} onClick={() => tog('noshow')} /></div></ConfigRow>
            <ConfigRow label="Resumen semanal" hint="Reporte de ocupación cada lunes"><div className="row" style={{ justifyContent: 'flex-end' }}><div className={'switch' + (notif.weekly ? ' on' : '')} onClick={() => tog('weekly')} /></div></ConfigRow>
          </ConfigSection>
        )}

        {section === 'plan' && (
          <ConfigSection icon="card" title="Plan y facturación" desc="Tu suscripción actual">
            <div className="card" style={{ padding: 18, boxShadow: 'none', background: 'var(--accent-deep)', color: '#fff', marginBottom: 6 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="col gap-4">
                  <span className="row gap-8" style={{ fontWeight: 600, fontSize: 15 }}><Icon name="zap" size={16} /> Plan Starter</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>500 reservas/mes · 1 número de WhatsApp</span>
                </div>
                <span className="display" style={{ fontSize: 28, fontWeight: 700 }}>$99<span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,.7)' }}>/mes</span></span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,.18)', margin: '14px 0 7px', overflow: 'hidden' }}><div style={{ width: '64%', height: '100%', background: '#fff', borderRadius: 99 }} /></div>
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)' }}>320 / 500 reservas usadas este mes</span>
            </div>
            <ConfigRow label="Método de pago" hint="Visa terminación 4242"><button className="btn btn-ghost btn-block">Actualizar tarjeta</button></ConfigRow>
            <ConfigRow label="Mejorar a Pro" hint="Reservas ilimitadas + 3 números"><button className="btn btn-primary btn-block"><Icon name="arrowUpRight" size={16} /> Subir a Pro</button></ConfigRow>
          </ConfigSection>
        )}

        {/* Zona de peligro */}
        <div className="card card-pad" style={{ padding: '20px 24px', border: '1px solid #EBC9C2', background: '#FCF3F1' }}>
          <div className="row gap-12" style={{ marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--st-no-bg)', color: 'var(--st-no)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name="alert" size={19} /></div>
            <div className="col" style={{ gap: 1 }}>
              <h3 style={{ fontSize: 17, color: 'var(--st-no)' }}>Zona de peligro</h3>
              <span className="faint" style={{ fontSize: 13 }}>Acciones irreversibles. Procede con cuidado.</span>
            </div>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', padding: '14px 0 0', borderTop: '1px solid #EBC9C2', gap: 16, flexWrap: 'wrap' }}>
            <div className="col" style={{ gap: 2, maxWidth: 360 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5 }}>Cancelar cuenta</span>
              <span className="faint" style={{ fontSize: 13 }}>Se eliminarán todas tus reservas, clientes y la conexión de WhatsApp.</span>
            </div>
            <button className="btn btn-danger"><Icon name="trash" size={16} /> Cancelar cuenta</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Clientes, Mesas, Configuracion, ClientPanel });
