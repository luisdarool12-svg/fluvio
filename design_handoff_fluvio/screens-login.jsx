/* ============================================================
   FLUVIO — Login / Auth (split layout)
   ============================================================ */

function Login({ onNav }) {
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('luis@dublebistro.mx');
  const [pass, setPass] = React.useState('demo1234');
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => onNav('dashboard'), 850);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* LEFT — dark side */}
      <div className="hide-sm" style={{
        flex: '1 1 0', background: 'var(--accent-deep)', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 48px',
        color: '#fff', minWidth: 0,
      }}>
        <div style={{ position: 'absolute', top: -80, left: -60, width: 360, height: 360, background: 'radial-gradient(circle, rgba(255,255,255,.08), transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -60, width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,.06), transparent 65%)' }} />
        <button className="row gap-10" style={{ position: 'relative', alignSelf: 'flex-start' }} onClick={() => onNav('landing')}>
          <Logo size={30} mono />
          <span className="display" style={{ fontWeight: 700, fontSize: 21, color: '#fff' }}>Fluvio</span>
        </button>

        <div className="col gap-24" style={{ position: 'relative', maxWidth: 440 }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(30px, 3.5vw, 40px)', lineHeight: 1.08 }}>
            Reservaciones inteligentes para tu restaurante.
          </h1>
          <div className="card" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', padding: 18, boxShadow: 'none' }}>
            <div className="row gap-10" style={{ marginBottom: 10 }}>
              <span className="ai-pulse" />
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)', fontWeight: 600, letterSpacing: '.02em' }}>FLUVIO · EN VIVO</span>
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.92)', lineHeight: 1.5 }}>
              "Desde que usamos Fluvio bajamos los no-shows a la mitad. El bot trabaja todas las noches por nosotros."
            </p>
            <div className="row gap-10" style={{ marginTop: 14 }}>
              <Avatar name="Luis Duble" size={34} />
              <div className="col" style={{ gap: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>Luis Duble</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>Dueño · Duble Bistró</span>
              </div>
            </div>
          </div>
        </div>

        <div className="row gap-20" style={{ position: 'relative', color: 'rgba(255,255,255,.6)', fontSize: 12.5 }}>
          <span>© 2026 Fluvio</span><span>Privacidad</span><span>Términos</span>
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div className="row" style={{ padding: '22px 28px', justifyContent: 'space-between' }}>
          <button className="row gap-10 hide-md" style={{ display: 'none' }} onClick={() => onNav('landing')}>
            <Logo size={26} />
          </button>
          <button className="btn btn-subtle btn-sm" style={{ marginLeft: 'auto' }} onClick={() => onNav('landing')}>
            <Icon name="chevronLeft" size={16} /> Volver
          </button>
        </div>

        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '12px 24px 60px' }}>
          <div className="col gap-24" style={{ width: '100%', maxWidth: 380 }}>
            <button className="row gap-10" style={{ justifyContent: 'center' }} onClick={() => onNav('landing')}>
              <Logo size={34} />
            </button>
            <div className="col gap-4" style={{ textAlign: 'center', alignItems: 'center' }}>
              <h1 style={{ fontSize: 28 }}>{mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h1>
              <p className="muted" style={{ fontSize: 14.5 }}>
                {mode === 'login' ? 'Inicia sesión para entrar a tu panel.' : 'Empieza tus 14 días gratis, sin tarjeta.'}
              </p>
            </div>

            <form className="col gap-14" onSubmit={submit}>
              {mode === 'signup' && (
                <div className="field">
                  <label>Nombre del restaurante</label>
                  <input className="input" placeholder="Duble Bistró" defaultValue="" />
                </div>
              )}
              <div className="field">
                <label>Correo electrónico</label>
                <div className="search-wrap">
                  <Icon name="mail" className="s-ico" />
                  <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@restaurante.mx" />
                </div>
              </div>
              <div className="field">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <label>Contraseña</label>
                  {mode === 'login' && <a style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}>¿Olvidaste?</a>}
                </div>
                <div className="search-wrap">
                  <Icon name="lock" className="s-ico" />
                  <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
                </div>
              </div>
              <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? <span className="row gap-8"><span className="spin" />Entrando…</span> : (mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta gratis')}
              </button>
            </form>

            <div className="row gap-12" style={{ color: 'var(--ink-3)', fontSize: 12.5 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />o<div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <button className="btn btn-ghost btn-block" onClick={() => onNav('dashboard')}>
              <Icon name="whatsapp" size={18} style={{ color: '#25D366' }} /> Continuar con WhatsApp Business
            </button>

            <p className="muted" style={{ textAlign: 'center', fontSize: 14 }}>
              {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <a style={{ color: 'var(--accent-ink)', fontWeight: 600 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Login });
