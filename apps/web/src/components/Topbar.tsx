'use client'
import { Menu, Search, Bell, Plus } from 'lucide-react'

interface TopbarProps {
  onMenu: () => void
  onNewRes: () => void
}

export function Topbar({ onMenu, onNewRes }: TopbarProps) {
  return (
    <header className="topbar">
      <button className="btn btn-icon btn-subtle menu-btn" onClick={onMenu}>
        <Menu size={20} />
      </button>

      <div className="search-wrap" style={{ width: 320 }}>
        <Search size={17} className="s-ico" />
        <input
          className="input"
          type="text"
          placeholder="Buscar reserva o cliente…"
          style={{ height: 38, fontSize: 14, background: 'var(--surface-2)', border: '1px solid transparent' }}
        />
      </div>

      <div className="spacer" />

      <button className="btn btn-icon btn-soft" title="Notificaciones" style={{ position: 'relative' }}>
        <Bell size={18} />
        <span style={{
          position: 'absolute', top: 8, right: 8,
          width: 7, height: 7, borderRadius: 99,
          background: 'var(--coral)', border: '1.5px solid var(--bg)',
        }} />
      </button>

      <button className="btn btn-primary" onClick={onNewRes}>
        <Plus size={17} />
        <span className="hide-sm">Nueva reservación</span>
      </button>
    </header>
  )
}
