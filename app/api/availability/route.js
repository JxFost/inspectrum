/*
 * GET /api/availability?date=YYYY-MM-DD&service=<id>
 *
 * Returns available time slots for a given date and service by checking
 * working hours config against real Google Calendar busy times.
 */

import { NextResponse } from 'next/server'
import { SERVICES } from '@/lib/services'
import { getBusyRanges } from '@/lib/google-calendar'
import { computeSlots } from '@/lib/slots'
import { TIMEZONE, MAX_DAYS_AHEAD } from '@/lib/working-hours'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get('date')
  const serviceId = searchParams.get('service')

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json(
      { error: 'Missing or invalid "date" param (YYYY-MM-DD).' },
      { status: 400 },
    )
  }

  const service = SERVICES.find((s) => s.id === serviceId)
  if (!service) {
    return NextResponse.json(
      { error: 'Unknown service ID.' },
      { status: 400 },
    )
  }

  // Query a full-day window in UTC for the freebusy call.
  // We pad generously to handle timezone offsets.
  const dayStart = `${dateStr}T00:00:00Z`
  const nextDay = new Date(new Date(dayStart).getTime() + 48 * 60 * 60 * 1000)
  const dayEnd = nextDay.toISOString()

  try {
    const busyRanges = await getBusyRanges(dayStart, dayEnd)
    const slots = computeSlots(dateStr, service.durationHours, busyRanges)
    return NextResponse.json({ slots })
  } catch (err) {
    console.error('Availability error:', err)
    return NextResponse.json(
      { error: 'Could not fetch availability. Please try again or call (303) 697-0990.' },
      { status: 500 },
    )
  }
}
