'use client'
import { useState, useEffect } from 'react'
import { X, CalendarCheck } from 'lucide-react'
import type { ReservationChannel } from '@/lib/data'
import { createClient } from '@/utils/supabase/client'

interface ReservationDrawerProps {
  onClose: () => void
  onSave: () => void
}

const CHANNELS: { value: ReservationChannel; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'web',      label: 'Web'      },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'manual',   label: 'Manual'   },
]

interface ClientOption { id: string; name: string; phone: string; visits: number }
interface TableOption  { id: string; name: string; zone: string;  cap: number   }

export function ReservationDrawer({ onClose, onSave }: ReservationDrawerProps) {
  const [clientQ, setClientQ]           = useState('')
  const [selected, setSelected]         = useState<ClientOption | null>(null)
  const [showPicker, setShowPicker]     = useState(false)
  const [clients, setClients]           = useState<ClientOption[]>([])
  const [tables, setTables]             = useState<TableOption[]>([])
  const [people, setPeople]             = useState(2)
  const [channel, setChannel]           = useState<ReservationChannel>('manual')
  const [date, setDate]                 = useState(new Date().toISOString().split('T')[0])
  const [time, setTime]                 = useState('13:00')
  const [mesa, setMesa]                 = useState('')
  const [notes, setNotes]               = useState('')
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')

  // Load customers and active tables from Supabase on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.from('customers').select('id, nombre, telefono, visitas').order('nombre')
      .then(({ data }) => {
        if (data) setClients(data.map(c => ({
          id: c.id, name: c.nombre, phone: c.telefono ?? '', visits: c.visitas ?? 0,
        })))
      })
    supabase.from('tables').select('id, nombre, zona, capacidad').eq('activo', true).order('nombre')
      .then(({ data }) => {
        if (data) setTables(data.map(t => ({
          id: t.id, name: t.nombre, zone: t.zona ?? 'Interior', cap: t.capacidad,
        })))
      })
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(clientQ.toLowerCase()) || c.phone.includes(clientQ)
  ).slice(0, 5)

  async function handleSave() {
    if (!selected && !clientQ.trim()) { setError('Selecciona o escribe un cliente'); return }
    setSaving(true); setError('')
    const supabase = createClient()

    // Need business_id for INSERT (RLS requires it explicitly)
    const { data: userRow } = await supabase.from('users').select('business_id').single()
    if (!userRow) { setError('Error de sesión. Recarga la página.'); setSaving(false); return }
    const businessId = userRow.business_id

    // Create customer on the fly if not found in DB
    let customerId = selected?.id ?? null
    if (!selected && clientQ.trim()) {
      const { data: newCust, error: custErr } = await supabase
        .from('customers')
        .insert({ nombre: clientQ.trim(), telefono: '', visitas: 0, business_id: businessId })
        .select('id')
        .single()
      if (custErr || !newCust) { setError('No se pudo crear el cliente'); setSaving(false); return }
      customerId = newCust.id
    }

    const { error: resErr } = await supabase.from('reservations').insert({
      customer_id:  customerId,
      table_id:     mesa || null,
      // Construye el instante en la zona horaria local del navegador (la del
      // restaurante) y lo guarda en ISO con offset, para que la hora mostrada
      // coincida con la capturada. Guardar el string naïve lo interpretaba como UTC.
      fecha_hora:   new Date(`${date}T${time}:00`).toISOString(),
      personas:     people,
      canal:        channel,
      estado:       'pendiente',
      notas:        notes.trim() || null,
      business_id:  businessId,
    })

    setSaving(false)
    if (resErr) { setError('Error al guardar: ' + resErr.message); return }
    onSave()
  }

  const todayLabel = new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <span style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent)', flex: 'none' }}>
            <CalendarCheck size={18} />
          </span>
          <div className="col" style={{ gap: 1, flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Nueva reservación
            </span>
            <span className="faint" style={{ fontSize: 13 }}>Dublé Bistró · {todayLabel}</span>
          </div>
          <button className="btn btn-icon btn-subtle" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          {/* Cliente */}
          <div className="field" style={{ position: 'relative' }}>
            <label>Cliente</label>
            <input
              className="input"
              placeholder="Buscar nombre o teléfono…"
              value={clientQ}
              onChange={e => { setClientQ(e.target.value); setSelected(null); setShowPicker(true) }}
              onFocus={() => setShowPicker(true)}
              onBlur={() => setTimeout(() => setShowPicker(false), 150)}
            />
            {selected && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flex: 'none' }}>
                  {selected.name[0]}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.name}</span>
                <span className="faint" style={{ fontSize: 12 }}>{selected.phone} · {selected.visits} visitas</span>
                <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 12 }}
                  onClick={() => { setSelected(null); setClientQ('') }}>✕</button>
              </div>
            )}
            {showPicker && clientQ && !selected && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', boxShadow: 'var(--shadow-lg)', zIndex: 10, marginTop: 4 }}>
                {filtered.map(c => (
                  <div key={c.id} style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseDown={() => { setSelected(c); setClientQ(c.name); setShowPicker(false) }}>
                    <div style={{ width: 30, height: 30, borderRadius: 99, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flex: 'none' }}>
                      {c.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
                      <div className="faint" style={{ fontSize: 12 }}>{c.phone} · {c.visits} visitas</div>
                    </div>
                  </div>
                ))}
                {!filtered.length && (
                  <div style={{ padding: '10px 14px', color: 'var(--accent)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}
                    onMouseDown={() => setShowPicker(false)}>
                    + Crear cliente «{clientQ}»
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fecha y hora */}
          <div className="row gap-12">
            <div className="field" style={{ flex: 1 }}>
              <label>Fecha</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Hora</label>
              <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          {/* Personas */}
          <div className="field">
            <label>Número de personas</label>
            <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
              {[1,2,3,4,5,6,7,8].map(n => (
                <button key={n} className={`btn btn-sm ${people === n ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ width: 40 }} onClick={() => setPeople(n)}>
                  {n}
                </button>
              ))}
              <button className={`btn btn-sm ${people > 8 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeople(10)}>
                +8
              </button>
            </div>
          </div>

          {/* Mesa */}
          <div className="field">
            <label>Mesa (opcional)</label>
            <select className="select" value={mesa} onChange={e => setMesa(e.target.value)}>
              <option value="">Asignar automáticamente</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.name} · {t.zone} · {t.cap} pers.</option>
              ))}
            </select>
          </div>

          {/* Canal */}
          <div className="field">
            <label>Canal</label>
            <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
              {CHANNELS.map(c => (
                <button key={c.value}
                  className={`btn btn-sm ${channel === c.value ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setChannel(c.value)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="field">
            <label>Notas</label>
            <textarea className="textarea" placeholder="Alergias, preferencias, ocasión especial…"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="drawer-foot">
          {error && (
            <p style={{ color: '#DC2626', fontSize: 12.5, marginBottom: 8, gridColumn: '1/-1', background: '#FEF2F2', padding: '8px 12px', borderRadius: 'var(--r)', border: '1px solid #FECACA' }}>
              {error}
            </p>
          )}
          <button className="btn btn-ghost btn-block" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn btn-primary btn-block" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Crear reservación'}
          </button>
        </div>
      </div>
    </>
  )
}
