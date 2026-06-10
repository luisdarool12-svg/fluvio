import { createClient } from '@/utils/supabase/client'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/**
 * fetch autenticado contra el API de FastAPI (mismo patrón que usan los
 * componentes de chatbot/campañas, centralizado para no repetirlo).
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
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
