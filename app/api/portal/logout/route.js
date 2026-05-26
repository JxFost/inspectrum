/*
 * GET /api/portal/logout
 *
 * Clears the portal session cookie and redirects to the login page.
 */

import { NextResponse } from 'next/server'
import { deletePortalSession } from '@/lib/db-customers'

export async function GET(request) {
  const sessionToken = request.cookies.get('portal_session')?.value

  if (sessionToken) {
    await deletePortalSession(sessionToken).catch(() => {})
  }

  const response = NextResponse.redirect(new URL('/portal', request.url))
  response.cookies.set('portal_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
