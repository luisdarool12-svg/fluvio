'use client'
import { Bot, UserRound } from 'lucide-react'

interface ModeToggleProps {
  mode: 'AI' | 'HUMAN'
  loading?: boolean
  onChange: (mode: 'AI' | 'HUMAN') => void
}

export function ModeToggle({ mode, loading, onChange }: ModeToggleProps) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--surface-2)',
      borderRadius: 'var(--r-pill)',
      padding: 3,
      gap: 2,
      border: '1px solid var(--line)',
    }}>
      <button
        onClick={() => onChange('AI')}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px',
          borderRadius: 'var(--r-pill)',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-ui)',
          fontSize: 13.5,
          fontWeight: 600,
          transition: 'all 0.15s var(--ease)',
          background: mode === 'AI' ? 'var(--accent)' : 'transparent',
          color: mode === 'AI' ? 'var(--accent-contrast)' : 'var(--ink-2)',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Bot size={15} />
        Modo IA
      </button>

      <button
        onClick={() => onChange('HUMAN')}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px',
          borderRadius: 'var(--r-pill)',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-ui)',
          fontSize: 13.5,
          fontWeight: 600,
          transition: 'all 0.15s var(--ease)',
          background: mode === 'HUMAN' ? 'var(--accent)' : 'transparent',
          color: mode === 'HUMAN' ? 'var(--accent-contrast)' : 'var(--ink-2)',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <UserRound size={15} />
        Modo Humano
      </button>
    </div>
  )
}
