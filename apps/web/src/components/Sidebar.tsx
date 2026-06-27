'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, ShieldAlert, Users, LayoutGrid, Settings, Zap, ChevronRight, MessageSquare, Megaphone, Receipt,
} from 'lucide-react'
import { Wordmark } from './Logo'
import { Avatar } from './Avatar'
import { createClient } from '@/utils/supabase/client'
import { apiFetch } from '@/lib/api'

const NAV = [
  { href: '/dashboard',               icon: <LayoutDashboard size={17} />, label: 'Dashboard',      count: null },
  { href: '/dashboard/reservaciones', icon: <Calendar size={17} />,        label: 'Reservaciones',  count: null },
  { href: '/dashboard/chatbot',       icon: <MessageSquare size={17} />,   label: 'Chatbot',        count: null },
  { href: '/dashboard/riesgo',        icon: <ShieldAlert size={17} />,     label: 'Riesgo no-show', count: null },
  { href: '/dashboard/clientes',      icon: <Users size={17} />,           label: 'Clientes',       count: null },
  { href: '/dashboard/mesas',         icon: <LayoutGrid size={17} />,      label: 'Mesas',          count: null },
  { href: '/dashboard/campanas',      icon: <Megaphone size={17} />,       label: 'Campañas',       count: null },
  { href: '/dashboard/facturacion',   icon: <Receipt size={17} />,         label: 'Facturación',    count: null },
  { href: '/dashboard/configuracion', icon: <Settings size={17} />,        label: 'Configuración',  count: null },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface SidebarData {
  businessName: string
  userName: string
  userEmail: string
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [data, setData] = useState<SidebarData>({ businessName: '', userName: '', userEmail: '' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const email = user.email ?? ''
      const name = (user.user_metadata?.full_name as string | undefined)
        ?? (user.user_metadata?.name as string | undefined)
        ?? email.split('@')[0]

      try {
        const res = await apiFetch('/business/me')
        if (res.ok && !cancelled) {
          const biz = await res.json()
          setData({ businessName: biz.nombre ?? '', userName: name, userEmail: email })
          return
        }
      } catch { /* API no disponible — seguimos sin nombre de negocio */ }

      if (!cancelled) setData({ businessName: '', userName: name, userEmail: email })
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <div className={`sb-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sb-brand">
          <Wordmark size={28} business={data.businessName || undefined} variant="mono" />
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
            <a href="/dashboard/configuracion" style={{ fontSize: 12, color: 'var(--violet-icon)', fontWeight: 600 }}>
              Ver configuración →
            </a>
          </div>

          <div className="user-row">
            <Avatar name={data.userName || data.userEmail || '?'} size={32} />
            <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,.82)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.userName || '—'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--sb-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data.userEmail}
              </span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--sb-label)', flex: 'none' }} />
          </div>
        </div>
      </aside>
    </>
  )
}
