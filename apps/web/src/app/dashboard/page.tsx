'use client'
import { useState, useEffect } from 'react'
import { Calendar, CalendarCheck, Users, TrendingUp, MessageCircle, Sparkles, Bell } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { SectionHead } from '@/components/SectionHead'
import { ReservationRow } from '@/components/ReservationRow'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { Avatar } from '@/components/Avatar'
import { Toast } from '@/components/Toast'
import type { Reservation, Client, FeedEvent, ReservationStatus } from '@/lib/data'
import { toReservation, clientFromReservation } from '@/lib/transform'
import { createClient } from '@/utils/supabase/client'

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return `hace ${Math.floor(diff / 86400)} días`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToFeedEvent(row: any): FeedEvent {
  const nombre = row.customers?.nombre ?? 'Cliente'
  const personas = row.personas ?? 1
  const hora = row.fecha_hora
    ? new Date(row.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
    : ''

  let msg = ''
  let kind: FeedEvent['kind'] = 'new'

  if (row.estado === 'confirmada') {
    msg = `confirmó su reservación`
    kind = 'confirm'
  } else if (row.reminder_sent) {
    msg = `recibió recordatorio anti no-show`
    kind = 'remind'
  } else {
    msg = `reservó mesa para ${personas} a las ${hora}`
    kind = 'new'
  }

  return { id: row.id, t: relativeTime(row.created_at), who: nombre, msg, kind }
}

export default function DashboardPage() {
  const [reservas, setReservas] = useState<Reservation[]>([])
  const [clients, setClients] = useState<Record<string, Client>>({})
  const [upcoming, setUpcoming] = useState<{ date: string; day: string; items: Reservation[]; clientMap: Record<string, Client> }[]>([])
  const [seg, setSeg] = useState('Todas')
  const [feed, setFeed] = useState<FeedEvent[]>([])
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [userName, setUserName] = useState('Luis')

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      // Nombre del usuario
      const { data: userRow } = await supabase.from('users').select('nombre').single()
      if (userRow) setUserName(userRow.nombre.split(' ')[0])

      // Reservas de hoy
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: todayRows } = await supabase
        .from('reservations')
        .select('*, customers(*), tables(*)')
        .gte('fecha_hora', today.toISOString())
        .lt('fecha_hora', tomorrow.toISOString())
        .neq('estado', 'cancelada')
        .order('fecha_hora')

      if (todayRows) {
        const cMap: Record<string, Client> = {}
        todayRows.forEach(row => {
          const c = clientFromReservation(row)
          if (c) cMap[c.id] = c
        })
        setClients(cMap)
        setReservas(todayRows.map(toReservation))
      }

      // Próximas reservas (7 días)
      const in7 = new Date(tomorrow); in7.setDate(in7.getDate() + 7)
      const { data: upRows } = await supabase
        .from('reservations')
        .select('*, customers(*), tables(*)')
        .gte('fecha_hora', tomorrow.toISOString())
        .lt('fecha_hora', in7.toISOString())
        .neq('estado', 'cancelada')
        .order('fecha_hora')

      if (upRows && upRows.length > 0) {
        const groups: Record<string, { date: string; day: string; items: Reservation[]; clientMap: Record<string, Client> }> = {}
        upRows.forEach(row => {
          const res = toReservation(row)
          const key = res.date!
          if (!groups[key]) {
            const d = new Date(row.fecha_hora)
            groups[key] = {
              date: d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
              day: res.dayLabel ?? key,
              items: [],
              clientMap: {},
            }
          }
          const c = clientFromReservation(row)
          if (c) groups[key].clientMap[c.id] = c
          groups[key].items.push(res)
        })
        setUpcoming(Object.values(groups).slice(0, 3))
      }

      // Feed de actividad real — últimas 12 reservas
      const { data: feedRows } = await supabase
        .from('reservations')
        .select('id, created_at, estado, personas, fecha_hora, reminder_sent, customers(nombre)')
        .order('created_at', { ascending: false })
        .limit(12)

      if (feedRows) setFeed(feedRows.map(rowToFeedEvent))
    }

    load()

    // Realtime: nueva reserva → aparece en el feed automáticamente
    const channel = supabase
      .channel('reservations-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservations' }, async payload => {
        const { data } = await supabase
          .from('reservations')
          .select('id, created_at, estado, personas, fecha_hora, reminder_sent, customers(nombre)')
          .eq('id', payload.new.id)
          .single()
        if (data) setFeed(prev => [rowToFeedEvent(data), ...prev].slice(0, 12))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

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
      const msgs: Record<string, string> = {
        confirmar: 'Reserva confirmada', sentar: 'Cliente sentado',
        no_show: 'Marcado como no-show', cancelar: 'Reserva cancelada', revertir: 'Reserva vuelta a confirmada',
      }
      showToast(msgs[action], action === 'no_show' ? 'error' : 'success')
    } else {
      showToast('No se pudo actualizar', 'error')
    }
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2400)
  }

  const filtradas = seg === 'Todas' ? reservas
    : seg === 'Comida' ? reservas.filter(r => r.time < '17:00')
    : reservas.filter(r => r.time >= '17:00')

  const confirmadas = reservas.filter(r => r.status === 'confirmada' || r.status === 'sentada').length
  const confirmPct = reservas.length ? Math.round((confirmadas / reservas.length) * 100) : 0
  const noShows = reservas.filter(r => r.status === 'no_show').length

  const feedIcon: Record<string, React.ReactNode> = {
    new:     <div className="wa-ico"><MessageCircle size={17} /></div>,
    confirm: <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--st-conf-bg)', display: 'grid', placeItems: 'center', flex: 'none', color: 'var(--st-conf)' }}><CalendarCheck size={16} /></div>,
    remind:  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--st-pend-bg)', display: 'grid', placeItems: 'center', flex: 'none', color: 'var(--st-pend)' }}><Bell size={16} /></div>,
    chat:    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--st-seat-bg)', display: 'grid', placeItems: 'center', flex: 'none', color: 'var(--st-seat)' }}><MessageCircle size={16} /></div>,
  }

  const pendientes = reservas.filter(r => r.status === 'pendiente').length

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 28 }}>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 4, fontWeight: 500 }}>
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>Buenos días, {userName} 👋</h1>
        <p className="muted" style={{ fontSize: 15 }}>
          Tienes <strong style={{ color: 'var(--ink)' }}>{reservas.length} reservas</strong> para hoy
          {pendientes > 0 && <> y <strong style={{ color: 'var(--ink)' }}>{pendientes} pendientes</strong> por confirmar</>}.
        </p>
      </div>

      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard icon={<Calendar size={18} />} label="Reservas hoy" value={reservas.length} trend="+18%" trendDir="up" sub="vs ayer" />
        <StatCard icon={<CalendarCheck size={18} />} label="Confirmadas" value={confirmadas} trend={`${confirmPct}%`} trendDir="flat" sub="tasa" ring={confirmPct} />
        <StatCard icon={<TrendingUp size={18} />} label="No-shows hoy" value={noShows} trend="−61%" trendDir="up" sub="vs mes ant." />
        <StatCard icon={<Users size={18} />} label="Personas hoy" value={reservas.reduce((s, r) => s + r.people, 0)} trend="+3" trendDir="up" sub="cubiertos" />
      </div>

      <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, alignItems: 'start' }}>
        <div className="card">
          <SectionHead
            title="Reservas de hoy"
            count={filtradas.length}
            right={
              <div className="seg">
                {['Todas', 'Comida', 'Cena'].map(s => (
                  <button key={s} className={seg === s ? 'on' : ''} onClick={() => setSeg(s)}>{s}</button>
                ))}
              </div>
            }
          />
          {filtradas.length === 0 ? (
            <EmptyState title="Sin reservas" body="No hay reservaciones para este filtro." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Hora</th><th>Cliente</th>
                    <th className="hide-sm">Pers.</th><th className="hide-sm">Mesa</th>
                    <th className="hide-sm">Canal</th><th>Estado</th><th />
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(r => (
                    <ReservationRow key={r.id} res={r} client={clients[r.clientId]} onAction={handleAction} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="col gap-16">
          {/* Feed IA */}
          <div className="card">
            <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#25D366', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <MessageCircle size={18} color="#fff" />
              </div>
              <div className="col" style={{ gap: 1, flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 14.5 }}>Bot de WhatsApp</span>
                <div className="row gap-6">
                  <div className="ai-pulse" />
                  <span className="faint" style={{ fontSize: 12 }}>Activo · responde 24/7</span>
                </div>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-pill)', padding: '3px 9px', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>
                <Sparkles size={12} />IA
              </span>
            </div>
            <div style={{ padding: '4px 18px 14px' }}>
              {feed.map(ev => (
                <div key={ev.id} className="feed-item">
                  {feedIcon[ev.kind]}
                  <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13.5 }}><strong>{ev.who}</strong> {ev.msg}</span>
                    <span className="faint" style={{ fontSize: 12 }}>{ev.t}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 18px', borderTop: '1px solid var(--line)' }}>
              <a href="#" style={{ fontSize: 13.5, color: 'var(--accent)', fontWeight: 600 }}>Ver toda la actividad →</a>
            </div>
          </div>

          {/* Próximas */}
          <div className="card">
            <SectionHead title="Próximas reservas" />
            <div style={{ padding: '8px 0' }}>
              {upcoming.length === 0 ? (
                <EmptyState title="Sin próximas reservas" body="No hay reservas en los próximos días." />
              ) : (
                upcoming.map(grupo => (
                  <div key={grupo.date}>
                    <div style={{ padding: '10px 18px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{grupo.day}</span>
                      <span className="faint" style={{ fontSize: 12 }}>{grupo.date}</span>
                    </div>
                    {grupo.items.map(item => {
                      const cl = grupo.clientMap[item.clientId]
                      if (!cl) return null
                      return (
                        <div key={item.id} style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="display mono-num" style={{ fontWeight: 600, fontSize: 14, width: 46, color: 'var(--ink-2)' }}>{item.time}</span>
                          <Avatar name={cl.name} size={28} />
                          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{cl.name}</span>
                          <span className="faint" style={{ fontSize: 12.5 }}>{item.people} pers.</span>
                          <StatusBadge status={item.status} />
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
