/*
 * GET /api/cron/maintenance-reminders
 *
 * Daily cron that re-engages past clients with two reminder types:
 *   - radon-retest:      ~2 years after a radon inspection (EPA retest cadence)
 *   - annual-maintenance: ~1 year after any inspection (seasonal check-in)
 *
 * Each type targets a 30-day anniversary window so the first run can't blast
 * the entire back catalog — only inspections whose 1- or 2-year mark passed in
 * the last 30 days qualify. Dedup is enforced via email_log (one send per
 * inspection per template), so re-running is safe.
 *
 * Auth: CRON_SECRET (scheduled runs) OR an admin session with ?dryRun=true
 * (browser preview of who would be emailed — sends nothing).
 */

import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'
import { maintenanceReminderHtml } from '@/lib/email/templates/maintenance-reminder'
import { unsubscribeUrl } from '@/lib/email/unsubscribe'

const BATCH_LIMIT = 100

function verifyAdminSession(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') === 'true'

  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const authedAsCron = !cronSecret || authHeader === `Bearer ${cronSecret}`
  // Allow a browser dry-run for logged-in admins; real sends need the cron secret.
  if (!authedAsCron && !(dryRun && verifyAdminSession(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = sql()
  const results = { dryRun, radonRetest: 0, annualMaintenance: 0, errors: 0, candidates: [] }

  // ~2-year radon retest candidates (radon add-on only, anniversary in last 30 days)
  let radonRows = []
  try {
    radonRows = await db`
      SELECT id, customer_name, email, address, start_at
      FROM inspections
      WHERE status != 'cancelled'
        AND email IS NOT NULL
        AND raw_description LIKE '%Radon Add-On: Yes%'
        AND start_at <= now() - interval '2 years'
        AND start_at >= now() - interval '2 years' - interval '30 days'
        AND id NOT IN (
          SELECT inspection_id FROM email_log
          WHERE template = 'radon-retest' AND inspection_id IS NOT NULL
        )
      ORDER BY start_at ASC
      LIMIT ${BATCH_LIMIT}
    `
  } catch (err) {
    console.error('[maintenance-reminders] radon query failed:', err.message)
    results.errors++
  }

  // ~1-year annual maintenance candidates (any inspection, anniversary in last 30 days)
  let annualRows = []
  try {
    annualRows = await db`
      SELECT id, customer_name, email, address, start_at
      FROM inspections
      WHERE status != 'cancelled'
        AND email IS NOT NULL
        AND start_at <= now() - interval '1 year'
        AND start_at >= now() - interval '1 year' - interval '30 days'
        AND id NOT IN (
          SELECT inspection_id FROM email_log
          WHERE template = 'annual-maintenance' AND inspection_id IS NOT NULL
        )
      ORDER BY start_at ASC
      LIMIT ${BATCH_LIMIT}
    `
  } catch (err) {
    console.error('[maintenance-reminders] annual query failed:', err.message)
    results.errors++
  }

  const batches = [
    { rows: radonRows, type: 'radon', template: 'radon-retest', subject: 'Time to retest your home for radon' },
    { rows: annualRows, type: 'annual', template: 'annual-maintenance', subject: 'Your annual home-maintenance check-in' },
  ]

  for (const batch of batches) {
    for (const row of batch.rows) {
      if (dryRun) {
        results.candidates.push({ template: batch.template, customer: row.customer_name, email: row.email, inspectedAt: row.start_at })
      } else {
        try {
          await sendEmail({
            to: row.email,
            subject: batch.subject,
            html: maintenanceReminderHtml({ type: batch.type, customerName: row.customer_name, address: row.address, unsubscribeUrl: unsubscribeUrl(row.email) }),
            marketing: true,
            inspectionId: row.id,
            template: batch.template,
          })
        } catch (err) {
          console.error(`[maintenance-reminders] send failed for inspection ${row.id}:`, err.message)
          results.errors++
          continue
        }
      }
      if (batch.template === 'radon-retest') results.radonRetest++
      else results.annualMaintenance++
    }
  }

  console.log(`[maintenance-reminders] dryRun=${dryRun} radon=${results.radonRetest} annual=${results.annualMaintenance} errors=${results.errors}`)
  return NextResponse.json(results)
}
