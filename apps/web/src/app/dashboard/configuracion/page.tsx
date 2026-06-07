'use client'
import { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, TriangleAlert, Zap, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { createClient } from '@/utils/supabase/client'

type Tab = 'perfil' | 'whatsapp' | 'notificaciones' | 'plan'

const TABS: { value: Tab; label: string }[] = [
  { value: 'perfil',          label: 'Perfil'         },
  { value: 'whatsapp',        label: 'WhatsApp'       },
  { value: 'notificaciones',  label: 'Notificaciones' },
  { value: 'plan',            label: 'Plan'           },
]

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Settings {
  nombre: string
  zona_horaria: string
  idioma_default: string
  telefono_contacto: string
  mensaje_bienvenida: string
  tomar_24h: boolean
  notif_recordatorio: boolean
  notif_nueva_reserva: boolean
  notif_alerta_noshow: boolean
  notif_resumen_semanal: boolean
}

const DEFAULT_SETTINGS: Settings = {
  nombre: '',
  zona_horaria: 'America/Mexico_City',
  idioma_default: 'es',
  telefono_contacto: '',
  mensaje_bienvenida: '',
  tomar_24h: true,
  notif_recordatorio: true,
  notif_nueva_reserva: true,
  notif_alerta_noshow: true,
  notif_resumen_semanal: false,
}

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>('perfil')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const getToken = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? ''
  }, [])

  useEffect(() => {
    let cancelled = false
    getToken().then(token => {
      if (!token) return
      fetch(`${API}/business/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => { if (!cancelled) setSettings(s => ({ ...s, ...data })) })
        .catch(() => {})
    })
    return () => { cancelled = true }
  }, [getToken])

  const save = async (patch: Partial<Settings>) => {
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/business/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setSettings(s => ({ ...s, ...patch }))
      showToast('Cambios guardados')
    } catch {
      showToast('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-narrow">
      <PageHeader title="Configuración" />

      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.startsWith('Error') ? '#fee2e2' : '#f0fdf4',
          border: `1px solid ${toast.startsWith('Error') ? '#fca5a5' : '#bbf7d0'}`,
          color: toast.startsWith('Error') ? '#991b1b' : '#166534',
          padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 12px rgba(0,0,0,.1)',
        }}>
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--line)', marginBottom: 28, display: 'flex', gap: 0 }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            style={{
              padding: '10px 18px', fontWeight: 600, fontSize: 14.5,
              color: tab === t.value ? 'var(--accent-deep)' : 'var(--ink-2)',
              borderBottom: tab === t.value ? '2px solid var(--accent)' : '2px solid transparent',
              background: 'none', marginBottom: -1,
              transition: 'color .14s, border-color .14s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'perfil' && (
        <div className="card card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Perfil del negocio</h3>
          {([
            { label: 'Nombre del restaurante', key: 'nombre' as const, type: 'text' },
            { label: 'Teléfono de contacto',   key: 'telefono_contacto' as const, type: 'tel' },
          ] as const).map(f => (
            <div key={f.key} className="row" style={{ borderTop: '1px solid var(--line)', padding: '16px 0', gap: 24, alignItems: 'center' }}>
              <label style={{ width: 220, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', flex: 'none' }}>{f.label}</label>
              <input
                className="input"
                type={f.type}
                value={settings[f.key]}
                onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                style={{ flex: 1 }}
              />
            </div>
          ))}
          <div className="row" style={{ borderTop: '1px solid var(--line)', padding: '16px 0', gap: 24, alignItems: 'center' }}>
            <label style={{ width: 220, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', flex: 'none' }}>Zona horaria</label>
            <select
              className="select"
              value={settings.zona_horaria}
              onChange={e => setSettings(s => ({ ...s, zona_horaria: e.target.value }))}
              style={{ flex: 1 }}
            >
              <option value="America/Mexico_City">América/Ciudad de México (CST)</option>
              <option value="America/Monterrey">América/Monterrey</option>
            </select>
          </div>
          <div className="row" style={{ borderTop: '1px solid var(--line)', padding: '16px 0', gap: 24, alignItems: 'center' }}>
            <label style={{ width: 220, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', flex: 'none' }}>Idioma</label>
            <select
              className="select"
              value={settings.idioma_default}
              onChange={e => setSettings(s => ({ ...s, idioma_default: e.target.value }))}
              style={{ flex: 1 }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => save({ nombre: settings.nombre, zona_horaria: settings.zona_horaria, idioma_default: settings.idioma_default, telefono_contacto: settings.telefono_contacto })}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {tab === 'whatsapp' && (
        <div className="col gap-14">
          <div style={{ background: 'var(--st-conf-bg)', border: '1px solid var(--st-conf-dot)', borderRadius: 'var(--r)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 99, background: '#25D366', display: 'grid', placeItems: 'center', flex: 'none' }}>
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--st-conf)' }}>WhatsApp conectado</div>
              <div className="faint" style={{ fontSize: 13 }}>{settings.telefono_contacto || '+52 477 912 3456'} · Bot activo · 1.284 mensajes enviados</div>
            </div>
            <button className="btn btn-sm btn-ghost">Reconectar</button>
          </div>

          <div className="card card-pad">
            <div className="row" style={{ borderTop: '1px solid var(--line)', padding: '16px 0', gap: 24, alignItems: 'center' }}>
              <label style={{ width: 260, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', flex: 'none' }}>Número de WhatsApp Business</label>
              <input
                className="input"
                type="text"
                value={settings.telefono_contacto}
                onChange={e => setSettings(s => ({ ...s, telefono_contacto: e.target.value }))}
                style={{ flex: 1 }}
              />
            </div>
            <div className="row" style={{ borderTop: '1px solid var(--line)', padding: '16px 0', gap: 24, alignItems: 'flex-start' }}>
              <label style={{ width: 260, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', flex: 'none', paddingTop: 10 }}>Mensaje de bienvenida</label>
              <textarea
                className="textarea"
                style={{ flex: 1 }}
                value={settings.mensaje_bienvenida}
                onChange={e => setSettings(s => ({ ...s, mensaje_bienvenida: e.target.value }))}
              />
            </div>
            <div className="row" style={{ borderTop: '1px solid var(--line)', padding: '16px 0', gap: 24, alignItems: 'center' }}>
              <label style={{ width: 260, fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', flex: 'none' }}>Tomar reservas 24/7</label>
              <div
                className={`switch ${settings.tomar_24h ? 'on' : ''}`}
                onClick={() => setSettings(s => ({ ...s, tomar_24h: !s.tomar_24h }))}
                role="switch"
                aria-checked={settings.tomar_24h}
              />
            </div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                disabled={saving}
                onClick={() => save({ telefono_contacto: settings.telefono_contacto, mensaje_bienvenida: settings.mensaje_bienvenida, tomar_24h: settings.tomar_24h })}
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'notificaciones' && (
        <div className="card card-pad">
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Notificaciones</h3>
          <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>Controla qué notificaciones recibes sobre tu negocio.</p>
          {([
            { key: 'notif_recordatorio'   as const, label: 'Recordatorios anti no-show',       desc: 'El bot envía recordatorios 24h y 2h antes' },
            { key: 'notif_nueva_reserva'  as const, label: 'Nueva reserva del bot',             desc: 'Notificación cada vez que el bot agenda una reserva' },
            { key: 'notif_alerta_noshow'  as const, label: 'Alerta de no-show en tiempo real',  desc: 'Aviso inmediato cuando un cliente no se presenta' },
            { key: 'notif_resumen_semanal' as const, label: 'Resumen semanal',                  desc: 'Reporte cada lunes con estadísticas de la semana' },
          ]).map(item => (
            <div key={item.key} className="row" style={{ borderTop: '1px solid var(--line)', padding: '16px 0', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{item.label}</div>
                <div className="faint" style={{ fontSize: 13 }}>{item.desc}</div>
              </div>
              <div
                className={`switch ${settings[item.key] ? 'on' : ''}`}
                onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
                role="switch"
                aria-checked={settings[item.key]}
              />
            </div>
          ))}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={() => save({
                notif_recordatorio: settings.notif_recordatorio,
                notif_nueva_reserva: settings.notif_nueva_reserva,
                notif_alerta_noshow: settings.notif_alerta_noshow,
                notif_resumen_semanal: settings.notif_resumen_semanal,
              })}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {tab === 'plan' && (
        <div className="col gap-14">
          <div style={{ background: 'var(--accent-deep)', borderRadius: 'var(--r-xl)', padding: 24, color: '#fff' }}>
            <div className="row gap-10" style={{ marginBottom: 16 }}>
              <Zap size={20} />
              <span style={{ fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)' }}>Plan Starter</span>
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.15)', borderRadius: 'var(--r-pill)', padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>Activo</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13.5, marginBottom: 18 }}>
              500 reservas/mes · 1 número de WhatsApp
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700 }}>$99<span style={{ fontSize: 15, opacity: .6 }}>/mes</span></span>
            </div>
            <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 99, height: 6, marginBottom: 6 }}>
              <div style={{ background: '#fff', width: '64%', height: '100%', borderRadius: 99 }} />
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span style={{ opacity: .7, fontSize: 12.5 }}>320 de 500 reservas usadas este mes</span>
            </div>
          </div>

          <div className="card card-pad">
            <div className="row" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Método de pago</div>
                <div className="faint" style={{ fontSize: 13 }}>Visa •••• 4242 · vence 12/27</div>
              </div>
              <button className="btn btn-sm btn-ghost"><CreditCard size={14} />Cambiar</button>
            </div>
            <div className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Mejorar a Pro</div>
                <div className="faint" style={{ fontSize: 13 }}>2.000 reservas/mes · 3 números · análisis avanzados</div>
              </div>
              <button className="btn btn-primary btn-sm"><Zap size={14} />Ver Pro</button>
            </div>
          </div>
        </div>
      )}

      {/* Zona de peligro */}
      <div style={{ marginTop: 32, background: '#FCF3F1', border: '1px solid #EBC9C2', borderRadius: 'var(--r-lg)', padding: 22 }}>
        <div className="row gap-10" style={{ marginBottom: 8 }}>
          <TriangleAlert size={18} style={{ color: 'var(--st-no)', flex: 'none' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--st-no)' }}>Zona de peligro</span>
        </div>
        <p style={{ fontSize: 14, color: '#6B3026', marginBottom: 16 }}>
          Cancelar tu cuenta eliminará permanentemente todos tus datos, reservas e historial de clientes. Esta acción no se puede deshacer.
        </p>
        <button className="btn btn-danger">Cancelar cuenta</button>
      </div>
    </div>
  )
}
