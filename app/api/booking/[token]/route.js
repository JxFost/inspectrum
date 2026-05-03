/*
 * GET /api/booking/[token]
 *
 * Returns appointment details for the manage page. The token is the
 * unguessable secret — no login required.
 *
 * Returns 404 if not found, 410 if the appointment is in the past.
 */

import { NextResponse } from 'next/server'
import { findEventByToken } from '@/lib/google-calendar'
import { TIMEZONE } from '@/lib/working-hours'

function parseCustomerField(description, field) {
  if (!description) return ''
  const match = description.match(new RegExp(`${field}:\\s*(.+)`))
  return match ? match[1].trim() : ''
}

export async function GET(_request, { params }) {
  const { token } = await params

  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 400 })
  }

  let event
  try {
    event = await findEventByToken(token)
  } catch (err) {
    console.error('Error looking up booking:', err)
    return NextResponse.json(
      { error: 'Could not look up this booking. Please try again or call (303) 697-0990.' },
      { status: 500 },
    )
  }

  if (!event) {
    return NextResponse.json({ error: 'Booking not found. It may have been cancelled.' }, { status: 404 })
  }

  const startISO = event.start?.dateTime
  const endISO = event.end?.dateTime

  if (!startISO) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }

  // Check if the appointment is in the past.
  if (new Date(startISO) < new Date()) {
    return NextResponse.json({ error: 'This appointment has already passed.' }, { status: 410 })
  }

  const description = event.description || ''

  return NextResponse.json({
    service: parseCustomerField(description, 'Service'),
    name: parseCustomerField(description, 'Customer'),
    address: event.location || parseCustomerField(description, 'Address'),
    startISO,
    endISO,
    status: event.status,
  })
}
