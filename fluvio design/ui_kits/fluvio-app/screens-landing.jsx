/* ============================================================
   FLUVIO — Landing page (/)
   ============================================================ */

function LandingNav({ onNav }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,250,248,.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
      <div className="row" style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 28px', justifyContent: 'space-between' }}>
        <Wordmark size={28} />
        <nav className="row gap-4 hide-sm" style={{ color: 'var(--ink-2)', fontSize: 14.5, fontWeight: 500 }}>
          <a className="btn btn-subtle btn-sm" href="#features">Funciones</a>
          <a className="btn btn-subtle btn-sm" href="#como">Cómo funciona</a>
          <a className="btn btn-subtle btn-sm" href="#precio">Precios</a>
        </nav>
        <div className="row gap-8">
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('login')}>Iniciar sesión</button>
          <button className="btn btn-primary btn-sm" onClick={() => onNav('login')}>Empezar gratis</button>
        </div>
      </div>
    </header>
  );
}

function ChatBubble({ from, children, delay }) {
  const isBot = from === 'bot';
  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', animation: `feedIn .5s var(--ease) ${delay}s both` }}>
      <div style={{
        maxWidth: '80%', padding: '9px 13px', fontSize: 13.5, lineHeight: 1.45,
        borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        background: isBot ? '#fff' : '#DCF8C6', color: 'var(--ink)',
        boxShadow: '0 1px 1px rgba(0,0,0,.06)', border: isBot ? '1px solid var(--line)' : 'none',
      }}>
        {children}
      </div>
    </div>
  );
}

function PhoneDemo() {
  return (
    <div style={{ position: 'relative', width: 290, flex: 'none' }}>
      {/* glow */}
      <div style={{ position: 'absolute', inset: '-30px -10px', background: 'radial-gradient(60% 50% at 50% 30%, rgba(74,124,89,.16), transparent 70%)', filter: 'blur(8px)' }} />
      <div style={{
        position: 'relative', borderRadius: 38, background: '#1A1A1A', padding: 9,
        boxShadow: 'var(--shadow-overlay)',
      }}>
        <div style={{ borderRadius: 30, overflow: 'hidden', background: '#E5DDD5', height: 560, display: 'flex', flexDirection: 'column' }}>
          {/* WA header */}
          <div className="row gap-10" style={{ background: '#075E54', padding: '14px 16px', color: '#fff' }}>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
              <Logo size={22} mono />
            </div>
            <div className="col" style={{ gap: 1 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5 }}>Duble Bistró</span>
              <span style={{ fontSize: 11.5, opacity: .8 }}>en línea · responde al instante</span>
            </div>
          </div>
          {/* chat */}
          <div className="col gap-8" style={{ padding: 14, flex: 1, background: 'linear-gradient(rgba(229,221,213,.5), rgba(229,221,213,.5))', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center', margin: '2px 0 6px' }}><span style={{ fontSize: 11, background: 'rgba(255,255,255,.7)', padding: '3px 9px', borderRadius: 8, color: 'var(--ink-2)' }}>Hoy</span></div>
            <ChatBubble from="user" delay={.1}>Hola! Tienen mesa para 2 hoy a las 2?</ChatBubble>
            <ChatBubble from="bot" delay={.5}>¡Hola! 👋 Claro que sí. Tengo disponible la <b>terraza a las 14:00</b>. ¿La aparto?</ChatBubble>
            <ChatBubble from="user" delay={1.1}>Perfecto, sí porfa</ChatBubble>
            <ChatBubble from="bot" delay={1.6}>Listo ✅ Mesa para 2, hoy 14:00 en terraza. Te mandaré un recordatorio una hora antes. ¡Te esperamos!</ChatBubble>
            <div style={{ animation: 'feedIn .5s var(--ease) 2.2s both', alignSelf: 'flex-start' }}>
              <div className="row gap-6" style={{ background: '#fff', padding: '8px 12px', borderRadius: '4px 14px 14px 14px', border: '1px solid var(--line)' }}>
                <span className="ai-pulse" />
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Fluvio agendó la reserva</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, body, badge }) {
  return (
    <div className="card card-pad col gap-12" style={{ borderRadius: 'var(--r-lg)' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--violet-light)', color: 'var(--plum)', display: 'grid', placeItems: 'center' }}>
          <Icon name={icon} size={22} />
        </div>
        {badge && <span className="chip" style={{ background: 'var(--violet-light)', color: 'var(--plum)', fontWeight: 600, fontSize: 12 }}>{badge}</span>}
      </div>
      <div className="col gap-6">
        <h3 style={{ fontSize: 18.5 }}>{title}</h3>
        <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.55 }}>{body}</p>
      </div>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <div className="row gap-16" style={{ alignItems: 'flex-start' }}>
      <div className="display" style={{ fontSize: 17, fontWeight: 700, color: '#fff', background: 'var(--violet)', width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', flex: 'none' }}>{n}</div>
      <div className="col gap-4" style={{ paddingTop: 3 }}>
        <h3 style={{ fontSize: 18 }}>{title}</h3>
        <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.55 }}>{body}</p>
      </div>
    </div>
  );
}

function Landing({ onNav }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <LandingNav onNav={onNav} />

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -80, width: 480, height: 480, background: 'radial-gradient(circle, rgba(74,124,89,.10), transparent 65%)' }} />
        <div className="row" style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 28px 72px', gap: 56, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="col gap-24" style={{ flex: '1 1 420px', minWidth: 320 }}>
            <span className="chip" style={{ alignSelf: 'flex-start', background: 'var(--violet-light)', color: 'var(--plum)', fontWeight: 600, height: 32 }}>
              <span className="ai-pulse" /> Bot de WhatsApp con IA
            </span>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 62px)', lineHeight: 1.02, letterSpacing: '-0.035em' }}>
              Tu restaurante,<br />siempre lleno.<br /><span style={{ color: 'var(--violet)' }}>Sin esfuerzo.</span>
            </h1>
            <p style={{ fontSize: 19, color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: 480 }}>
              Bot de WhatsApp con IA que toma reservaciones 24/7 y elimina los no-shows automáticamente.
            </p>
            <div className="row gap-12" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => onNav('login')}>Empezar gratis <Icon name="arrowUpRight" size={18} /></button>
              <button className="btn btn-ghost btn-lg" onClick={() => onNav('dashboard')}><Icon name="monitor" size={18} /> Ver demo</button>
            </div>
            <div className="row gap-20" style={{ marginTop: 4, color: 'var(--ink-3)', fontSize: 13.5, fontWeight: 500, flexWrap: 'wrap' }}>
              <span className="row gap-6"><Icon name="check" size={16} style={{ color: 'var(--violet)' }} /> 14 días gratis</span>
              <span className="row gap-6"><Icon name="check" size={16} style={{ color: 'var(--violet)' }} /> Sin tarjeta</span>
              <span className="row gap-6"><Icon name="check" size={16} style={{ color: 'var(--violet)' }} /> Listo en 5 min</span>
            </div>
          </div>
          <div className="row" style={{ flex: '1 1 290px', justifyContent: 'center' }}>
            <PhoneDemo />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF strip */}
      <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div className="row" style={{ maxWidth: 1180, margin: '0 auto', padding: '22px 28px', gap: 40, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {[['+38%','reservas confirmadas'],['−61%','no-shows'],['24/7','atención sin pausa'],['4.9★','satisfacción']].map(([n,l]) => (
            <div className="col" key={l} style={{ gap: 2 }}>
              <span className="display" style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-0.03em' }}>{n}</span>
              <span className="muted" style={{ fontSize: 13.5 }}>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth: 1180, margin: '0 auto', padding: '84px 28px' }}>
        <div className="col gap-8" style={{ textAlign: 'center', alignItems: 'center', marginBottom: 48 }}>
          <span className="chip" style={{ background: 'var(--violet-light)', color: 'var(--plum)', fontWeight: 600 }}>Funciones</span>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 42px)', maxWidth: 640 }}>Todo lo que tu host hacía, ahora automático</h2>
          <p className="muted" style={{ fontSize: 17, maxWidth: 520 }}>Fluvio atiende, confirma y recuerda — para que tú te dediques a la cocina y la sala.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <FeatureCard icon="whatsapp" badge="Estrella" title="Bot de WhatsApp 24/7" body="Responde, sugiere horarios y aparta mesas al instante — en el chat que tus clientes ya usan, sin apps ni formularios." />
          <FeatureCard icon="bell" title="Recordatorios anti no-show" body="Mensajes automáticos antes de cada reserva con confirmación en un toque. Recupera las mesas que se quedaban vacías." />
          <FeatureCard icon="dashboard" title="Panel en tiempo real" body="Mira tus reservas del día, ocupación y clientes desde un panel claro. Confirma, sienta o reagenda con un clic." />
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="row" style={{ maxWidth: 1180, margin: '0 auto', padding: '84px 28px', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="col gap-28" style={{ flex: '1 1 360px' }}>
            <div className="col gap-8">
              <span className="chip" style={{ alignSelf: 'flex-start', background: 'var(--violet-light)', color: 'var(--plum)', fontWeight: 600 }}>Así funciona</span>
              <h2 style={{ fontSize: 'clamp(30px, 4vw, 42px)' }}>En marcha en tres pasos</h2>
            </div>
            <div className="col gap-24">
              <Step n="1" title="Conecta tu WhatsApp" body="Enlaza el número de tu restaurante en minutos. Fluvio entiende tu menú, horarios y mesas." />
              <Step n="2" title="El bot toma las reservas" body="Tus clientes escriben como siempre. La IA responde, confirma disponibilidad y agenda automáticamente." />
              <Step n="3" title="Gestiona desde el panel" body="Todo cae ordenado en tu dashboard. Confirma, sienta o reagenda — y deja que los recordatorios hagan el resto." />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => onNav('login')}>Crear mi cuenta <Icon name="chevronRight" size={17} /></button>
          </div>
          <div className="col" style={{ flex: '1 1 320px', alignItems: 'center' }}>
            <MiniDashPreview />
          </div>
        </div>
      </section>

      {/* CTA / PRECIO */}
      <section id="precio" style={{ maxWidth: 1180, margin: '0 auto', padding: '84px 28px' }}>
        <div style={{ background: 'var(--plum)', borderRadius: 'var(--r-xl)', padding: '56px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -40, width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,255,255,.08), transparent 65%)' }} />
          <div className="col gap-16" style={{ alignItems: 'center', position: 'relative' }}>
            <h2 style={{ color: '#fff', fontSize: 'clamp(30px, 4vw, 44px)', maxWidth: 620 }}>Llena tu restaurante esta misma semana</h2>
            <p style={{ color: 'rgba(255,255,255,.78)', fontSize: 18, maxWidth: 480 }}>Plan Starter desde <b style={{ color: '#fff' }}>$99/mes</b>. Cancela cuando quieras. Prueba 14 días gratis.</p>
            <div className="row gap-12" style={{ marginTop: 6 }}>
              <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--plum)' }} onClick={() => onNav('login')}>Empezar gratis</button>
              <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={() => onNav('dashboard')}>Ver demo en vivo</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
        <div className="row" style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 28px', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div className="col gap-8">
            <Wordmark size={26} />
            <p className="faint" style={{ fontSize: 13 }}>Reservaciones inteligentes para tu restaurante.</p>
          </div>
          <div className="row gap-24 muted" style={{ fontSize: 13.5 }}>
            <a href="#features">Funciones</a><a href="#precio">Precios</a><a href="#como">Cómo funciona</a>
            <span className="faint">© 2026 Fluvio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* mini dashboard preview for "cómo funciona" */
function MiniDashPreview() {
  return (
    <div className="card" style={{ width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: 'var(--shadow-pop)' }}>
      <div className="row gap-8" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>
        <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--st-no-dot)' }} />
        <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--st-pend-dot)' }} />
        <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--st-conf-dot)' }} />
        <span className="faint" style={{ fontSize: 12, marginLeft: 6 }}>Reservas de hoy</span>
      </div>
      <div className="col" style={{ padding: 14, gap: 10 }}>
        {[['14:00','María F. Ríos','confirmada'],['14:30','Ricardo Beltrán','pendiente'],['20:00','Andrés Lozano','confirmada']].map(([t,n,s]) => (
          <div className="row gap-10" key={n} style={{ padding: '8px 10px', borderRadius: 10, background: 'var(--surface-2)' }}>
            <span className="display" style={{ fontWeight: 600, fontSize: 13.5, width: 42 }}>{t}</span>
            <Avatar name={n} size={26} />
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{n}</span>
            <StatusBadge status={s} />
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Landing });
