'use client'
import { useState } from 'react'
import { X, Loader2, FileText, Info } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function apiFetch(path: string, init?: RequestInit) {
  const { data } = await createClient().auth.getSession()
  const token = data.session?.access_token ?? ''
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

// Catálogos SAT más comunes en restaurantes
const USOS_CFDI = [
  { value: 'G03', label: 'G03 – Gastos en general' },
  { value: 'S01', label: 'S01 – Sin efectos fiscales' },
  { value: 'G01', label: 'G01 – Adquisición de mercancias' },
  { value: 'G02', label: 'G02 – Devoluciones, descuentos o bonificaciones' },
  { value: 'D01', label: 'D01 – Honorarios médicos y dentales' },
  { value: 'D04', label: 'D04 – Donativos' },
]

const REGIMENES_RECEPTOR = [
  { value: '616', label: '616 – Sin obligaciones fiscales' },
  { value: '601', label: '601 – General de Ley Personas Morales' },
  { value: '603', label: '603 – Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 – Sueldos y Salarios' },
  { value: '606', label: '606 – Arrendamiento' },
  { value: '608', label: '608 – Demás ingresos' },
  { value: '612', label: '612 – Personas Físicas con Actividades Empresariales' },
  { value: '621', label: '621 – Incorporación Fiscal' },
  { value: '626', label: '626 – Régimen Simplificado de Confianza (RESICO)' },
]

const FORMAS_PAGO = [
  { value: '01', label: '01 – Efectivo' },
  { value: '03', label: '03 – Transferencia electrónica' },
  { value: '04', label: '04 – Tarjeta de crédito' },
  { value: '28', label: '28 – Tarjeta de débito' },
  { value: '99', label: '99 – Por definir' },
]

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export function NuevaCFDIModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    receptor_rfc: '',
    receptor_nombre: '',
    receptor_email: '',
    receptor_cp: '',
    receptor_regimen: '616',
    receptor_uso_cfdi: 'G03',
    concepto: 'Alimentos y bebidas',
    subtotal: '',
    forma_pago: '03',
  })

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const isPublicoGeneral = !form.receptor_rfc || form.receptor_rfc.toUpperCase() === 'XAXX010101000'

  function fillPublicoGeneral() {
    setForm(prev => ({
      ...prev,
      receptor_rfc: 'XAXX010101000',
      receptor_nombre: 'PUBLICO EN GENERAL',
      receptor_cp: '99999',
      receptor_regimen: '616',
      receptor_uso_cfdi: 'S01',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.subtotal || Number(form.subtotal) <= 0) {
      setError('El subtotal debe ser mayor a $0')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/billing/cfdis', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          subtotal: Number(form.subtotal),
          receptor_rfc: form.receptor_rfc.trim().toUpperCase(),
          receptor_nombre: form.receptor_nombre.trim().toUpperCase(),
          receptor_email: form.receptor_email.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail ?? 'Error generando CFDI')
      }
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const iva = form.subtotal ? Math.round(Number(form.subtotal) * 0.16 * 100) / 100 : 0
  const total = form.subtotal ? Math.round((Number(form.subtotal) + iva) * 100) / 100 : 0

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(3px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto', margin: 16,
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--violet-soft)', borderRadius: 'var(--r)', padding: 8 }}>
            <FileText size={18} style={{ color: 'var(--violet)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Nueva factura CFDI 4.0</div>
            <div className="faint" style={{ fontSize: 13 }}>Se timbrará directamente ante el SAT vía Facturama</div>
          </div>
          <button className="btn btn-icon btn-subtle btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {/* Botón público en general */}
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={fillPublicoGeneral}
              style={{ width: '100%', justifyContent: 'center', gap: 6 }}
            >
              <Info size={14} />
              Público en general (sin RFC)
            </button>
          </div>

          {/* Datos del receptor */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-3)', marginBottom: 10 }}>
              Datos del cliente
            </div>

            <div className="col" style={{ gap: 10 }}>
              <div className="row gap-10">
                <div style={{ flex: 1 }}>
                  <label className="label">RFC *</label>
                  <input
                    className="input"
                    required
                    placeholder="XAXX010101000"
                    value={form.receptor_rfc}
                    onChange={set('receptor_rfc')}
                    maxLength={13}
                    style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)' }}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label className="label">Nombre o razón social *</label>
                  <input
                    className="input"
                    required
                    placeholder="JUAN PEREZ GARCIA"
                    value={form.receptor_nombre}
                    onChange={set('receptor_nombre')}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div className="row gap-10">
                <div style={{ flex: 1 }}>
                  <label className="label">CP fiscal *</label>
                  <input
                    className="input"
                    required
                    placeholder="37000"
                    value={form.receptor_cp}
                    onChange={set('receptor_cp')}
                    maxLength={5}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Email (opcional)</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="cliente@email.com"
                    value={form.receptor_email}
                    onChange={set('receptor_email')}
                  />
                </div>
              </div>

              <div className="row gap-10">
                <div style={{ flex: 1 }}>
                  <label className="label">Régimen fiscal</label>
                  <select
                    className="input"
                    value={form.receptor_regimen}
                    onChange={set('receptor_regimen')}
                    disabled={isPublicoGeneral}
                  >
                    {REGIMENES_RECEPTOR.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Uso del CFDI</label>
                  <select
                    className="input"
                    value={form.receptor_uso_cfdi}
                    onChange={set('receptor_uso_cfdi')}
                    disabled={isPublicoGeneral}
                  >
                    {USOS_CFDI.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Concepto y monto */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-3)', marginBottom: 10 }}>
              Concepto y monto
            </div>

            <div className="col" style={{ gap: 10 }}>
              <div>
                <label className="label">Descripción del concepto *</label>
                <input
                  className="input"
                  required
                  value={form.concepto}
                  onChange={set('concepto')}
                />
              </div>

              <div className="row gap-10">
                <div style={{ flex: 1 }}>
                  <label className="label">Subtotal (sin IVA) *</label>
                  <input
                    className="input"
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.subtotal}
                    onChange={set('subtotal')}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Forma de pago</label>
                  <select className="input" value={form.forma_pago} onChange={set('forma_pago')}>
                    {FORMAS_PAGO.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen */}
          {form.subtotal && Number(form.subtotal) > 0 && (
            <div style={{
              background: 'var(--surface-2)', borderRadius: 'var(--r)',
              padding: '12px 16px', marginBottom: 18,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="faint" style={{ fontSize: 13.5 }}>Subtotal</span>
                <span style={{ fontSize: 13.5 }}>
                  ${Number(form.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="faint" style={{ fontSize: 13.5 }}>IVA 16%</span>
                <span style={{ fontSize: 13.5 }}>
                  ${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 6, marginTop: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>
                  ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#991b1b', borderRadius: 'var(--r)',
              padding: '10px 14px', fontSize: 13.5, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <div className="row gap-10" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><Loader2 size={15} className="spin" />Timbrando…</> : 'Generar CFDI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
