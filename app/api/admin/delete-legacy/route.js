/*
 * GET /api/admin/delete-legacy?dryRun=true
 *
 * Deletes old legacy-imported events from the booking calendar.
 * Targets events with "Imported from Harry's calendar" in the description.
 * Also removes their DB records.
 *
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { findEventsBetween, deleteEvent } from '@/lib/google-calendar'
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

  let events
  try {
    events = await findEventsBetween(
      '2026-01-01T00:00:00Z',
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    )
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  // Step 1: Find non-ACC events that overlap with ACC events
  const accEvents = events.filter((e) =>
    (e.description || '').includes('acc_source: true')
  )
  const nonAccEvents = events.filter((e) =>
    !(e.description || '').includes('acc_source: true')
  )

  function overlapsWithAcc(event) {
    const start = new Date(event.start?.dateTime || 0).getTime()
    return accEvents.some((acc) => {
      const accStart = new Date(acc.start?.dateTime || 0).getTime()
      return Math.abs(start - accStart) < 4 * 60 * 60 * 1000
    })
  }

  const nonAccDuplicates = nonAccEvents.filter(overlapsWithAcc)
  const kept = nonAccEvents.filter((e) => !overlapsWithAcc(e))

  // Step 2: Find duplicate ACC events (same start time = ran rebuild twice)
  // Group ACC events by start time, keep the first one, mark rest as dupes
  const accByTime = {}
  for (const e of accEvents) {
    const key = (e.start?.dateTime || '').slice(0, 16) // match to the minute
    if (!accByTime[key]) accByTime[key] = []
    accByTime[key].push(e)
  }
  const accDuplicates = []
  for (const group of Object.values(accByTime)) {
    if (group.length > 1) {
      // Keep the first, delete the rest
      accDuplicates.push(...group.slice(1))
    }
  }

  const duplicates = [...nonAccDuplicates, ...accDuplicates]

  const results = {
    dryRun,
    totalNonAcc: nonAccEvents.length,
    accDuplicates: accDuplicates.length,
    duplicates: duplicates.length,
    kept: kept.length,
    deleted: 0,
    dbDeleted: 0,
    errors: [],
    keptEvents: kept.map((e) => ({ summary: e.summary, date: e.start?.dateTime })),
    items: [],
  }

  const db = sql()

  for (const event of duplicates) {
    const item = {
      eventId: event.id,
      summary: event.summary,
      date: event.start?.dateTime,
    }

    if (!dryRun) {
      try {
        await deleteEvent(event.id)
        results.deleted++
        item.status = 'deleted'

        // Also remove from DB
        try {
          await db`DELETE FROM inspections WHERE google_event_id = ${event.id}`
          results.dbDeleted++
        } catch { /* may not exist in DB */ }
      } catch (err) {
        item.status = 'error'
        item.error = err.message
        results.errors.push(`${event.id}: ${err.message}`)
      }
    } else {
      item.status = 'dry-run'
    }

    results.items.push(item)
  }

  return NextResponse.json(results)
}
