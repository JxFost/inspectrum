/*
 * GET /api/portal/verify?token=...
 *
 * Validates a magic link token. If valid, creates a 30-day session
 * and redirects to the portal dashboard.
 */

import { NextResponse } from 'next/server'
import { validateMagicLink, createPortalSession } from '@/lib/db-customers'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token') || ''

  if (!token) {
    return NextResponse.redirect(new URL('/portal?error=invalid', request.url))
  }

  const customer = await validateMagicLink(token)

  if (!customer) {
    return NextResponse.redirect(new URL('/portal?error=expired', request.url))
  }

  // Create a long-lived session
  const sessionToken = await createPortalSession(customer.id)

  // Set session cookie and redirect to dashboard
  const response = NextResponse.redirect(new URL('/portal/dashboard', request.url))
  response.cookies.set('portal_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })

  return response
}
