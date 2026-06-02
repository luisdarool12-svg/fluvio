'use client'
import { useState, useEffect } from 'react'
import { UserPlus, ChevronRight, X, History, MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Avatar } from '@/components/Avatar'
import { VipTag } from '@/components/VipTag'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import type { Client, Reservation } from '@/lib/data'
import { toClient, toReservation } from '@/lib/transform'
import { formatDate } from '@/lib/helpers'
import { createClient } from '@/utils/supabase/client'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Client[]>([])
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)
  const [history, setHistory] = useState<Reservation[]>([])

  useEffect(() => {
    createClient()
      .from('customers')
      .select('*')
      .order('nombre')
      .then(({ data }) => { if (data) setClientes(data.map(toClient)) })
  }, [])

  useEffect(() => {
    if (!selected) { setHistory([]); return }
    createClient()
      .from('reservations')
      .select('*, tables(*)')
      .eq('customer_id', selected.id)
      .order('fecha_hora', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setHistory(data.map(row => toReservation({ ...row, customer_id: selected.id })))
      })
  }, [selected])

  const vipCount = clientes.filter(c => c.visits >= 5).length
  const filtered = clientes.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
  )

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} clientes registrados · ${vipCount} VIP`}
        actions={<button className="btn btn-primary"><UserPlus size={17} />Nuevo cliente</button>}
      />

      <div className="row gap-16" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card card-pad" style={{ marginBottom: 14 }}>
            <div className="search-wrap">
              <svg className="s-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input className="input" placeholder="Buscar por nombre o teléfono…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
          </div>

          <div className="card">
            {filtered.length === 0 ? (
              <EmptyState title="Sin resultados" body="No encontramos clientes con esa búsqueda." />
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th className="hide-sm">Teléfono</th>
                    <th className="hide-sm">Visitas</th>
                    <th className="hide-sm">Última visita</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(cl => (
                    <tr key={cl.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(cl)}>
                      <td>
                        <div className="row gap-10">
                          <Avatar name={cl.name} size={34} />
                          <div className="col" style={{ gap: 2 }}>
                            <span className="row gap-6" style={{ fontWeight: 600, fontSize: 14 }}>
                              {cl.name}{cl.visits >= 5 && <VipTag />}
                            </span>
                            <span className="faint" style={{ fontSize: 12.5 }}>
                              {cl.visits >= 5 ? 'Recurrente' : cl.visits === 0 ? 'Nuevo' : `${cl.visits} visitas`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="hide-sm"><span className="muted">{cl.phone}</span></td>
                      <td className="hide-sm"><span className="mono-num" style={{ fontWeight: 600 }}>{cl.visits}</span></td>
                      <td className="hide-sm"><span className="muted">{cl.last !== '—' ? formatDate(cl.last) : '—'}</span></td>
                      <td><ChevronRight size={16} style={{ color: 'var(--ink-4)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selected && (
          <div style={{
            width: 360, flex: 'none', background: 'var(--surface)',
            border: '1px solid var(--line)', borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--line)' }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontWeight: 600, fontSize: 14.5 }}>Perfil del cliente</span>
                <button className="btn btn-icon btn-subtle btn-sm" onClick={() => setSelected(null)}><X size={16} /></button>
              </div>
              <div className="row gap-12">
                <Avatar name={selected.name} size={44} />
                <div className="col gap-4">
                  <span className="row gap-6" style={{ fontWeight: 700, fontSize: 16 }}>
                    {selected.name}{selected.visits >= 5 && <VipTag />}
                  </span>
                  <span className="faint" style={{ fontSize: 13 }}>{selected.phone}</span>
                </div>
              </div>
            </div>

            <div className="row" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', gap: 0 }}>
              {[
                { label: 'Visitas', value: selected.visits },
                { label: 'Última', value: selected.last !== '—' ? formatDate(selected.last).split(' ').slice(0, 2).join(' ') : '—' },
                { label: 'Canal', value: 'WhatsApp' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid var(--line)' : 'none' }}>
                  <div className="display" style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em' }}>{s.value}</div>
                  <div className="faint" style={{ fontSize: 12 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div style={{ margin: '14px 20px', background: '#FBF5DF', border: '1px solid #EFE1A8', borderRadius: 'var(--r)', padding: '10px 13px' }}>
                <p style={{ fontSize: 13.5, color: '#7A6210' }}>{selected.notes}</p>
              </div>
            )}

            <div style={{ padding: '4px 20px 16px' }}>
              <div className="row gap-8" style={{ marginBottom: 10, marginTop: 8 }}>
                <History size={15} style={{ color: 'var(--ink-3)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Historial</span>
              </div>
              {history.length === 0 ? (
                <p className="faint" style={{ fontSize: 13 }}>Sin reservas registradas.</p>
              ) : (
                history.map(r => (
                  <div key={r.id} style={{ padding: '8px 0', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.dayLabel} · {r.time}</div>
                      <div className="faint" style={{ fontSize: 12 }}>{r.people} pers. · {r.table}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}><StatusBadge status={r.status} /></div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}><MessageCircle size={15} />WhatsApp</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>Nueva reserva</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
