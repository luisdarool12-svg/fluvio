/* ============================================================
   FLUVIO — Reservaciones (tabla + filtros + drawer)
   ============================================================ */

function ReservationDrawer({ res, onClose, onSave }) {
  const editing = res && res.clientId;
  const cl = editing ? clientById(res.clientId) : null;
  const [people, setPeople] = React.useState(res?.people || 2);
  const [channel, setChannel] = React.useState(res?.channel || 'manual');
  const [date, setDate] = React.useState('2026-05-30');
  const [time, setTime] = React.useState(res?.time || '14:00');
  const [client, setClient] = React.useState(cl?.name || '');
  const [showClients, setShowClients] = React.useState(false);
  const matches = CLIENTS.filter(c => c.name.toLowerCase().includes(client.toLowerCase())).slice(0, 4);

  return (
    <Scrim onClose={onClose}>
      <div className="drawer">
        <div className="drawer-head">
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'grid', placeItems: 'center' }}>
            <Icon name={editing ? 'edit' : 'plus'} size={19} />
          </div>
          <div className="col" style={{ gap: 1, flex: 1 }}>
            <h2 style={{ fontSize: 18 }}>{editing ? 'Editar reservación' : 'Nueva reservación'}</h2>
            <span className="faint" style={{ fontSize: 12.5 }}>{editing ? 'Modifica los datos de la reserva' : 'Crea una reserva manualmente'}</span>
          </div>
          <button className="btn btn-icon btn-subtle" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <div className="drawer-body">
          {/* cliente */}
          <div className="field" style={{ position: 'relative' }}>
            <label>Cliente</label>
            <div className="search-wrap">
              <Icon name="user" className="s-ico" />
              <input className="input" placeholder="Buscar o crear cliente…" value={client}
                onChange={e => { setClient(e.target.value); setShowClients(true); }}
                onFocus={() => setShowClients(true)} />
            </div>
            {showClients && client && (
              <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, zIndex: 5, padding: 6, boxShadow: 'var(--shadow-lg)' }}>
                {matches.length ? matches.map(c => (
                  <div key={c.id} className="row gap-10 client-pick" onClick={() => { setClient(c.name); setShowClients(false); }}
                    style={{ padding: '8px 8px', borderRadius: 8, cursor: 'pointer' }}>
                    <Avatar name={c.name} size={28} />
                    <div className="col" style={{ gap: 0, flex: 1 }}>
                      <span className="row gap-6" style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name} {c.tags.includes('VIP') && <VipTag />}</span>
                      <span className="faint" style={{ fontSize: 11.5 }}>{c.phone} · {c.visits} visitas</span>
                    </div>
                  </div>
                )) : (
                  <div className="row gap-10" style={{ padding: '10px 8px', cursor: 'pointer' }} onClick={() => setShowClients(false)}>
                    <div style={{ width: 28, height: 28, borderRadius: 99, background: 'var(--accent-soft)', color: 'var(--accent-deep)', display: 'grid', placeItems: 'center' }}><Icon name="plus" size={15} /></div>
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>Crear "{client}"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* fecha + hora */}
          <div className="row gap-12">
            <div className="field" style={{ flex: 1 }}>
              <label>Fecha</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Hora</label>
              <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          {/* personas */}
          <div className="field">
            <label>Número de personas</label>
            <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
              {[1,2,3,4,5,6,8].map(n => (
                <button key={n} className={'btn btn-sm' + (people === n ? ' btn-primary' : ' btn-ghost')} style={{ minWidth: 42 }} onClick={() => setPeople(n)}>{n}</button>
              ))}
              <button className={'btn btn-sm' + (people > 8 ? ' btn-primary' : ' btn-ghost')} onClick={() => setPeople(10)}>+8</button>
            </div>
          </div>

          {/* mesa */}
          <div className="field">
            <label>Mesa <span className="faint" style={{ fontWeight: 400 }}>· opcional</span></label>
            <select className="select" defaultValue={res?.table || ''}>
              <option value="">Asignar automáticamente</option>
              {TABLES.filter(t => t.active).map(t => <option key={t.id} value={t.name}>{t.name} · {t.zone} ({t.cap} pers.)</option>)}
            </select>
          </div>

          {/* canal */}
          <div className="field">
            <label>Canal</label>
            <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
              {Object.entries(CHANNEL).map(([k, c]) => (
                <button key={k} className={'chip' + (channel === k ? ' chip-on' : '')} onClick={() => setChannel(k)}
                  style={channel === k ? { background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--accent-soft-2)', fontWeight: 600 } : { cursor: 'pointer' }}>
                  <Icon name={c.icon} size={14} /> {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* notas */}
          <div className="field">
            <label>Notas <span className="faint" style={{ fontWeight: 400 }}>· opcional</span></label>
            <textarea className="textarea" placeholder="Alergias, preferencias de mesa, ocasión especial…" defaultValue={res?.notes || ''} />
          </div>
        </div>

        <div className="drawer-foot">
          <button className="btn btn-ghost grow" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary grow" onClick={() => onSave({ client, time, people, channel })}>
            <Icon name="check" size={17} /> {editing ? 'Guardar cambios' : 'Crear reservación'}
          </button>
        </div>
      </div>
    </Scrim>
  );
}

function Reservaciones({ reservations, onAction, onOpen, onNewRes }) {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [day, setDay] = React.useState('all');

  let list = reservations.filter(r => {
    const cl = clientById(r.clientId);
    if (q && !cl.name.toLowerCase().includes(q.toLowerCase()) && !cl.phone.includes(q)) return false;
    if (status !== 'all' && r.status !== status) return false;
    if (day !== 'all' && r.dayLabel !== day) return false;
    return true;
  });

  const statusOpts = [['all','Todos'],['pendiente','Pendientes'],['confirmada','Confirmadas'],['sentada','Sentadas'],['no_show','No-show'],['cancelada','Canceladas']];

  return (
    <div className="page page-enter">
      <PageHeader title="Reservaciones" subtitle={`${reservations.length} reservas en total · ${reservations.filter(r=>r.status==='pendiente').length} pendientes`}
        actions={<button className="btn btn-primary" onClick={onNewRes}><Icon name="plus" size={17} /> Nueva reservación</button>} />

      {/* filtros */}
      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div className="row gap-10" style={{ flexWrap: 'wrap' }}>
          <div className="search-wrap grow" style={{ minWidth: 220 }}>
            <Icon name="search" className="s-ico" />
            <input className="input" placeholder="Buscar por nombre o teléfono…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select className="select" style={{ width: 'auto', minWidth: 150 }} value={day} onChange={e => setDay(e.target.value)}>
            <option value="all">Cualquier fecha</option>
            <option value="Hoy">Hoy</option>
            <option value="Mañana">Mañana</option>
            <option value="Pasado mañana">Pasado mañana</option>
            <option value="Ayer">Ayer</option>
          </select>
          <select className="select" style={{ width: 'auto', minWidth: 150 }} value={status} onChange={e => setStatus(e.target.value)}>
            {statusOpts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* status quick filters */}
      <div className="row gap-8" style={{ marginBottom: 14, flexWrap: 'wrap', overflowX: 'auto' }}>
        {statusOpts.map(([v,l]) => (
          <button key={v} className={'chip' + (status === v ? ' chip-on' : '')} onClick={() => setStatus(v)}
            style={status === v ? { background: 'var(--ink)', color: '#fff', cursor: 'pointer' } : { cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {list.length === 0 ? (
          <EmptyState icon="search" title="Sin resultados" body="Prueba con otro nombre, fecha o estado. También puedes crear una reserva nueva." action={<button className="btn btn-primary btn-sm" onClick={onNewRes}><Icon name="plus" size={15} /> Nueva reservación</button>} />
        ) : (
          <table className="tbl">
            <thead><tr>
              <th>Hora</th><th>Cliente</th><th className="hide-sm">Día</th><th className="hide-sm">Pers.</th><th className="hide-sm">Mesa</th><th className="hide-sm">Canal</th><th>Estado</th><th></th>
            </tr></thead>
            <tbody>
              {list.map(r => {
                const cl = clientById(r.clientId);
                return (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => onOpen(r)}>
                    <td style={{ width: 70 }}><span className="display" style={{ fontWeight: 600, fontSize: 15 }}>{r.time}</span></td>
                    <td>
                      <div className="row gap-10">
                        <Avatar name={cl.name} size={32} />
                        <div className="col" style={{ gap: 1, minWidth: 0 }}>
                          <span className="row gap-6" style={{ fontWeight: 600, fontSize: 14 }}>{cl.name}{cl.tags.includes('VIP') && <VipTag />}</span>
                          <span className="faint" style={{ fontSize: 12.5 }}>{cl.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hide-sm"><span className="muted" style={{ fontSize: 13.5 }}>{r.dayLabel}</span></td>
                    <td className="hide-sm"><span className="mono-num">{r.people}</span></td>
                    <td className="hide-sm"><span className="muted">{r.table}</span></td>
                    <td className="hide-sm"><ChannelTag channel={r.channel} showLabel={false} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ width: 150 }}><QuickActions res={r} onAction={onAction} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {list.length > 0 && (
          <div className="row" style={{ justifyContent: 'space-between', padding: '13px 18px', borderTop: '1px solid var(--line)' }}>
            <span className="faint" style={{ fontSize: 13 }}>Mostrando {list.length} de {reservations.length}</span>
            <div className="row gap-6">
              <button className="btn btn-ghost btn-sm btn-icon" disabled><Icon name="chevronLeft" size={16} /></button>
              <button className="btn btn-soft btn-sm" style={{ minWidth: 33 }}>1</button>
              <button className="btn btn-ghost btn-sm" style={{ minWidth: 33 }}>2</button>
              <button className="btn btn-ghost btn-sm btn-icon"><Icon name="chevronRight" size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Reservaciones, ReservationDrawer });
