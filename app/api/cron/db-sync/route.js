/*
 * GET /api/cron/db-sync
 *
 * Nightly sync: compares calendar events (today + future) with DB records.
 * - Upserts any calendar events missing from or outdated in the DB
 * - Flags discrepancies (missing from calendar but in DB as scheduled)
 * - Sends alert email to Harry if issues are found
 *
 * Runs at 8am UTC (2am MT) via Vercel Cron.
 */

import { NextResponse } from 'next/server'
import { findEventsBetween } from '@/lib/google-calendar'
import { parseEventDescription } from '@/lib/booking'
import { upsertInspection } from '@/lib/db-inspections'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  // 1. Fetch all calendar events from today forward
  let calEvents
  try {
    calEvents = await findEventsBetween(`${todayStr}T00:00:00Z`, future.toISOString())
  } catch (err) {
    console.error('[db-sync] calendar fetch error:', err.message)
    return NextResponse.json({ error: 'Calendar fetch failed' }, { status: 500 })
  }

  // 2. Upsert each calendar event into DB
  let synced = 0
  let errors = 0

  for (const event of calEvents) {
    const startISO = event.start?.dateTime
    const endISO = event.end?.dateTime
    if (!startISO) continue

    const parsed = parseEventDescription(event.description)
    if (!parsed.customerName && !parsed.service) continue

    try {
      await upsertInspection({
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
        status: new Date(endISO || startISO) < now ? 'completed' : 'scheduled',
        paymentStatus: parsed.paymentStatus || null,
        invoiceAmountCents: parsed.invoiceAmountCents ? parseInt(parsed.invoiceAmountCents, 10) : null,
        paymentAmountCents: parsed.paymentAmountCents ? parseInt(parsed.paymentAmountCents, 10) : null,
        distanceMiles: parsed.distanceMiles ? parseFloat(parsed.distanceMiles) : null,
        tripChargeCents: parsed.tripChargeCents ? parseInt(parsed.tripChargeCents, 10) : null,
        geoLat: parsed.geoLat ? parseFloat(parsed.geoLat) : null,
        geoLng: parsed.geoLng ? parseFloat(parsed.geoLng) : null,
        token: parsed.token || null,
        feedbackRating: parsed.feedbackRating ? parseInt(parsed.feedbackRating, 10) : null,
        rawDescription: event.description || null,
      })
      synced++
    } catch (err) {
      errors++
      console.error(`[db-sync] upsert failed for ${event.id}:`, err.message)
    }
  }

  // 3. Check for DB records that are scheduled but missing from calendar
  //    (indicates a deletion Harry made directly in Google Calendar)
  const db = sql()
  const calEventIds = calEvents.map((e) => e.id).filter(Boolean)

  let orphaned = []
  try {
    // Find DB records with start_at >= today, status = scheduled, but not in calendar
    const dbRows = await db`
      SELECT id, google_event_id, customer_name, service, start_at, inspection_number
      FROM inspections
      WHERE status = 'scheduled'
        AND start_at >= ${todayStr}
        AND google_event_id IS NOT NULL
    `

    orphaned = dbRows.filter((row) => !calEventIds.includes(row.google_event_id))

    // Mark orphaned records as cancelled (they were deleted from calendar)
    for (const row of orphaned) {
      await db`
        UPDATE inspections
        SET status = 'cancelled', cancelled_at = now(), updated_at = now()
        WHERE id = ${row.id}
      `
    }
  } catch (err) {
    console.error('[db-sync] orphan check error:', err.message)
  }

  // 4. Send alert if there are orphaned records (unexpected calendar deletions)
  if (orphaned.length > 0) {
    const alertTo = process.env.DIGEST_EMAIL || 'harry@evergreeninspections.com'
    const items = orphaned.map((r) =>
      `<li>${r.customer_name || 'Unknown'} — ${r.service || 'Inspection'} (${r.inspection_number || 'no #'}), was scheduled for ${new Date(r.start_at).toLocaleDateString('en-US')}</li>`
    ).join('')

    sendEmail({
      to: alertTo,
      subject: `DB Sync: ${orphaned.length} calendar event(s) missing`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#1F2426;margin:0 0 12px;">Calendar Sync Alert</h2>
          <p style="font-size:14px;color:#3D3F40;margin:0 0 16px;">
            The nightly sync found ${orphaned.length} inspection(s) in the database that are no longer on the calendar.
            They've been marked as cancelled in the database.
          </p>
          <ul style="font-size:14px;color:#3D3F40;line-height:1.8;">${items}</ul>
          <p style="font-size:13px;color:#9DA0A2;margin-top:16px;">
            If these were intentional cancellations, no action needed.
          </p>
        </div>
      `,
    }).catch((err) => console.error('[db-sync] alert email failed:', err.message))
  }

  console.log(`[db-sync] synced ${synced}, errors ${errors}, orphaned ${orphaned.length}`)

  return NextResponse.json({
    synced,
    errors,
    orphaned: orphaned.length,
    calendarEvents: calEvents.length,
  })
}
