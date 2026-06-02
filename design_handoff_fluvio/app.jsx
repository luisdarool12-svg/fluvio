/* ============================================================
   FLUVIO — App: routing + estado + tweaks
   ============================================================ */
const { useState, useEffect, useRef } = React;

const ACCENTS = {
  '#4A7C59': { '--accent': '#4A7C59', '--accent-ink': '#3A6347', '--accent-deep': '#2E4F39', '--accent-soft': '#EAF1EC', '--accent-soft-2': '#DCE8DF' },
  '#E0632F': { '--accent': '#E0632F', '--accent-ink': '#BC4F22', '--accent-deep': '#8A3614', '--accent-soft': '#FBEDE5', '--accent-soft-2': '#F6DBCA' },
  '#2F6CC4': { '--accent': '#2F6CC4', '--accent-ink': '#2657A0', '--accent-deep': '#1C3D72', '--accent-soft': '#E8F0FA', '--accent-soft-2': '#D2E2F4' },
};

const DARK = {
  '--bg': '#0F0F0F', '--surface': '#1A1A19', '--surface-2': '#232321', '--surface-3': '#2C2C29', '--surface-sunken': '#000',
  '--ink': '#F5F4F0', '--ink-2': '#B6B4AB', '--ink-3': '#86847C', '--ink-4': '#5C5A53',
  '--line': '#2C2C29', '--line-2': '#363632', '--line-strong': '#44443F',
};
const LIGHT = {
  '--bg': '#FAFAF8', '--surface': '#FFFFFF', '--surface-2': '#F4F3EF', '--surface-3': '#EFEEE9', '--surface-sunken': '#EBEAE3',
  '--ink': '#1A1A1A', '--ink-2': '#5C5A54', '--ink-3': '#908E86', '--ink-4': '#B6B4AB',
  '--line': '#E7E5DE', '--line-2': '#DBD9D0', '--line-strong': '#CFCDC3',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dashLayout": "metrics",
  "accent": "#4A7C59",
  "theme": "claro",
  "displayFont": "Bricolage Grotesque",
  "density": "regular"
}/*EDITMODE-END*/;

function applyTweaks(t) {
  const root = document.documentElement.style;
  const base = t.theme === 'oscuro' ? DARK : LIGHT;
  Object.entries(base).forEach(([k, v]) => root.setProperty(k, v));
  Object.entries(ACCENTS[t.accent] || ACCENTS['#4A7C59']).forEach(([k, v]) => root.setProperty(k, v));
  root.setProperty('--font-display', `'${t.displayFont}', serif`);
  root.setProperty('--app-scale', t.density === 'compacta' ? '14px' : '15px');
  document.body.style.fontSize = t.density === 'compacta' ? '14px' : '15px';
}

let feedSeq = 100;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState(() => localStorage.getItem('fluvio_route') || 'landing');
  const [reservations, setReservations] = useState(() => ALL_RES.map(r => ({ ...r })));
  const [drawer, setDrawer] = useState(null); // {res} or {} for new
  const [sbOpen, setSbOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [feed, setFeed] = useState(() => AI_FEED_SEED.map((f, i) => ({ ...f, id: 'seed' + i })));

  useEffect(() => { applyTweaks(t); }, [t]);
  useEffect(() => { localStorage.setItem('fluvio_route', route); window.scrollTo(0, 0); }, [route]);

  // Live AI feed
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
            {route === 'dashboard' && <Dashboard reservations={reservations} onAction={onAction} onOpen={openRes} onNewRes={newRes} onNav={nav} layout={t.dashLayout} feed={feed} />}
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
          <span className="toast-ico" style={{ background: toast.kind === 'warn' ? 'var(--st-no)' : 'var(--accent)' }}>
            <Icon name={toast.kind === 'warn' ? 'x' : 'check'} size={14} strokeWidth={2.4} />
          </span>
          {toast.msg}
        </div>
      )}

      {isApp && (
        <TweaksPanel>
          <TweakSection label="Dashboard" />
          <TweakRadio label="Layout" value={t.dashLayout}
            options={[{ value: 'metrics', label: 'Métricas' }, { value: 'timeline', label: 'Agenda' }, { value: 'focus', label: 'IA' }]}
            onChange={v => setTweak('dashLayout', v)} />
          <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '2px 4px 6px', lineHeight: 1.4 }}>Métricas = tarjetas + tabla · Agenda = timeline · IA = feed del bot protagonista</p>

          <TweakSection label="Marca" />
          <TweakColor label="Acento" value={t.accent}
            options={['#4A7C59', '#E0632F', '#2F6CC4']}
            onChange={v => setTweak('accent', v)} />
          <TweakRadio label="Tema" value={t.theme} options={['claro', 'oscuro']} onChange={v => setTweak('theme', v)} />
          <TweakSelect label="Tipografía titulares" value={t.displayFont}
            options={['Bricolage Grotesque', 'Instrument Serif', 'Spectral', 'Fraunces', 'Hanken Grotesk']}
            onChange={v => setTweak('displayFont', v)} />
          <TweakRadio label="Densidad" value={t.density} options={['regular', 'compacta']} onChange={v => setTweak('density', v)} />
        </TweaksPanel>
      )}
    </>
  );
}

function agePeriod(t) {
  if (t === 'Ahora') return 'hace 1 min';
  const m = t.match(/hace (\d+) min/);
  if (m) return `hace ${+m[1] + 5} min`;
  return t;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
