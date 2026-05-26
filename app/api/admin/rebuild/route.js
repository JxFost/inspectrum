/*
 * GET /api/admin/rebuild?dryRun=true
 *
 * Nuclear rebuild: wipes the booking calendar + DB, then recreates everything
 * from ACC emails in Shirley's Gmail. This gives us clean, complete data
 * with full structured descriptions.
 *
 * Steps:
 * 1. Delete all existing events from booking calendar
 * 2. Truncate inspections + customers tables
 * 3. Read ACC emails from Shirley's Gmail
 * 4. Deduplicate, parse, sort chronologically
 * 5. Create new events on booking calendar with full descriptions
 * 6. Insert into DB + customers table
 *
 * Auth: admin session cookie.
 * Pass ?dryRun=false to actually execute. Default is dry run.
 * Pass ?limit=500 to control email fetch limit.
 */

import { NextResponse } from 'next/server'
import { searchEmails } from '@/lib/gmail'
import { parseACCEmail } from '@/lib/acc-email-parser'
import { buildEventDescription, mapACCServiceType, getNextInspectionNumber } from '@/lib/booking'
import { findEventsBetween, insertEvent, deleteEvent } from '@/lib/google-calendar'
import { computeDistance } from '@/lib/mileage'
import { upsertInspection } from '@/lib/db-inspections'
import { upsertCustomer } from '@/lib/db-customers'
import { sql } from '@/lib/db'

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
  const limit = parseInt(searchParams.get('limit'), 10) || 500

  const results = {
    dryRun,
    step1_deleteCalendar: { deleted: 0, errors: 0 },
    step2_clearDB: false,
    step3_emailsFetched: 0,
    step4_uniqueAppointments: 0,
    step5_created: 0,
    step6_customers: 0,
    errors: [],
    appointments: [],
  }

  // ---- Step 1: Delete all existing events from booking calendar ----
  let existingEvents
  try {
    existingEvents = await findEventsBetween(
      '2026-01-01T00:00:00Z',
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    )
    results.step1_deleteCalendar.found = existingEvents.length

    if (!dryRun) {
      for (const event of existingEvents) {
        try {
          await deleteEvent(event.id)
          results.step1_deleteCalendar.deleted++
        } catch (err) {
          results.step1_deleteCalendar.errors++
          results.errors.push(`Delete event ${event.id}: ${err.message}`)
        }
      }
    }
  } catch (err) {
    return NextResponse.json({ error: `Calendar fetch failed: ${err.message}` }, { status: 500 })
  }

  // ---- Step 2: Clear DB tables ----
  if (!dryRun) {
    try {
      const db = sql()
      await db`DELETE FROM portal_sessions`
      await db`DELETE FROM inspections`
      await db`DELETE FROM customers`
      results.step2_clearDB = true
    } catch (err) {
      results.errors.push(`Clear DB: ${err.message}`)
    }
  }

  // ---- Step 3: Fetch ACC emails ----
  let emails
  try {
    emails = await searchEmails(
      'from:theinspectorsoffice.com subject:(Appointment OR Reschedule) after:2026/01/01',
      limit
    )
    results.step3_emailsFetched = emails.length
  } catch (err) {
    return NextResponse.json({ error: `Gmail error: ${err.message}` }, { status: 500 })
  }

  // ---- Step 4: Parse, deduplicate, sort chronologically ----
  const parsedEmails = []
  const seen = new Set()

  for (const email of emails) {
    const result = parseACCEmail({
      subject: email.subject,
      from: email.from,
      html: email.html,
      plainText: email.plain,
    })

    if (result.type !== 'appointment' && result.type !== 'reschedule') continue

    const { parsed, startISO } = result
    if (!startISO) continue

    // Skip obviously bad dates (before 2026)
    if (new Date(startISO) < new Date('2026-01-01')) continue

    const fullAddress = [parsed.address, parsed.city, parsed.state, parsed.zip]
      .filter(Boolean).join(', ')

    // Dedupe by address + date (more reliable than name for reschedules)
    const dedupeKey = `${fullAddress.toLowerCase()}|${startISO.slice(0, 10)}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    parsedEmails.push({ parsed, startISO, fullAddress, subject: email.subject })
  }

  // Sort chronologically (earliest first) for sequential inspection numbering
  parsedEmails.sort((a, b) => new Date(a.startISO) - new Date(b.startISO))
  results.step4_uniqueAppointments = parsedEmails.length

  // ---- Step 5: Create new events + DB records ----
  let inspectionCount = 0

  for (const { parsed, startISO, fullAddress, subject } of parsedEmails) {
    const service = mapACCServiceType(parsed.inspectionType)
    const endDate = new Date(new Date(startISO).getTime() + service.durationHours * 60 * 60 * 1000)
    const endISO = endDate.toISOString()

    // Assign inspection number
    inspectionCount++
    const inspectionNumber = `2026-${String(inspectionCount).padStart(3, '0')}`

    const customerName = parsed.clientName || 'ACC Client'

    // Build extra description lines from ACC data
    const extraLines = []
    if (parsed.squareFeet) extraLines.push(`Square Footage: ${parsed.squareFeet}`)
    if (parsed.yearBuilt) extraLines.push(`Year Built: ${parsed.yearBuilt}`)
    if (parsed.occupied) extraLines.push(`Occupied: ${parsed.occupied}`)
    if (parsed.radon === 'Yes') {
      extraLines.push('Radon Add-On: Yes')
      if (parsed.radonDropDate) extraLines.push(`Radon Drop: ${parsed.radonDropDate}`)
      if (parsed.radonPickupDate) extraLines.push(`Radon Pickup: ${parsed.radonPickupDate}`)
    }
    if (parsed.sewerScope === 'Yes') extraLines.push('Sewer Scope: Yes')
    if (parsed.accessProvidedBy) extraLines.push(`Access: ${parsed.accessProvidedBy}`)
    if (parsed.orderedBy) extraLines.push(`Ordered By: ${parsed.orderedBy}`)
    if (parsed.clientAttending) extraLines.push(`Client Attending: ${parsed.clientAttending}`)
    if (parsed.buyersAgent?.name) extraLines.push(`Buyer's Agent: ${parsed.buyersAgent.name}`)
    if (parsed.sellersAgent?.name) extraLines.push(`Seller's Agent: ${parsed.sellersAgent.name}`)
    if (parsed.totalFee) extraLines.push(`ACC Fee: $${parsed.totalFee}`)
    if (parsed.comments) extraLines.push(`Comments: ${parsed.comments}`)

    const record = {
      inspectionNumber,
      clientName: customerName,
      service: service.name,
      address: fullAddress,
      email: parsed.clientEmail || null,
      phone: parsed.clientPhone || null,
      startISO,
      endISO,
      subject,
    }

    if (!dryRun) {
      try {
        // Compute distance
        const dist = fullAddress ? await computeDistance(fullAddress) : null

        const { description, token } = buildEventDescription({
          inspectionNumber,
          distanceMiles: dist?.miles,
          tripChargeCents: dist?.tripChargeCents,
          geoLat: dist?.geoLat,
          geoLng: dist?.geoLng,
          serviceName: service.name,
          customerName,
          phone: parsed.clientPhone || '',
          email: parsed.clientEmail || '',
          address: fullAddress,
          sqft: parsed.squareFeet,
          source: 'acc',
          accSubject: subject,
          extra: extraLines.length > 0 ? extraLines.join('\n') : null,
        })

        const event = await insertEvent({
          summary: `${customerName} — ${service.name}`,
          description,
          location: fullAddress,
          startISO,
          endISO,
        })

        // Insert into DB
        await upsertInspection({
          googleEventId: event.id,
          inspectionNumber,
          customerName,
          email: parsed.clientEmail || null,
          phone: parsed.clientPhone || null,
          address: fullAddress,
          service: service.name,
          startAt: startISO,
          endAt: endISO,
          source: 'acc',
          distanceMiles: dist?.miles || null,
          tripChargeCents: dist?.tripChargeCents || null,
          geoLat: dist?.geoLat || null,
          geoLng: dist?.geoLng || null,
          token,
          rawDescription: description,
        })

        // Create customer record
        if (parsed.clientEmail) {
          await upsertCustomer({
            email: parsed.clientEmail,
            name: customerName,
            phone: parsed.clientPhone,
          })
          results.step6_customers++
        }

        record.eventId = event.id
        record.status = 'created'
        results.step5_created++
      } catch (err) {
        record.status = 'error'
        record.error = err.message
        results.errors.push(`Create ${customerName}: ${err.message}`)
      }
    } else {
      record.status = 'dry-run'
    }

    results.appointments.push(record)
  }

  return NextResponse.json(results)
}
