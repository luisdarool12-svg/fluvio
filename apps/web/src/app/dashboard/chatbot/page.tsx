'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, Settings2, BarChart2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { createClient } from '@/utils/supabase/client'
import { ConversationInbox } from './components/ConversationInbox'
import { SystemPromptBuilder } from './components/SystemPromptBuilder'
import { ChatbotStats } from './components/ChatbotStats'
import { BotStatusCard } from './components/BotStatusCard'

type Tab = 'conversations' | 'config' | 'stats'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'conversations', label: 'Conversaciones', icon: <MessageSquare size={15} /> },
  { id: 'config',        label: 'Configuración',  icon: <Settings2 size={15} /> },
  { id: 'stats',         label: 'Estadísticas',   icon: <BarChart2 size={15} /> },
]

export default function ChatbotPage() {
  const [tab, setTab] = useState<Tab>('conversations')
  const [businessId, setBusinessId] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) {
        const payload = JSON.parse(atob(data.session.access_token.split('.')[1]))
        setBusinessId(payload.business_id ?? null)
      }
    })
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <PageHeader
          title="Chatbot"
          subtitle="Gestiona conversaciones, configura el bot y revisa métricas"
        />
        <BotStatusCard />
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: 'var(--surface-2)', borderRadius: 'var(--r)',
        padding: 4, width: 'fit-content',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-subtle'}`}
            style={{ gap: 6, fontWeight: tab === t.id ? 600 : 500 }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'conversations' && <ConversationInbox businessId={businessId} />}
      {tab === 'config'        && <SystemPromptBuilder businessId={businessId} />}
      {tab === 'stats'         && <ChatbotStats businessId={businessId} />}
    </div>
  )
}
