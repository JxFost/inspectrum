/*
 * POST /api/admin/resend-report
 *
 * Resends the report-ready email for an inspection, linking the primary
 * report (inspection type preferred, otherwise the most recent upload).
 * Body: { inspectionId } — UUID from the inspections table.
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'
import { reportReadyHtml } from '@/lib/email/templates/report-ready'
import { parseEventDescription } from '@/lib/booking'

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

  const { inspectionId } = body
  if (!inspectionId) {
    return NextResponse.json({ error: 'inspectionId required.' }, { status: 400 })
  }

  const db = sql()
  const inspections = await db`
    SELECT id, inspection_number, customer_name, email, address, raw_description
    FROM inspections WHERE id = ${inspectionId}
  `
  const inspection = inspections[0]
  if (!inspection) {
    return NextResponse.json({ error: 'Inspection not found.' }, { status: 404 })
  }
  if (!inspection.email) {
    return NextResponse.json({ error: 'No customer email on file.' }, { status: 400 })
  }

  const reports = await db`
    SELECT file_url FROM inspection_reports
    WHERE inspection_id = ${inspectionId}
    ORDER BY (report_type = 'inspection') DESC, uploaded_at DESC
    LIMIT 1
  `
  if (!reports[0]) {
    return NextResponse.json({ error: 'No report uploaded for this inspection.' }, { status: 400 })
  }

  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
  const agentCc = parseEventDescription(inspection.raw_description).clientAgentEmail || undefined

  const result = await sendEmail({
    to: inspection.email,
    cc: agentCc,
    subject: `Your Inspection Report is Ready — ${inspection.address || 'Inspectrum'}`,
    html: reportReadyHtml({
      firstName: inspection.customer_name?.split(' ')[0] || 'there',
      address: inspection.address,
      downloadUrl: reports[0].file_url,
      portalUrl: `${siteUrl}/portal`,
    }),
    inspectionId: inspection.id,
    template: 'report-ready-resend',
  })

  if (result.error) {
    return NextResponse.json({ error: 'Email send failed.' }, { status: 500 })
  }

  await db`
    UPDATE inspection_reports
    SET notified_at = now()
    WHERE inspection_id = ${inspectionId}
    AND notified_at IS NULL
  `

  console.log(`[resend-report] sent to ${inspection.email} for ${inspection.inspection_number}`)
  return NextResponse.json({ ok: true })
}
