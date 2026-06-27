'use client'
import { useState, useEffect } from 'react'
import { TriangleAlert, Zap, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import EmbeddedSignup from '@/components/EmbeddedSignup'
import { apiFetch } from '@/lib/api'

type Tab = 'perfil' | 'whatsapp' | 'notificaciones' | 'plan'

const TABS: { value: Tab; label: string }[] = [
  { value: 'perfil',          label: 'Perfil'         },
  { value: 'whatsapp',        label: 'WhatsApp'       },
  { value: 'notificaciones',  label: 'Notificaciones' },
  { value: 'plan',            label: 'Plan'           },
]

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
  whatsapp_connected?: boolean
  whatsapp_token_days_left?: number | null
  whatsapp_token_warning?: boolean
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

  useEffect(() => {
    let cancelled = false
    apiFetch('/business/me')
      .then(r => r.json())
      .then(data => { if (!cancelled) setSettings(s => ({ ...s, ...data })) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const save = async (patch: Partial<Settings>) => {
    setSaving(true)
    try {
      const res = await apiFetch('/business/me', {
        method: 'PATCH',
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

      {/* Plano base del salón: única entrada para editarlo (en Mesas las
          posiciones son fijas salvo que haya un layout temporal activo) */}
      {tab === 'perfil' && (
        <div className="card card-pad" style={{ marginTop: 14 }}>
          <div className="row" style={{ gap: 24, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Plano del salón</h3>
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                Posiciones base de mesas, zonas, paredes y mobiliario. Para reacomodos
                puntuales usa el modo temporal en la página de Mesas.
              </p>
            </div>
            <a className="btn btn-soft" href="/dashboard/mesas?editarBase=1" style={{ flex: 'none' }}>
              Editar plano base
            </a>
          </div>
        </div>
      )}

      {tab === 'whatsapp' && (
        <div className="col gap-14">
          {settings.whatsapp_token_warning && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
              <AlertCircle size={18} style={{ color: '#B45309', flex: 'none', marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 3 }}>
                  Token de WhatsApp por vencer
                </div>
                <div style={{ fontSize: 13, color: '#92400E' }}>
                  Tu conexión de WhatsApp expira en{' '}
                  <strong>{settings.whatsapp_token_days_left ?? 0} día{settings.whatsapp_token_days_left === 1 ? '' : 's'}</strong>.
                  Reconecta ahora usando el botón de abajo para no interrumpir el servicio.
                </div>
              </div>
            </div>
          )}

          <div className="card card-pad">
            <EmbeddedSignup />
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Configuración del bot</h3>
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
                onClick={() => save({ mensaje_bienvenida: settings.mensaje_bienvenida, tomar_24h: settings.tomar_24h })}
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
            <div className="row gap-10" style={{ marginBottom: 12 }}>
              <Zap size={20} />
              <span style={{ fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)' }}>Plan Starter</span>
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.15)', borderRadius: 'var(--r-pill)', padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>Activo</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13.5, margin: 0 }}>
              Reservaciones ilimitadas · 1 número de WhatsApp · Agente IA 24/7
            </p>
          </div>

          <div className="card card-pad">
            <div className="row gap-10" style={{ marginBottom: 12 }}>
              <Zap size={16} style={{ color: 'var(--accent)', flex: 'none' }} />
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>¿Necesitas más números o funcionalidades?</div>
                <div className="faint" style={{ fontSize: 13 }}>
                  Escríbenos para hablar de tu plan: agregar números de WhatsApp, integraciones personalizadas o descuentos por volumen.
                </div>
              </div>
            </div>
            <div className="row gap-10" style={{ flexWrap: 'wrap' }}>
              <a
                href="mailto:hola@gofluvio.com?subject=Quiero%20mejorar%20mi%20plan"
                className="btn btn-primary btn-sm"
              >
                <Zap size={14} />Contactar a Fluvio
              </a>
              <a
                href="https://wa.me/521XXXXXXXXXX?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20los%20planes%20de%20Fluvio"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-soft btn-sm"
              >
                WhatsApp
              </a>
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
