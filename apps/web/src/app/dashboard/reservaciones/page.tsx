'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { ReservationRow } from '@/components/ReservationRow'
import { EmptyState } from '@/components/EmptyState'
import { ReservationDrawer } from '@/components/ReservationDrawer'
import { Toast } from '@/components/Toast'
import type { Reservation, Client, ReservationStatus } from '@/lib/data'
import { toReservation, toClient, clientFromReservation } from '@/lib/transform'
import { createClient } from '@/utils/supabase/client'

const STATUSES = [
  { value: 'todas',      label: 'Todas'      },
  { value: 'pendiente',  label: 'Pendiente'  },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'sentada',    label: 'Sentada'    },
  { value: 'no_show',    label: 'No-show'    },
  { value: 'cancelada',  label: 'Cancelada'  },
]

const DAYS = [
  { value: 'todas',  label: 'Todas las fechas' },
  { value: 'hoy',    label: 'Hoy'              },
  { value: 'manana', label: 'Mañana'           },
  { value: 'ayer',   label: 'Ayer'             },
]

export default function ReservacionesPage() {
  const [reservas, setReservas] = useState<Reservation[]>([])
  const [clients, setClients] = useState<Record<string, Client>>({})
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('todas')
  const [day, setDay] = useState('todas')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)

    let query = supabase
      .from('reservations')
      .select('*, customers(*), tables(*)')
      .order('fecha_hora', { ascending: false })

    if (day === 'hoy')    query = query.gte('fecha_hora', today.toISOString()).lt('fecha_hora', tomorrow.toISOString())
    if (day === 'manana') query = query.gte('fecha_hora', tomorrow.toISOString()).lt('fecha_hora', new Date(tomorrow.getTime() + 86400000).toISOString())
    if (day === 'ayer')   query = query.gte('fecha_hora', yesterday.toISOString()).lt('fecha_hora', today.toISOString())
    if (status !== 'todas') query = query.eq('estado', status)

    const { data } = await query.limit(100)
    if (data) {
      const cMap: Record<string, Client> = {}
      data.forEach(row => {
        const c = clientFromReservation(row)
        if (c) cMap[c.id] = c
      })
      setClients(cMap)
      setReservas(data.map(toReservation))
    }
  }, [day, status])

  useEffect(() => { load() }, [load])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2400)
  }

  async function handleAction(id: string, action: string) {
    const nextStatus: Record<string, ReservationStatus> = {
      confirmar: 'confirmada', sentar: 'sentada', no_show: 'no_show', cancelar: 'cancelada', revertir: 'confirmada',
    }
    if (action === 'edit') return

    const supabase = createClient()

    if (action === 'eliminar') {
      if (!confirm('¿Eliminar esta reservación? Esta acción no se puede deshacer.')) return
      const { error } = await supabase.from('reservations').delete().eq('id', id)
      if (!error) {
        setReservas(prev => prev.filter(r => r.id !== id))
        showToast('Reservación eliminada', 'success')
      } else {
        showToast('No se pudo eliminar', 'error')
      }
      return
    }

    const next = nextStatus[action]
    if (!next) return
    const { error } = await supabase.from('reservations').update({ estado: next }).eq('id', id)
    if (!error) {
      setReservas(prev => prev.map(r => r.id === id ? { ...r, status: next } : r))
      const msgs: Record<string, string> = { confirmar: 'Reserva confirmada', sentar: 'Cliente sentado', no_show: 'No-show marcado', cancelar: 'Cancelada', revertir: 'Reserva vuelta a confirmada' }
      showToast(msgs[action], action === 'no_show' ? 'error' : 'success')
    } else {
      showToast('No se pudo actualizar', 'error')
    }
  }

  const filtradas = reservas.filter(r => {
    const cl = clients[r.clientId]
    const matchQ = !q || (cl?.name.toLowerCase().includes(q.toLowerCase()) ?? false) || (cl?.phone.includes(q) ?? false)
    return matchQ
  })

  return (
    <div>
      <PageHeader
        title="Reservaciones"
        subtitle={`${reservas.length} reservas · ${reservas.filter(r => r.status === 'pendiente').length} pendientes`}
        actions={
          <button className="btn btn-primary" onClick={() => setDrawerOpen(true)}>
            <Plus size={17} />Nueva reservación
          </button>
        }
      />

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="row gap-12" style={{ flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ flex: '1', minWidth: 200 }}>
            <svg className="s-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input className="input" placeholder="Buscar por nombre o teléfono…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select className="select" style={{ width: 180 }} value={day} onChange={e => setDay(e.target.value)}>
            {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select className="select" style={{ width: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="row gap-8" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => setStatus(s.value)} className="chip chip-on"
              style={status === s.value ? { background: 'var(--ink)', color: '#fff', border: '1px solid var(--ink)' } : {}}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {filtradas.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            body="No hay reservas que coincidan con los filtros seleccionados."
            action={<button className="btn btn-soft" onClick={() => { setQ(''); setStatus('todas'); setDay('todas') }}>Limpiar filtros</button>}
          />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Hora</th><th>Cliente</th>
                    <th className="hide-sm">Día</th><th className="hide-sm">Pers.</th>
                    <th className="hide-sm">Mesa</th><th className="hide-sm">Canal</th>
                    <th>Estado</th><th />
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(r => (
                    <ReservationRow key={r.id} res={r} client={clients[r.clientId]} onAction={handleAction} />
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="faint" style={{ fontSize: 13 }}>Mostrando {filtradas.length} de {reservas.length}</span>
              <div className="row gap-6">
                <button className="btn btn-sm btn-ghost">← Anterior</button>
                <button className="btn btn-sm btn-primary">1</button>
                <button className="btn btn-sm btn-ghost">Siguiente →</button>
              </div>
            </div>
          </>
        )}
      </div>

      {drawerOpen && (
        <ReservationDrawer
          onClose={() => setDrawerOpen(false)}
          onSave={() => { setDrawerOpen(false); showToast('Reservación creada'); load() }}
        />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
