/* ============================================================
   FLUVIO — App UI kit · routing + state + live feed + toasts
   (Brand-fixed build — no theming/tweaks. Mock data from lib.jsx.)
   ============================================================ */
const { useState, useEffect } = React;

let feedSeq = 100;

function agePeriod(t) {
  if (t === 'Ahora') return 'hace 1 min';
  const m = t.match(/hace (\d+) min/);
  if (m) return `hace ${+m[1] + 5} min`;
  return t;
}

function App() {
  const [route, setRoute] = useState(() => localStorage.getItem('fluvio_kit_route') || 'dashboard');
  const [reservations, setReservations] = useState(() => ALL_RES.map(r => ({ ...r })));
  const [drawer, setDrawer] = useState(null);
  const [sbOpen, setSbOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [feed, setFeed] = useState(() => AI_FEED_SEED.map((f, i) => ({ ...f, id: 'seed' + i })));

  useEffect(() => { localStorage.setItem('fluvio_kit_route', route); window.scrollTo(0, 0); }, [route]);

  // Live WhatsApp / AI feed — only inside the app
  useEffect(() => {
    if (route === 'landing' || route === 'login') return;
    const iv = setInterval(() => {
      const pick = AI_FEED_POOL[Math.floor(Math.random() * AI_FEED_POOL.length)];
      setFeed(f => [{ ...pick, id: 'f' + (feedSeq++), t: 'Ahora' }, ...f.map(x => ({ ...x, t: agePeriod(x.t) }))].slice(0, 12));
    }, 6500);
    return () => clearInterval(iv);
  }, [route]);

  const nav = (r) => { setRoute(r); setSbOpen(false); };
  const showToast = (msg, kind = 'ok') => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2400); };

  const onAction = (id, kind) => {
    if (kind === 'edit') { const r = reservations.find(x => x.id === id); setDrawer({ res: r }); return; }
    const map = { confirmar: 'confirmada', sentar: 'sentada', no_show: 'no_show', cancelar: 'cancelada' };
    const ns = map[kind]; if (!ns) return;
    setReservations(rs => rs.map(r => r.id === id ? { ...r, status: ns } : r));
    const cl = clientById(reservations.find(r => r.id === id)?.clientId);
    const labels = { confirmada: 'confirmada', sentada: 'sentada', no_show: 'marcada como no-show', cancelada: 'cancelada' };
    showToast(`Reserva de ${cl?.name.split(' ')[0]} ${labels[ns]}`, ns === 'no_show' ? 'warn' : 'ok');
  };

  const openRes = (res) => setDrawer({ res });
  const newRes = () => setDrawer({});
  const saveRes = (data) => { setDrawer(null); showToast(data?.client ? `Reserva creada para ${data.client.split(' ')[0]}` : 'Reservación guardada'); };

  const isApp = route !== 'landing' && route !== 'login';

  return (
    <>
      {route === 'landing' && <Landing onNav={nav} />}
      {route === 'login' && <Login onNav={nav} />}

      {isApp && (
        <div className="app-shell">
          <Sidebar route={route} onNav={nav} business="Duble Bistró" open={sbOpen} onClose={() => setSbOpen(false)} />
          <div className="main">
            <Topbar onMenu={() => setSbOpen(true)} onNewRes={newRes} onNav={nav} />
            {route === 'dashboard' && <Dashboard reservations={reservations} onAction={onAction} onOpen={openRes} onNewRes={newRes} onNav={nav} layout="metrics" feed={feed} />}
            {route === 'reservaciones' && <Reservaciones reservations={reservations} onAction={onAction} onOpen={openRes} onNewRes={newRes} />}
            {route === 'clientes' && <Clientes reservations={reservations} />}
            {route === 'mesas' && <Mesas />}
            {route === 'configuracion' && <Configuracion />}
          </div>
        </div>
      )}

      {drawer && <ReservationDrawer res={drawer.res} onClose={() => setDrawer(null)} onSave={saveRes} />}

      {toast && (
        <div className="toast">
          <span className="toast-ico" style={{ background: toast.kind === 'warn' ? 'var(--coral)' : 'var(--st-conf-dot)' }}>
            <Icon name={toast.kind === 'warn' ? 'x' : 'check'} size={14} strokeWidth={2.4} />
          </span>
          {toast.msg}
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
