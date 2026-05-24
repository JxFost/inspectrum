/*
 * GET /api/admin/uninvoiced-count
 *
 * Returns the count of past inspections that haven't been invoiced yet.
 * Used by the admin nav badge.
 */

import { NextResponse } from 'next/server'
import { findEventsBetween } from '@/lib/google-calendar'
import { parseEventDescription } from '@/lib/booking'

export async function GET(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return NextResponse.json({ count: 0 })

  try {
    const now = new Date()
    const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const events = await findEventsBetween(past30.toISOString(), now.toISOString())

    let count = 0
    for (const event of events) {
      const endISO = event.end?.dateTime
      if (!endISO || new Date(endISO) > now) continue

      const parsed = parseEventDescription(event.description)
      // Skip blocked time / vacation entries
      if (!parsed.customerName || parsed.service === 'Blocked Time') continue
      // Count if no payment status set
      if (!parsed.paymentStatus) count++
    }

    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
