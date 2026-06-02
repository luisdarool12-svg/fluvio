'use client'
import { Check, X, MoreHorizontal, Armchair, Undo2, Trash2 } from 'lucide-react'
import type { Reservation } from '@/lib/data'

interface QuickActionsProps {
  res: Reservation
  onAction: (id: string, action: string) => void
}

export function QuickActions({ res, onAction }: QuickActionsProps) {
  const acts: { k: string; icon: React.ReactNode; title: string; cls: string }[] = []

  if (res.status === 'pendiente')
    acts.push({ k: 'confirmar', icon: <Check size={15} />, title: 'Confirmar reserva', cls: 'btn-soft' })
  if (res.status === 'confirmada')
    acts.push({ k: 'sentar', icon: <Armchair size={15} />, title: 'Marcar como sentado', cls: 'btn-soft' })
  if (res.status === 'sentada' || res.status === 'no_show' || res.status === 'cancelada')
    acts.push({ k: 'revertir', icon: <Undo2 size={15} />, title: 'Volver a confirmada', cls: 'btn-soft' })
  if (res.status !== 'no_show' && res.status !== 'cancelada' && res.status !== 'sentada')
    acts.push({ k: 'no_show', icon: <X size={15} />, title: 'Marcar no-show', cls: 'btn-subtle' })
  acts.push({ k: 'eliminar', icon: <Trash2 size={15} />, title: 'Eliminar reserva', cls: 'btn-subtle' })
  acts.push({ k: 'edit', icon: <MoreHorizontal size={15} />, title: 'Ver detalles', cls: 'btn-subtle' })

  return (
    <div className="row-actions">
      {acts.map(a => (
        <button
          key={a.k}
          className={`btn btn-sm btn-icon tip ${a.cls}`}
          data-tip={a.title}
          aria-label={a.title}
          onClick={(e) => { e.stopPropagation(); onAction(res.id, a.k) }}
        >
          {a.icon}
        </button>
      ))}
    </div>
  )
}
