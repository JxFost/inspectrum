/*
 * POST /api/admin/upload-report
 *
 * Uploads a PDF report for an inspection. Stores in Vercel Blob,
 * creates a DB record, and optionally sends customer notification.
 *
 * Body: FormData with:
 *   - file: PDF file
 *   - inspectionId: UUID from inspections table
 *   - notify: 'true' to send customer email
 *
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
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

  const formData = await request.formData()
  const file = formData.get('file')
  const inspectionId = formData.get('inspectionId')
  const reportType = formData.get('reportType') || 'inspection'
  const notify = formData.get('notify') === 'true'

  if (!file || !inspectionId) {
    return NextResponse.json({ error: 'File and inspectionId required.' }, { status: 400 })
  }

  if (!file.type || !file.type.includes('pdf')) {
    return NextResponse.json({ error: 'Only PDF files are accepted.' }, { status: 400 })
  }

  // Look up the inspection
  const db = sql()
  const inspections = await db`
    SELECT id, inspection_number, customer_name, email, address, service, raw_description
    FROM inspections WHERE id = ${inspectionId}
  `
  const inspection = inspections[0]
  if (!inspection) {
    return NextResponse.json({ error: 'Inspection not found.' }, { status: 404 })
  }

  // Upload to Vercel Blob
  const fileName = `${inspection.inspection_number || 'report'}_${file.name}`
  const blobPath = `reports/${new Date().getFullYear()}/${fileName}`

  let blob
  try {
    blob = await put(blobPath, file, {
      access: 'public',
      contentType: 'application/pdf',
    })
  } catch (err) {
    console.error('[upload-report] blob upload failed:', err.message)
    return NextResponse.json({ error: 'Upload failed: ' + err.message }, { status: 500 })
  }

  // Create DB record
  try {
    await db`
      INSERT INTO inspection_reports (
        inspection_id, customer_email, file_url, file_name, file_size_bytes, report_type, uploaded_via
      ) VALUES (
        ${inspectionId},
        ${inspection.email || null},
        ${blob.url},
        ${file.name},
        ${file.size},
        ${reportType},
        'admin'
      )
    `
  } catch (err) {
    console.error('[upload-report] DB insert failed:', err.message)
    return NextResponse.json({ error: 'DB error: ' + err.message }, { status: 500 })
  }

  // Send notification email
  if (notify && inspection.email) {
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
    try {
      const agentCc = parseEventDescription(inspection.raw_description).clientAgentEmail || undefined
      await sendEmail({
        to: inspection.email,
        cc: agentCc,
        subject: `Your Inspection Report is Ready — ${inspection.address || 'Inspectrum'}`,
        html: reportReadyHtml({
          firstName: inspection.customer_name?.split(' ')[0] || 'there',
          address: inspection.address,
          downloadUrl: blob.url,
          portalUrl: `${siteUrl}/portal`,
        }),
      })

      await db`
        UPDATE inspection_reports
        SET notified_at = now()
        WHERE inspection_id = ${inspectionId}
        AND notified_at IS NULL
      `

      console.log(`[upload-report] notified ${inspection.email} for ${inspection.inspection_number}`)
    } catch (err) {
      console.error('[upload-report] notification email failed:', err.message)
      // Don't fail the upload — report is already stored
    }
  }

  console.log(`[upload-report] uploaded ${file.name} for ${inspection.inspection_number}`)

  return NextResponse.json({
    ok: true,
    fileUrl: blob.url,
    fileName: file.name,
    inspectionNumber: inspection.inspection_number,
    notified: notify && !!inspection.email,
  })
}
