'use client'
import { useState, useEffect, useCallback } from 'react'
import { Power, RotateCcw, Square, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function apiFetch(path: string, init?: RequestInit) {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token ?? ''
  return fetch(`${API}${path}`, {
    ...init,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...init?.headers },
  })
}

type BotAction = 'restart' | 'start' | 'stop'

interface Status {
  running: boolean
  easypanel_configured: boolean
}

export function BotStatusCard() {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<BotAction | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const r = await apiFetch('/chatbot/bot/status')
      const d = await r.json()
      setStatus(d)
      setLastChecked(new Date())
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30_000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  async function handleAction(action: BotAction) {
    setActionLoading(action)
    setActionMsg(null)
    try {
      const r = await apiFetch(`/chatbot/bot/${action}`, { method: 'POST' })
      if (!r.ok) {
        const e = await r.json().catch(() => ({}))
        setActionMsg(e.detail ?? 'Error al ejecutar la acción')
      } else {
        const labels: Record<BotAction, string> = {
          restart: 'Reiniciando…',
          start: 'Iniciando…',
          stop: 'Deteniendo…',
        }
        setActionMsg(labels[action])
        // Re-check status after 4s to reflect the change
        setTimeout(() => { fetchStatus(); setActionMsg(null) }, 4000)
      }
    } catch {
      setActionMsg('Error de conexión')
    } finally {
      setActionLoading(null)
    }
  }

  const dot = loading
    ? 'var(--ink-4)'
    : status?.running
      ? '#22c55e'
      : '#ef4444'

  const label = loading
    ? 'Verificando…'
    : status?.running
      ? 'En línea'
      : 'Detenido'

  const canControl = status?.easypanel_configured ?? false

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r)',
      padding: '8px 14px',
      fontSize: 13,
    }}>
      {/* Status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: dot,
          boxShadow: status?.running ? `0 0 0 3px ${dot}33` : 'none',
          flexShrink: 0,
          transition: 'background 0.3s, box-shadow 0.3s',
        }} />
        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Bot WhatsApp</span>
        <span style={{ color: status?.running ? '#16a34a' : 'var(--ink-3)', fontWeight: 500 }}>
          {label}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'var(--line)' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Restart */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => handleAction('restart')}
          disabled={!canControl || actionLoading !== null}
          title={canControl ? 'Reiniciar bot' : 'Configura EASYPANEL_* en el .env para controlar el bot'}
          style={{ gap: 5, opacity: canControl ? 1 : 0.4 }}
        >
          {actionLoading === 'restart'
            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            : <RotateCcw size={13} />}
          Reiniciar
        </button>

        {/* Start / Stop */}
        {status?.running ? (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleAction('stop')}
            disabled={!canControl || actionLoading !== null}
            title="Detener bot"
            style={{ gap: 5, color: 'var(--status-noshow-ink)', opacity: canControl ? 1 : 0.4 }}
          >
            {actionLoading === 'stop'
              ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              : <Square size={13} />}
            Detener
          </button>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleAction('start')}
            disabled={!canControl || actionLoading !== null}
            title="Iniciar bot"
            style={{ gap: 5, color: '#16a34a', opacity: canControl ? 1 : 0.4 }}
          >
            {actionLoading === 'start'
              ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              : <Power size={13} />}
            Iniciar
          </button>
        )}
      </div>

      {/* Action feedback / last checked */}
      {actionMsg && (
        <span style={{ fontSize: 12, color: actionMsg.includes('Error') ? 'var(--status-noshow-ink)' : 'var(--ink-3)' }}>
          {actionMsg}
        </span>
      )}
      {!actionMsg && lastChecked && (
        <span style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 'auto' }}>
          {lastChecked.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )}
    </div>
  )
}
