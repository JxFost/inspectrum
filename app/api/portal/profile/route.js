/*
 * POST /api/portal/profile
 *
 * Updates the customer's name and phone number.
 * Auth: portal session cookie.
 */

import { NextResponse } from 'next/server'
import { validatePortalSession } from '@/lib/db-customers'
import { sql } from '@/lib/db'

export async function POST(request) {
  const sessionToken = request.cookies.get('portal_session')?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const customer = await validatePortalSession(sessionToken)
  if (!customer) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const name = (body.name || '').trim()
  const phone = (body.phone || '').trim()

  const db = sql()
  await db`
    UPDATE customers
    SET name = ${name || customer.name}, phone = ${phone || customer.phone}
    WHERE id = ${customer.id}
  `

  return NextResponse.json({ ok: true })
}
