import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

// Rutas que requieren sesión. Todo lo demás (landing, /login, assets) es público.
const PROTECTED_PREFIXES = ['/dashboard']

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request)

  // IMPORTANTE: no correr código entre createClient() y getClaims().
  // getClaims() refresca el token si expiró; quitarlo provoca logouts aleatorios
  // en rutas con SSR (patrón oficial de @supabase/ssr para Next.js App Router).
  let user = null
  try {
    const { data } = await supabase.auth.getClaims()
    user = data?.claims ?? null
  } catch {
    // Si getClaims() lanza (ej. Supabase no responde), tratamos como sin sesión.
    // Las rutas protegidas redirigen a /login; las públicas pasan sin problema.
  }

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    // Conservar las cookies de sesión refrescadas también en el redirect
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie)
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
