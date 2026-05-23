/*
 * POST /api/admin/login
 *
 * Validates ADMIN_PASSWORD, sets a signed httpOnly session cookie.
 * Uses timingSafeEqual for constant-time password comparison.
 */

import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

function signSession(timestamp, secret) {
  return createHmac('sha256', secret).update(String(timestamp)).digest('hex')
}

export async function POST(request) {
  const adminPassword = process.env.ADMIN_PASSWORD
  const sessionSecret = process.env.ADMIN_SESSION_SECRET

  if (!adminPassword || !sessionSecret) {
    return NextResponse.json({ error: 'Admin not configured.' }, { status: 500 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''

  // Constant-time comparison
  const a = Buffer.from(password)
  const b = Buffer.from(adminPassword)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 })
  }

  // Create signed session cookie
  const timestamp = Date.now()
  const signature = signSession(timestamp, sessionSecret)
  const cookieValue = `${timestamp}.${signature}`

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_session', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })

  return response
}
