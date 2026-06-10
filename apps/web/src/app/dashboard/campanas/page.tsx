'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Megaphone, Send, BarChart2, Sparkles, Users, X, Loader2, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { Toast } from '@/components/Toast'
import { createClient } from '@/utils/supabase/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function apiFetch(path: string, init?: RequestInit) {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token ?? ''
  return fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init?.headers },
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Campaign {
  id: string
  nombre: string
  tipo: string
  mensaje: string
  audience_filter: { segment: string }
  estado: string
  total_destinatarios: number
  total_enviados: number
  created_at: string
}

type Step = 1 | 2 | 3

const TIPOS = [
  { value: 'reactivacion', label: 'Reactivación', desc: 'Clientes que no han vuelto' },
  { value: 'promo',        label: 'Promoción',    desc: 'Oferta o descuento especial' },
  { value: 'evento',       label: 'Evento',       desc: 'Invitación a evento especial' },
  { value: 'otro',         label: 'Otro',         desc: 'Mensaje general' },
]

const SEGMENTS = [
  { value: 'all',      label: 'Todos los clientes',       desc: 'Toda tu base de datos' },
  { value: 'vip',      label: 'Clientes VIP',             desc: '5 o más visitas' },
  { value: 'inactive', label: 'Clientes inactivos',       desc: 'Sin visita en 30+ días' },
  { value: 'new',      label: 'Clientes nuevos',          desc: 'Solo primera visita' },
]

const ESTADO_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  borrador:    { label: 'Borrador',    bg: 'var(--surface-3)', color: 'var(--ink-3)' },
  programada:  { label: 'Programada', bg: '#fef3c7', color: '#92400e' },
  enviando:    { label: 'Enviando…',  bg: '#dbeafe', color: '#1e40af' },
  completada:  { label: 'Completada', bg: '#dcfce7', color: '#166534' },
  cancelada:   { label: 'Cancelada',  bg: '#fee2e2', color: '#991b1b' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampanasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Wizard state
  const [tipo, setTipo] = useState('reactivacion')
  const [segment, setSegment] = useState('all')
  const [context, setContext] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [nombre, setNombre] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await apiFetch('/campaigns/')
    if (res.ok) setCampaigns(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  function openModal() {
    setStep(1); setTipo('reactivacion'); setSegment('all')
    setContext(''); setMensaje(''); setNombre(''); setShowModal(true)
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await apiFetch('/campaigns/generate', {
        method: 'POST',
        body: JSON.stringify({ tipo, segment, context: context || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setMensaje(data.mensaje)
        setStep(3)
      } else {
        showToast('Error generando el mensaje', 'error')
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleCreate() {
    if (!nombre.trim() || !mensaje.trim()) return
    const res = await apiFetch('/campaigns/', {
      method: 'POST',
      body: JSON.stringify({
        nombre: nombre.trim(),
        tipo,
        mensaje,
        audience_filter: { segment },
      }),
    })
    if (res.ok) {
      showToast('Campaña creada correctamente')
      setShowModal(false)
      load()
    } else {
      showToast('Error creando la campaña', 'error')
    }
  }

  async function handleSend(id: string) {
    setSending(id)
    try {
      const res = await apiFetch(`/campaigns/${id}/send`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        showToast(`Enviada: ${data.sent} mensajes`)
        load()
      } else {
        showToast('Error al enviar', 'error')
      }
    } finally {
      setSending(null)
    }
  }

  const totalCampaigns = campaigns.length
  const completadas = campaigns.filter(c => c.estado === 'completada').length
  const totalEnviados = campaigns.reduce((sum, c) => sum + (c.total_enviados || 0), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 }}>
        <PageHeader
          title="Campañas"
          subtitle="Envía mensajes masivos a tus clientes con ayuda de IA"
        />
        <button className="btn btn-primary" onClick={openModal} style={{ gap: 6, flexShrink: 0 }}>
          <Plus size={15} /> Nueva campaña
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Campañas creadas" value={String(totalCampaigns)} icon={<Megaphone size={16} />} />
        <StatCard label="Completadas" value={String(completadas)} icon={<BarChart2 size={16} />} />
        <StatCard label="Mensajes enviados" value={String(totalEnviados)} icon={<Send size={16} />} />
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--ink-3)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px', background: 'var(--surface-2)',
          borderRadius: 'var(--r)', border: '1px dashed var(--surface-3)',
        }}>
          <Megaphone size={32} style={{ color: 'var(--ink-4)', marginBottom: 12 }} />
          <p style={{ color: 'var(--ink-3)', marginBottom: 16 }}>No hay campañas todavía</p>
          <button className="btn btn-primary" onClick={openModal} style={{ gap: 6 }}>
            <Plus size={15} /> Crear primera campaña
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {campaigns.map(c => {
            const s = ESTADO_STYLES[c.estado] ?? ESTADO_STYLES.borrador
            return (
              <div key={c.id} style={{
                background: 'var(--surface-1)', border: '1px solid var(--surface-3)',
                borderRadius: 'var(--r)', padding: '14px 16px',
                display: 'flex', gap: 12, alignItems: 'center',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 99, background: s.bg, color: s.color,
                    }}>{s.label}</span>
                  </div>
                  <p style={{
                    color: 'var(--ink-3)', fontSize: 13,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: 480,
                  }}>{c.mensaje}</p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={12} /> {c.total_destinatarios} destinatarios
                    </span>
                    {c.total_enviados > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Send size={12} /> {c.total_enviados} enviados
                      </span>
                    )}
                  </div>
                </div>
                {(c.estado === 'borrador' || c.estado === 'programada') && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSend(c.id)}
                    disabled={sending === c.id}
                    style={{ gap: 5, flexShrink: 0 }}
                  >
                    {sending === c.id
                      ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                      : <Send size={13} />}
                    Enviar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal wizard */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 16,
        }}>
          <div style={{
            background: 'var(--surface-1)', borderRadius: 'calc(var(--r) * 1.5)',
            width: '100%', maxWidth: 520, padding: 24, position: 'relative',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}
            >
              <X size={18} style={{ color: 'var(--ink-3)' }} />
            </button>

            {/* Steps indicator */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
              {([1, 2, 3] as Step[]).map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                    background: step >= s ? 'var(--accent)' : 'var(--surface-3)',
                    color: step >= s ? '#fff' : 'var(--ink-3)',
                  }}>{s}</div>
                  {i < 2 && <ChevronRight size={14} style={{ color: 'var(--ink-4)' }} />}
                </div>
              ))}
              <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--ink-3)' }}>
                {step === 1 ? 'Audiencia' : step === 2 ? 'Generar mensaje' : 'Revisar y crear'}
              </span>
            </div>

            {/* Step 1 — Audience */}
            {step === 1 && (
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 16 }}>¿A quién va dirigida?</h3>
                <p style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 16 }}>Selecciona el tipo de campaña y el segmento.</p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Tipo de campaña</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {TIPOS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTipo(t.value)}
                        style={{
                          padding: '10px 12px', borderRadius: 'var(--r)', textAlign: 'left', cursor: 'pointer',
                          border: tipo === t.value ? '2px solid var(--accent)' : '1px solid var(--surface-3)',
                          background: tipo === t.value ? 'var(--accent-muted, #f0f9ff)' : 'var(--surface-2)',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Segmento de clientes</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {SEGMENTS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSegment(s.value)}
                        style={{
                          padding: '10px 12px', borderRadius: 'var(--r)', textAlign: 'left', cursor: 'pointer',
                          border: segment === s.value ? '2px solid var(--accent)' : '1px solid var(--surface-3)',
                          background: segment === s.value ? 'var(--accent-muted, #f0f9ff)' : 'var(--surface-2)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.desc}</div>
                        </div>
                        <Users size={16} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(2)}>
                  Continuar
                </button>
              </div>
            )}

            {/* Step 2 — Generate */}
            {step === 2 && (
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 16 }}>Genera el mensaje con IA</h3>
                <p style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 16 }}>
                  Cuéntale a la IA algo sobre la campaña (opcional) para un resultado más personalizado.
                </p>

                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Ej: tenemos menú nuevo de brunch los domingos, queremos que vuelvan los clientes de fin de año..."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 'var(--r)',
                    border: '1px solid var(--surface-3)', background: 'var(--surface-2)',
                    fontSize: 13, resize: 'vertical', marginBottom: 16,
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-subtle" onClick={() => setStep(1)}>Atrás</button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', gap: 6 }}
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating
                      ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generando…</>
                      : <><Sparkles size={14} /> Generar con IA</>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Review & create */}
            {step === 3 && (
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 16 }}>Revisa y crea la campaña</h3>
                <p style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 16 }}>
                  Edita el mensaje si lo necesitas y dale un nombre a la campaña.
                </p>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre de la campaña</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej: Reactivación junio, Promo brunch..."
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 'var(--r)',
                      border: '1px solid var(--surface-3)', background: 'var(--surface-2)',
                      fontSize: 13, boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Mensaje
                    <span style={{ fontWeight: 400, color: 'var(--ink-3)', marginLeft: 8 }}>
                      Puedes editarlo
                    </span>
                  </label>
                  <textarea
                    value={mensaje}
                    onChange={e => setMensaje(e.target.value)}
                    rows={6}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 'var(--r)',
                      border: '1px solid var(--accent)', background: 'var(--surface-2)',
                      fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
                    }}
                  />
                  <button
                    className="btn btn-subtle btn-sm"
                    style={{ marginTop: 6, gap: 5 }}
                    onClick={() => setStep(2)}
                  >
                    <Sparkles size={12} /> Regenerar
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-subtle" onClick={() => setStep(2)}>Atrás</button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={handleCreate}
                    disabled={!nombre.trim() || !mensaje.trim()}
                  >
                    Crear campaña
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
