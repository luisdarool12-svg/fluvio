import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

// Rutas que requieren sesión. Todo lo demás (landing, /login, assets) es público.
const PROTECTED_PREFIXES = ['/dashboard']

export async function middleware(request: NextRequest) {
  try {
    const { supabase, supabaseResponse } = createClient(request)

    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user ?? null
    } catch {
      // Si Supabase no responde, tratamos como sin sesión.
    }

    const { pathname } = request.nextUrl
    const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))

    if (!user && isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie)
      })
      return redirectResponse
    }

    return supabaseResponse
  } catch {
    // Fallback: dejar pasar la request sin auth si el middleware falla
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
