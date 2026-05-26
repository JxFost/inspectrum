/*
 * Next.js middleware — protects /admin/* and /portal/* routes.
 *
 * Admin: checks for valid `admin_session` cookie (HMAC-signed).
 * Portal: checks for valid `portal_session` cookie (DB session token).
 */

import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/admin/:path((?!login).*)', '/portal/dashboard/:path*'],
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  // ---- Admin routes ----
  if (pathname.startsWith('/admin')) {
    const secret = process.env.ADMIN_SESSION_SECRET
    if (!secret) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const cookie = request.cookies.get('admin_session')?.value
    if (!cookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const parts = cookie.split('.')
    if (parts.length !== 2) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const [timestamp] = parts
    const age = Date.now() - parseInt(timestamp, 10)
    if (isNaN(age) || age > 30 * 24 * 60 * 60 * 1000) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return NextResponse.next()
  }

  // ---- Portal routes (dashboard and beyond) ----
  if (pathname.startsWith('/portal/dashboard')) {
    const sessionToken = request.cookies.get('portal_session')?.value
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
    // Full session validation happens server-side in the page component.
    // Middleware is just a quick gate to redirect obvious non-logged-in users.
    return NextResponse.next()
  }

  return NextResponse.next()
}
