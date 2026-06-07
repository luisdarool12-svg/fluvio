'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowLeft, MessageCircle } from 'lucide-react'
import { Logo, Wordmark } from '@/components/Logo'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: pass })
    setLoading(false)
    if (authError) {
      setError('Email o contraseña incorrectos. Intenta de nuevo.')
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Lado izquierdo — dark */}
      <div style={{
        flex: 1, background: 'var(--accent-deep)', display: 'flex', flexDirection: 'column',
        padding: '40px 52px', position: 'relative', overflow: 'hidden',
      }} className="hide-sm">
        {/* Glows */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <a href="/" style={{ display: 'inline-flex' }}>
          <Wordmark size={28} />
        </a>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 380 }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 32, lineHeight: 1.1 }}>
            Reservaciones inteligentes para tu restaurante.
          </h1>

          {/* Testimonio */}
          <div style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 'var(--r-lg)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div className="ai-pulse" style={{ background: '#fff' }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>
                Fluvio · En vivo
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 15, lineHeight: 1.6, marginBottom: 14 }}>
              "Antes perdíamos 3 o 4 mesas cada fin de semana por no-shows. Desde Fluvio, casi no pasa."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 99, background: 'var(--accent)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>LD</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>Luis Duble</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Dublé Bistró, León Gto.</div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>© 2026 Fluvio · Todos los derechos reservados</p>
      </div>

      {/* Lado derecho — formulario */}
      <div style={{ flex: 1, maxWidth: 520, display: 'flex', flexDirection: 'column', padding: '32px 52px', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a href="/" className="btn btn-subtle btn-sm">
            <ArrowLeft size={15} />Volver
          </a>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 380, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 32 }}>
            <Logo size={40} />
            <h1 style={{ fontSize: 26, marginTop: 20, marginBottom: 6 }}>
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h1>
            <p className="muted" style={{ fontSize: 15 }}>
              {mode === 'login' ? 'Entra a tu panel de reservaciones.' : 'Empieza 14 días gratis, sin tarjeta.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <div className="field">
                <label>Nombre del restaurante</label>
                <input className="input" type="text" placeholder="Ej. Dublé Bistró" />
              </div>
            )}

            <div className="field">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                <input
                  className="input"
                  type="email"
                  placeholder="tu@restaurante.mx"
                  style={{ paddingLeft: 40 }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Contraseña</label>
                {mode === 'login' && (
                  <a href="#" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>¿Olvidaste?</a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  style={{ paddingLeft: 40 }}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 13.5, color: '#B91C1C' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 4 }}>
              {loading ? <span className="spin" /> : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--ink-3)', fontSize: 13 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            o
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <button className="btn btn-ghost btn-block">
            <MessageCircle size={17} style={{ color: '#25D366' }} />
            Continuar con WhatsApp Business
          </button>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--ink-2)' }}>
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Regístrate gratis' : 'Iniciar sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
