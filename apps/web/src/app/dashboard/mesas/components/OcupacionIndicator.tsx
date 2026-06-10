'use client'
import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

interface Ocupacion {
  porcentaje: number
  mesas_ocupadas: number
  mesas_totales: number
  capacidad_ocupada: number
  capacidad_total: number
}

const REFRESH_MS = 60_000

function barColor(pct: number): string {
  if (pct >= 90) return '#ef4444'
  if (pct >= 60) return '#f59e0b'
  return '#22c55e'
}

/**
 * % de ocupación del restaurante en este momento, vía el motor de
 * disponibilidad (GET /tables/availability). `refreshKey` fuerza un
 * refetch cuando cambian las reservas (realtime de la página).
 */
export function OcupacionIndicator({ refreshKey }: { refreshKey: number }) {
  const [ocupacion, setOcupacion] = useState<Ocupacion | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const now = new Date()
        // Fecha y hora en el reloj local (no UTC) para consultar el momento actual real
        const fecha = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const hora = now.toTimeString().slice(0, 5)
        const r = await apiFetch(`/tables/availability?fecha=${fecha}&hora=${hora}&personas=2`)
        if (!r.ok) return
        const data = await r.json()
        if (!cancelled && data.ocupacion) setOcupacion(data.ocupacion)
      } catch {
        // El indicador es informativo; si el API no responde simplemente no se muestra.
      }
    }

    load()
    const interval = setInterval(load, REFRESH_MS)
    return () => { cancelled = true; clearInterval(interval) }
  }, [refreshKey])

  if (!ocupacion || ocupacion.mesas_totales === 0) return null

  const color = barColor(ocupacion.porcentaje)
  return (
    <div className="row gap-10" style={{ alignItems: 'center', minWidth: 220 }}>
      <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}
        role="progressbar" aria-valuenow={ocupacion.porcentaje} aria-valuemin={0} aria-valuemax={100}
        aria-label="Ocupación actual del restaurante">
        <div style={{
          width: `${Math.min(100, ocupacion.porcentaje)}%`, height: '100%',
          background: color, borderRadius: 99, transition: 'width .4s ease',
        }} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 700, color, whiteSpace: 'nowrap' }}>
        {ocupacion.porcentaje}% ocupado
      </span>
      <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
        {ocupacion.mesas_ocupadas}/{ocupacion.mesas_totales} mesas
      </span>
    </div>
  )
}
