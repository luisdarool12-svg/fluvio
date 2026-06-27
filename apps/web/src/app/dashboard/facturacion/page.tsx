'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Plus, Settings2, Download, X, CheckCircle2,
  AlertCircle, Clock, Ban, Loader2, RefreshCw,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { createClient } from '@/utils/supabase/client'
import { NuevaCFDIModal } from './components/NuevaCFDIModal'
import { ConfigFiscalModal } from './components/ConfigFiscalModal'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function apiFetch(path: string, init?: RequestInit) {
  const { data } = await createClient().auth.getSession()
  const token = data.session?.access_token ?? ''
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CFDI {
  id: string
  receptor_rfc: string
  receptor_nombre: string
  receptor_email?: string
  concepto: string
  subtotal: number
  iva: number
  total: number
  forma_pago: string
  serie: string
  folio: string
  facturama_id?: string
  uuid_fiscal?: string
  fecha_timbrado?: string
  estado: 'borrador' | 'timbrado' | 'cancelado' | 'error'
  error_msg?: string
  created_at: string
}

// ─── Estado badge ─────────────────────────────────────────────────────────────

const ESTADO_STYLES: Record<string, { icon: React.ReactNode; label: string; bg: string; color: string }> = {
  timbrado:  { icon: <CheckCircle2 size={13} />, label: 'Timbrado',  bg: '#dcfce7', color: '#166534' },
  cancelado: { icon: <Ban size={13} />,          label: 'Cancelado', bg: '#fee2e2', color: '#991b1b' },
  error:     { icon: <AlertCircle size={13} />,  label: 'Error',     bg: '#fef3c7', color: '#92400e' },
  borrador:  { icon: <Clock size={13} />,        label: 'Borrador',  bg: 'var(--surface-3)', color: 'var(--ink-3)' },
}

function EstadoBadge({ estado }: { estado: string }) {
  const s = ESTADO_STYLES[estado] ?? ESTADO_STYLES.borrador
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 12.5, fontWeight: 600 }}>
      {s.icon}{s.label}
    </span>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n: number) {
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FacturacionPage() {
  const [cfdis, setCfdis] = useState<CFDI[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [showNueva, setShowNueva] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [selected, setSelected] = useState<CFDI | null>(null)
  const [downloading, setDownloading] = useState<'pdf' | 'xml' | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [configured, setConfigured] = useState(true)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const loadCfdis = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await apiFetch('/billing/cfdis')
      if (res.ok) {
        const data: CFDI[] = await res.json()
        setCfdis(data)
      }
    } finally {
      setLoadingList(false)
    }
  }, [])

  const checkConfig = useCallback(async () => {
    try {
      const res = await apiFetch('/billing/config')
      if (res.ok) {
        const data = await res.json()
        setConfigured(Boolean(data.rfc && data.tiene_credenciales))
      }
    } catch {
      setConfigured(false)
    }
  }, [])

  useEffect(() => {
    loadCfdis()
    checkConfig()
  }, [loadCfdis, checkConfig])

  async function downloadFile(cfdi: CFDI, type: 'pdf' | 'xml') {
    setDownloading(type)
    try {
      const res = await apiFetch(`/billing/cfdis/${cfdi.id}/${type}`)
      if (!res.ok) throw new Error('Error descargando archivo')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factura-${cfdi.serie}${cfdi.folio}.${type}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast('No se pudo descargar el archivo', 'error')
    } finally {
      setDownloading(null)
    }
  }

  async function cancelCFDI(cfdi: CFDI) {
    if (!confirm(`¿Cancelar el CFDI ${cfdi.serie}${cfdi.folio}? Esta acción no se puede deshacer.`)) return
    setCanceling(true)
    try {
      const res = await apiFetch(`/billing/cfdis/${cfdi.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ motivo: '02' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail ?? 'Error cancelando')
      }
      showToast('CFDI cancelado')
      setSelected(null)
      await loadCfdis()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error cancelando CFDI', 'error')
    } finally {
      setCanceling(false)
    }
  }

  // Stats
  const timbrados = cfdis.filter(c => c.estado === 'timbrado')
  const totalFacturado = timbrados.reduce((s, c) => s + c.total, 0)
  const cancelados = cfdis.filter(c => c.estado === 'cancelado').length

  return (
    <div>
      <PageHeader
        title="Facturación"
        subtitle={`${timbrados.length} CFDIs timbrados · ${fmtMoney(totalFacturado)} facturado`}
        actions={
          <div className="row gap-10">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowConfig(true)}>
              <Settings2 size={15} />Configuración fiscal
            </button>
            <button className="btn btn-primary" onClick={() => setShowNueva(true)}>
              <Plus size={17} />Nueva factura
            </button>
          </div>
        }
      />

      {/* Banner de configuración pendiente */}
      {!configured && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#fefce8', border: '1px solid #fde047',
          borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 18,
        }}>
          <AlertCircle size={18} style={{ color: '#ca8a04', flex: 'none' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#713f12' }}>Configura tus datos fiscales</div>
            <div style={{ fontSize: 13, color: '#854d0e' }}>Para poder timbrar facturas necesitas tu RFC y credenciales de Facturama.</div>
          </div>
          <button className="btn btn-sm" style={{ background: '#ca8a04', color: '#fff', flex: 'none' }} onClick={() => setShowConfig(true)}>
            Configurar ahora
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="row gap-14" style={{ marginBottom: 20 }}>
        {[
          { label: 'Timbrados', value: timbrados.length, color: '#166534' },
          { label: 'Total facturado', value: fmtMoney(totalFacturado), color: 'var(--ink-1)' },
          { label: 'Cancelados', value: cancelados, color: '#991b1b' },
        ].map(s => (
          <div key={s.label} className="card card-pad" style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: s.color }}>{s.value}</div>
            <div className="faint" style={{ fontSize: 13, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div className="row gap-16" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>CFDIs emitidos</span>
              <button className="btn btn-icon btn-subtle btn-sm" onClick={loadCfdis} disabled={loadingList}>
                <RefreshCw size={14} className={loadingList ? 'spin' : ''} />
              </button>
            </div>

            {loadingList ? (
              <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Loader2 size={20} className="spin" />
                <span className="faint">Cargando facturas…</span>
              </div>
            ) : cfdis.length === 0 ? (
              <EmptyState
                title="Sin facturas todavía"
                body="Crea tu primera factura con el botón «Nueva factura»."
              />
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Receptor</th>
                    <th className="hide-sm">Concepto</th>
                    <th>Total</th>
                    <th className="hide-sm">Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cfdis.map(c => (
                    <tr
                      key={c.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelected(c)}
                    >
                      <td>
                        <span className="mono-num" style={{ fontWeight: 700, fontSize: 13 }}>
                          {c.serie}{c.folio}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.receptor_nombre}</div>
                        <div className="faint" style={{ fontSize: 12 }}>{c.receptor_rfc}</div>
                      </td>
                      <td className="hide-sm">
                        <span className="muted" style={{ fontSize: 13 }}>{c.concepto}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{fmtMoney(c.total)}</span>
                      </td>
                      <td className="hide-sm">
                        <span className="muted" style={{ fontSize: 13 }}>{fmtDate(c.created_at)}</span>
                      </td>
                      <td><EstadoBadge estado={c.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        {selected && (
          <div style={{
            width: 340, flex: 'none',
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Folio {selected.serie}{selected.folio}</div>
                <EstadoBadge estado={selected.estado} />
              </div>
              <button className="btn btn-icon btn-subtle btn-sm" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <div className="col" style={{ gap: 0 }}>
              {[
                { label: 'RFC receptor', value: selected.receptor_rfc },
                { label: 'Nombre', value: selected.receptor_nombre },
                { label: 'Email', value: selected.receptor_email ?? '—' },
                { label: 'Concepto', value: selected.concepto },
                { label: 'Subtotal', value: fmtMoney(selected.subtotal) },
                { label: 'IVA', value: fmtMoney(selected.iva) },
                { label: 'Total', value: fmtMoney(selected.total) },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 18px', borderBottom: '1px solid var(--line)', gap: 10 }}>
                  <span className="faint" style={{ fontSize: 13 }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', maxWidth: 180, wordBreak: 'break-all' }}>{row.value}</span>
                </div>
              ))}

              {selected.uuid_fiscal && (
                <div style={{ padding: '9px 18px', borderBottom: '1px solid var(--line)' }}>
                  <div className="faint" style={{ fontSize: 12, marginBottom: 3 }}>UUID fiscal</div>
                  <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono, monospace)', color: 'var(--ink-2)', wordBreak: 'break-all' }}>
                    {selected.uuid_fiscal}
                  </span>
                </div>
              )}

              {selected.fecha_timbrado && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 18px', borderBottom: '1px solid var(--line)' }}>
                  <span className="faint" style={{ fontSize: 13 }}>Timbrado</span>
                  <span style={{ fontSize: 13 }}>{fmtDate(selected.fecha_timbrado)}</span>
                </div>
              )}

              {selected.error_msg && (
                <div style={{ margin: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--r)', padding: '10px 13px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>Error de timbrado</div>
                  <div style={{ fontSize: 12.5, color: '#7f1d1d' }}>{selected.error_msg}</div>
                </div>
              )}
            </div>

            {selected.estado === 'timbrado' && (
              <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="row gap-8">
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => downloadFile(selected, 'pdf')}
                    disabled={!!downloading}
                  >
                    {downloading === 'pdf' ? <Loader2 size={13} className="spin" /> : <Download size={13} />}
                    PDF
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => downloadFile(selected, 'xml')}
                    disabled={!!downloading}
                  >
                    {downloading === 'xml' ? <Loader2 size={13} className="spin" /> : <FileText size={13} />}
                    XML
                  </button>
                </div>
                <button
                  className="btn btn-sm"
                  style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
                  onClick={() => cancelCFDI(selected)}
                  disabled={canceling}
                >
                  {canceling ? <Loader2 size={13} className="spin" /> : <Ban size={13} />}
                  Cancelar CFDI
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showNueva && (
        <NuevaCFDIModal
          onClose={() => setShowNueva(false)}
          onSuccess={() => {
            setShowNueva(false)
            showToast('CFDI timbrado correctamente')
            loadCfdis()
          }}
        />
      )}

      {showConfig && (
        <ConfigFiscalModal
          onClose={() => setShowConfig(false)}
          onSaved={() => {
            setShowConfig(false)
            showToast('Configuración fiscal guardada')
            checkConfig()
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#991b1b' : 'var(--ink-1)',
          color: '#fff', borderRadius: 99, padding: '10px 20px',
          fontSize: 14, fontWeight: 500, zIndex: 60,
          boxShadow: '0 4px 24px rgba(0,0,0,.25)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
