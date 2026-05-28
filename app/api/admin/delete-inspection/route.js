/*
 * POST /api/admin/delete-inspection
 *
 * Removes an inspection: deletes from Google Calendar and marks
 * as cancelled in the database (preserves the record).
 *
 * Body: { eventId }
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { deleteEvent } from '@/lib/google-calendar'
import { sql } from '@/lib/db'

function verifyAdminSession(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

export async function POST(request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { eventId } = body
  if (!eventId) {
    return NextResponse.json({ error: 'eventId required.' }, { status: 400 })
  }

  // Delete from Google Calendar
  try {
    await deleteEvent(eventId)
  } catch (err) {
    // 404/410 = already gone, that's fine
    if (err.code !== 404 && err.code !== 410) {
      console.error('[delete-inspection] calendar delete error:', err.message)
      return NextResponse.json({ error: 'Failed to delete from calendar.' }, { status: 500 })
    }
  }

  // Mark as cancelled in DB (preserve the record)
  try {
    const db = sql()
    await db`
      UPDATE inspections
      SET status = 'cancelled', cancelled_at = now(), updated_at = now()
      WHERE google_event_id = ${eventId}
    `
  } catch (err) {
    console.error('[delete-inspection] DB update error:', err.message)
    // Calendar is already deleted, log but don't fail
  }

  console.log(`[delete-inspection] removed event ${eventId}`)

  return NextResponse.json({ ok: true })
}
