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
import { buildEventDescription, getNextInspectionNumber } from '@/lib/booking'

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
 * 'Insp - Johnson' → { type: 'inspection', customerName: 'Johnson' }
 * 'Set Radon - Johnson' → { type: 'radon-set', customerName: 'Johnson' }
 * 'P/U radon - Johnson' → { type: 'radon-pickup', customerName: 'Johnson' }
 */
function parseLegacyTitle(summary) {
  if (!summary) return null

  const inspMatch = summary.match(/^Insp\s*-\s*(.+)/i)
  if (inspMatch) return { type: 'inspection', customerName: inspMatch[1].trim() }

  const setMatch = summary.match(/^Set Radon\s*-\s*(.+)/i)
  if (setMatch) return { type: 'radon-set', customerName: setMatch[1].trim() }

  const puMatch = summary.match(/^P\/U radon\s*-\s*(.+)/i)
  if (puMatch) return { type: 'radon-pickup', customerName: puMatch[1].trim() }

  return null
}

export async function GET(request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') !== 'false'

  const timeMin = '2026-01-01T00:00:00Z'
  const timeMax = new Date().toISOString()

  let events
  try {
    events = await fetchHarryEvents(timeMin, timeMax)
  } catch (err) {
    console.error('[backfill-legacy] fetch error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  // Filter to legacy inspection events
  const legacyEvents = events
    .filter((e) => {
      const parsed = parseLegacyTitle(e.summary)
      return parsed !== null
    })
    .map((e) => ({
      ...e,
      parsed: parseLegacyTitle(e.summary),
    }))

  const results = []

  for (const event of legacyEvents) {
    const { parsed } = event
    const startISO = event.start?.dateTime || event.start?.date
    const endISO = event.end?.dateTime || event.end?.date

    if (!startISO) continue

    let serviceName
    let summary
    switch (parsed.type) {
      case 'inspection':
        serviceName = 'Full Home Inspection'
        summary = `${parsed.customerName} — Full Home Inspection`
        break
      case 'radon-set':
        serviceName = 'Radon Testing Only'
        summary = `${parsed.customerName} — Radon Drop`
        break
      case 'radon-pickup':
        serviceName = 'Radon Testing Only'
        summary = `${parsed.customerName} — Radon Pickup`
        break
    }

    const record = {
      originalTitle: event.summary,
      type: parsed.type,
      customerName: parsed.customerName,
      service: serviceName,
      startISO,
      endISO,
      newSummary: summary,
    }

    if (!dryRun) {
      try {
        const inspectionNumber = parsed.type === 'inspection'
          ? await getNextInspectionNumber()
          : null

        const { description } = buildEventDescription({
          serviceName,
          customerName: parsed.customerName,
          phone: '',
          email: '',
          address: '',
          source: 'admin',
          inspectionNumber,
          extra: `Imported from Harry's calendar: ${event.summary}`,
        })

        const created = await insertEvent({
          summary,
          description,
          location: '',
          startISO,
          endISO,
        })

        record.eventId = created.id
        record.inspectionNumber = inspectionNumber
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
    results,
  })
}
