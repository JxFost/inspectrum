/*
 * POST /api/booking/cancel
 *
 * Cancels a booking by token. Finds the matching calendar event and deletes it.
 * Idempotent — if the event is already gone, returns success with a flag.
 */

import { NextResponse } from 'next/server'
import { findEventByToken, deleteEvent } from '@/lib/google-calendar'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''

  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 400 })
  }

  let event
  try {
    event = await findEventByToken(token)
  } catch (err) {
    console.error('Cancel lookup error:', err)
    return NextResponse.json(
      { error: 'Could not process cancellation. Please try again or call (303) 697-0990.' },
      { status: 500 },
    )
  }

  // Already cancelled or not found — that's fine, tell the customer.
  if (!event) {
    return NextResponse.json({ cancelled: true, alreadyCancelled: true })
  }

  try {
    await deleteEvent(event.id)
  } catch (err) {
    console.error('Cancel delete error:', err)
    return NextResponse.json(
      { error: 'Could not cancel the booking. Please call (303) 697-0990.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ cancelled: true, alreadyCancelled: false })
}
