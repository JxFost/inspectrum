/*
 * POST /api/admin/assign-report
 *
 * Assigns a pending (unmatched) report to an inspection.
 * Moves it from pending_reports to inspection_reports and optionally
 * notifies the customer.
 *
 * Body: { pendingReportId, inspectionId, notify }
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'
import { reportReadyHtml } from '@/lib/email/templates/report-ready'

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

  const { pendingReportId, inspectionId, notify } = body
  if (!pendingReportId || !inspectionId) {
    return NextResponse.json({ error: 'pendingReportId and inspectionId required.' }, { status: 400 })
  }

  const db = sql()

  // Fetch the pending report
  const pending = await db`SELECT * FROM pending_reports WHERE id = ${pendingReportId} AND resolved_at IS NULL`
  if (!pending[0]) {
    return NextResponse.json({ error: 'Pending report not found or already assigned.' }, { status: 404 })
  }

  // Fetch the inspection
  const inspections = await db`SELECT id, customer_name, email, address FROM inspections WHERE id = ${inspectionId}`
  if (!inspections[0]) {
    return NextResponse.json({ error: 'Inspection not found.' }, { status: 404 })
  }
  const inspection = inspections[0]

  // Create the inspection_reports record
  await db`
    INSERT INTO inspection_reports (inspection_id, customer_email, file_url, file_name, file_size_bytes, uploaded_via)
    VALUES (${inspectionId}, ${inspection.email || null}, ${pending[0].file_url}, ${pending[0].file_name}, ${pending[0].file_size_bytes}, 'auto-import')
  `

  // Mark pending report as resolved
  await db`
    UPDATE pending_reports SET resolved_at = now(), resolved_to = ${inspectionId} WHERE id = ${pendingReportId}
  `

  // Notify customer
  if (notify && inspection.email) {
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
    try {
      await sendEmail({
        to: inspection.email,
        subject: `Your Inspection Report is Ready — ${inspection.address || 'Inspectrum'}`,
        html: reportReadyHtml({
          firstName: inspection.customer_name?.split(' ')[0] || 'there',
          address: inspection.address,
          downloadUrl: pending[0].file_url,
          portalUrl: `${siteUrl}/portal`,
        }),
      })

      await db`
        UPDATE inspection_reports SET notified_at = now()
        WHERE inspection_id = ${inspectionId} AND notified_at IS NULL
      `
    } catch (err) {
      console.error('[assign-report] notification failed:', err.message)
    }
  }

  console.log(`[assign-report] ${pending[0].file_name} → ${inspection.customer_name} (${inspection.email})`)

  return NextResponse.json({ ok: true })
}
