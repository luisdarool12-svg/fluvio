'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, ShieldAlert, Users, LayoutGrid, Settings, Zap, ChevronRight,
} from 'lucide-react'
import { Wordmark } from './Logo'
import { Avatar } from './Avatar'

const NAV = [
  { href: '/dashboard',                 icon: <LayoutDashboard size={18} />, label: 'Dashboard',      count: null },
  { href: '/dashboard/reservaciones',   icon: <Calendar size={18} />,        label: 'Reservaciones',  count: 10   },
  { href: '/dashboard/riesgo',          icon: <ShieldAlert size={18} />,     label: 'Riesgo no-show', count: null },
  { href: '/dashboard/clientes',        icon: <Users size={18} />,           label: 'Clientes',       count: null },
  { href: '/dashboard/mesas',           icon: <LayoutGrid size={18} />,      label: 'Mesas',          count: null },
  { href: '/dashboard/configuracion',   icon: <Settings size={18} />,        label: 'Configuración',  count: null },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <div className={`sb-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sb-brand">
          <Wordmark size={28} business="Duble Bistró" />
        </div>

        <nav className="sb-nav">
          <div className="sb-section-label">Operación</div>
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`} onClick={onClose}>
                {item.icon}
                {item.label}
                {item.count != null && <span className="nav-count">{item.count}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="sb-foot">
          <div className="plan-card">
            <div className="row gap-8" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                <Zap size={13} style={{ display: 'inline', marginRight: 4, color: 'var(--accent)' }} />
                Plan Starter
              </span>
              <span className="badge badge-conf" style={{ marginLeft: 'auto', fontSize: 11 }}>Activo</span>
            </div>
            <div style={{ background: 'var(--surface-3)', borderRadius: 99, height: 5, marginBottom: 6 }}>
              <div style={{ background: 'var(--accent)', width: '64%', height: '100%', borderRadius: 99 }} />
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="faint" style={{ fontSize: 12 }}>320/500 reservas</span>
              <a href="/dashboard/configuracion" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Mejorar</a>
            </div>
          </div>

          <div className="user-row">
            <Avatar name="Luis Duble" size={32} />
            <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>Luis Duble</span>
              <span className="faint" style={{ fontSize: 12 }}>luis@dublebistro.mx</span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--ink-4)', flex: 'none' }} />
          </div>
        </div>
      </aside>
    </>
  )
}
