/*
 * GET /api/admin/backfill-reports?dryRun=true
 *
 * Scans Harry's Sent folder for all emails with PDF attachments
 * since Jan 1 2026. Matches by recipient email to customers in the DB,
 * uploads to Vercel Blob, and creates inspection_reports records.
 *
 * Skips inspections that already have a report.
 *
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { searchEmails, downloadAttachment } from '@/lib/gmail'
import { put } from '@vercel/blob'
import { sql } from '@/lib/db'
import { parseBackfillFrom } from '@/lib/backfill-window'

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
  const limit = parseInt(searchParams.get('limit'), 10) || 200
  const { fromGmail, toGmail } = parseBackfillFrom(searchParams)

  const inspectorEmail = process.env.INSPECTOR_GMAIL_ADDRESS
  if (!inspectorEmail) {
    return NextResponse.json({ error: 'INSPECTOR_GMAIL_ADDRESS not configured' }, { status: 500 })
  }

  const db = sql()

  // Fetch all sent emails with PDF attachments since Jan 1
  let emails
  try {
    emails = await searchEmails(
      `in:sent has:attachment filename:pdf ${fromGmail}${toGmail ? ' ' + toGmail : ''}`,
      limit,
      inspectorEmail
    )
  } catch (err) {
    return NextResponse.json({ error: `Gmail error: ${err.message}` }, { status: 500 })
  }

  const results = { dryRun, scanned: emails.length, imported: 0, skipped: 0, alreadyHasReport: 0, noMatch: 0, errors: 0, items: [] }

  for (const email of emails) {
    // Extract recipient emails
    const toRaw = email.to || ''
    const recipientEmails = toRaw
      .split(/[,;]/)
      .map((e) => e.match(/<([^>]+)>/)?.[1] || e.trim())
      .map((e) => e.toLowerCase().trim())
      .filter((e) => e.includes('@') && !e.endsWith('@evergreeninspections.com'))

    // Find PDF attachments
    const pdfAttachments = email.attachments.filter((a) =>
      a.mimeType === 'application/pdf' || a.filename?.toLowerCase().endsWith('.pdf')
    )

    if (pdfAttachments.length === 0) {
      results.skipped++
      continue
    }

    // Match recipient to customer + inspection
    let matchedInspection = null
    for (const recipientEmail of recipientEmails) {
      const inspections = await db`
        SELECT i.id, i.inspection_number, i.customer_name, i.email, i.address
        FROM inspections i
        WHERE LOWER(i.email) = ${recipientEmail}
          AND i.status != 'cancelled'
        ORDER BY i.start_at DESC
        LIMIT 1
      `
      if (inspections[0]) {
        matchedInspection = inspections[0]
        break
      }
    }

    if (!matchedInspection) {
      results.noMatch++
      results.items.push({ subject: email.subject, to: toRaw, file: pdfAttachments[0]?.filename, status: 'no-match' })
      continue
    }

    // Check if this inspection already has a report
    const existing = await db`
      SELECT 1 FROM inspection_reports WHERE inspection_id = ${matchedInspection.id}
    `
    if (existing.length > 0) {
      results.alreadyHasReport++
      continue
    }

    const attachment = pdfAttachments[0]
    const record = {
      customer: matchedInspection.customer_name,
      inspection: matchedInspection.inspection_number,
      file: attachment.filename,
      email: matchedInspection.email,
    }

    if (!dryRun) {
      try {
        const pdfBuffer = await downloadAttachment(email.id, attachment.attachmentId, inspectorEmail)
        const fileName = `${matchedInspection.inspection_number || 'report'}_${attachment.filename}`
        // Bucket historical reports by their inspection's year (e.g. "2025-001" -> 2025)
        const inspYear = /^(\d{4})-/.test(matchedInspection.inspection_number || '')
          ? matchedInspection.inspection_number.slice(0, 4)
          : new Date().getFullYear()
        const blobPath = `reports/${inspYear}/${fileName}`

        const blob = await put(blobPath, pdfBuffer, { access: 'public', contentType: 'application/pdf' })

        await db`
          INSERT INTO inspection_reports (inspection_id, customer_email, file_url, file_name, file_size_bytes, uploaded_via)
          VALUES (${matchedInspection.id}, ${matchedInspection.email}, ${blob.url}, ${attachment.filename}, ${attachment.size}, 'backfill')
        `

        record.status = 'imported'
        record.fileUrl = blob.url
        results.imported++
      } catch (err) {
        record.status = 'error'
        record.error = err.message
        results.errors++
      }
    } else {
      record.status = 'dry-run'
      results.imported++
    }

    results.items.push(record)
  }

  return NextResponse.json(results)
}
