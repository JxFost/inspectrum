/*
 * POST /api/admin/bulk-update
 *
 * Applies a bulk action to multiple inspections.
 * Actions: mark_paid, mark_report_sent
 *
 * Body: { eventIds: string[], action: string }
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
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

  const { eventIds, action } = body
  if (!eventIds?.length || !action) {
    return NextResponse.json({ error: 'eventIds and action required.' }, { status: 400 })
  }

  const db = sql()
  let updated = 0

  try {
    switch (action) {
      case 'mark_paid': {
        const result = await db`
          UPDATE inspections
          SET payment_status = 'paid', updated_at = now()
          WHERE google_event_id = ANY(${eventIds})
            AND (payment_status IS NULL OR payment_status != 'paid')
        `
        updated = result.count || eventIds.length
        console.log(`[bulk-update] marked ${updated} inspections as paid`)
        break
      }

      case 'mark_report_sent': {
        // Insert a placeholder report record for each inspection that doesn't have one
        for (const eventId of eventIds) {
          const rows = await db`
            SELECT i.id FROM inspections i
            LEFT JOIN inspection_reports ir ON ir.inspection_id = i.id
            WHERE i.google_event_id = ${eventId}
              AND ir.id IS NULL
          `
          if (rows[0]) {
            await db`
              INSERT INTO inspection_reports (inspection_id, file_url, file_name, report_type, uploaded_via)
              VALUES (${rows[0].id}, '', 'report-marked-sent', 'inspection', 'bulk-update')
            `
            updated++
          }
        }
        console.log(`[bulk-update] marked ${updated} inspections as report sent`)
        break
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    console.error('[bulk-update] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, updated })
}
