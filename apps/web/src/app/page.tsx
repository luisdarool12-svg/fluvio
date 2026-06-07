'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, MessageCircle, Bell, LayoutDashboard, ArrowRight } from 'lucide-react'
import { Logo, Wordmark } from '@/components/Logo'

const CHAT = [
  { from: 'user', text: 'Hola, quiero reservar mesa para 2 el sábado 🙂' },
  { from: 'bot',  text: '¡Hola! Con gusto. ¿A qué hora prefieres?' },
  { from: 'user', text: 'A las 8pm' },
  { from: 'bot',  text: '✅ Listo, Carlos. Mesa para 2 el sábado 30 de mayo a las 8pm en Dublé Bistró. Te enviamos confirmación.' },
]

export default function LandingPage() {
  const [visibleChat, setVisibleChat] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setVisibleChat(n => (n < CHAT.length ? n + 1 : n))
    }, 900)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,248,.88)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
        padding: '0 clamp(20px,5vw,60px)', height: 64,
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        <Wordmark size={26} />
        <div style={{ flex: 1 }} />
        <div className="row gap-24 hide-sm" style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-2)' }}>
          <a href="#funciones" style={{ transition: 'color .13s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--ink)'} onMouseLeave={e => (e.target as HTMLElement).style.color = ''}>Funciones</a>
          <a href="#como-funciona" style={{ transition: 'color .13s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--ink)'} onMouseLeave={e => (e.target as HTMLElement).style.color = ''}>Cómo funciona</a>
          <a href="#precios" style={{ transition: 'color .13s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--ink)'} onMouseLeave={e => (e.target as HTMLElement).style.color = ''}>Precios</a>
        </div>
        <Link href="/login" className="btn btn-ghost btn-sm">Iniciar sesión</Link>
        <Link href="/login" className="btn btn-primary btn-sm">Empezar gratis</Link>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px) 80px', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Izquierda */}
        <div style={{ flex: '1 1 400px', maxWidth: 560 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent-soft)', border: '1px solid var(--accent-soft-2)',
            borderRadius: 'var(--r-pill)', padding: '5px 14px', fontSize: 13, fontWeight: 600, color: 'var(--accent-deep)',
            marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)', display: 'block' }} />
            Bot de WhatsApp con IA
          </div>

          <h1 style={{
            fontSize: 'clamp(40px,6vw,62px)',
            letterSpacing: '-0.035em', lineHeight: 1.05,
            marginBottom: 22,
          }}>
            Tu restaurante,<br />
            siempre lleno.<br />
            <span style={{ color: 'var(--accent)' }}>Sin esfuerzo.</span>
          </h1>

          <p style={{ fontSize: 19, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 36 }}>
            Bot de WhatsApp con IA que toma reservaciones 24/7 y elimina los no-shows automáticamente.
          </p>

          <div className="row gap-14" style={{ marginBottom: 28, flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-primary btn-lg">
              Empezar gratis <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="btn btn-ghost btn-lg">
              Ver demo
            </Link>
          </div>

          <div className="row gap-20" style={{ flexWrap: 'wrap' }}>
            {['14 días gratis', 'Sin tarjeta de crédito', 'Listo en 5 minutos'].map(t => (
              <span key={t} className="row gap-6" style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500 }}>
                <Check size={14} style={{ color: 'var(--accent)', flex: 'none' }} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Teléfono mockup */}
        <div style={{ flex: '1 1 280px', maxWidth: 310, margin: '0 auto', position: 'relative' }}>
          {/* Glow */}
          <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(circle at 50% 60%, rgba(74,124,89,.18) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{
            background: '#1A1A1A', borderRadius: 38,
            padding: 10, boxShadow: '0 32px 80px -20px rgba(0,0,0,.5), 0 8px 24px -8px rgba(0,0,0,.3)',
            position: 'relative',
          }}>
            {/* Notch */}
            <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 80, height: 18, background: '#1A1A1A', borderRadius: 99, zIndex: 2 }} />

            <div style={{ background: '#fff', borderRadius: 30, overflow: 'hidden', minHeight: 540 }}>
              {/* Header WhatsApp */}
              <div style={{ background: '#075E54', padding: '38px 14px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 99, background: 'var(--accent)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Logo size={22} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Dublé Bistró</div>
                  <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>en línea</div>
                </div>
              </div>

              {/* Chat */}
              <div style={{ background: '#E5DDD5', padding: '14px 12px', minHeight: 400, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CHAT.slice(0, visibleChat).map((msg, i) => (
                  <div key={i} style={{
                    maxWidth: '80%',
                    alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.from === 'user' ? '#DCF8C6' : '#fff',
                    padding: '8px 12px', borderRadius: msg.from === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,.1)',
                    fontSize: 13.5, lineHeight: 1.4,
                    animation: 'pageIn .3s var(--ease)',
                  }}>
                    {msg.text}
                  </div>
                ))}
                {visibleChat >= CHAT.length && (
                  <div style={{ alignSelf: 'center', background: 'rgba(255,255,255,.8)', borderRadius: 'var(--r-pill)', padding: '5px 14px', fontSize: 12, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 6, animation: 'pageIn .3s var(--ease)' }}>
                    <div className="ai-pulse" />
                    Fluvio agendó la reserva
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '40px clamp(20px,5vw,60px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { stat: '+38%',   label: 'Reservas confirmadas' },
            { stat: '−61%',   label: 'No-shows' },
            { stat: '24/7',   label: 'Atención automática' },
            { stat: '4.9 ★', label: 'Satisfacción' },
          ].map(s => (
            <div key={s.stat}>
              <div className="display" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--accent-deep)', marginBottom: 4 }}>{s.stat}</div>
              <div className="muted" style={{ fontSize: 14 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="funciones" style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px,4vw,40px)', marginBottom: 12 }}>Todo lo que necesitas</h2>
        <p className="muted" style={{ textAlign: 'center', fontSize: 17, marginBottom: 56 }}>Diseñado para restaurantes que quieren llenar mesas sin contratar más personal.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            {
              icon: <MessageCircle size={22} />,
              badge: '★ Estrella',
              title: 'Bot de WhatsApp 24/7',
              body: 'Tu restaurante toma reservaciones mientras duermes. El bot entiende lenguaje natural, confirma disponibilidad y agenda al instante.',
            },
            {
              icon: <Bell size={22} />,
              badge: 'Anti no-show',
              title: 'Recordatorios automáticos',
              body: 'El bot envía recordatorios 24h y 2h antes. Si el cliente cancela, la mesa queda disponible de inmediato.',
            },
            {
              icon: <LayoutDashboard size={22} />,
              badge: 'Tiempo real',
              title: 'Panel de gestión',
              body: 'Visualiza todas tus reservas, gestiona el estado mesa por mesa y monitorea el bot desde cualquier dispositivo.',
            },
          ].map(f => (
            <div key={f.title} className="card card-pad">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.03em', background: 'var(--accent-soft-2)', color: 'var(--accent-deep)', borderRadius: 'var(--r-pill)', padding: '2px 10px' }}>{f.badge}</span>
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>{f.title}</h3>
              <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', gap: 60, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 360px' }}>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,38px)', marginBottom: 40 }}>Listo en 5 minutos</h2>
            {[
              { n: 1, title: 'Conecta tu WhatsApp',     desc: 'Vincula tu número de WhatsApp Business en un clic.' },
              { n: 2, title: 'El bot toma las reservas', desc: 'Tus clientes escriben como siempre y el bot gestiona todo.' },
              { n: 3, title: 'Gestiona desde el panel',  desc: 'Confirma, sienta clientes y monitorea en tiempo real.' },
            ].map(paso => (
              <div key={paso.n} className="row gap-16" style={{ marginBottom: 28, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, flex: 'none' }}>{paso.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{paso.title}</div>
                  <div className="muted" style={{ fontSize: 14.5 }}>{paso.desc}</div>
                </div>
              </div>
            ))}
            <Link href="/login" className="btn btn-primary btn-lg">Crear mi cuenta gratis</Link>
          </div>

          {/* Mini preview */}
          <div className="card" style={{ flex: '1 1 280px', maxWidth: 380, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Logo size={20} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Panel Fluvio</span>
              <span className="badge badge-conf" style={{ marginLeft: 'auto' }}><span className="dot" />En vivo</span>
            </div>
            {[
              { time: '13:00', name: 'Sofía M.',   st: 'confirmada', p: 2 },
              { time: '14:00', name: 'María F.',   st: 'sentada',    p: 2 },
              { time: '20:00', name: 'Andrés L.',  st: 'pendiente',  p: 8 },
            ].map((r, i) => (
              <div key={i} style={{ padding: '12px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="display" style={{ fontWeight: 600, fontSize: 14, width: 46, fontVariantNumeric: 'tabular-nums' }}>{r.time}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{r.name}</span>
                <span className="faint" style={{ fontSize: 13 }}>{r.p} pers.</span>
                <span className={`badge badge-${r.st === 'confirmada' ? 'conf' : r.st === 'sentada' ? 'seat' : 'pend'}`}>
                  <span className="dot" />
                  {r.st.charAt(0).toUpperCase() + r.st.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="precios" style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,60px)' }}>
        <div style={{
          maxWidth: 720, margin: '0 auto', textAlign: 'center',
          background: 'var(--accent-deep)', borderRadius: 'var(--r-xl)', padding: 'clamp(40px,6vw,64px)',
        }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(28px,4vw,42px)', marginBottom: 16 }}>
            Llena tu restaurante esta misma semana
          </h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 17, marginBottom: 10 }}>
            Plan Starter desde <strong style={{ color: '#fff' }}>$99/mes</strong> · 500 reservas · 1 número de WhatsApp
          </p>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginBottom: 36 }}>14 días gratis · Sin tarjeta de crédito · Cancela cuando quieras</p>
          <div className="row gap-14" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-lg" style={{ background: '#fff', color: 'var(--accent-deep)', fontWeight: 700 }}>
              Empezar gratis <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}>
              Ver demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: 'clamp(24px,4vw,40px) clamp(20px,5vw,60px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Wordmark size={22} />
        <div className="row gap-24 hide-sm" style={{ fontSize: 14, color: 'var(--ink-3)' }}>
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Contacto</a>
        </div>
        <p className="faint" style={{ fontSize: 13 }}>© 2026 Fluvio. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
