'use client'
import { useState, useEffect, useRef } from 'react'
import { Send, CheckCheck, Bot, UserRound } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { EmptyState } from '@/components/EmptyState'
import { createClient } from '@/utils/supabase/client'
import { ModeToggle } from './ModeToggle'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Conversation {
  id: number
  phone: string
  name: string | null
  mode: 'AI' | 'HUMAN'
  status: 'active' | 'resolved' | 'escalated'
  unread_count: number
  last_message_at: string | null
}

interface Message {
  id: number
  role: 'user' | 'assistant' | 'human'
  content: string
  read: boolean
  created_at: string
}

type Filter = 'all' | 'ai' | 'human' | 'unread'

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

async function apiFetch(path: string, init?: RequestInit) {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token ?? ''
  return fetch(`${API}${path}`, {
    ...init,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...init?.headers },
  })
}

export function ConversationInbox({ businessId }: { businessId: string | null }) {
  const [convs, setConvs] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [modeLoading, setModeLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load conversations
  useEffect(() => {
    if (!businessId) return
    setLoadError(null)
    apiFetch('/chatbot/conversations')
      .then(r => {
        if (!r.ok) return r.json().then(e => { throw new Error(`${r.status}: ${e?.detail ?? r.statusText}`) })
        return r.json()
      })
      .then(setConvs)
      .catch((e: unknown) => setLoadError(e instanceof Error ? e.message : String(e)))
  }, [businessId])

  // Realtime: conversations (Supabase postgres_changes)
  useEffect(() => {
    if (!businessId) return
    const supabase = createClient()
    const ch = supabase
      .channel('chatbot-conversations')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'conversations',
        filter: `business_id=eq.${businessId}`,
      }, () => {
        apiFetch('/chatbot/conversations').then(r => r.json()).then(setConvs).catch(() => {})
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [businessId])

  // Polling fallback: refresh conversation list every 10s
  useEffect(() => {
    if (!businessId) return
    const id = setInterval(() => {
      apiFetch('/chatbot/conversations').then(r => r.json()).then(setConvs).catch(() => {})
    }, 10_000)
    return () => clearInterval(id)
  }, [businessId])

  // Load messages when conversation selected
  useEffect(() => {
    if (!selected) { setMessages([]); return }
    apiFetch(`/chatbot/conversations/${selected.id}/messages`)
      .then(r => r.json())
      .then(setMessages)
      .catch(() => {})
  }, [selected])

  // Realtime: messages for active conversation (Supabase postgres_changes)
  useEffect(() => {
    if (!selected) return
    const supabase = createClient()
    const ch = supabase
      .channel(`chatbot-messages-${selected.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${selected.id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [selected])

  // Polling fallback: refresh messages every 5s for active conversation
  useEffect(() => {
    if (!selected) return
    const id = setInterval(() => {
      apiFetch(`/chatbot/conversations/${selected.id}/messages`)
        .then(r => r.json())
        .then((msgs: Message[]) => {
          setMessages(prev => {
            if (msgs.length !== prev.length) return msgs
            const lastNew = msgs[msgs.length - 1]?.id
            const lastPrev = prev[prev.length - 1]?.id
            return lastNew !== lastPrev ? msgs : prev
          })
        })
        .catch(() => {})
    }, 5_000)
    return () => clearInterval(id)
  }, [selected])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!selected || !draft.trim() || sending) return
    setSending(true)
    const content = draft.trim()
    setDraft('')
    await apiFetch(`/chatbot/conversations/${selected.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    setSending(false)
  }

  async function handleModeChange(mode: 'AI' | 'HUMAN') {
    if (!selected) return
    setModeLoading(true)
    // Optimistic
    setSelected(prev => prev ? { ...prev, mode } : prev)
    setConvs(prev => prev.map(c => c.id === selected.id ? { ...c, mode } : c))
    await apiFetch(`/chatbot/conversations/${selected.id}/mode`, {
      method: 'PATCH',
      body: JSON.stringify({ mode }),
    })
    setModeLoading(false)
  }

  async function handleResolve() {
    if (!selected) return
    await apiFetch(`/chatbot/conversations/${selected.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'resolved' }),
    })
    setSelected(prev => prev ? { ...prev, status: 'resolved' } : prev)
    setConvs(prev => prev.map(c => c.id === selected.id ? { ...c, status: 'resolved' } : c))
  }

  const filtered = convs.filter(c => {
    const matchQ = !q || (c.name ?? c.phone).toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
    const matchF =
      filter === 'all' ? true :
      filter === 'ai' ? c.mode === 'AI' :
      filter === 'human' ? c.mode === 'HUMAN' :
      filter === 'unread' ? c.unread_count > 0 : true
    return matchQ && matchF
  })

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all',    label: 'Todos' },
    { id: 'ai',     label: 'Activos IA' },
    { id: 'human',  label: 'En Humano' },
    { id: 'unread', label: 'Sin leer' },
  ]

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 180px)', minHeight: 500 }}>
      {/* Left panel */}
      <div style={{
        width: 320, flex: 'none',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg) 0 0 var(--r-lg)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Search */}
        <div style={{ padding: '14px 14px 10px' }}>
          <div className="search-wrap">
            <svg className="s-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input className="input" placeholder="Buscar conversación…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 4, padding: '0 14px 10px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '4px 10px', borderRadius: 'var(--r-pill)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: '1px solid var(--line)',
                background: filter === f.id ? 'var(--accent)' : 'var(--surface-2)',
                color: filter === f.id ? 'var(--accent-contrast)' : 'var(--ink-2)',
              }}
            >{f.label}</button>
          ))}
        </div>

        {/* Error banner */}
        {loadError && (
          <div style={{ margin: '0 14px 10px', padding: '8px 12px', background: '#fee2e2', borderRadius: 'var(--r)', fontSize: 12, color: '#b91c1c', wordBreak: 'break-all' }}>
            Error: {loadError}
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <EmptyState title="Sin conversaciones" body="No hay conversaciones que coincidan." />
          ) : (
            filtered.map(c => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--line)',
                  background: selected?.id === c.id ? 'var(--accent-soft)' : 'transparent',
                  transition: 'background 0.1s',
                }}
              >
                <Avatar name={c.name ?? c.phone} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)' }}>
                      {c.name ?? c.phone}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{timeAgo(c.last_message_at)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                      {c.phone}
                    </span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {c.mode === 'AI'
                        ? <Bot size={12} style={{ color: 'var(--accent)' }} />
                        : <UserRound size={12} style={{ color: 'var(--status-seated-ink)' }} />
                      }
                      {c.unread_count > 0 && (
                        <span style={{
                          background: 'var(--accent)', color: 'white',
                          borderRadius: 99, fontSize: 11, fontWeight: 700,
                          padding: '0 6px', minWidth: 18, textAlign: 'center',
                        }}>{c.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, minWidth: 0,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderLeft: 'none',
        borderRadius: '0 var(--r-lg) var(--r-lg) 0',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState title="Selecciona una conversación" body="Elige un chat de la lista para ver el historial." />
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={selected.name ?? selected.phone} size={36} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.name ?? selected.phone}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{selected.phone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ModeToggle mode={selected.mode} loading={modeLoading} onChange={handleModeChange} />
                {selected.status !== 'resolved' && (
                  <button className="btn btn-ghost btn-sm" onClick={handleResolve}>
                    <CheckCheck size={14} />
                    Resolver
                  </button>
                )}
                {selected.status === 'resolved' && (
                  <span className="badge badge-conf">Resuelta</span>
                )}
                {selected.status === 'escalated' && (
                  <span className="badge badge-noshow">Escalada</span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--ink-4)', fontSize: 13, marginTop: 40 }}>Sin mensajes aún.</p>
              )}
              {messages.map(m => {
                const isOutbound = m.role === 'assistant' || m.role === 'human'
                return (
                  <div key={m.id} style={{
                    display: 'flex',
                    justifyContent: isOutbound ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{
                        background: isOutbound ? 'var(--accent-soft)' : 'var(--surface-2)',
                        borderRadius: isOutbound
                          ? 'var(--r-lg) var(--r) var(--r) var(--r-lg)'
                          : 'var(--r) var(--r-lg) var(--r-lg) var(--r)',
                        padding: '9px 13px',
                        fontSize: 13.5,
                        color: 'var(--ink)',
                        lineHeight: 1.5,
                      }}>
                        {m.content}
                      </div>
                      <div style={{
                        fontSize: 11, color: 'var(--ink-4)',
                        marginTop: 3,
                        textAlign: isOutbound ? 'right' : 'left',
                        display: 'flex', gap: 4, justifyContent: isOutbound ? 'flex-end' : 'flex-start', alignItems: 'center',
                      }}>
                        {isOutbound && (
                          m.role === 'human'
                            ? <UserRound size={11} style={{ color: 'var(--ink-3)' }} />
                            : <Bot size={11} style={{ color: 'var(--accent)' }} />
                        )}
                        {new Date(m.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Footer input */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--line)',
              display: 'flex', gap: 10, alignItems: 'flex-end',
            }}>
              {selected.mode === 'AI' && (
                <div style={{
                  flex: 1, padding: '10px 14px',
                  background: 'var(--surface-2)', borderRadius: 'var(--r)',
                  fontSize: 13, color: 'var(--ink-3)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Bot size={14} style={{ color: 'var(--accent)' }} />
                  El bot está respondiendo automáticamente. Cambia a <strong>Modo Humano</strong> para responder tú.
                </div>
              )}
              {selected.mode === 'HUMAN' && (
                <>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Escribe un mensaje… (Enter para enviar)"
                    rows={2}
                    style={{
                      flex: 1, resize: 'none',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r)',
                      padding: '9px 12px',
                      fontFamily: 'var(--font-ui)',
                      fontSize: 13.5,
                      color: 'var(--ink)',
                      background: 'var(--surface)',
                      outline: 'none',
                    }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSend}
                    disabled={!draft.trim() || sending}
                    style={{ height: 38, flexShrink: 0 }}
                  >
                    <Send size={14} />
                    Enviar
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
