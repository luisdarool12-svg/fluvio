'use client'
import { useState, useEffect, useRef } from 'react'
import {
  ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Save,
  Plus, Trash2, History, RotateCcw, Loader2, Upload, FileText, ImageIcon,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { apiFetch } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function apiJson(path: string, init?: RequestInit) {
  const r = await apiFetch(path, init)
  if (!r.ok) {
    const e = await r.json().catch(() => null)
    throw new Error(`${r.status}: ${e?.detail ?? r.statusText}`)
  }
  return r.json()
}

async function apiUploadFile(path: string, file: File) {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token ?? ''
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  })
  if (!r.ok) {
    const e = await r.json().catch(() => null)
    throw new Error(`${r.status}: ${e?.detail ?? r.statusText}`)
  }
  return r.json()
}

function errMsg(e: unknown): string {
  if (e instanceof TypeError) return 'No se pudo conectar con el servidor (¿API corriendo en el puerto 8000?)'
  return e instanceof Error ? e.message : String(e)
}

// ─── Types ────────────────────────────────────────────────────

interface DayHour { day: string; open: boolean; from: string; to: string }
interface MenuItem { name: string; description: string; price: number | ''; tags: string[]; available: boolean }
interface MenuCategory { name: string; items: MenuItem[] }
interface Event { name: string; description: string; date_start: string; date_end: string; active: boolean }
interface EscalationRules {
  negative_feedback: boolean; refund_request: boolean; large_group: boolean;
  large_group_threshold: number; private_events: boolean; customer_requests_human: boolean;
  repeated_unknown: boolean;
}
interface FormData {
  restaurant_name: string; cuisine_type: string; address: string; neighborhood: string;
  city: string; phone: string; website: string; instagram: string;
  hours: DayHour[]; hours_note: string;
  accepts_reservations: boolean; reservation_max_people: number;
  reservation_advance_hours: number; reservation_contact: string;
  menu_mode: 'manual' | 'text'; menu_text: string; menu_categories: MenuCategory[];
  bot_name: string; tone: 'formal' | 'semiformal' | 'casual';
  language: 'spanish' | 'english' | 'bilingual'; response_length: 'concise' | 'normal' | 'detailed';
  can_recommend: boolean; show_prices: boolean;
  escalation_rules: EscalationRules; escalation_message: string; escalation_contact: string;
  events: Event[];
}

interface Version { id: string; version_label: string; is_active: boolean; created_at: string }

const DEFAULT_DAYS: DayHour[] = [
  { day: 'lunes', open: false, from: '13:00', to: '22:00' },
  { day: 'martes', open: true, from: '13:00', to: '22:00' },
  { day: 'miércoles', open: true, from: '13:00', to: '22:00' },
  { day: 'jueves', open: true, from: '13:00', to: '22:00' },
  { day: 'viernes', open: true, from: '13:00', to: '23:00' },
  { day: 'sábado', open: true, from: '13:00', to: '23:00' },
  { day: 'domingo', open: true, from: '13:00', to: '18:00' },
]

const EMPTY_FORM: FormData = {
  restaurant_name: '', cuisine_type: '', address: '', neighborhood: '', city: '',
  phone: '', website: '', instagram: '',
  hours: DEFAULT_DAYS, hours_note: '',
  accepts_reservations: true, reservation_max_people: 12,
  reservation_advance_hours: 2, reservation_contact: '',
  menu_mode: 'manual', menu_text: '', menu_categories: [{ name: 'Platos principales', items: [] }],
  bot_name: '', tone: 'formal', language: 'bilingual', response_length: 'concise',
  can_recommend: true, show_prices: true,
  escalation_rules: {
    negative_feedback: true, refund_request: true, large_group: true,
    large_group_threshold: 10, private_events: true, customer_requests_human: true,
    repeated_unknown: true,
  },
  escalation_message: 'Un momento, te voy a conectar con alguien de nuestro equipo que podrá ayudarte mejor. 🙏',
  escalation_contact: '',
  events: [],
}

// ─── Section wrapper ─────────────────────────────────────────

function Section({
  title, subtitle, open, onToggle, complete, required, children,
}: {
  title: string; subtitle?: string; open: boolean; onToggle: () => void;
  complete: boolean; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 10 }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: open ? 'var(--accent-soft)' : 'var(--surface)',
          border: 'none', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', textAlign: 'left',
          transition: 'background 0.15s',
        }}
      >
        {complete
          ? <CheckCircle2 size={17} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          : required
            ? <AlertCircle size={17} style={{ color: 'var(--status-pending-ink)', flexShrink: 0 }} />
            : <div style={{ width: 17, height: 17, borderRadius: 99, border: '1.5px solid var(--line)', flexShrink: 0 }} />
        }
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>
            {title}
            {required && <span style={{ color: 'var(--status-pending-ink)', marginLeft: 4 }}>*</span>}
          </div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{subtitle}</div>}
        </div>
        {open ? <ChevronDown size={16} style={{ color: 'var(--ink-3)' }} /> : <ChevronRight size={16} style={{ color: 'var(--ink-3)' }} />}
      </button>
      {open && (
        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Field helpers ────────────────────────────────────────────

function Field({ label, tooltip, children, half }: { label: string; tooltip?: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ flex: half ? '1 1 240px' : '1 1 100%', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>{label}</label>
        {tooltip && (
          <span title={tooltip} style={{ cursor: 'help', color: 'var(--ink-4)', fontSize: 12 }}>ⓘ</span>
        )}
      </div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px',
  border: '1px solid var(--line)', borderRadius: 'var(--r)',
  fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'var(--ink)',
  background: 'var(--surface)', outline: 'none', boxSizing: 'border-box',
}

// ─── Main component ───────────────────────────────────────────

export function SystemPromptBuilder({ businessId }: { businessId: string | null }) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [open, setOpen] = useState<Record<string, boolean>>({ business: true })
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [parsingMenu, setParsingMenu] = useState(false)
  const [versions, setVersions] = useState<Version[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // ── Menu file upload state ────────────────────────────────────
  const [menuTab, setMenuTab] = useState<'manual' | 'text' | 'upload'>('manual')
  const [uploadingMenu, setUploadingMenu] = useState(false)
  const [menuUploadFile, setMenuUploadFile] = useState<File | null>(null)
  const [menuUploadPreview, setMenuUploadPreview] = useState<string | null>(null)
  const [draggingFile, setDraggingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!businessId) return
    setErrors([])
    apiJson('/chatbot/config').then(data => {
      if (data.prompt_form_data) {
        setForm({ ...EMPTY_FORM, ...data.prompt_form_data })
        const savedMode = data.prompt_form_data.menu_mode
        if (savedMode === 'manual' || savedMode === 'text') setMenuTab(savedMode)
      }
      if (data.bot_config?.system_prompt) setPrompt(data.bot_config.system_prompt)
      if (data.versions) setVersions(data.versions)
    }).catch((e: unknown) => setErrors([`No se pudo cargar la configuración — ${errMsg(e)}`]))
  }, [businessId])

  function upd<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
    setSaved(false)
  }

  function toggleSection(key: string) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Completion checks
  const bizComplete = !!(form.restaurant_name && form.city && form.phone)
  const hoursComplete = form.hours.some(h => h.open)
  const menuComplete = form.menu_mode === 'text'
    ? !!form.menu_text.trim()
    : form.menu_categories.some(c => c.items.length > 0)
  const completedCount = [bizComplete, hoursComplete, menuComplete].filter(Boolean).length
  const progress = Math.round((completedCount / 3) * 100)

  async function handleGenerate() {
    setGenerating(true)
    setErrors([])
    try {
      const data = await apiJson('/chatbot/config/generate-prompt', {
        method: 'POST',
        body: JSON.stringify({ form_data: form }),
      })
      if (data.system_prompt) setPrompt(data.system_prompt)
    } catch (e: unknown) {
      setErrors([`No se pudo generar el prompt — ${errMsg(e)}`])
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    const errs: string[] = []
    if (!form.restaurant_name) errs.push('Nombre del restaurante es obligatorio')
    if (!hoursComplete) errs.push('Debes tener al menos un día de horario activo')
    if (!menuComplete) errs.push('Debes agregar al menos un platillo al menú')
    if (!prompt.trim()) errs.push('Genera el system prompt antes de guardar')
    if (errs.length) { setErrors(errs); return }
    setErrors([])
    setSaving(true)
    try {
      await apiJson('/chatbot/config', {
        method: 'POST',
        body: JSON.stringify({ system_prompt: prompt, form_data: form }),
      })
      setSaved(true)
      // Refresh versions
      apiJson('/chatbot/config').then(d => { if (d.versions) setVersions(d.versions) }).catch(() => {})
    } catch (e: unknown) {
      setErrors([`No se pudo guardar — ${errMsg(e)}`])
    } finally {
      setSaving(false)
    }
  }

  async function handleParseMenu() {
    if (!form.menu_text.trim()) return
    setParsingMenu(true)
    setErrors([])
    try {
      const data = await apiJson('/chatbot/config/parse-menu', {
        method: 'POST',
        body: JSON.stringify({ menu_text: form.menu_text }),
      })
      if (data.categories) {
        upd('menu_categories', data.categories)
        upd('menu_mode', 'manual')
      }
    } catch (e: unknown) {
      setErrors([`No se pudo estructurar el menú — ${errMsg(e)}`])
    } finally {
      setParsingMenu(false)
    }
  }

  function handleMenuFileSelect(file: File | null) {
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowed.includes(file.type)) {
      setErrors(['Solo se aceptan imágenes (JPG, PNG, WEBP) y archivos PDF'])
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors(['El archivo no puede superar 20 MB'])
      return
    }
    setMenuUploadFile(file)
    setErrors([])
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setMenuUploadPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setMenuUploadPreview(null)
    }
  }

  async function handleMenuFileUpload() {
    if (!menuUploadFile) return
    setUploadingMenu(true)
    setErrors([])
    try {
      const data = await apiUploadFile('/chatbot/config/parse-menu-file', menuUploadFile)
      if (data.categories) {
        upd('menu_categories', data.categories)
        upd('menu_mode', 'manual')
        setMenuTab('manual')
        setMenuUploadFile(null)
        setMenuUploadPreview(null)
      }
    } catch (e: unknown) {
      setErrors([`No se pudo extraer el menú — ${errMsg(e)}`])
    } finally {
      setUploadingMenu(false)
    }
  }

  async function handleRestore(id: string) {
    setErrors([])
    try {
      await apiJson(`/chatbot/config/restore/${id}`, { method: 'POST' })
      const data = await apiJson('/chatbot/config')
      if (data.prompt_form_data) setForm({ ...EMPTY_FORM, ...data.prompt_form_data })
      if (data.bot_config?.system_prompt) setPrompt(data.bot_config.system_prompt)
      if (data.versions) setVersions(data.versions)
      setShowHistory(false)
      setSaved(true)
    } catch (e: unknown) {
      setErrors([`No se pudo restaurar la versión — ${errMsg(e)}`])
    }
  }

  const charCount = prompt.length
  const overLimit = charCount > 16000

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Progress */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Configuración {progress}% completa</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{completedCount}/3 secciones obligatorias</span>
          </div>
          <div style={{ background: 'var(--surface-3)', borderRadius: 99, height: 6 }}>
            <div style={{ background: 'var(--accent)', width: `${progress}%`, height: '100%', borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ background: 'var(--status-noshow-bg)', border: '1px solid var(--status-noshow-ink)', borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 12 }}>
          {errors.map(e => <div key={e} style={{ fontSize: 13, color: 'var(--status-noshow-ink)' }}>{e}</div>)}
        </div>
      )}

      {/* Section 1: Business info */}
      <Section title="Datos del Negocio" subtitle="Nombre, ubicación y contacto" open={!!open.business} onToggle={() => toggleSection('business')} complete={bizComplete} required>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Field label="Nombre del restaurante *" half>
            <input style={inputStyle} value={form.restaurant_name} onChange={e => upd('restaurant_name', e.target.value)} placeholder="Dublé Bistró" />
          </Field>
          <Field label="Tipo de cocina / concepto" half>
            <input style={inputStyle} value={form.cuisine_type} onChange={e => upd('cuisine_type', e.target.value)} placeholder="Bistró francés contemporáneo" />
          </Field>
          <Field label="Dirección" half>
            <input style={inputStyle} value={form.address} onChange={e => upd('address', e.target.value)} placeholder="Av. Juárez 123" />
          </Field>
          <Field label="Colonia / Zona" half>
            <input style={inputStyle} value={form.neighborhood} onChange={e => upd('neighborhood', e.target.value)} placeholder="Centro Histórico" />
          </Field>
          <Field label="Ciudad *" half>
            <input style={inputStyle} value={form.city} onChange={e => upd('city', e.target.value)} placeholder="León, Gto." />
          </Field>
          <Field label="Teléfono de contacto *" half tooltip="Se usa para escalar conversaciones a un humano">
            <input style={inputStyle} value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+52 477 000 0000" />
          </Field>
          <Field label="Sitio web" half>
            <input style={inputStyle} value={form.website} onChange={e => upd('website', e.target.value)} placeholder="www.dublebistro.mx" />
          </Field>
          <Field label="Instagram" half>
            <input style={inputStyle} value={form.instagram} onChange={e => upd('instagram', e.target.value)} placeholder="@dublebistro" />
          </Field>
        </div>
      </Section>

      {/* Section 2: Hours */}
      <Section title="Horarios de Operación" subtitle="Configura los días y horarios del restaurante" open={!!open.hours} onToggle={() => toggleSection('hours')} complete={hoursComplete} required>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {form.hours.map((h, i) => (
            <div key={h.day} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', minWidth: 110 }}>
                <input type="checkbox" checked={h.open} onChange={e => {
                  const next = [...form.hours]; next[i] = { ...h, open: e.target.checked }; upd('hours', next)
                }} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
                <span style={{ fontSize: 13.5, fontWeight: h.open ? 600 : 400, color: h.open ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {h.day.charAt(0).toUpperCase() + h.day.slice(1)}
                </span>
              </label>
              {h.open ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="time" value={h.from} onChange={e => { const n = [...form.hours]; n[i] = { ...h, from: e.target.value }; upd('hours', n) }} style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }} />
                  <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>a</span>
                  <input type="time" value={h.to} onChange={e => { const n = [...form.hours]; n[i] = { ...h, to: e.target.value }; upd('hours', n) }} style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }} />
                </div>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Cerrado</span>
              )}
            </div>
          ))}
          <Field label="Nota especial de horario" tooltip="Ej: Domingos solo comida, sin cena">
            <input style={inputStyle} value={form.hours_note} onChange={e => upd('hours_note', e.target.value)} placeholder="Ej: Lunes cerrado, domingos solo comida hasta las 17:00" />
          </Field>
          <div style={{ marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.accepts_reservations} onChange={e => upd('accepts_reservations', e.target.checked)} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>¿Acepta reservaciones?</span>
            </label>
          </div>
          {form.accepts_reservations && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, paddingLeft: 24 }}>
              <Field label="Máximo de personas" half tooltip="Límite por reservación individual">
                <input type="number" style={inputStyle} value={form.reservation_max_people} min={1} onChange={e => upd('reservation_max_people', +e.target.value)} />
              </Field>
              <Field label="Anticipación mínima (horas)" half>
                <input type="number" style={inputStyle} value={form.reservation_advance_hours} min={0} onChange={e => upd('reservation_advance_hours', +e.target.value)} />
              </Field>
              <Field label="WhatsApp / contacto para confirmar reservas">
                <input style={inputStyle} value={form.reservation_contact} onChange={e => upd('reservation_contact', e.target.value)} placeholder={form.phone} />
              </Field>
            </div>
          )}
        </div>
      </Section>

      {/* Section 3: Menu */}
      <Section title="Menú" subtitle="Carga el menú para que el bot pueda responder sobre platillos y precios" open={!!open.menu} onToggle={() => toggleSection('menu')} complete={menuComplete} required>
        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--surface-2)', borderRadius: 'var(--r)', padding: 4, width: 'fit-content' }}>
          {([
            ['manual', 'Carga manual'],
            ['text', 'Texto libre'],
            ['upload', 'Subir foto o PDF'],
          ] as const).map(([m, label]) => (
            <button key={m} onClick={() => {
              setMenuTab(m)
              if (m !== 'upload') upd('menu_mode', m)
            }} style={{
              padding: '6px 14px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: menuTab === m ? 'var(--surface)' : 'transparent',
              color: menuTab === m ? 'var(--ink)' : 'var(--ink-3)',
              boxShadow: menuTab === m ? 'var(--shadow-xs)' : 'none',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {m === 'upload' && <Upload size={12} />}
              {label}
            </button>
          ))}
        </div>

        {menuTab === 'upload' && (
          <div>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              style={{ display: 'none' }}
              onChange={e => handleMenuFileSelect(e.target.files?.[0] ?? null)}
            />

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDraggingFile(true) }}
              onDragLeave={() => setDraggingFile(false)}
              onDrop={e => { e.preventDefault(); setDraggingFile(false); handleMenuFileSelect(e.dataTransfer.files[0]) }}
              onClick={() => !menuUploadFile && fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${draggingFile ? 'var(--accent)' : menuUploadFile ? 'var(--accent)' : 'var(--line)'}`,
                borderRadius: 'var(--r-lg)',
                padding: menuUploadFile ? '16px' : '36px 24px',
                textAlign: 'center',
                background: draggingFile ? 'var(--accent-soft)' : menuUploadFile ? 'var(--surface-2)' : 'var(--surface-2)',
                cursor: menuUploadFile ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {menuUploadFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {menuUploadPreview ? (
                    // Image preview
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={menuUploadPreview}
                        alt="Vista previa del menú"
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--r)', border: '1px solid var(--line)' }}
                      />
                    </div>
                  ) : (
                    <FileText size={40} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{menuUploadFile.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{(menuUploadFile.size / 1024).toFixed(0)} KB · {menuUploadFile.type.startsWith('image/') ? 'Imagen' : 'PDF'}</div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ flexShrink: 0 }}
                    onClick={e => { e.stopPropagation(); setMenuUploadFile(null); setMenuUploadPreview(null) }}
                  >
                    <Trash2 size={13} />
                    Cambiar
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 10, opacity: 0.4 }}>
                    <ImageIcon size={28} />
                    <FileText size={28} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                    Arrastra aquí tu menú o haz clic para seleccionar
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    JPG, PNG, WEBP o PDF · máx. 20 MB
                  </div>
                </div>
              )}
            </div>

            {/* Extract button */}
            {menuUploadFile && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleMenuFileUpload}
                  disabled={uploadingMenu}
                >
                  {uploadingMenu
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Extrayendo menú…</>
                    : <><Sparkles size={14} /> Extraer menú con IA</>
                  }
                </button>
                {uploadingMenu && (
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    Claude está leyendo el archivo, puede tardar unos segundos…
                  </span>
                )}
              </div>
            )}

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-4)', lineHeight: 1.5 }}>
              <strong>Recomendaciones:</strong> fotografía con buena iluminación, sin reflejos, con el menú desplegado.
              Para PDF, usa archivos digitales (no escaneados) para mejor precisión.
              Después de extraer podrás editar cualquier platillo.
            </div>
          </div>
        )}

        {menuTab === 'text' && (
          <div>
            <textarea
              value={form.menu_text}
              onChange={e => upd('menu_text', e.target.value)}
              rows={8}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Pega aquí tu menú en cualquier formato. Ej: 'Tacos de birria $85, Consomé $45, Orden de quesadillas $70...'"
            />
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 8 }}
              onClick={handleParseMenu}
              disabled={parsingMenu || !form.menu_text.trim()}
            >
              {parsingMenu ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
              Estructurar con IA
            </button>
          </div>
        )}

        {menuTab === 'manual' && (
          <div>
            {form.menu_categories.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 16, border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface-2)' }}>
                  <input
                    style={{ ...inputStyle, fontWeight: 600, flex: 1 }}
                    value={cat.name}
                    placeholder="Nombre de categoría"
                    onChange={e => {
                      const n = [...form.menu_categories]; n[ci] = { ...cat, name: e.target.value }; upd('menu_categories', n)
                    }}
                  />
                  {form.menu_categories.length > 1 && (
                    <button className="btn btn-icon btn-subtle btn-sm" onClick={() => {
                      upd('menu_categories', form.menu_categories.filter((_, i) => i !== ci))
                    }}><Trash2 size={13} /></button>
                  )}
                </div>
                <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {cat.items.map((item, ii) => (
                    <div key={ii} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <input
                        style={{ ...inputStyle, flex: '2 1 140px' }}
                        placeholder="Nombre del platillo"
                        value={item.name}
                        onChange={e => {
                          const nc = [...form.menu_categories]
                          nc[ci].items[ii] = { ...item, name: e.target.value }
                          upd('menu_categories', nc)
                        }}
                      />
                      <input
                        style={{ ...inputStyle, flex: '3 1 180px' }}
                        placeholder="Descripción (opcional)"
                        value={item.description}
                        onChange={e => {
                          const nc = [...form.menu_categories]
                          nc[ci].items[ii] = { ...item, description: e.target.value }
                          upd('menu_categories', nc)
                        }}
                      />
                      <input
                        type="number" min={0}
                        style={{ ...inputStyle, width: 90, flex: 'none' }}
                        placeholder="Precio"
                        value={item.price}
                        onChange={e => {
                          const nc = [...form.menu_categories]
                          nc[ci].items[ii] = { ...item, price: e.target.value === '' ? '' : +e.target.value }
                          upd('menu_categories', nc)
                        }}
                      />
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 'none' }}>
                        {([['vegetarian', '🌱'], ['spicy', '🌶️'], ['recommended', '⭐']] as const).map(([tag, emoji]) => (
                          <button
                            key={tag} title={tag}
                            onClick={() => {
                              const nc = [...form.menu_categories]
                              const t = item.tags.includes(tag) ? item.tags.filter(x => x !== tag) : [...item.tags, tag]
                              nc[ci].items[ii] = { ...item, tags: t }
                              upd('menu_categories', nc)
                            }}
                            style={{
                              fontSize: 16, background: 'none', border: '1px solid var(--line)',
                              borderRadius: 6, padding: '2px 6px', cursor: 'pointer',
                              opacity: item.tags.includes(tag) ? 1 : 0.35,
                            }}
                          >{emoji}</button>
                        ))}
                        <button
                          title="Marcar como no disponible"
                          onClick={() => {
                            const nc = [...form.menu_categories]
                            nc[ci].items[ii] = { ...item, available: !item.available }
                            upd('menu_categories', nc)
                          }}
                          style={{ fontSize: 15, background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '2px 6px', cursor: 'pointer', opacity: item.available ? 0.35 : 1 }}
                        >🚫</button>
                        <button className="btn btn-icon btn-subtle btn-sm" onClick={() => {
                          const nc = [...form.menu_categories]
                          nc[ci].items = nc[ci].items.filter((_, j) => j !== ii)
                          upd('menu_categories', nc)
                        }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: 4 }}
                    onClick={() => {
                      const nc = [...form.menu_categories]
                      nc[ci].items.push({ name: '', description: '', price: '', tags: [], available: true })
                      upd('menu_categories', nc)
                    }}
                  >
                    <Plus size={13} />Agregar platillo
                  </button>
                </div>
              </div>
            ))}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => upd('menu_categories', [...form.menu_categories, { name: 'Nueva categoría', items: [] }])}
            >
              <Plus size={13} />Agregar categoría
            </button>
          </div>
        )}
      </Section>

      {/* Section 4: Personality */}
      <Section title="Personalidad del Bot" subtitle="Nombre, tono e idioma del asistente" open={!!open.personality} onToggle={() => toggleSection('personality')} complete={true}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Field label="Nombre del asistente" half tooltip="Por defecto: 'Asistente de [Nombre del Restaurante]'">
            <input style={inputStyle} value={form.bot_name} onChange={e => upd('bot_name', e.target.value)} placeholder={`Asistente de ${form.restaurant_name || 'tu restaurante'}`} />
          </Field>
          <Field label="Tono de comunicación" half>
            <select style={inputStyle} value={form.tone} onChange={e => upd('tone', e.target.value as FormData['tone'])}>
              <option value="formal">Formal (usted)</option>
              <option value="semiformal">Semi-formal</option>
              <option value="casual">Casual (tú)</option>
            </select>
          </Field>
          <Field label="Idioma principal" half>
            <select style={inputStyle} value={form.language} onChange={e => upd('language', e.target.value as FormData['language'])}>
              <option value="bilingual">Bilingüe (auto-detecta)</option>
              <option value="spanish">Solo Español</option>
              <option value="english">Solo English</option>
            </select>
          </Field>
          <Field label="Longitud de respuestas" half>
            <select style={inputStyle} value={form.response_length} onChange={e => upd('response_length', e.target.value as FormData['response_length'])}>
              <option value="concise">Concisas (2-3 líneas)</option>
              <option value="normal">Normales (4-5 líneas)</option>
              <option value="detailed">Detalladas</option>
            </select>
          </Field>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13.5 }}>
              <input type="checkbox" checked={form.can_recommend} onChange={e => upd('can_recommend', e.target.checked)} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
              Puede recomendar platillos
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13.5 }}>
              <input type="checkbox" checked={form.show_prices} onChange={e => upd('show_prices', e.target.checked)} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
              Menciona precios cuando le preguntan
            </label>
          </div>
        </div>
      </Section>

      {/* Section 5: Escalation */}
      <Section title="Reglas de Escalación" subtitle="Cuándo el bot debe pasarle la conversación a una persona" open={!!open.escalation} onToggle={() => toggleSection('escalation')} complete={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {([
            ['negative_feedback', 'Quejas o comentarios negativos'],
            ['refund_request', 'Solicitudes de reembolso o compensación'],
            ['private_events', 'Preguntas sobre eventos privados o presupuestos'],
            ['customer_requests_human', 'El cliente pide explícitamente hablar con una persona'],
            ['repeated_unknown', 'El bot no sabe responder algo 2 veces seguidas'],
          ] as [keyof EscalationRules, string][]).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13.5 }}>
              <input
                type="checkbox"
                checked={!!form.escalation_rules[key]}
                onChange={e => upd('escalation_rules', { ...form.escalation_rules, [key]: e.target.checked })}
                style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
              />
              {label}
            </label>
          ))}
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13.5 }}>
            <input
              type="checkbox"
              checked={form.escalation_rules.large_group}
              onChange={e => upd('escalation_rules', { ...form.escalation_rules, large_group: e.target.checked })}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
            />
            Grupos grandes de más de
            <input
              type="number" min={2}
              value={form.escalation_rules.large_group_threshold}
              onChange={e => upd('escalation_rules', { ...form.escalation_rules, large_group_threshold: +e.target.value })}
              style={{ ...inputStyle, width: 60, display: 'inline', padding: '4px 8px' }}
            />
            personas
          </label>
          <Field label="Mensaje de escalación" tooltip="El bot enviará exactamente este texto cuando escale la conversación">
            <textarea
              value={form.escalation_message}
              onChange={e => upd('escalation_message', e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Field>
          <Field label="Número/contacto al que se avisa (WhatsApp)" half>
            <input style={inputStyle} value={form.escalation_contact} onChange={e => upd('escalation_contact', e.target.value)} placeholder={form.phone} />
          </Field>
        </div>
      </Section>

      {/* Section 6: Events */}
      <Section title="Eventos y Promociones" subtitle="Opcional — el bot mencionará estos cuando sea relevante" open={!!open.events} onToggle={() => toggleSection('events')} complete={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {form.events.map((ev, i) => (
            <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '12px 14px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' }}>
              <input style={{ ...inputStyle, flex: '2 1 160px' }} placeholder="Nombre del evento" value={ev.name} onChange={e => { const n = [...form.events]; n[i] = { ...ev, name: e.target.value }; upd('events', n) }} />
              <input style={{ ...inputStyle, flex: '3 1 200px' }} placeholder="Descripción breve" value={ev.description} onChange={e => { const n = [...form.events]; n[i] = { ...ev, description: e.target.value }; upd('events', n) }} />
              <input type="date" style={{ ...inputStyle, flex: '1 1 120px' }} value={ev.date_start} onChange={e => { const n = [...form.events]; n[i] = { ...ev, date_start: e.target.value }; upd('events', n) }} />
              <input type="date" style={{ ...inputStyle, flex: '1 1 120px' }} value={ev.date_end} onChange={e => { const n = [...form.events]; n[i] = { ...ev, date_end: e.target.value }; upd('events', n) }} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={ev.active} onChange={e => { const n = [...form.events]; n[i] = { ...ev, active: e.target.checked }; upd('events', n) }} style={{ accentColor: 'var(--accent)' }} />
                  Activo
                </label>
                <button className="btn btn-icon btn-subtle btn-sm" onClick={() => upd('events', form.events.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => upd('events', [...form.events, { name: '', description: '', date_start: '', date_end: '', active: true }])}>
            <Plus size={13} />Agregar evento
          </button>
        </div>
      </Section>

      {/* Section 7: Preview */}
      <Section title="Vista Previa y Guardado" subtitle="Genera el prompt completo y actívalo" open={!!open.preview} onToggle={() => toggleSection('preview')} complete={!!prompt}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
            Generar System Prompt
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowHistory(!showHistory)}>
            <History size={14} />
            Historial ({versions.length})
          </button>
        </div>

        {showHistory && versions.length > 0 && (
          <div style={{ marginBottom: 12, border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
            {versions.map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: '1px solid var(--line)', background: v.is_active ? 'var(--accent-soft)' : 'var(--surface)' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13.5, fontWeight: v.is_active ? 600 : 400 }}>{v.version_label}</span>
                  {v.is_active && <span className="badge badge-conf" style={{ marginLeft: 8, fontSize: 11 }}>Activa</span>}
                </div>
                {!v.is_active && (
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRestore(v.id)}>
                    <RotateCcw size={12} />Restaurar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {prompt && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>System prompt generado ({charCount.toLocaleString()} caracteres)</span>
              {overLimit && (
                <span style={{ fontSize: 12, color: 'var(--status-pending-ink)', fontWeight: 600 }}>⚠ Muy extenso — considera simplificar el menú</span>
              )}
            </div>
            <textarea
              value={prompt}
              onChange={e => { setPrompt(e.target.value); setSaved(false) }}
              rows={16}
              style={{
                ...inputStyle, resize: 'vertical', fontFamily: 'monospace',
                fontSize: 12.5, lineHeight: 1.6,
                borderColor: overLimit ? 'var(--status-pending-ink)' : 'var(--line)',
              }}
            />
          </>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !prompt.trim()}
          >
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
            Guardar y Activar
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>✓ Guardado y activo</span>}
        </div>
      </Section>
    </div>
  )
}
