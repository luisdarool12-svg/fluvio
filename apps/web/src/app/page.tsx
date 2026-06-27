'use client'

import { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo'

/* ── Valores editables ───────────────────────────────────────────────
   Número de WhatsApp y precios del plan. Cambia WHATSAPP_NUMBER por la
   línea real de Fluvio cuando la tengas (hoy usa la de Dublé).        */
const WHATSAPP_NUMBER = '524771298654' // formato internacional, sin '+' ni espacios
const DEMO_MESSAGE = 'Hola, quiero agendar una demo gratis de Fluvio para mi restaurante.'
const DEMO_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEMO_MESSAGE)}`
const PRECIO_MES = '$1,799' // precio mensual del Founding Member (MXN)
const PRECIO_SETUP = '$3,500' // valor del setup incluido (MXN)

const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Mis clientes necesitan instalar algo?',
    a: 'No. Usan el WhatsApp que ya tienen. Escriben a tu número de siempre y Fluvio responde al instante — para ellos es exactamente como chatear con el restaurante.',
  },
  {
    q: '¿Funciona si ya tengo un sistema de reservaciones?',
    a: 'Sí. Fluvio puede reemplazarlo o convivir con él mientras haces la transición. Migramos tu historial de reservas y clientes sin costo durante el setup.',
  },
  {
    q: '¿Cuánto tiempo toma la implementación?',
    a: '24 horas. Conectamos tu línea de WhatsApp, cargamos tu mapa de mesas y tus horarios, y ese mismo día recibes tu primera reservación automática.',
  },
  {
    q: '¿Qué pasa si el bot no entiende al cliente?',
    a: 'Te avisa de inmediato. La conversación pasa a ti o a tu equipo con todo el contexto, y el cliente nunca se queda sin respuesta. Es la excepción, no la regla.',
  },
  {
    q: '¿Hay contrato de permanencia?',
    a: 'No. El plan es mensual y puedes cancelar cuando quieras. El precio de Founding Member queda bloqueado mientras tu cuenta siga activa.',
  },
]

const FONT_DISPLAY = 'var(--font-display)'
const FONT_UI = 'var(--font-ui)'

/* Animaciones, hovers y reglas responsive — convertidas del prototipo. */
const STYLES = `
  .lp-reveal { opacity: 0; transform: translateY(24px); transition: opacity .5s ease, transform .5s ease; }
  .lp-reveal--left { transform: translateX(30px); }
  .lp-reveal.is-visible { opacity: 1; transform: none; }

  @keyframes lpBubbleIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes lpWaPulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
  .lp-bubble { animation: lpBubbleIn .5s ease both; }
  .lp-wa-dot { animation: lpWaPulse 1.8s ease infinite; }

  .lp-nav-link { color: #4E4566; text-decoration: none; padding: 6px 4px; transition: color .15s ease; }
  .lp-nav-link:hover { color: #180F2E; }

  .lp-nav-cta { color: #180F2E; text-decoration: none; border: 1.5px solid #180F2E; border-radius: 999px;
    padding: 8px 18px; font-weight: 600; font-size: 13.5px; transition: background .15s ease, color .15s ease; }
  .lp-nav-cta:hover { background: #180F2E; color: #FAF9F5; }

  .lp-cta { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; cursor: pointer;
    border: none; font-family: ${FONT_UI}; font-weight: 600; border-radius: 12px;
    transition: transform .15s ease, box-shadow .15s ease; }
  .lp-cta:active { transform: translateY(0); }
  .lp-cta--violet { background: #6447F5; color: #FAF9F5; }
  .lp-cta--violet:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(100,71,245,.35); }
  .lp-cta--white { background: #FFFFFF; color: #6447F5; }
  .lp-cta--white:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(11,5,32,.4); }

  .lp-feature { transition: box-shadow .2s ease, border-color .2s ease; }
  .lp-feature:hover { box-shadow: 0 14px 36px -14px rgba(24,15,46,.16); border-color: rgba(100,71,245,.4); }

  .lp-foot-link { color: rgba(255,255,255,.6); text-decoration: none; transition: color .15s ease; }
  .lp-foot-link:hover { color: rgba(255,255,255,.9); }

  .lp-faq-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px;
    background: none; border: none; cursor: pointer; padding: 20px 2px; text-align: left; font-family: ${FONT_UI}; }

  @media (prefers-reduced-motion: reduce) {
    .lp-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
    .lp-bubble, .lp-wa-dot { animation: none !important; }
  }
`

const PAD_X = 'clamp(24px,6vw,96px)'

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FF6A38" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }} aria-hidden="true">
      <path d="M4 12.5 L9.5 18 L20 6.5" />
    </svg>
  )
}

function ChatBubble({ text, out, delay }: { text: React.ReactNode; out: boolean; delay: number }) {
  return (
    <div className="lp-bubble" style={{ display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', animationDelay: `${delay}s` }}>
      <div
        style={{
          maxWidth: '84%',
          padding: '9px 13px',
          fontSize: 13.5,
          lineHeight: 1.45,
          borderRadius: out ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          background: out ? '#DCF8C6' : '#fff',
          color: '#180F2E',
          border: out ? 'none' : '1px solid #EAE6F2',
          boxShadow: '0 1px 1px rgba(0,0,0,.06)',
        }}
      >
        {text}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = Array.from(document.querySelectorAll<HTMLElement>('.lp-reveal'))

    if (reduce) {
      els.forEach((el) => el.classList.add('is-visible'))
      return () => window.removeEventListener('resize', onResize)
    }

    const reveal = (el: HTMLElement) => {
      const delay = parseInt(el.dataset.revealDelay || '0', 10)
      el.style.transitionDelay = `${delay}ms`
      el.classList.add('is-visible')
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))

    return () => {
      window.removeEventListener('resize', onResize)
      io.disconnect()
    }
  }, [])

  const phoneRotate = isMobile ? 'none' : 'rotate(-3deg)'

  return (
    <div style={{ background: '#FAF9F5', color: '#180F2E', fontFamily: FONT_UI, overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── NAV ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,249,245,.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EAE6F2' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `14px ${PAD_X}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Logo size={26} wordmark />
          </a>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px,2vw,28px)', fontSize: 14.5, fontWeight: 500, whiteSpace: 'nowrap' }}>
            <a href="#problema" className="lp-nav-link">El problema</a>
            <a href="#como-funciona" className="lp-nav-link">Cómo funciona</a>
            <a href="#precio" className="lp-nav-link">Precio</a>
            <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="lp-nav-cta">Agenda tu demo</a>
          </nav>
        </div>
      </header>

      {/* ── 1 · HERO ── */}
      <section style={{ position: 'relative', padding: `clamp(56px,8vw,120px) ${PAD_X} clamp(64px,8vw,110px)` }}>
        <svg aria-hidden="true" style={{ position: 'absolute', top: -120, right: -140, width: 560, height: 520, pointerEvents: 'none' }} viewBox="0 0 560 520" fill="none">
          <path d="M390 30 C500 50 560 160 530 270 C500 380 400 460 280 440 C160 420 110 320 150 210 C190 100 280 10 390 30 Z" fill="#6447F5" opacity="0.08" />
        </svg>
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(40px,6vw,72px)' }}>
          <div style={{ flex: '1 1 520px', minWidth: 'min(100%,300px)' }}>
            <h1 className="lp-reveal" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(40px,7vw,92px)', lineHeight: 1.02, letterSpacing: '-0.01em', margin: 0, color: '#180F2E', textWrap: 'balance' }}>
              Tu restaurante lleno. <span style={{ color: '#FF6A38' }}>Sin llamadas.</span>
            </h1>
            <p className="lp-reveal" data-reveal-delay="150" style={{ fontSize: 'clamp(18px,2vw,22px)', fontWeight: 500, lineHeight: 1.5, color: 'rgba(24,15,46,.7)', margin: '24px 0 0', maxWidth: 520, textWrap: 'pretty' }}>
              Fluvio gestiona tus reservaciones por WhatsApp con IA. Cero no-shows. Tú descansas.
            </p>
            <div className="lp-reveal" data-reveal-delay="300" style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="lp-cta lp-cta--violet" style={{ fontSize: 16.5, padding: '16px 32px' }}>
                Agenda tu demo gratis <span aria-hidden="true">→</span>
              </a>
              <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(24,15,46,.5)' }}>Sin tarjeta de crédito · Setup en 24h</span>
            </div>
          </div>

          <div className="lp-reveal lp-reveal--left" data-reveal-delay="400" style={{ flex: '0 1 300px', margin: '0 auto' }}>
            <div style={{ position: 'relative', width: 'min(100%,300px)', transform: phoneRotate }}>
              <div style={{ borderRadius: 38, background: '#1A1A1A', padding: 9, boxShadow: '0 28px 64px -18px rgba(24,15,46,.34),0 6px 16px -8px rgba(24,15,46,.14)' }}>
                <div style={{ borderRadius: 30, overflow: 'hidden', background: '#E5DDD5', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#075E54', padding: '14px 16px', color: '#fff' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 99, background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                      <Logo size={18} variant="mono" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: 14.5 }}>La Terraza</span>
                      <span style={{ fontSize: 11.5, opacity: 0.8 }}>en línea · responde al instante</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, flex: 1 }}>
                    <div style={{ textAlign: 'center', margin: '2px 0 6px' }}>
                      <span style={{ fontSize: 11, background: 'rgba(255,255,255,.7)', padding: '3px 9px', borderRadius: 8, color: '#4E4566' }}>Hoy 9:41 pm</span>
                    </div>
                    <ChatBubble out delay={0.2} text="Hola, ¿tienen mesa para 2 este viernes a las 8?" />
                    <ChatBubble out={false} delay={0.7} text={<>¡Hola! Claro que sí. Viernes 8:00 pm para 2 personas — te aparto la <b>mesa 7, junto a la terraza</b>. ¿La confirmo a tu nombre?</>} />
                    <ChatBubble out delay={1.2} text="Sí, a nombre de Sofía" />
                    <ChatBubble out={false} delay={1.7} text="Listo. Mesa 7 · 2 personas · viernes 8:00 pm. Te mando un recordatorio ese día. ¡Te esperamos, Sofía!" />
                    <div className="lp-bubble" style={{ alignSelf: 'flex-start', animationDelay: '2.3s', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', padding: '8px 12px', borderRadius: '4px 14px 14px 14px', border: '1px solid #EAE6F2' }}>
                        <span className="lp-wa-dot" style={{ width: 7, height: 7, borderRadius: 99, background: '#25D366' }} />
                        <span style={{ fontSize: 12, color: '#9487B0' }}>Fluvio asignó la mesa automáticamente</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · SOCIAL PROOF ── */}
      <section style={{ background: '#180F2E', padding: `22px ${PAD_X}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px 18px', textAlign: 'center' }}>
          <span style={{ fontSize: 14.5, color: 'rgba(255,255,255,.7)' }}><b style={{ fontWeight: 600, color: '#FF6A38' }}>+340 reservaciones</b> gestionadas este mes en La Terraza</span>
          <span aria-hidden="true" style={{ color: 'rgba(255,255,255,.25)' }}>·</span>
          <span style={{ fontSize: 14.5, color: 'rgba(255,255,255,.7)' }}><b style={{ fontWeight: 600, color: '#FF6A38' }}>0 no-shows</b> en las últimas 3 semanas</span>
          <span aria-hidden="true" style={{ color: 'rgba(255,255,255,.25)' }}>·</span>
          <span style={{ fontSize: 14.5, color: 'rgba(255,255,255,.7)' }}><b style={{ fontWeight: 600, color: '#FF6A38' }}>4.9 ★</b> en Google Maps</span>
          <span aria-hidden="true" style={{ color: 'rgba(255,255,255,.25)' }}>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14.5, color: 'rgba(255,255,255,.7)' }}>
            <span style={{ width: 24, height: 24, borderRadius: 99, background: 'rgba(255,255,255,.12)', display: 'inline-grid', placeItems: 'center', fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 11, color: '#fff' }}>LT</span>
            La Terraza · León, Guanajuato
          </span>
        </div>
      </section>

      {/* ── 3 · PROBLEMA ── */}
      <section id="problema" style={{ padding: `clamp(80px,11vw,150px) ${PAD_X} 0` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(40px,5vw,72px)' }}>
          <div className="lp-reveal" style={{ flex: '1 1 480px', minWidth: 'min(100%,300px)' }}>
            <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9487B0' }}>¿Te identificas?</p>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-0.01em', margin: 0, color: '#180F2E', textWrap: 'balance' }}>Gestionar reservaciones a mano cuesta más de lo que crees.</h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.6, color: '#4E4566', margin: '20px 0 0', maxWidth: 480, textWrap: 'pretty' }}>Cada llamada perdida es una mesa vacía. Cada no-show es dinero que ya no regresa. Y mientras tanto, tú no puedes soltar el teléfono ni salir del restaurante.</p>
          </div>
          <div style={{ flex: '1 1 340px', minWidth: 'min(100%,280px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { d: 0, icon: <path d="M5.5 3.5 h3.2 l1.4 3.8 -2 1.4 a11 11 0 0 0 5.2 5.2 l1.4 -2 3.8 1.4 v3.2 a2 2 0 0 1 -2.2 2 A16 16 0 0 1 3.5 5.7 a2 2 0 0 1 2 -2.2 Z" />, t: 'Llamadas a deshoras que no puedes ignorar' },
              { d: 100, icon: <><path d="M3 21 V5 a2 2 0 0 1 2-2 h7 a2 2 0 0 1 2 2 v16" /><path d="M3 21 H21" /><path d="M19 21 V9 a1 1 0 0 0-1-1 h-3" /><path d="M7.5 8 h0.01" /></>, t: 'Mesas vacías por no-shows de último minuto' },
              { d: 200, icon: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3 V1.5 h6 V3" /><path d="M8.5 9 H15.5" /><path d="M8.5 13 H15.5" /><path d="M8.5 17 H12.5" /></>, t: 'Cuadernos de reservas que se pierden o se confunden' },
              { d: 300, icon: <><path d="M12 21 s-7-4.5-7-10 a7 7 0 0 1 14 0 c0 5.5-7 10-7 10 Z" /><circle cx="12" cy="11" r="2.4" /></>, t: 'Tener que estar físico para que todo funcione' },
            ].map((c) => (
              <div key={c.d} className="lp-reveal" data-reveal-delay={c.d} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '1px solid rgba(100,71,245,.2)', borderRadius: 12, padding: '16px 18px' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: '#EDE9FE', display: 'grid', placeItems: 'center', color: '#180F2E', flex: 'none' }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{c.icon}</svg>
                </span>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#180F2E' }}>{c.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 · SOLUCIÓN ── */}
      <section id="como-funciona" style={{ padding: `clamp(80px,11vw,150px) ${PAD_X} 0` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ maxWidth: 640 }}>
            <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9487B0' }}>Así funciona Fluvio</p>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-0.01em', margin: 0, color: '#180F2E', textWrap: 'balance' }}>Tres pasos. Cero fricción.</h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px,3vw,36px)', marginTop: 'clamp(36px,5vw,60px)', alignItems: 'stretch' }}>
            {/* Paso 01 */}
            <div className="lp-reveal" style={{ flex: '4 1 360px', minWidth: 'min(100%,300px)', background: '#fff', border: '1px solid #EAE6F2', borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 15, letterSpacing: '.1em', color: '#FF6A38' }}>PASO 01</span>
                <span aria-hidden="true" style={{ flex: 1, borderTop: '2px dashed rgba(255,106,56,.55)' }} />
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 23, lineHeight: 1.15, margin: 0, color: '#180F2E' }}>Tu cliente escribe por WhatsApp</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: '#4E4566', margin: 0 }}>A cualquier hora. Sin app extra. Sin formularios.</p>
              <div style={{ background: '#E5DDD5', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '85%', padding: '8px 12px', fontSize: 13, lineHeight: 1.45, borderRadius: '13px 4px 13px 13px', background: '#DCF8C6', color: '#180F2E' }}>¿Tienen lugar mañana para 4?</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ maxWidth: '85%', padding: '8px 12px', fontSize: 13, lineHeight: 1.45, borderRadius: '4px 13px 13px 13px', background: '#fff', color: '#180F2E', border: '1px solid #EAE6F2' }}>Sí — mesa 12 a las 3:00 pm. ¿La aparto?</div>
                </div>
              </div>
            </div>
            {/* Paso 02 */}
            <div className="lp-reveal" data-reveal-delay="120" style={{ flex: '3 1 280px', minWidth: 'min(100%,260px)', background: '#fff', border: '1px solid #EAE6F2', borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 15, letterSpacing: '.1em', color: '#FF6A38' }}>PASO 02</span>
                <span aria-hidden="true" style={{ flex: 1, borderTop: '2px dashed rgba(255,106,56,.55)' }} />
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 21, lineHeight: 1.15, margin: 0, color: '#180F2E' }}>Fluvio asigna la mesa ideal</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: '#4E4566', margin: 0 }}>El motor de asignación considera capacidad, combinaciones de mesas y tiempo estimado de estancia.</p>
              <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} style={{ height: 34, borderRadius: 8, background: i === 2 ? '#FF6A38' : '#F3F1FA', border: `1px solid ${i === 2 ? '#FF6A38' : '#EAE6F2'}` }} />
                ))}
              </div>
            </div>
            {/* Paso 03 */}
            <div className="lp-reveal" data-reveal-delay="240" style={{ flex: '3 1 280px', minWidth: 'min(100%,260px)', background: '#fff', border: '1px solid #EAE6F2', borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 15, letterSpacing: '.1em', color: '#FF6A38' }}>PASO 03</span>
                <span aria-hidden="true" style={{ flex: 1, borderTop: '2px dashed rgba(255,106,56,.55)' }} />
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 21, lineHeight: 1.15, margin: 0, color: '#180F2E' }}>Tú ves todo desde tu dashboard</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: '#4E4566', margin: 0 }}>Desde el celular, en tiempo real. Con alertas de riesgo de no-show.</p>
              <div style={{ marginTop: 'auto', background: '#FAF9F5', border: '1px solid #EAE6F2', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }} aria-hidden="true">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', color: '#9487B0' }}>RESERVAS HOY</span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 20, color: '#180F2E' }}>10</span>
                </div>
                <span style={{ height: 6, borderRadius: 99, background: '#ECE9F4', overflow: 'hidden', display: 'block' }}>
                  <span style={{ display: 'block', width: '70%', height: '100%', borderRadius: 99, background: '#FF6A38' }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 · CARACTERÍSTICAS ── */}
      <section style={{ background: '#FFFFFF', marginTop: 'clamp(80px,11vw,150px)', padding: `clamp(80px,10vw,130px) ${PAD_X}`, borderTop: '1px solid #EAE6F2', borderBottom: '1px solid #EAE6F2' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="lp-reveal" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-0.01em', margin: '0 auto', color: '#180F2E', textAlign: 'center', maxWidth: 760, textWrap: 'balance' }}>Diseñado para dueños, no para gerentes de IT.</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,330px),1fr))', gap: 20, marginTop: 'clamp(36px,5vw,56px)' }}>
            {/* Card grande (span 2 filas) */}
            <div className="lp-reveal lp-feature" style={{ gridRow: 'span 2', background: '#FAF9F5', border: '1px solid #EAE6F2', borderRadius: 14, padding: 30, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EDE9FE', display: 'grid', placeItems: 'center', color: '#180F2E' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></svg>
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, margin: 0, color: '#180F2E' }}>Motor de asignación inteligente</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4E4566', margin: 0, textWrap: 'pretty' }}>Detecta la capacidad real de tu piso, combina mesas cuando hace falta y evita el overbooking automáticamente. Tú defines las reglas una vez; Fluvio las respeta todas las noches.</p>
              <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }} aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const bg = i === 2 ? '#FFEDD5' : i === 4 ? '#FF6A38' : '#fff'
                  const bd = i === 2 ? '#FBC9AE' : i === 4 ? '#FF6A38' : '#EAE6F2'
                  return <span key={i} style={{ height: 44, borderRadius: 10, background: bg, border: `1px solid ${bd}` }} />
                })}
              </div>
            </div>

            {/* Scoring anti no-show */}
            <div className="lp-reveal lp-feature" data-reveal-delay="120" style={{ background: '#FAF9F5', border: '1px solid #EAE6F2', borderRadius: 14, padding: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EDE9FE', display: 'grid', placeItems: 'center', color: '#180F2E' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2.5 L19.5 5.5 V11 C19.5 16 16.5 19.8 12 21.5 C7.5 19.8 4.5 16 4.5 11 V5.5 Z" /><path d="M9 11.5 L11.2 13.7 L15.2 9.2" /></svg>
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19, margin: 0, color: '#180F2E' }}>Scoring anti no-show</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4E4566', margin: 0, textWrap: 'pretty' }}>Historial del cliente + confirmaciones automáticas. Las reservas de riesgo se detectan antes de que te cuesten una mesa.</p>
            </div>

            {/* WhatsApp nativo */}
            <div className="lp-reveal lp-feature" data-reveal-delay="240" style={{ background: '#FAF9F5', border: '1px solid #EAE6F2', borderRadius: 14, padding: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EDE9FE', display: 'grid', placeItems: 'center', color: '#180F2E' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5 a8.5 8.5 0 0 1 -12.4 7.6 L3 21 L4.9 15.4 A8.5 8.5 0 1 1 21 11.5 Z" /></svg>
              </div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19, margin: 0, color: '#180F2E' }}>WhatsApp nativo</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4E4566', margin: 0, textWrap: 'pretty' }}>Sin apps nuevas para tu cliente. Escribe como le escribe a un amigo — y recibe respuesta al instante, 24/7.</p>
            </div>

            {/* Dashboard (ancho completo) */}
            <div className="lp-reveal lp-feature" data-reveal-delay="320" style={{ gridColumn: '1/-1', background: '#FAF9F5', border: '1px solid #EAE6F2', borderRadius: 14, padding: 30, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EDE9FE', display: 'grid', placeItems: 'center', color: '#180F2E', flex: 'none' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21 H16" /><path d="M12 17 V21" /></svg>
              </div>
              <div style={{ flex: '1 1 320px' }}>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19, margin: 0, color: '#180F2E' }}>Dashboard en tiempo real</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4E4566', margin: '6px 0 0', textWrap: 'pretty' }}>Gestión remota desde cualquier lugar. Reservas, mesas y alertas de riesgo — todo desde tu celular.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 · TESTIMONIAL ── */}
      <section style={{ background: '#180F2E', padding: `clamp(80px,10vw,130px) ${PAD_X}` }}>
        <div className="lp-reveal" style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <blockquote style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(24px,3.4vw,36px)', lineHeight: 1.25, letterSpacing: '-0.01em', color: '#FFFFFF', margin: 0, textWrap: 'balance' }}>
            <span style={{ color: '#FF6A38' }} aria-hidden="true">“ </span>Antes perdía 2 o 3 mesas por semana por no-shows. Con Fluvio, en 3 semanas, cero.<span style={{ color: '#FF6A38' }} aria-hidden="true"> ”</span>
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 99, background: '#FF6A38', display: 'grid', placeItems: 'center', fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 16, color: '#fff' }}>M</span>
            <span style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontWeight: 500, fontSize: 15.5, color: '#FF6A38' }}>Mariana</span>
              <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,.6)' }}>La Terraza · León, Guanajuato</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── 7 · PRICING ── */}
      <section id="precio" style={{ padding: `clamp(80px,11vw,150px) ${PAD_X} 0` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="lp-reveal" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-0.01em', margin: 0, color: '#180F2E', textAlign: 'center', maxWidth: 680, textWrap: 'balance' }}>Un precio fijo. Sin comisiones por reservación.</h2>

          <div className="lp-reveal" data-reveal-delay="150" style={{ marginTop: 'clamp(36px,5vw,52px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ background: '#FF6A38', color: '#fff', fontSize: 12.5, fontWeight: 600, letterSpacing: '.06em', padding: '7px 16px', borderRadius: 999, transform: 'translateY(50%)', zIndex: 1, boxShadow: '0 4px 12px rgba(255,106,56,.3)' }}>Solo para los primeros 10 restaurantes</span>
            <div style={{ background: '#fff', border: '1px solid #EAE6F2', borderRadius: 20, padding: 'clamp(32px,4vw,48px)', width: 'min(100%,460px)', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9487B0' }}>Founding Member</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(38px,5vw,52px)', letterSpacing: '-0.01em', color: '#180F2E' }}>{PRECIO_MES}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#9487B0' }}>MXN / mes</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, borderTop: '1px solid #EAE6F2', paddingTop: 24 }}>
                {[
                  'Bot de WhatsApp ilimitado',
                  'Dashboard completo',
                  'Motor de asignación inteligente',
                  'Scoring anti no-show',
                  `Setup incluido (valor ${PRECIO_SETUP} MXN)`,
                  'Precio bloqueado de por vida',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckIcon />
                    <span style={{ fontSize: 15, color: '#180F2E' }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="lp-cta lp-cta--violet" style={{ fontSize: 16, padding: '16px 32px', justifyContent: 'center' }}>
                Agenda tu demo gratis <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8 · FAQ ── */}
      <section style={{ padding: `clamp(80px,11vw,150px) ${PAD_X}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 className="lp-reveal" style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(28px,3.6vw,40px)', lineHeight: 1.1, letterSpacing: '-0.01em', margin: '0 0 clamp(28px,4vw,44px)', color: '#180F2E', textWrap: 'balance' }}>Las preguntas que nos hacen todos los dueños.</h2>
          <div className="lp-reveal" data-reveal-delay="100" style={{ display: 'flex', flexDirection: 'column' }}>
            {FAQS.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={f.q} style={{ borderBottom: '1px solid #EAE6F2' }}>
                  <button className="lp-faq-btn" onClick={() => setOpenFaq(open ? -1 : i)} aria-expanded={open}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: '#180F2E' }}>{f.q}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6A38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .25s ease' }} aria-hidden="true"><path d="M5 9 L12 16 L19 9" /></svg>
                  </button>
                  <div style={{ maxHeight: open ? 220 : 0, overflow: 'hidden', transition: 'max-height .3s ease' }}>
                    <p style={{ fontSize: 15.5, lineHeight: 1.65, color: '#4E4566', margin: 0, padding: '0 36px 22px 2px', textWrap: 'pretty' }}>{f.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 9 · CTA FINAL ── */}
      <section style={{ background: 'linear-gradient(135deg,#6447F5,#180F2E)', padding: `clamp(88px,11vw,150px) ${PAD_X}` }}>
        <div className="lp-reveal" style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 'clamp(34px,5vw,56px)', lineHeight: 1.08, letterSpacing: '-0.01em', margin: 0, color: '#FFFFFF', textWrap: 'balance' }}>¿Tu restaurante listo para fluir?</h2>
          <p style={{ fontSize: 'clamp(16px,1.8vw,18px)', fontWeight: 400, lineHeight: 1.6, color: 'rgba(255,255,255,.8)', margin: 0, maxWidth: 540, textWrap: 'pretty' }}>Agenda una demo de 20 minutos. Te mostramos Fluvio funcionando en vivo con un restaurante real en León.</p>
          <a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className="lp-cta lp-cta--white" style={{ marginTop: 10, fontSize: 16.5, padding: '16px 34px' }}>
            Agenda tu demo gratis <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* ── 10 · FOOTER ── */}
      <footer style={{ background: '#180F2E', borderTop: '1px solid rgba(255,255,255,.08)', padding: `40px ${PAD_X}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo size={24} variant="mono" />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 15, letterSpacing: '.02em', color: '#FFFFFF' }}>FLUVIO</span>
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)' }}>Todo fluye.</span>
            </span>
          </div>
          <nav style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 24px', fontSize: 13.5 }}>
            <a href="#" className="lp-foot-link">Términos</a>
            <a href="#" className="lp-foot-link">Privacidad</a>
            <a href="mailto:contacto@fluvio.mx" className="lp-foot-link">contacto@fluvio.mx</a>
          </nav>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>Hecho en León, Guanajuato</span>
        </div>
      </footer>
    </div>
  )
}
