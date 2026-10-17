import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Next.js Proxy (previously "middleware") — runs on every request BEFORE the page loads
// Route protection now happens at the server edge — much more secure than client-side PrivateRoute.

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') return supabaseResponse;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — keeps the JWT token alive
  // IMPORTANT: Do not add any logic between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()


  const { pathname } = request.nextUrl
  const role = user?.user_metadata?.role ?? 'counselor'

  // If user is NOT logged in and tries to access /dashboard or /patient routes → redirect to login
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/patient'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user IS logged in and tries to access /login, /register, or / → redirect to appropriate portal
  if (user && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    const url = request.nextUrl.clone()
    url.pathname = role === 'patient' ? '/patient' : '/dashboard'
    return NextResponse.redirect(url)
  }

  // Role isolation: Patients cannot access counselor /dashboard
  if (user && role === 'patient' && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/patient'
    return NextResponse.redirect(url)
  }

  // Role isolation: Counselors cannot access /patient portal
  if (user && role !== 'patient' && pathname.startsWith('/patient')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
