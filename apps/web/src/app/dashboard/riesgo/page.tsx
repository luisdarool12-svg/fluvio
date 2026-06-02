'use client'
import { useState, useEffect, useCallback } from 'react'
import { ShieldAlert, ShieldCheck, Bell, Check } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Avatar } from '@/components/Avatar'
import { EmptyState } from '@/components/EmptyState'
import { Toast } from '@/components/Toast'
import { riskLevel } from '@/lib/risk'
import { createClient } from '@/utils/supabase/client'

interface RiskRow {
  id: string
  fecha_hora: string
  personas: number
  estado: string
  confirmation_status: string
  no_show_score: number | null
  customers: {
    nombre: string
    telefono: string
    visitas: number
    no_show_history: number
  } | null
}

interface NotiRow {
  id: number
  tipo: string
  titulo: string | null
  mensaje: string | null
  created_at: string
}

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function customerTags(c: RiskRow['customers']): { label: string; cls: string }[] {
  if (!c) return []
  const tags: { label: string; cls: string }[] = []
  if (c.no_show_history > 0) tags.push({ label: `${c.no_show_history} no-show previo${c.no_show_history > 1 ? 's' : ''}`, cls: 'badge-no' })
  if (c.visitas === 0) tags.push({ label: 'Cliente nuevo', cls: 'badge-pend' })
  else if (c.visitas >= 5 && c.no_show_history === 0) tags.push({ label: 'Frecuente', cls: 'badge-conf' })
  return tags
}

export default function RiesgoPage() {
  const [rows, setRows] = useState<RiskRow[]>([])
  const [notis, setNotis] = useState<NotiRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(tomorrow); dayAfter.setDate(dayAfter.getDate() + 1)

    const { data: resData } = await supabase
      .from('reservations')
      .select('id,fecha_hora,personas,estado,confirmation_status,no_show_score,customers(nombre,telefono,visitas,no_show_history)')
      .gte('fecha_hora', tomorrow.toISOString())
      .lt('fecha_hora', dayAfter.toISOString())
      .neq('estado', 'cancelada')
      .neq('estado', 'no_show')
      .order('no_show_score', { ascending: false, nullsFirst: false })

    const { data: notiData } = await supabase
      .from('notifications')
      .select('id,tipo,titulo,mensaje,created_at')
      .eq('leida', false)
      .in('tipo', ['noshow_high_risk', 'noshow_critical'])
      .order('created_at', { ascending: false })
      .limit(20)

    setRows((resData ?? []) as unknown as RiskRow[])
    setNotis((notiData ?? []) as NotiRow[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2400)
  }

  async function confirmar(id: string, score: number | null) {
    const supabase = createClient()
    const { error } = await supabase
      .from('reservations')
      .update({ confirmation_status: 'confirmed', estado: 'confirmada' })
      .eq('id', id)
    if (error) { showToast('No se pudo confirmar', 'error'); return }
    // Feedback inmediato: el peso -25 de "confirmó activamente" lo reaplica
    // el backend en el próximo cálculo; aquí lo anticipamos para la UI.
    setRows(prev => prev.map(r => r.id === id
      ? { ...r, confirmation_status: 'confirmed', estado: 'confirmada', no_show_score: Math.max(0, (score ?? 0) - 25) }
      : r))
    showToast('Reserva confirmada')
  }

  async function dismissNoti(id: number) {
    const supabase = createClient()
    await supabase.from('notifications').update({ leida: true }).eq('id', id)
    setNotis(prev => prev.filter(n => n.id !== id))
  }

  const counts = rows.reduce((acc, r) => {
    const lvl = riskLevel(r.no_show_score ?? 0).key
    acc[lvl] = (acc[lvl] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <PageHeader
        title="Riesgo de no-show"
        subtitle="Reservas de mañana priorizadas por probabilidad de no presentarse"
        actions={
          <button className="btn btn-soft" onClick={load}>
            <ShieldCheck size={16} />Actualizar
          </button>
        }
      />

      {/* Alertas para el dueño */}
      {notis.length > 0 && (
        <div className="col gap-8" style={{ marginBottom: 16 }}>
          {notis.map(n => {
            const critico = n.tipo === 'noshow_critical'
            return (
              <div key={n.id} className="card card-pad row gap-12" style={{
                alignItems: 'flex-start',
                borderLeft: `3px solid ${critico ? 'var(--st-no)' : '#C2410C'}`,
              }}>
                <Bell size={18} style={{ color: critico ? 'var(--st-no)' : '#C2410C', flex: 'none', marginTop: 2 }} />
                <div className="col gap-2" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{n.titulo ?? 'Alerta'}</span>
                  {n.mensaje && <span className="faint" style={{ fontSize: 13 }}>{n.mensaje}</span>}
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => dismissNoti(n.id)}>
                  <Check size={14} />Listo
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Resumen por nivel */}
      <div className="row gap-8" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        {([
          { key: 'critico', label: 'Crítico (81-100)' },
          { key: 'alto',    label: 'Alto (61-80)'     },
          { key: 'medio',   label: 'Medio (31-60)'    },
          { key: 'bajo',    label: 'Bajo (0-30)'      },
        ] as const).map(s => {
          const lvl = riskLevel(s.key === 'critico' ? 90 : s.key === 'alto' ? 70 : s.key === 'medio' ? 45 : 10)
          return (
            <div key={s.key} className="card card-pad row gap-10" style={{ flex: '1 1 160px', alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: lvl.color, flex: 'none' }} />
              <div className="col gap-2">
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{counts[s.key] ?? 0}</span>
                <span className="faint" style={{ fontSize: 12.5 }}>{s.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        {loading ? (
          <div className="card-pad faint" style={{ textAlign: 'center' }}>Cargando…</div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Sin reservas para mañana"
            body="Cuando haya reservas para el día siguiente, aparecerán aquí ordenadas por riesgo. El job nocturno calcula los scores a las 10pm."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th className="hide-sm">Pers.</th>
                  <th>Score</th>
                  <th>Riesgo</th>
                  <th className="hide-sm">Acción recomendada</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const score = r.no_show_score ?? 0
                  const lvl = riskLevel(score)
                  const c = r.customers
                  const confirmado = r.confirmation_status === 'confirmed'
                  const scored = r.no_show_score != null
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{timeOf(r.fecha_hora)}</td>
                      <td>
                        <div className="row gap-10">
                          <Avatar name={c?.nombre ?? '—'} size={32} />
                          <div className="col gap-2" style={{ minWidth: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{c?.nombre ?? 'Sin cliente'}</span>
                            <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
                              <span className="faint" style={{ fontSize: 12 }}>{c?.telefono ?? '—'}</span>
                              {customerTags(c).map((t, i) => (
                                <span key={i} className={`badge ${t.cls}`} style={{ fontSize: 10.5 }}>{t.label}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hide-sm">{r.personas}</td>
                      <td>
                        {scored ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: 38, height: 28, padding: '0 8px', borderRadius: 8,
                            fontSize: 15, fontWeight: 700, color: lvl.color, background: lvl.bg,
                          }}>{score}</span>
                        ) : (
                          <span className="faint" style={{ fontSize: 12 }}>sin calcular</span>
                        )}
                      </td>
                      <td>
                        <span className="badge" style={{ color: lvl.color, background: lvl.bg }}>
                          <ShieldAlert size={12} />{lvl.label}
                        </span>
                      </td>
                      <td className="hide-sm faint" style={{ fontSize: 13 }}>{lvl.action}</td>
                      <td>
                        {confirmado ? (
                          <span className="badge badge-conf"><span className="dot" />Confirmada</span>
                        ) : (
                          <button className="btn btn-sm btn-primary" onClick={() => confirmar(r.id, r.no_show_score)}>
                            <Check size={14} />Confirmar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
