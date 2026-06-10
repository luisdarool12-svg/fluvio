'use client'
import { useState } from 'react'
import { Clock, X } from 'lucide-react'

export interface OverrideInfo {
  id: string
  valid_from: string
  valid_until: string
  motivo: string | null
}

interface FloorPlanOverrideBarProps {
  override: OverrideInfo | null
  isOwner: boolean
  busy: boolean
  onActivate: (horas: number, motivo: string) => void
  onRevert: () => void
}

const DURACIONES = [
  { horas: 2, label: '2 horas' },
  { horas: 4, label: '4 horas' },
  { horas: 8, label: '8 horas' },
  { horas: 24, label: '24 horas' },
]

function fmtHora(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

/**
 * Banner + controles del layout temporal del salón.
 * - Sin override: botón "Activar modo temporal" (abre modal duración + motivo).
 * - Con override: banner naranja con vigencia y botón "Revertir ahora".
 */
export function FloorPlanOverrideBar({ override, isOwner, busy, onActivate, onRevert }: FloorPlanOverrideBarProps) {
  const [showModal, setShowModal] = useState(false)
  const [horas, setHoras] = useState(4)
  const [motivo, setMotivo] = useState('')

  function activate() {
    onActivate(horas, motivo.trim())
    setShowModal(false)
    setMotivo('')
  }

  if (override) {
    return (
      <div role="status" style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 'var(--r)',
        padding: '10px 14px', marginBottom: 12,
      }}>
        <Clock size={16} color="#ea580c" />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#9a3412' }}>
          Layout temporal activo — revierte a las {fmtHora(override.valid_until)}
        </span>
        {override.motivo && (
          <span style={{ fontSize: 12.5, color: '#c2410c' }}>· {override.motivo}</span>
        )}
        {isOwner && (
          <button className="btn" onClick={onRevert} disabled={busy}
            style={{ marginLeft: 'auto', fontSize: 12.5, padding: '5px 12px', background: '#ffedd5', color: '#9a3412', border: '1px solid #fdba74', borderRadius: 'var(--r-sm)', fontWeight: 600 }}>
            {busy ? <span className="spin" /> : 'Revertir ahora'}
          </button>
        )}
      </div>
    )
  }

  if (!isOwner) return null

  return (
    <>
      <button className="btn btn-soft" onClick={() => setShowModal(true)} disabled={busy}>
        <Clock size={15} />Activar modo temporal
      </button>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Layout temporal</h2>
              <button className="btn btn-icon btn-subtle btn-sm" onClick={() => setShowModal(false)} aria-label="Cerrar"><X size={16} /></button>
            </div>
            <p className="muted" style={{ fontSize: 12.5, marginBottom: 20 }}>
              Reacomoda el croquis para un evento sin tocar el plano base.
              Al expirar, todo vuelve automáticamente a su lugar.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Duración</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 4 }}>
                  {DURACIONES.map(d => (
                    <button key={d.horas} type="button" onClick={() => setHoras(d.horas)}
                      style={{
                        padding: '8px 4px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        border: horas === d.horas ? '2px solid var(--accent)' : '1px solid var(--line)',
                        background: horas === d.horas ? 'var(--accent-soft)' : 'var(--surface)',
                      }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Motivo</label>
                <input className="input" type="text" placeholder="Ej. Evento privado, cena de grupo…"
                  value={motivo} onChange={e => setMotivo(e.target.value)} />
              </div>
              <div className="row gap-10">
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={activate} disabled={busy}>
                  {busy ? <span className="spin" /> : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
