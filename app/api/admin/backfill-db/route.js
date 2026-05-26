/*
 * GET /api/admin/backfill-db?dryRun=true
 *
 * One-time backfill: reads all events from the booking calendar,
 * parses their descriptions, and upserts into the inspections DB table.
 * Uses google_event_id to avoid duplicates.
 *
 * Auth: admin session cookie.
 * Default window: Jan 1 current year to 90 days from now.
 * Pass ?dryRun=false to actually write to the DB.
 */

import { NextResponse } from 'next/server'
import { findEventsBetween } from '@/lib/google-calendar'
import { parseEventDescription } from '@/lib/booking'
import { upsertInspection } from '@/lib/db-inspections'

function verifyAdminSession(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

export async function GET(request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') !== 'false'

  const year = new Date().getFullYear()
  const timeMin = `${year}-01-01T00:00:00Z`
  const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  const timeMax = future.toISOString()

  let events
  try {
    events = await findEventsBetween(timeMin, timeMax)
  } catch (err) {
    console.error('[backfill-db] fetch error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  const results = { total: events.length, upserted: 0, skipped: 0, errors: 0, items: [] }

  for (const event of events) {
    const startISO = event.start?.dateTime
    const endISO = event.end?.dateTime

    if (!startISO) {
      results.skipped++
      continue
    }

    const parsed = parseEventDescription(event.description)

    // Skip events with no customer info (likely vacation blocks)
    if (!parsed.customerName && !parsed.service) {
      results.skipped++
      continue
    }

    const record = {
      googleEventId: event.id,
      inspectionNumber: parsed.inspectionNumber || null,
      customerName: parsed.customerName || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      service: parsed.service || null,
      startAt: startISO,
      endAt: endISO,
      source: parsed.source || 'unknown',
      status: new Date(endISO || startISO) < new Date() ? 'completed' : 'scheduled',
      paymentStatus: parsed.paymentStatus || null,
      invoiceAmountCents: parsed.invoiceAmountCents ? parseInt(parsed.invoiceAmountCents, 10) : null,
      paymentAmountCents: parsed.paymentAmountCents ? parseInt(parsed.paymentAmountCents, 10) : null,
      squareInvoiceId: null, // not currently parsed
      distanceMiles: parsed.distanceMiles ? parseFloat(parsed.distanceMiles) : null,
      tripChargeCents: parsed.tripChargeCents ? parseInt(parsed.tripChargeCents, 10) : null,
      geoLat: parsed.geoLat ? parseFloat(parsed.geoLat) : null,
      geoLng: parsed.geoLng ? parseFloat(parsed.geoLng) : null,
      token: parsed.token || null,
      feedbackRating: parsed.feedbackRating ? parseInt(parsed.feedbackRating, 10) : null,
      rawDescription: event.description || null,
    }

    if (!dryRun) {
      try {
        await upsertInspection(record)
        results.upserted++
        results.items.push({ eventId: event.id, name: parsed.customerName, status: 'upserted' })
      } catch (err) {
        results.errors++
        results.items.push({ eventId: event.id, name: parsed.customerName, status: 'error', error: err.message })
      }
    } else {
      results.upserted++
      results.items.push({ eventId: event.id, name: parsed.customerName, service: parsed.service, status: 'dry-run' })
    }
  }

  return NextResponse.json({ dryRun, ...results })
}
