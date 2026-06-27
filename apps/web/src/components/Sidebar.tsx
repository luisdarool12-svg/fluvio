'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, ShieldAlert, Users, LayoutGrid, Settings, Zap, ChevronRight, MessageSquare, Megaphone, Receipt,
} from 'lucide-react'
import { Wordmark } from './Logo'
import { Avatar } from './Avatar'

const NAV = [
  { href: '/dashboard',                 icon: <LayoutDashboard size={17} />, label: 'Dashboard',      count: null },
  { href: '/dashboard/reservaciones',   icon: <Calendar size={17} />,        label: 'Reservaciones',  count: 10   },
  { href: '/dashboard/chatbot',         icon: <MessageSquare size={17} />,   label: 'Chatbot',        count: null },
  { href: '/dashboard/riesgo',          icon: <ShieldAlert size={17} />,     label: 'Riesgo no-show', count: null },
  { href: '/dashboard/clientes',        icon: <Users size={17} />,           label: 'Clientes',       count: null },
  { href: '/dashboard/mesas',           icon: <LayoutGrid size={17} />,      label: 'Mesas',          count: null },
  { href: '/dashboard/campanas',         icon: <Megaphone size={17} />,       label: 'Campañas',       count: null },
  { href: '/dashboard/facturacion',     icon: <Receipt size={17} />,         label: 'Facturación',    count: null },
  { href: '/dashboard/configuracion',   icon: <Settings size={17} />,        label: 'Configuración',  count: null },
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
          <Wordmark size={28} business="Dublé Bistró" variant="mono" />
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
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 9 }}>
              <span className="row gap-6" style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,.82)', whiteSpace: 'nowrap' }}>
                <Zap size={13} style={{ color: 'var(--violet-icon)' }} />
                Plan Starter
              </span>
              <span className="badge badge-conf" style={{ height: 20, padding: '0 8px' }}>
                <span className="dot" />Activo
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 99, height: 5, marginBottom: 7 }}>
              <div style={{ background: 'var(--violet)', width: '64%', height: '100%', borderRadius: 99 }} />
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11.5, color: 'var(--sb-text)', whiteSpace: 'nowrap' }}>320/500 reservas</span>
              <a href="/dashboard/configuracion" style={{ fontSize: 12, color: 'var(--violet-icon)', fontWeight: 600 }}>Mejorar</a>
            </div>
          </div>

          <div className="user-row">
            <Avatar name="Luis Duble" size={32} />
            <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,.82)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Luis Duble</span>
              <span style={{ fontSize: 12, color: 'var(--sb-text)' }}>luis@dublebistro.mx</span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--sb-label)', flex: 'none' }} />
          </div>
        </div>
      </aside>
    </>
  )
}
