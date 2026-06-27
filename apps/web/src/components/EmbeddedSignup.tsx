'use client'
import { useState, useEffect, useRef } from 'react'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { apiFetch } from '@/lib/api'

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID ?? ''
const META_CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID ?? ''

type Status = 'idle' | 'loading' | 'connected' | 'error'

interface WhatsAppStatus {
  connected: boolean
  phone_number_id: string | null
  waba_id: string | null
}

declare global {
  interface Window {
    FB: {
      init: (opts: object) => void
      login: (cb: (resp: FBLoginResponse) => void, opts: object) => void
    }
    fbAsyncInit?: () => void
  }
}

interface FBLoginResponse {
  authResponse?: { code?: string }
  status: string
}

const FB_SDK_TIMEOUT_MS = 10000

function loadFbSdk(appId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.FB !== 'undefined') { resolve(); return }

    const timer = setTimeout(() => {
      reject(new Error('El SDK de Facebook no respondió. Revisa bloqueadores de anuncios o protección de rastreo.'))
    }, FB_SDK_TIMEOUT_MS)

    window.fbAsyncInit = () => {
      clearTimeout(timer)
      window.FB.init({ appId, version: 'v22.0', xfbml: false, cookie: false })
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.onerror = () => {
      clearTimeout(timer)
      reject(new Error('No se pudo descargar el SDK de Facebook (bloqueado por el navegador o sin red).'))
    }
    document.head.appendChild(script)
  })
}

export default function EmbeddedSignup() {
  const [status, setStatus] = useState<Status>('idle')
  const [waStatus, setWaStatus] = useState<WhatsAppStatus | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')
  const sessionInfoRef = useRef<{ waba_id: string; phone_number_id: string } | null>(null)

  // Cargar estado inicial
  useEffect(() => {
    let cancelled = false
    apiFetch('/whatsapp/setup/status')
      .then(res => res.ok ? res.json() : null)
      .then((data: WhatsAppStatus | null) => {
        if (!cancelled && data) {
          setWaStatus(data)
          setStatus(data.connected ? 'connected' : 'idle')
        }
      })
      .catch(() => { /* network error — keep idle */ })
    return () => { cancelled = true }
  }, [])

  // Listener para session info del flujo Embedded Signup
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== 'https://www.facebook.com' &&
          event.origin !== 'https://web.facebook.com') return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data?.type === 'WA_EMBEDDED_SIGNUP' && data?.event === 'FINISH') {
          sessionInfoRef.current = {
            waba_id: data.data?.waba_id ?? '',
            phone_number_id: data.data?.phone_number_id ?? '',
          }
        }
      } catch { /* ignore non-JSON messages */ }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const handleConnect = async () => {
    if (!META_APP_ID) {
      setErrorMsg('NEXT_PUBLIC_META_APP_ID no configurado')
      setStatus('error')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    setLoadingMsg('Cargando SDK de Meta…')
    sessionInfoRef.current = null

    try {
      await loadFbSdk(META_APP_ID)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'No se pudo cargar el SDK de Facebook')
      setStatus('error')
      return
    }

    setLoadingMsg('SDK cargado. Abriendo ventana de Meta… Si no aparece, el navegador la está bloqueando (revisa el ícono de popup en la barra de direcciones).')

    window.FB.login(async (response: FBLoginResponse) => {
      const code = response.authResponse?.code
      if (!code) {
        setErrorMsg('La ventana de Meta se cerró sin completar la autorización. Si no viste ningún popup, el navegador lo está bloqueando.')
        setStatus('error')
        return
      }

      const info = sessionInfoRef.current
      if (!info?.waba_id || !info?.phone_number_id) {
        setErrorMsg('No se recibió información del número. Intenta de nuevo.')
        setStatus('error')
        return
      }

      try {
        const res = await apiFetch('/whatsapp/setup/callback', {
          method: 'POST',
          body: JSON.stringify({ code, waba_id: info.waba_id, phone_number_id: info.phone_number_id }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.detail ?? 'Error al conectar')
        }
        const result = await res.json()
        setWaStatus({ connected: true, phone_number_id: result.phone_number_id, waba_id: result.waba_id })
        setStatus('connected')
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : 'Error desconocido')
        setStatus('error')
      }
    }, META_CONFIG_ID
      ? {
          // Flujo actual de Meta: requiere una Configuración de Facebook Login for Business
          config_id: META_CONFIG_ID,
          response_type: 'code',
          override_default_response_type: true,
          extras: { setup: {}, featureType: '', sessionInfoVersion: '3' },
        }
      : {
          // Fallback legacy por scopes (Meta puede rechazarlo en apps de negocio)
          scope: 'whatsapp_business_management,whatsapp_business_messaging',
          response_type: 'code',
          override_default_response_type: true,
          extras: { featureType: '', sessionInfoVersion: '3' },
        })
  }

  const handleDisconnect = async () => {
    setStatus('loading')
    try {
      await apiFetch('/whatsapp/setup/disconnect', { method: 'DELETE' })
      setWaStatus(null)
      setStatus('idle')
    } catch {
      setStatus('connected')
    }
  }

  if (status === 'connected' && waStatus) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 'var(--r)', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 99, background: '#25D366',
            display: 'grid', placeItems: 'center', flex: 'none',
          }}>
            <CheckCircle size={20} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: 15 }}>
              WhatsApp Business conectado
            </div>
            <div style={{ color: '#15803d', fontSize: 13, marginTop: 2 }}>
              Phone ID: {waStatus.phone_number_id}
            </div>
          </div>
          <button
            className="btn btn-sm btn-ghost"
            onClick={handleDisconnect}
            style={{ color: '#dc2626' }}
          >
            Desconectar
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
          El bot ya está activo para este número. Los mensajes entrantes se procesan automáticamente.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Conectar WhatsApp Business</h3>
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: 0, lineHeight: 1.6 }}>
          Vincula la cuenta de WhatsApp Business del restaurante con Fluvio.
          Necesitarás acceso al Facebook Business Manager del negocio.
        </p>
      </div>

      {status === 'error' && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 'var(--r)', padding: '12px 16px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <AlertCircle size={16} style={{ color: '#dc2626', flex: 'none', marginTop: 1 }} />
          <span style={{ fontSize: 13.5, color: '#991b1b' }}>{errorMsg}</span>
        </div>
      )}

      <div style={{
        background: 'var(--surface-2, #f8f9fa)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)', padding: 24,
        display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: '#25D366',
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            Conectar vía Meta Business
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 340 }}>
            Se abrirá una ventana de Meta para que autorices el acceso a la cuenta de WhatsApp Business.
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleConnect}
          disabled={status === 'loading'}
          style={{ gap: 8, minWidth: 220 }}
        >
          {status === 'loading'
            ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />Conectando…</>
            : <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flex: 'none' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Conectar WhatsApp Business
              </>
          }
        </button>
        {status === 'loading' && loadingMsg && (
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', maxWidth: 360, lineHeight: 1.5 }}>
            {loadingMsg}
          </div>
        )}
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--ink-3, #9ca3af)', lineHeight: 1.6 }}>
        Al conectar, Fluvio recibe permisos para enviar y recibir mensajes en nombre del número.
        Puedes desconectarlo en cualquier momento desde esta sección.
      </div>
    </div>
  )
}
