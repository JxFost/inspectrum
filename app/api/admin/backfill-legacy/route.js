/*
 * GET /api/admin/backfill-legacy?dryRun=true
 *
 * One-time backfill: reads Harry's personal calendar for legacy inspection events
 * (titles starting with 'Insp -', 'Set Radon', 'P/U radon') from Jan 1 2026 onward,
 * and copies them to the booking calendar with structured descriptions.
 *
 * Auth: admin session cookie.
 * Pass ?dryRun=true (default) to preview without creating events.
 * Pass ?dryRun=false to actually create events on the booking calendar.
 */

import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { insertEvent } from '@/lib/google-calendar'
import { buildEventDescription } from '@/lib/booking'
import { parseBackfillFrom } from '@/lib/backfill-window'

function verifyAdminSession(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY
  if (!email || !rawKey) throw new Error('Missing Google service account env vars')
  const key = rawKey.replace(/\\n/g, '\n')
  return new google.auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/calendar.readonly'] })
}

/**
 * Fetch events from Harry's personal calendar.
 */
async function fetchHarryEvents(timeMin, timeMax) {
  const auth = getAuth()
  await auth.authorize()
  const calendar = google.calendar({ version: 'v3', auth })

  // Harry's personal calendar
  const calendarId = process.env.GOOGLE_BUSY_CALENDAR_IDS?.split(',')[0]?.trim()
  if (!calendarId) throw new Error('GOOGLE_BUSY_CALENDAR_IDS not configured')

  const allEvents = []
  let pageToken

  do {
    const res = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
      pageToken,
    })
    allEvents.push(...(res.data.items || []))
    pageToken = res.data.nextPageToken
  } while (pageToken)

  return allEvents
}

/**
 * Parse a legacy event title into structured data.
 *
 * Inspection variants:
 *   'Insp - Johnson'              → residential inspection
 *   'Insp Johnson'                → residential (missing dash)
 *   'Insp-commercial - Smith'     �� commercial inspection
 *   'Commercial insp - Smith'     → commercial inspection
 *   'Property inspection - Davis' → residential inspection
 *
 * Radon:
 *   'Set Radon - Johnson'         → radon drop
 *   'P/U radon - Johnson'         → radon pickup
 *
 * Sewer:
 *   'Sewer scope - Johnson'       → sewer scope
 */
function parseLegacyTitle(summary) {
  if (!summary) return null

  const s = summary.trim()

  // Sewer scope (check early so it doesn't accidentally match other patterns)
  const sewerMatch = s.match(/^sewer\s+scope\s*-?\s*(.+)/i)
  if (sewerMatch) return { type: 'sewer-scope', customerName: sewerMatch[1].trim(), commercial: false }

  // Radon events (check before inspection patterns)
  const setMatch = s.match(/^Set Radon\s*-?\s*(.+)/i)
  if (setMatch) return { type: 'radon-set', customerName: setMatch[1].trim(), commercial: false }

  const puMatch = s.match(/^P\/U radon\s*-?\s*(.+)/i)
  if (puMatch) return { type: 'radon-pickup', customerName: puMatch[1].trim(), commercial: false }

  // Commercial inspection variants
  const commercialInspMatch = s.match(/^commercial\s+insp(?:ection)?\s*[.\-]?\s*(.+)/i)
  if (commercialInspMatch) return { type: 'inspection', customerName: commercialInspMatch[1].trim(), commercial: true }

  const inspCommercialMatch = s.match(/^insp[.\-]?\s*commercial\s*[.\-]?\s*(.+)/i)
  if (inspCommercialMatch) return { type: 'inspection', customerName: inspCommercialMatch[1].trim(), commercial: true }

  // Exterior inspection
  const exteriorMatch = s.match(/^exterior\s+insp(?:ection)?\s*[.\-]?\s*(.+)/i)
  if (exteriorMatch) return { type: 'inspection', customerName: exteriorMatch[1].trim(), commercial: false }

  // Residential inspection variants
  const propertyInspMatch = s.match(/^property\s+inspection\s*[.\-]?\s*(.+)/i)
  if (propertyInspMatch) return { type: 'inspection', customerName: propertyInspMatch[1].trim(), commercial: false }

  // 'Insp - Name', 'Insp. Name', 'Insp-Name', 'Insp Name' (with or without dash/period/space)
  const inspMatch = s.match(/^insp[.\-]?\s*[.\-]?\s*(.+)/i)
  if (inspMatch) return { type: 'inspection', customerName: inspMatch[1].trim(), commercial: false }

  return null
}

export async function GET(request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') !== 'false'

  const { fromISO, toISO } = parseBackfillFrom(searchParams)
  const timeMin = fromISO
  const timeMax = toISO || new Date().toISOString()

  let events
  try {
    events = await fetchHarryEvents(timeMin, timeMax)
  } catch (err) {
    console.error('[backfill-legacy] fetch error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  // Filter to legacy inspection events (matched by parser)
  // Also pull in any event containing 'insp' that the parser doesn't match — flag for review
  const legacyEvents = []
  const unmatchedInspEvents = []

  for (const e of events) {
    const parsed = parseLegacyTitle(e.summary)
    if (parsed) {
      legacyEvents.push({ ...e, parsed })
    } else if (e.summary && /insp/i.test(e.summary)) {
      unmatchedInspEvents.push({
        title: e.summary,
        startISO: e.start?.dateTime || e.start?.date,
        endISO: e.end?.dateTime || e.end?.date,
      })
    }
  }

  // Sort by start time so inspection numbers are assigned chronologically
  legacyEvents.sort((a, b) => {
    const aStart = a.start?.dateTime || a.start?.date || ''
    const bStart = b.start?.dateTime || b.start?.date || ''
    return aStart.localeCompare(bStart)
  })

  // Assign inspection numbers sequentially per year (e.g. 2025-001, 2026-001).
  // Events are already sorted chronologically, so per-year counters stay in order.
  // Only inspections get numbers (not radon set/pickup).
  const yearCounts = {}
  const results = []

  for (const event of legacyEvents) {
    const { parsed } = event
    const startISO = event.start?.dateTime || event.start?.date
    const endISO = event.end?.dateTime || event.end?.date

    if (!startISO) continue

    // Inspections and sewer scopes get numbered; radon set/pickup don't
    const isCountable = parsed.type === 'inspection' || parsed.type === 'sewer-scope'
    let inspectionNumber = null
    if (isCountable) {
      const yr = String(new Date(startISO).getUTCFullYear())
      yearCounts[yr] = (yearCounts[yr] || 0) + 1
      inspectionNumber = `${yr}-${String(yearCounts[yr]).padStart(3, '0')}`
    }

    let serviceName
    let summary
    switch (parsed.type) {
      case 'inspection':
        serviceName = parsed.commercial ? 'Commercial Inspection' : 'Full Home Inspection'
        summary = `${parsed.customerName} — ${serviceName}`
        break
      case 'radon-set':
        serviceName = 'Radon Testing Only'
        summary = `${parsed.customerName} — Radon Drop`
        break
      case 'radon-pickup':
        serviceName = 'Radon Testing Only'
        summary = `${parsed.customerName} — Radon Pickup`
        break
      case 'sewer-scope':
        serviceName = 'Sewer Scope'
        summary = `${parsed.customerName} — Sewer Scope`
        break
    }

    const record = {
      originalTitle: event.summary,
      type: parsed.type,
      commercial: parsed.commercial,
      customerName: parsed.customerName,
      service: serviceName,
      inspectionNumber,
      startISO,
      endISO,
      newSummary: summary,
    }

    if (!dryRun) {
      try {
        const { description } = buildEventDescription({
          serviceName,
          customerName: parsed.customerName,
          phone: '',
          email: '',
          address: '',
          source: 'admin',
          inspectionNumber,
          extra: [
            parsed.commercial ? 'property_type: commercial' : 'property_type: residential',
            parsed.type === 'radon-set' ? 'Radon Add-On: Yes (radon device set for testing)' : null,
            parsed.type === 'sewer-scope' ? 'Sewer Scope: Yes' : null,
            `Imported from Harry's calendar: ${event.summary}`,
          ].filter(Boolean).join('\n'),
        })

        const created = await insertEvent({
          summary,
          description,
          location: '',
          startISO,
          endISO,
        })

        record.eventId = created.id
        record.status = 'created'
      } catch (err) {
        record.status = 'error'
        record.error = err.message
      }
    } else {
      record.status = 'dry-run'
    }

    results.push(record)
  }

  return NextResponse.json({
    dryRun,
    totalEventsScanned: events.length,
    legacyMatched: legacyEvents.length,
    inspectionsCounted: Object.values(yearCounts).reduce((a, b) => a + b, 0),
    inspectionsByYear: yearCounts,
    results,
    unmatchedContainingInsp: unmatchedInspEvents,
  })
}
