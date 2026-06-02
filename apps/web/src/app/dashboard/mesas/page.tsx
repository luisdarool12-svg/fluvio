'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Sun, Utensils, Armchair, X, PenLine, Save, LayoutGrid, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Toast } from '@/components/Toast'
import type { Table, TableZone, TableTipo, ZoneArea, Wall, FurnitureItem, FloorPlanConfig } from '@/lib/data'
import { toTable } from '@/lib/transform'
import { createClient } from '@/utils/supabase/client'

const ZONE_ICON: Record<TableZone, React.ReactNode> = {
  Terraza:  <Sun size={20} />,
  Interior: <Utensils size={20} />,
  Barra:    <Armchair size={20} />,
}
const ZONAS_LIST: TableZone[] = ['Terraza', 'Interior', 'Barra']

type Ocup = 'libre' | 'proxima' | 'ocupada'
type VisualState = Ocup | 'inactiva'

const OCUP_LABEL: Record<Ocup, string> = {
  libre: 'Libre', proxima: 'Próxima', ocupada: 'Ocupada',
}
const VISUAL_COLOR: Record<VisualState, string> = {
  libre: '#22c55e', proxima: '#f59e0b', ocupada: '#ef4444', inactiva: '#d1d5db',
}
const VISUAL_LABEL: Record<VisualState, string> = {
  libre: 'Libre', proxima: 'Próxima (≤30 min)', ocupada: 'Ocupada', inactiva: 'Inactiva',
}

type OcupEntry = { estado: string; nombre: string; fecha_hora: string; personas: number }

// ── Formas OpenTable ──────────────────────────────────────────────────────────
type Variant = 'round' | 'rect' | 'double' | 'triple'

function getVariant(cap: number, zone: TableZone): Variant {
  if (zone === 'Barra' || cap <= 2) return 'round'
  if (cap <= 4) return 'rect'
  if (cap <= 8) return 'double'
  return 'triple'
}

const RECT_DIMS: Record<Variant, { w: number; h: number }> = {
  round: { w: 54, h: 54 }, rect: { w: 76, h: 56 },
  double: { w: 58, h: 52 }, triple: { w: 50, h: 48 },
}
const NUM_RECTS: Record<Variant, number> = { round: 1, rect: 1, double: 2, triple: 3 }
const GAP = 3

function totalWidth(variant: Variant): number {
  return RECT_DIMS[variant].w * NUM_RECTS[variant] + GAP * (NUM_RECTS[variant] - 1)
}

function chairCounts(cap: number, zone: TableZone, tipo: TableTipo): { top: number; bottom: number } {
  if (zone === 'Barra') return { top: Math.min(cap, 6), bottom: 0 }
  if (tipo === 'booth') return { top: 0, bottom: Math.min(cap, 8) }
  return { top: Math.ceil(cap / 2), bottom: Math.floor(cap / 2) }
}

function chairW(n: number, containerW: number): number {
  return Math.min(14, Math.max(8, (containerW - 4 * (n - 1)) / n))
}

// ── Floor plan constants ──────────────────────────────────────────────────────
const FURNITURE_STYLE: Record<FurnitureItem['tipo'], { bg: string; text: string }> = {
  sofa:       { bg: '#c9a87888', text: 'Sillón'  },
  barra_fija: { bg: '#9ca3af88', text: 'Barra'   },
  planta:     { bg: '#86efac88', text: 'Planta'  },
}

const ZONE_PRESETS = [
  { label: 'Terraza',  color: '#fef9c350' },
  { label: 'Interior', color: '#eff6ff60' },
  { label: 'Barra',    color: '#fff1f250' },
  { label: 'Privado',  color: '#f3e8ff50' },
  { label: 'Exterior', color: '#f0fdf450' },
]

const rotBtnStyle: React.CSSProperties = {
  width: 20, height: 20, borderRadius: 4,
  border: '1px solid rgba(0,0,0,.18)',
  background: 'rgba(255,255,255,.9)',
  cursor: 'pointer', fontSize: 13,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0, lineHeight: 1,
}

type EditLayer = 'mesas' | 'zonas' | 'paredes' | 'mobiliario'
type SelectedEl = { type: 'zone' | 'wall' | 'furniture'; id: string } | null

export default function MesasPage() {
  const [mesas, setMesas]                     = useState<Table[]>([])
  const [zona, setZona]                       = useState('Todas')
  const [view, setView]                       = useState<'lista' | 'croquis'>('lista')
  const [editMode, setEditMode]               = useState(false)
  const [editLayer, setEditLayer]             = useState<EditLayer>('mesas')
  const [isOwner, setIsOwner]                 = useState(false)
  const [businessId, setBusinessId]           = useState<string | null>(null)
  const [ocupMap, setOcupMap]                 = useState<Map<string, OcupEntry>>(new Map())
  const [fpConfig, setFpConfig]               = useState<FloorPlanConfig>({ zones: [], walls: [], furniture: [] })
  const [selectedEl, setSelectedEl]           = useState<SelectedEl>(null)
  const [showModal, setShowModal]             = useState(false)
  const [showAddZone, setShowAddZone]         = useState(false)
  const [showAddWall, setShowAddWall]         = useState(false)
  const [showAddFurniture, setShowAddFurniture] = useState(false)
  const [saving, setSaving]                   = useState(false)
  const [savingPos, setSavingPos]             = useState(false)
  const [seatingSaving, setSeatingSaving]     = useState(false)
  const [toast, setToast]                     = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [form, setForm]                       = useState({ nombre: '', zona: 'Interior' as TableZone, cap: 4, tipo: 'mesa' as TableTipo })
  const [zoneForm, setZoneForm]               = useState({ label: 'Terraza', color: '#fef9c350', w: 35, h: 80 })
  const [wallForm, setWallForm]               = useState({ dir: 'v' as 'h' | 'v', len: 40 })
  const [furnitureForm, setFurnitureForm]     = useState({ tipo: 'sofa' as FurnitureItem['tipo'], label: '', w: 30, h: 8 })
  const [tooltip, setTooltip]                 = useState<{ id: string } | null>(null)
  const [seatPersonas, setSeatPersonas]       = useState(2)

  const canvasRef  = useRef<HTMLDivElement>(null)
  const dragging   = useRef<{ id: string } | null>(null)
  const fpDragging = useRef<{
    type: 'zone' | 'wall' | 'furniture'
    id: string; startX: number; startY: number; origX: number; origY: number
  } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  function exitEditMode() {
    setEditMode(false)
    setEditLayer('mesas')
    setSelectedEl(null)
    setTooltip(null)
  }

  const loadOcupacion = useCallback(async (supabase: ReturnType<typeof createClient>) => {
    const today    = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    const { data } = await supabase
      .from('reservations')
      .select('table_id, estado, fecha_hora, personas, customers(nombre)')
      .gte('fecha_hora', today.toISOString())
      .lt('fecha_hora', tomorrow.toISOString())
      .neq('estado', 'cancelada')
      .not('table_id', 'is', null)
    if (!data) return
    const map = new Map<string, OcupEntry>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((r: any) => {
      if (!r.table_id) return
      const existing = map.get(r.table_id)
      if (!existing || r.estado === 'sentada') {
        map.set(r.table_id, { estado: r.estado, nombre: r.customers?.nombre ?? '—', fecha_hora: r.fecha_hora, personas: r.personas })
      }
    })
    setOcupMap(map)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userRow } = await supabase.from('users').select('rol, business_id').single()
      setIsOwner(userRow?.rol === 'owner')
      if (userRow?.business_id) setBusinessId(userRow.business_id)

      const { data } = await supabase.from('tables').select('*').order('nombre')
      if (data) setMesas(data.map(toTable))

      const { data: fpRow } = await supabase.from('floor_plan_config').select('config').single()
      if (fpRow?.config) setFpConfig(fpRow.config as FloorPlanConfig)

      await loadOcupacion(supabase)
    }
    load()
    const ch = supabase.channel('mesas-ocup')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => loadOcupacion(supabase))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [loadOcupacion])

  function getOcup(mesa: Table): Ocup {
    if (mesa.ocupadoManual) return 'ocupada'
    const r = ocupMap.get(mesa.id)
    if (!r) return 'libre'
    if (r.estado === 'sentada') return 'ocupada'
    const min = (new Date(r.fecha_hora).getTime() - Date.now()) / 60000
    if (min <= 30 && min >= -30) return 'proxima'
    return 'libre'
  }

  function getVisual(mesa: Table): VisualState {
    return mesa.active ? getOcup(mesa) : 'inactiva'
  }

  // ── Drag ──────────────────────────────────────────────────────────────────
  function startDrag(e: React.MouseEvent, id: string) {
    e.preventDefault()
    dragging.current = { id }
    setTooltip(null)
  }

  function handleMouseMove(e: React.MouseEvent) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()

    const drag = dragging.current
    if (drag) {
      const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
      const y = Math.max(8, Math.min(92, ((e.clientY - rect.top) / rect.height) * 100))
      setMesas(prev => prev.map(m => m.id === drag.id ? { ...m, posX: x, posY: y } : m))
      return
    }

    const fp = fpDragging.current
    if (!fp) return
    const dx = ((e.clientX - fp.startX) / rect.width) * 100
    const dy = ((e.clientY - fp.startY) / rect.height) * 100
    const nx = Math.max(0, Math.min(94, fp.origX + dx))
    const ny = Math.max(0, Math.min(94, fp.origY + dy))
    setFpConfig(prev => {
      if (fp.type === 'zone')      return { ...prev, zones:     prev.zones.map(z => z.id === fp.id ? { ...z, x: nx, y: ny } : z) }
      if (fp.type === 'wall')      return { ...prev, walls:     prev.walls.map(w => w.id === fp.id ? { ...w, x: nx, y: ny } : w) }
      return                              { ...prev, furniture: prev.furniture.map(f => f.id === fp.id ? { ...f, x: nx, y: ny } : f) }
    })
  }

  function handleMouseUp() {
    dragging.current   = null
    fpDragging.current = null
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  async function toggle(id: string) {
    const mesa = mesas.find(t => t.id === id)
    if (!mesa) return
    const supabase = createClient()
    const { error } = await supabase.from('tables').update({ activo: !mesa.active }).eq('id', id)
    if (!error) setMesas(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t))
    else showToast('Error al actualizar', 'error')
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: userRow } = await supabase.from('users').select('business_id').single()
    if (!userRow) { setSaving(false); showToast('Error obteniendo negocio', 'error'); return }
    const { data, error } = await supabase.from('tables').insert({
      business_id: userRow.business_id, nombre: form.nombre.trim(),
      zona: form.zona, capacidad: form.cap, tipo: form.tipo,
      activo: true, pos_x: 50, pos_y: 50, rotation: 0,
    }).select().single()
    setSaving(false)
    if (error) { showToast('Error al guardar', 'error'); return }
    setMesas(prev => [...prev, toTable(data)].sort((a, b) => a.name.localeCompare(b.name)))
    setShowModal(false)
    setForm({ nombre: '', zona: 'Interior', cap: 4, tipo: 'mesa' })
    showToast(`${data.nombre} agregada`)
  }

  async function savePositions() {
    if (!businessId) { showToast('Sin business_id', 'error'); return }
    setSavingPos(true)
    const supabase = createClient()
    const [tableResults, fpResult] = await Promise.all([
      Promise.all(
        mesas.map(m => supabase.from('tables').update({ pos_x: m.posX, pos_y: m.posY, rotation: m.rotation }).eq('id', m.id))
      ),
      supabase.from('floor_plan_config').upsert(
        { business_id: businessId, config: fpConfig, updated_at: new Date().toISOString() },
        { onConflict: 'business_id' }
      ),
    ])
    setSavingPos(false)
    if (tableResults.some(r => r.error) || fpResult.error) {
      showToast('Error al guardar — verifica que ejecutaste el SQL en Supabase', 'error')
      return
    }
    exitEditMode()
    showToast('Croquis guardado correctamente')
  }

  async function seatManual(id: string, personas: number) {
    setSeatingSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('tables').update({ ocupado_manual: true, personas_manual: personas }).eq('id', id)
    setSeatingSaving(false)
    if (!error) { setMesas(prev => prev.map(t => t.id === id ? { ...t, ocupadoManual: true, personasManual: personas } : t)); setTooltip(null); showToast('Cliente sentado') }
    else showToast('Error al sentar cliente', 'error')
  }

  async function freeManual(id: string) {
    setSeatingSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('tables').update({ ocupado_manual: false, personas_manual: 0 }).eq('id', id)
    setSeatingSaving(false)
    if (!error) { setMesas(prev => prev.map(t => t.id === id ? { ...t, ocupadoManual: false, personasManual: 0 } : t)); setTooltip(null); showToast('Mesa liberada') }
    else showToast('Error al liberar', 'error')
  }

  function rotateMesa(id: string, delta: number) {
    setMesas(prev => prev.map(m =>
      m.id === id ? { ...m, rotation: ((m.rotation + delta) % 360 + 360) % 360 } : m
    ))
  }

  // ── Floor plan helpers ────────────────────────────────────────────────────
  function addZone() {
    setFpConfig(prev => ({
      ...prev,
      zones: [...prev.zones, { id: crypto.randomUUID(), label: zoneForm.label, color: zoneForm.color, x: 5, y: 5, w: zoneForm.w, h: zoneForm.h }],
    }))
    setShowAddZone(false)
    setZoneForm({ label: 'Terraza', color: '#fef9c350', w: 35, h: 80 })
  }

  function deleteZone(id: string) {
    setFpConfig(prev => ({ ...prev, zones: prev.zones.filter(z => z.id !== id) }))
    setSelectedEl(null)
  }

  function addWall() {
    setFpConfig(prev => ({
      ...prev,
      walls: [...prev.walls, { id: crypto.randomUUID(), x: 30, y: 5, len: wallForm.len, dir: wallForm.dir }],
    }))
    setShowAddWall(false)
  }

  function deleteWall(id: string) {
    setFpConfig(prev => ({ ...prev, walls: prev.walls.filter(w => w.id !== id) }))
    setSelectedEl(null)
  }

  function addFurniture() {
    setFpConfig(prev => ({
      ...prev,
      furniture: [...prev.furniture, { id: crypto.randomUUID(), tipo: furnitureForm.tipo, label: furnitureForm.label, x: 10, y: 10, w: furnitureForm.w, h: furnitureForm.h }],
    }))
    setShowAddFurniture(false)
    setFurnitureForm({ tipo: 'sofa', label: '', w: 30, h: 8 })
  }

  function deleteFurniture(id: string) {
    setFpConfig(prev => ({ ...prev, furniture: prev.furniture.filter(f => f.id !== id) }))
    setSelectedEl(null)
  }

  // ── Datos derivados ───────────────────────────────────────────────────────
  const zonas    = ['Todas', ...Array.from(new Set(mesas.map(t => t.zone)))]
  const filtered = zona === 'Todas' ? mesas : mesas.filter(t => t.zone === zona)
  const activas  = mesas.filter(t => t.active).length
  const aforo    = mesas.filter(t => t.active).reduce((s, t) => s + t.cap, 0)
  const libres   = mesas.filter(t => t.active && getOcup(t) === 'libre').length
  const ocupadas = mesas.filter(t => t.active && getOcup(t) === 'ocupada').length

  return (
    <div>
      <PageHeader
        title="Mesas"
        subtitle={`${activas} mesas · ${libres} libres · ${ocupadas} ocupadas · aforo ${aforo}`}
        actions={
          <div className="row gap-8">
            <div className="seg">
              <button className={view === 'lista' ? 'on' : ''} onClick={() => { setView('lista'); exitEditMode() }}>
                <LayoutGrid size={14} style={{ marginRight: 4 }} />Lista
              </button>
              <button className={view === 'croquis' ? 'on' : ''} onClick={() => setView('croquis')}>
                <MapPin size={14} style={{ marginRight: 4 }} />Croquis
              </button>
            </div>
            {view === 'croquis' && isOwner && !editMode && (
              <button className="btn btn-soft" onClick={() => setEditMode(true)}>
                <PenLine size={15} />Editar
              </button>
            )}
            {view === 'croquis' && editMode && (
              <>
                {editLayer === 'mesas' && (
                  <button className="btn btn-soft" onClick={() => setShowModal(true)}>
                    <Plus size={15} />Mesa
                  </button>
                )}
                <button className="btn btn-primary" onClick={savePositions} disabled={savingPos}>
                  {savingPos ? <span className="spin" /> : <><Save size={15} />Guardar</>}
                </button>
              </>
            )}
            {view === 'lista' && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={17} />Agregar mesa
              </button>
            )}
          </div>
        }
      />

      {/* ── VISTA LISTA ───────────────────────────────────────────────────── */}
      {view === 'lista' && (
        <>
          <div className="row gap-8" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
            {zonas.map(z => (
              <button key={z} onClick={() => setZona(z)} className="chip chip-on"
                style={zona === z ? { background: 'var(--ink)', color: '#fff', border: '1px solid var(--ink)' } : {}}>
                {z}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 14 }}>
            {filtered.map(mesa => {
              const ocup  = getOcup(mesa)
              const entry = ocupMap.get(mesa.id)
              const color = mesa.active ? VISUAL_COLOR[ocup] : VISUAL_COLOR.inactiva
              return (
                <div key={mesa.id} className="card card-pad" style={{ opacity: mesa.active ? 1 : 0.62 }}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 'var(--r-sm)',
                      background: mesa.active ? 'var(--accent-soft)' : 'var(--surface-2)',
                      color: mesa.active ? 'var(--accent)' : 'var(--ink-3)',
                      display: 'grid', placeItems: 'center',
                    }}>
                      {ZONE_ICON[mesa.zone as TableZone]}
                    </div>
                    <div className={`switch ${mesa.active ? 'on' : ''}`} onClick={() => toggle(mesa.id)} role="switch" aria-checked={mesa.active} />
                  </div>
                  <div className="display" style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', marginBottom: 2 }}>{mesa.name}</div>
                  <div className="muted" style={{ fontSize: 13.5, marginBottom: 14 }}>
                    {mesa.zone}{mesa.tipo === 'booth' ? ' · Booth' : ''}
                  </div>
                  {mesa.active && (entry || mesa.ocupadoManual) && (
                    <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 8 }}>
                      {mesa.ocupadoManual ? `Walk-in · ${mesa.personasManual} pers.` : entry ? `${entry.nombre} · ${entry.personas} pers.` : null}
                    </div>
                  )}
                  <div className="row" style={{ justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    <span className="faint" style={{ fontSize: 13 }}>{mesa.cap} pers.</span>
                    {mesa.active ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color, background: `${color}18`, borderRadius: 99, padding: '3px 9px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
                        {OCUP_LABEL[ocup]}
                      </span>
                    ) : (
                      <span className="badge badge-canc"><span className="dot" />Inactiva</span>
                    )}
                  </div>
                </div>
              )
            })}
            <button onClick={() => setShowModal(true)}
              style={{ border: '2px dashed var(--line-2)', borderRadius: 'var(--r-lg)', padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent', minHeight: 140 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.color = 'var(--ink-3)' }}
            >
              <Plus size={24} /><span style={{ fontSize: 14, fontWeight: 600 }}>Agregar mesa</span>
            </button>
          </div>
        </>
      )}

      {/* ── VISTA CROQUIS ─────────────────────────────────────────────────── */}
      {view === 'croquis' && (
        <div>
          {/* Leyenda */}
          <div className="row gap-16" style={{ marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {(Object.keys(VISUAL_LABEL) as VisualState[]).map(vs => (
              <div key={vs} className="row gap-6" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: VISUAL_COLOR[vs], display: 'inline-block', flex: 'none' }} />
                {VISUAL_LABEL[vs]}
              </div>
            ))}
            <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>
              {editMode ? 'Arrastra · ↺↻ rotar · Guarda al terminar' : 'Clic en mesa → sentar / liberar'}
            </span>
          </div>

          {/* Selector de capa — solo en edit mode */}
          {editMode && (
            <div className="row gap-8" style={{ marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="seg">
                {(['mesas', 'zonas', 'paredes', 'mobiliario'] as const).map(l => (
                  <button key={l} className={editLayer === l ? 'on' : ''}
                    onClick={() => { setEditLayer(l); setSelectedEl(null) }}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
              {editLayer === 'zonas'      && <button className="btn btn-soft" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => setShowAddZone(true)}><Plus size={13} />Zona</button>}
              {editLayer === 'paredes'    && <button className="btn btn-soft" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => setShowAddWall(true)}><Plus size={13} />Pared</button>}
              {editLayer === 'mobiliario' && <button className="btn btn-soft" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => setShowAddFurniture(true)}><Plus size={13} />Mueble</button>}
            </div>
          )}

          {/* Canvas */}
          <div
            ref={canvasRef}
            style={{
              position: 'relative', width: '100%', height: 640,
              background: '#f8f7f4', borderRadius: 'var(--r-lg)',
              border: editMode ? '2px dashed var(--accent)' : '1px solid var(--line)',
              overflow: 'visible', userSelect: 'none',
              boxShadow: 'inset 0 0 0 1px var(--line)',
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => { setTooltip(null); setSelectedEl(null) }}
          >
            {/* ─ Capa 1: Zonas ─ */}
            {fpConfig.zones.map(zone => (
              <div key={zone.id}
                style={{
                  position: 'absolute', left: `${zone.x}%`, top: `${zone.y}%`,
                  width: `${zone.w}%`, height: `${zone.h}%`,
                  background: zone.color, borderRadius: 12, zIndex: 0,
                  border: editLayer === 'zonas' && selectedEl?.id === zone.id
                    ? '2px dashed var(--accent)'
                    : editLayer === 'zonas' ? '1.5px dashed rgba(0,0,0,.10)' : '1px solid transparent',
                  cursor: editLayer === 'zonas' ? 'move' : 'default',
                  padding: '8px 12px',
                }}
                onClick={e => { if (editLayer === 'zonas') { e.stopPropagation(); setSelectedEl({ type: 'zone', id: zone.id }) } }}
                onMouseDown={e => {
                  if (editLayer !== 'zonas') return
                  e.stopPropagation()
                  setSelectedEl({ type: 'zone', id: zone.id })
                  fpDragging.current = { type: 'zone', id: zone.id, startX: e.clientX, startY: e.clientY, origX: zone.x, origY: zone.y }
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', opacity: 0.65, userSelect: 'none', pointerEvents: 'none' }}>
                  {zone.label}
                </span>
                {editLayer === 'zonas' && selectedEl?.id === zone.id && (
                  <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); deleteZone(zone.id) }}
                    style={{ position: 'absolute', top: 6, right: 6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ×
                  </button>
                )}
              </div>
            ))}

            {/* ─ Capa 2: Paredes ─ */}
            {fpConfig.walls.map(wall => (
              <div key={wall.id}
                style={{
                  position: 'absolute', left: `${wall.x}%`, top: `${wall.y}%`,
                  width: wall.dir === 'h' ? `${wall.len}%` : '8px',
                  height: wall.dir === 'v' ? `${wall.len}%` : '8px',
                  background: '#374151', borderRadius: 4, zIndex: 1,
                  cursor: editLayer === 'paredes' ? 'move' : 'default',
                  outline: editLayer === 'paredes' && selectedEl?.id === wall.id ? '2px dashed var(--accent)' : 'none',
                  outlineOffset: 3,
                }}
                onClick={e => { if (editLayer === 'paredes') { e.stopPropagation(); setSelectedEl({ type: 'wall', id: wall.id }) } }}
                onMouseDown={e => {
                  if (editLayer !== 'paredes') return
                  e.stopPropagation()
                  setSelectedEl({ type: 'wall', id: wall.id })
                  fpDragging.current = { type: 'wall', id: wall.id, startX: e.clientX, startY: e.clientY, origX: wall.x, origY: wall.y }
                }}
              >
                {editLayer === 'paredes' && selectedEl?.id === wall.id && (
                  <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); deleteWall(wall.id) }}
                    style={{ position: 'absolute', top: -10, right: -10, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    ×
                  </button>
                )}
              </div>
            ))}

            {/* ─ Capa 3: Mobiliario ─ */}
            {fpConfig.furniture.map(item => {
              const fs = FURNITURE_STYLE[item.tipo]
              return (
                <div key={item.id}
                  style={{
                    position: 'absolute', left: `${item.x}%`, top: `${item.y}%`,
                    width: `${item.w}%`, height: `${item.h}%`,
                    background: fs.bg, borderRadius: 8, zIndex: 2,
                    border: editLayer === 'mobiliario' && selectedEl?.id === item.id
                      ? '2px dashed var(--accent)' : '2px solid rgba(0,0,0,.10)',
                    cursor: editLayer === 'mobiliario' ? 'move' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, color: '#374151', userSelect: 'none',
                  }}
                  onClick={e => { if (editLayer === 'mobiliario') { e.stopPropagation(); setSelectedEl({ type: 'furniture', id: item.id }) } }}
                  onMouseDown={e => {
                    if (editLayer !== 'mobiliario') return
                    e.stopPropagation()
                    setSelectedEl({ type: 'furniture', id: item.id })
                    fpDragging.current = { type: 'furniture', id: item.id, startX: e.clientX, startY: e.clientY, origX: item.x, origY: item.y }
                  }}
                >
                  {item.label || fs.text}
                  {editLayer === 'mobiliario' && selectedEl?.id === item.id && (
                    <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); deleteFurniture(item.id) }}
                      style={{ position: 'absolute', top: -10, right: -10, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                      ×
                    </button>
                  )}
                </div>
              )
            })}

            {/* ─ Capa 4: Mesas ─ */}
            {mesas.map(mesa => {
              const visual  = getVisual(mesa)
              const color   = VISUAL_COLOR[visual]
              const entry   = ocupMap.get(mesa.id)
              const variant = getVariant(mesa.cap, mesa.zone)
              const dims    = RECT_DIMS[variant]
              const nRects  = NUM_RECTS[variant]
              const isRound = variant === 'round'
              const tW      = totalWidth(variant)
              const chairs  = chairCounts(mesa.cap, mesa.zone, mesa.tipo)
              const chairClr = `${color}99`
              const cW      = (n: number) => chairW(n, tW)
              const ocup    = getOcup(mesa)
              const canDrag = editMode && editLayer === 'mesas'

              return (
                <div key={mesa.id} style={{
                  position: 'absolute',
                  left: `${mesa.posX}%`, top: `${mesa.posY}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: tooltip?.id === mesa.id ? 10 : 3,
                }}>
                  {/* Parte rotable: booth wall + sillas + mesa + botones */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transform: `rotate(${mesa.rotation}deg)`,
                    transformOrigin: 'center',
                  }}>
                    {mesa.tipo === 'booth' && (
                      <div style={{ width: tW + 12, height: 7, borderRadius: '4px 4px 0 0', background: '#374151', marginBottom: -2 }} />
                    )}

                    {chairs.top > 0 && (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', width: tW }}>
                        {Array.from({ length: chairs.top }).map((_, i) => (
                          <div key={i} style={{ width: cW(chairs.top), height: 10, borderRadius: 6, background: chairClr, flex: 'none' }} />
                        ))}
                      </div>
                    )}

                    <div
                      style={{ display: 'flex', gap: isRound ? 0 : GAP, position: 'relative' }}
                      onMouseDown={e => { e.stopPropagation(); if (canDrag) startDrag(e, mesa.id) }}
                      onClick={e => {
                        if (editMode || !mesa.active) return
                        e.stopPropagation()
                        setSeatPersonas(entry?.personas ?? 2)
                        setTooltip(prev => prev?.id === mesa.id ? null : { id: mesa.id })
                      }}
                    >
                      {Array.from({ length: nRects }).map((_, i) => (
                        <div key={i} style={{
                          width: dims.w, height: dims.h,
                          borderRadius: isRound ? '50%' : 10,
                          background: `${color}22`,
                          border: `2.5px solid ${color}`,
                          borderTopWidth: mesa.tipo === 'booth' ? 5 : 2.5,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', gap: 2,
                          cursor: canDrag ? 'grab' : (mesa.active ? 'pointer' : 'default'),
                          opacity: mesa.active ? 1 : 0.75,
                          transition: editMode ? 'none' : 'box-shadow .15s',
                          boxShadow: tooltip?.id === mesa.id ? `0 0 0 3px ${color}44` : '0 1px 4px rgba(0,0,0,.10)',
                        }}>
                          {i === 0 && (
                            <>
                              <span style={{ fontSize: 10, fontWeight: 700, color, textAlign: 'center', lineHeight: 1.2, padding: '0 4px', pointerEvents: 'none', maxWidth: dims.w - 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {mesa.name}
                              </span>
                              <span style={{ fontSize: 9.5, color: `${color}cc`, pointerEvents: 'none' }}>{mesa.cap}p</span>
                            </>
                          )}
                        </div>
                      ))}

                      {editMode && editLayer === 'mesas' && (
                        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); toggle(mesa.id) }}
                          style={{ position: 'absolute', top: -10, right: -10, zIndex: 10, width: 20, height: 20, borderRadius: '50%', background: mesa.active ? '#ef4444' : '#22c55e', border: '2px solid #f8f7f4', cursor: 'pointer', fontSize: 13, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0, fontWeight: 700 }}
                          title={mesa.active ? 'Desactivar' : 'Activar'}>
                          {mesa.active ? '×' : '✓'}
                        </button>
                      )}
                    </div>

                    {chairs.bottom > 0 && (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', width: tW }}>
                        {Array.from({ length: chairs.bottom }).map((_, i) => (
                          <div key={i} style={{ width: cW(chairs.bottom), height: 10, borderRadius: 6, background: chairClr, flex: 'none' }} />
                        ))}
                      </div>
                    )}

                    {/* Botones de rotación — capa Mesas */}
                    {editMode && editLayer === 'mesas' && (
                      <div style={{ display: 'flex', gap: 3, marginTop: 1 }}>
                        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); rotateMesa(mesa.id, -15) }} style={rotBtnStyle}>↺</button>
                        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); rotateMesa(mesa.id, +15) }} style={rotBtnStyle}>↻</button>
                      </div>
                    )}
                  </div>

                  {/* Tooltip — fuera del div rotado, siempre horizontal */}
                  {tooltip?.id === mesa.id && (
                    <div
                      style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '12px 14px', boxShadow: 'var(--shadow-lg)', zIndex: 20, width: 200, pointerEvents: 'auto' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{mesa.name}</span>
                        <button onClick={() => setTooltip(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ink-3)', lineHeight: 1 }}><X size={14} /></button>
                      </div>
                      {entry && (
                        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                          <strong style={{ color: 'var(--ink)' }}>{entry.nombre}</strong>
                          <br />{entry.personas} pers. · <span style={{ color: VISUAL_COLOR[ocup], fontWeight: 600 }}>{OCUP_LABEL[ocup]}</span>
                        </div>
                      )}
                      {mesa.ocupadoManual && !entry && (
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>Walk-in · {mesa.personasManual} personas</div>
                      )}
                      {ocup === 'libre' ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <input type="number" min={1} max={30} value={seatPersonas}
                              onChange={e => setSeatPersonas(Number(e.target.value))}
                              onMouseDown={e => e.stopPropagation()}
                              style={{ width: 52, borderRadius: 6, border: '1px solid var(--line)', padding: '3px 7px', fontSize: 13, background: 'var(--surface)', color: 'var(--ink)' }} />
                            <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>personas</span>
                          </div>
                          <button className="btn btn-primary"
                            style={{ width: '100%', fontSize: 13, padding: '6px 0', justifyContent: 'center' }}
                            disabled={seatingSaving} onMouseDown={e => e.stopPropagation()}
                            onClick={e => { e.stopPropagation(); seatManual(mesa.id, seatPersonas) }}>
                            {seatingSaving ? <span className="spin" /> : 'Sentar cliente'}
                          </button>
                        </div>
                      ) : mesa.ocupadoManual ? (
                        <button className="btn"
                          style={{ width: '100%', fontSize: 13, padding: '6px 0', justifyContent: 'center', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 'var(--r-sm)' }}
                          disabled={seatingSaving} onMouseDown={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); freeManual(mesa.id) }}>
                          {seatingSaving ? <span className="spin" /> : 'Liberar mesa'}
                        </button>
                      ) : (
                        <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>Ocupada por reservación.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {mesas.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="muted" style={{ fontSize: 14 }}>Agrega mesas para verlas aquí.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: agregar mesa ───────────────────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Nueva mesa</h2>
              <button className="btn btn-icon btn-subtle btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Nombre</label>
                <input className="input" type="text" placeholder="Ej. Mesa 8, Terraza VIP…"
                  value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required autoFocus />
              </div>
              <div className="field">
                <label>Zona</label>
                <select className="select" style={{ width: '100%' }} value={form.zona}
                  onChange={e => { const z = e.target.value as TableZone; setForm(f => ({ ...f, zona: z, tipo: z === 'Barra' ? 'mesa' : f.tipo })) }}>
                  {ZONAS_LIST.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              {form.zona !== 'Barra' && (
                <div className="field">
                  <label>Estilo</label>
                  <select className="select" style={{ width: '100%' }} value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TableTipo }))}>
                    <option value="mesa">Mesa (normal)</option>
                    <option value="booth">Booth (pegada a pared)</option>
                  </select>
                </div>
              )}
              <div className="field">
                <label>Capacidad (personas)</label>
                <input className="input" type="number" min={1} max={50}
                  value={form.cap} onChange={e => setForm(f => ({ ...f, cap: Number(e.target.value) }))} />
              </div>
              <div className="row gap-10" style={{ marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <span className="spin" /> : 'Guardar mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: agregar zona ───────────────────────────────────────────── */}
      {showAddZone && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowAddZone(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Nueva zona</h2>
              <button className="btn btn-icon btn-subtle btn-sm" onClick={() => setShowAddZone(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Color de zona</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {ZONE_PRESETS.map(p => (
                    <button key={p.label} type="button"
                      onClick={() => setZoneForm(f => ({ ...f, label: p.label, color: p.color }))}
                      style={{ padding: '5px 12px', borderRadius: 'var(--r-pill)', border: zoneForm.color === p.color ? '2px solid var(--accent)' : '1px solid var(--line)', background: p.color, fontSize: 12.5, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Nombre personalizado</label>
                <input className="input" type="text" value={zoneForm.label}
                  onChange={e => setZoneForm(f => ({ ...f, label: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Ancho (%)</label>
                  <input className="input" type="number" min={5} max={95} value={zoneForm.w}
                    onChange={e => setZoneForm(f => ({ ...f, w: Number(e.target.value) }))} />
                </div>
                <div className="field">
                  <label>Alto (%)</label>
                  <input className="input" type="number" min={5} max={95} value={zoneForm.h}
                    onChange={e => setZoneForm(f => ({ ...f, h: Number(e.target.value) }))} />
                </div>
              </div>
              <p className="muted" style={{ fontSize: 12, margin: 0 }}>Después de agregar, arrástrala a su posición en el croquis.</p>
              <div className="row gap-10">
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddZone(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={addZone}>Agregar zona</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: agregar pared ──────────────────────────────────────────── */}
      {showAddWall && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowAddWall(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 360, boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Nueva pared</h2>
              <button className="btn btn-icon btn-subtle btn-sm" onClick={() => setShowAddWall(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Dirección</label>
                <div className="row gap-10" style={{ marginTop: 4 }}>
                  {(['v', 'h'] as const).map(d => (
                    <button key={d} type="button" onClick={() => setWallForm(f => ({ ...f, dir: d }))}
                      style={{ flex: 1, padding: '8px', borderRadius: 'var(--r)', fontSize: 13, border: wallForm.dir === d ? '2px solid var(--accent)' : '1px solid var(--line)', background: wallForm.dir === d ? 'var(--accent-soft)' : 'var(--surface)', cursor: 'pointer', fontWeight: 600 }}>
                      {d === 'v' ? '| Vertical' : '— Horizontal'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Longitud (%)</label>
                <input className="input" type="number" min={5} max={90} value={wallForm.len}
                  onChange={e => setWallForm(f => ({ ...f, len: Number(e.target.value) }))} />
              </div>
              <p className="muted" style={{ fontSize: 12, margin: 0 }}>Se colocará al inicio del canvas. Arrástrala a su posición.</p>
              <div className="row gap-10">
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddWall(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={addWall}>Agregar pared</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: agregar mueble ─────────────────────────────────────────── */}
      {showAddFurniture && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShowAddFurniture(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: 28, width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Nuevo mueble</h2>
              <button className="btn btn-icon btn-subtle btn-sm" onClick={() => setShowAddFurniture(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Tipo</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
                  {(Object.keys(FURNITURE_STYLE) as FurnitureItem['tipo'][]).map(t => {
                    const fs = FURNITURE_STYLE[t]
                    return (
                      <button key={t} type="button" onClick={() => setFurnitureForm(f => ({ ...f, tipo: t }))}
                        style={{ padding: '12px 8px', borderRadius: 'var(--r)', border: furnitureForm.tipo === t ? '2px solid var(--accent)' : '1px solid var(--line)', background: furnitureForm.tipo === t ? 'var(--accent-soft)' : fs.bg, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', textAlign: 'center' }}>
                        {fs.text}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="field">
                <label>Etiqueta (opcional)</label>
                <input className="input" type="text" placeholder="Ej. Sillón Norte, Barra principal…"
                  value={furnitureForm.label} onChange={e => setFurnitureForm(f => ({ ...f, label: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Ancho (%)</label>
                  <input className="input" type="number" min={3} max={80} value={furnitureForm.w}
                    onChange={e => setFurnitureForm(f => ({ ...f, w: Number(e.target.value) }))} />
                </div>
                <div className="field">
                  <label>Alto (%)</label>
                  <input className="input" type="number" min={2} max={50} value={furnitureForm.h}
                    onChange={e => setFurnitureForm(f => ({ ...f, h: Number(e.target.value) }))} />
                </div>
              </div>
              <p className="muted" style={{ fontSize: 12, margin: 0 }}>Se colocará en la esquina superior izquierda. Arrástralo a su posición.</p>
              <div className="row gap-10">
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddFurniture(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={addFurniture}>Agregar mueble</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  )
}
