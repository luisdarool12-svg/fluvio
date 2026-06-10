'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Table } from '@/lib/data'
import { createClient } from '@/utils/supabase/client'

interface MesaEditModalProps {
  mesa: Table
  todas: Table[]
  onSaved: (patch: { estanciaMin: number; combinableCon: string[] }) => void
  onClose: () => void
}

/**
 * Edita los parámetros del motor de disponibilidad de una mesa:
 * tiempo promedio de estancia y con qué mesas puede combinarse.
 */
export function MesaEditModal({ mesa, todas, onSaved, onClose }: MesaEditModalProps) {
  const [estancia, setEstancia] = useState(mesa.estanciaMin)
  const [combinables, setCombinables] = useState<string[]>(mesa.combinableCon)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const candidatas = todas.filter(t => t.id !== mesa.id && t.active)

  function toggleCombinable(id: string) {
    setCombinables(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function save() {
    if (estancia < 15 || estancia > 480) {
      setError('La estancia debe estar entre 15 y 480 minutos')
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: dbError } = await supabase.from('tables').update({
      tiempo_promedio_estancia: estancia,
      combinable_con: combinables,
    }).eq('id', mesa.id)
    setSaving(false)
    if (dbError) {
      setError('Error al guardar — verifica que ejecutaste la migración 008 en Supabase')
      return
    }
    onSaved({ estanciaMin: estancia, combinableCon: combinables })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{mesa.name}</h2>
          <button className="btn btn-icon btn-subtle btn-sm" onClick={onClose} aria-label="Cerrar"><X size={16} /></button>
        </div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 20 }}>
          Parámetros que usa el bot para decidir disponibilidad.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="field">
            <label>Tiempo promedio de estancia (minutos)</label>
            <input className="input" type="number" min={15} max={480} step={15} value={estancia}
              onChange={e => setEstancia(Number(e.target.value))} />
            <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
              Cuánto permanece ocupada la mesa por reservación. Default: 90 min.
            </p>
          </div>

          <div className="field">
            <label>Combinable con</label>
            {candidatas.length === 0 ? (
              <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 0' }}>No hay otras mesas activas.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {candidatas.map(t => {
                  const on = combinables.includes(t.id)
                  return (
                    <button key={t.id} type="button" onClick={() => toggleCombinable(t.id)}
                      aria-pressed={on}
                      style={{
                        padding: '5px 12px', borderRadius: 'var(--r-pill)', fontSize: 12.5, fontWeight: 600,
                        cursor: 'pointer',
                        border: on ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                        background: on ? 'var(--accent-soft)' : 'var(--surface)',
                        color: on ? 'var(--accent)' : 'var(--ink-2)',
                      }}>
                      {t.name} · {t.cap}p
                    </button>
                  )
                })}
              </div>
            )}
            <p className="muted" style={{ fontSize: 12, margin: '6px 0 0' }}>
              Para grupos grandes, el bot puede juntar esta mesa con las seleccionadas.
            </p>
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: 12.5, margin: 0 }}>{error}</p>}

          <div className="row gap-10">
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}>
              {saving ? <span className="spin" /> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
