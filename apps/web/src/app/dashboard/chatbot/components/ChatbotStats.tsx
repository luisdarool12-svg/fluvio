'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, Send, Bot, UserRound, AlertTriangle } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { createClient } from '@/utils/supabase/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function apiFetch(path: string) {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token ?? ''
  return fetch(`${API}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
}

interface DayPoint { date: string; count: number }

interface Stats {
  total_conversations: number
  month_conversations: number
  messages_sent: number
  messages_received: number
  ai_conversations: number
  human_conversations: number
  escalated_conversations: number
  escalated_pct: number
  daily_conversations: DayPoint[]
}

function DonutChart({ ai, human }: { ai: number; human: number }) {
  const total = ai + human
  if (total === 0) return <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface-3)' }} />
  const aiPct = ai / total
  const r = 34
  const circ = 2 * Math.PI * r
  const aiDash = circ * aiPct
  return (
    <svg width={80} height={80} viewBox="0 0 80 80">
      <circle cx={40} cy={40} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={12} />
      <circle
        cx={40} cy={40} r={r} fill="none"
        stroke="var(--accent)" strokeWidth={12}
        strokeDasharray={`${aiDash} ${circ - aiDash}`}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dasharray 0.4s' }}
      />
      {human > 0 && (
        <circle
          cx={40} cy={40} r={r} fill="none"
          stroke="var(--status-seated-ink)" strokeWidth={12}
          strokeDasharray={`${circ - aiDash} ${aiDash}`}
          strokeDashoffset={-(aiDash)}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
      )}
    </svg>
  )
}

function BarChart({ data }: { data: DayPoint[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const last7 = data.slice(-7)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, paddingBottom: 4 }}>
      {data.map((d, i) => {
        const h = Math.round((d.count / max) * 52) || 2
        const isLast7 = i >= data.length - 7
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.count}`}
            style={{
              flex: 1, height: h,
              background: isLast7 ? 'var(--accent)' : 'var(--surface-3)',
              borderRadius: 3,
              transition: 'height 0.3s',
              minWidth: 0,
              opacity: isLast7 ? 1 : 0.5,
            }}
          />
        )
      })}
    </div>
  )
}

export function ChatbotStats({ businessId }: { businessId: string | null }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) return
    apiFetch('/chatbot/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [businessId])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--ink-4)', fontSize: 14 }}>
        Cargando estadísticas…
      </div>
    )
  }

  if (!stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--ink-4)', fontSize: 14 }}>
        No se pudieron cargar las estadísticas.
      </div>
    )
  }

  return (
    <div>
      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard
          label="Conversaciones este mes"
          value={stats.month_conversations.toString()}
          trend={`${stats.total_conversations} históricas`}
          trendDir="flat"
          icon={<MessageSquare size={18} style={{ color: 'var(--accent)' }} />}
        />
        <StatCard
          label="Mensajes recibidos"
          value={stats.messages_received.toString()}
          trend="De clientes"
          trendDir="flat"
          icon={<MessageSquare size={18} style={{ color: 'var(--accent)' }} />}
        />
        <StatCard
          label="Mensajes enviados"
          value={stats.messages_sent.toString()}
          trend="Bot + agentes"
          trendDir="flat"
          icon={<Send size={18} style={{ color: 'var(--accent)' }} />}
        />
        <StatCard
          label="Escaladas"
          value={stats.escalated_conversations.toString()}
          trend={`${stats.escalated_pct}% del total`}
          trendDir="flat"
          icon={<AlertTriangle size={18} style={{ color: 'var(--status-pending-ink)' }} />}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, alignItems: 'start' }}>
        {/* Donut: AI vs Human */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Modo de conversaciones</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <DonutChart ai={stats.ai_conversations} human={stats.human_conversations} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>IA: <strong>{stats.ai_conversations}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-seated-ink)', flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>Humano: <strong>{stats.human_conversations}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar chart: last 30 days */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Conversaciones por día</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Últimos 30 días</span>
          </div>
          <BarChart data={stats.daily_conversations} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{stats.daily_conversations[0]?.date.slice(5) ?? ''}</span>
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>hoy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
