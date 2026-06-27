'use client'
import { useState, useEffect } from 'react'
import { X, Loader2, Settings2, CheckCircle2, AlertCircle } from 'lucide-react'
import { apiFetch } from '@/lib/api'

const REGIMENES_EMISOR = [
  { value: '601', label: '601 – General de Ley Personas Morales' },
  { value: '603', label: '603 – Personas Morales con Fines no Lucrativos' },
  { value: '606', label: '606 – Arrendamiento' },
  { value: '612', label: '612 – Personas Físicas con Actividades Empresariales' },
  { value: '621', label: '621 – Incorporación Fiscal' },
  { value: '626', label: '626 – RESICO' },
]

interface Props {
  onClose: () => void
  onSaved: () => void
}

export function ConfigFiscalModal({ onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    rfc: '',
    razon_social: '',
    regimen_fiscal: '601',
    cp_fiscal: '',
    facturama_user: '',
    facturama_password: '',
    facturama_sandbox: true,
    serie_default: 'A',
    forma_pago_default: '03',
    iva_porcentaje: 16,
  })

  useEffect(() => {
    setLoading(true)
    apiFetch('/billing/config')
      .then(r => r.json())
      .then(data => {
        setForm(prev => ({
          ...prev,
          rfc: data.rfc ?? '',
          razon_social: data.razon_social ?? '',
          regimen_fiscal: data.regimen_fiscal ?? '601',
          cp_fiscal: data.cp_fiscal ?? '',
          facturama_user: data.facturama_user ?? '',
          facturama_sandbox: data.facturama_sandbox ?? true,
          serie_default: data.serie_default ?? 'A',
          forma_pago_default: data.forma_pago_default ?? '03',
          iva_porcentaje: data.iva_porcentaje ?? 16,
        }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await apiFetch('/billing/config', {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          iva_porcentaje: Number(form.iva_porcentaje),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail ?? 'Error guardando configuración')
      }
      setSaved(true)
      setTimeout(() => { onSaved() }, 900)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', padding: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Loader2 size={20} className="spin" />
          <span>Cargando configuración…</span>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(3px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', margin: 16 }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--violet-soft)', borderRadius: 'var(--r)', padding: 8 }}>
            <Settings2 size={18} style={{ color: 'var(--violet)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Configuración fiscal</div>
            <div className="faint" style={{ fontSize: 13 }}>Datos del emisor y credenciales de Facturama</div>
          </div>
          <button className="btn btn-icon btn-subtle btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {/* Datos del emisor */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-3)', marginBottom: 12 }}>
              Datos del negocio (Emisor)
            </div>
            <div className="col" style={{ gap: 10 }}>
              <div className="row gap-10">
                <div style={{ flex: 1 }}>
                  <label className="label">RFC del negocio *</label>
                  <input
                    className="input"
                    required
                    placeholder="AAA010101AAA"
                    value={form.rfc}
                    onChange={set('rfc')}
                    maxLength={13}
                    style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">CP fiscal *</label>
                  <input
                    className="input"
                    required
                    placeholder="37000"
                    value={form.cp_fiscal}
                    onChange={set('cp_fiscal')}
                    maxLength={5}
                  />
                </div>
              </div>
              <div>
                <label className="label">Razón social *</label>
                <input
                  className="input"
                  required
                  placeholder="RESTAURANTE DUBLE SA DE CV"
                  value={form.razon_social}
                  onChange={set('razon_social')}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <label className="label">Régimen fiscal *</label>
                <select className="input" value={form.regimen_fiscal} onChange={set('regimen_fiscal')}>
                  {REGIMENES_EMISOR.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Credenciales Facturama */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-3)', marginBottom: 12 }}>
              Credenciales Facturama
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#1e40af' }}>
              Crea tu cuenta en <a href="https://www.facturama.mx" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>facturama.mx</a>. El modo sandbox no genera timbres reales.
            </div>

            <div className="col" style={{ gap: 10 }}>
              <div className="row gap-10">
                <div style={{ flex: 1 }}>
                  <label className="label">Usuario *</label>
                  <input className="input" required placeholder="usuario_facturama" value={form.facturama_user} onChange={set('facturama_user')} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Contraseña *</label>
                  <input className="input" required type="password" placeholder="••••••••" value={form.facturama_password} onChange={set('facturama_password')} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r)' }}>
                <input
                  type="checkbox"
                  checked={form.facturama_sandbox}
                  onChange={e => setForm(prev => ({ ...prev, facturama_sandbox: e.target.checked }))}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Modo sandbox</div>
                  <div className="faint" style={{ fontSize: 12.5 }}>Sin cobro, sin timbres reales — para pruebas</div>
                </div>
              </label>
            </div>
          </div>

          {/* Ajustes de facturación */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-3)', marginBottom: 12 }}>
              Ajustes de facturas
            </div>
            <div className="row gap-10">
              <div style={{ flex: 1 }}>
                <label className="label">Serie por defecto</label>
                <input className="input" value={form.serie_default} onChange={set('serie_default')} maxLength={2} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">IVA (%)</label>
                <input className="input" type="number" min={0} max={100} step={0.1} value={form.iva_porcentaje} onChange={set('iva_porcentaje')} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 13.5, marginBottom: 16 }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 13.5, marginBottom: 16 }}>
              <CheckCircle2 size={15} />
              Configuración guardada
            </div>
          )}

          <div className="row gap-10" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={15} className="spin" />Guardando…</> : 'Guardar configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
