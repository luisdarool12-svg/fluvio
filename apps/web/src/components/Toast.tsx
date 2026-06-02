'use client'
import { Check, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
}

export function Toast({ message, type = 'success' }: ToastProps) {
  return (
    <div className="toast">
      <span className="toast-ico" style={{ background: type === 'error' ? 'var(--st-no)' : 'var(--st-conf)' }}>
        {type === 'error' ? <X size={13} strokeWidth={2.5} /> : <Check size={13} strokeWidth={2.5} />}
      </span>
      {message}
    </div>
  )
}
