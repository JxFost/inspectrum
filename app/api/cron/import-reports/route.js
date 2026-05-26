/*
 * GET /api/cron/import-reports
 *
 * Scans Harry's Sent folder for emails with PDF attachments sent to
 * known customers. Auto-imports reports: uploads to Vercel Blob,
 * creates DB record, sends customer notification.
 *
 * Runs every 2 hours via Vercel Cron.
 * Tracks processed emails by Gmail message ID to avoid duplicates.
 */

import { NextResponse } from 'next/server'
import { searchEmails, downloadAttachment } from '@/lib/gmail'
import { put } from '@vercel/blob'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email/send'
import { reportReadyHtml } from '@/lib/email/templates/report-ready'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const inspectorEmail = process.env.INSPECTOR_GMAIL_ADDRESS
  if (!inspectorEmail) {
    return NextResponse.json({ error: 'INSPECTOR_GMAIL_ADDRESS not configured' }, { status: 500 })
  }

  const db = sql()
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'

  // Search Harry's sent folder for emails with PDF attachments from last 48 hours
  let emails
  try {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const afterDate = `${twoDaysAgo.getFullYear()}/${twoDaysAgo.getMonth() + 1}/${twoDaysAgo.getDate()}`

    emails = await searchEmails(
      `in:sent has:attachment filename:pdf after:${afterDate}`,
      50,
      inspectorEmail
    )
  } catch (err) {
    console.error('[import-reports] Gmail fetch error:', err.message)
    return NextResponse.json({ error: `Gmail error: ${err.message}` }, { status: 500 })
  }

  const results = { scanned: emails.length, imported: 0, skipped: 0, errors: 0, items: [] }

  for (const email of emails) {
    // Skip if already processed
    const existing = await db`
      SELECT 1 FROM processed_emails WHERE gmail_message_id = ${email.id}
    `
    if (existing.length > 0) {
      results.skipped++
      continue
    }

    // Extract recipient email(s)
    const toRaw = email.to || ''
    const recipientEmails = toRaw
      .split(/[,;]/)
      .map((e) => e.match(/<([^>]+)>/)?.[1] || e.trim())
      .map((e) => e.toLowerCase().trim())
      .filter((e) => e.includes('@'))

    // Find PDF attachments
    const pdfAttachments = email.attachments.filter((a) =>
      a.mimeType === 'application/pdf' || a.filename?.toLowerCase().endsWith('.pdf')
    )

    if (pdfAttachments.length === 0) {
      results.skipped++
      await db`INSERT INTO processed_emails (gmail_message_id) VALUES (${email.id}) ON CONFLICT DO NOTHING`
      continue
    }

    // Try to match recipient to a customer + inspection
    let matchedInspection = null
    for (const recipientEmail of recipientEmails) {
      // Skip internal emails
      if (recipientEmail.endsWith('@evergreeninspections.com')) continue

      const inspections = await db`
        SELECT i.id, i.inspection_number, i.customer_name, i.email, i.address, i.service
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
      results.skipped++
      await db`INSERT INTO processed_emails (gmail_message_id) VALUES (${email.id}) ON CONFLICT DO NOTHING`
      results.items.push({
        subject: email.subject,
        to: toRaw,
        status: 'no-match',
      })
      continue
    }

    // Check if this inspection already has a report
    const existingReport = await db`
      SELECT 1 FROM inspection_reports WHERE inspection_id = ${matchedInspection.id}
    `
    if (existingReport.length > 0) {
      results.skipped++
      await db`INSERT INTO processed_emails (gmail_message_id) VALUES (${email.id}) ON CONFLICT DO NOTHING`
      continue
    }

    // Download and upload the first PDF attachment
    const attachment = pdfAttachments[0]
    try {
      const pdfBuffer = await downloadAttachment(email.id, attachment.attachmentId, inspectorEmail)

      const fileName = `${matchedInspection.inspection_number || 'report'}_${attachment.filename}`
      const blobPath = `reports/${new Date().getFullYear()}/${fileName}`

      const blob = await put(blobPath, pdfBuffer, {
        access: 'public',
        contentType: 'application/pdf',
      })

      // Create DB record
      await db`
        INSERT INTO inspection_reports (
          inspection_id, customer_email, file_url, file_name, file_size_bytes, uploaded_via
        ) VALUES (
          ${matchedInspection.id},
          ${matchedInspection.email},
          ${blob.url},
          ${attachment.filename},
          ${attachment.size},
          'auto-import'
        )
      `

      // Send customer notification
      if (matchedInspection.email) {
        try {
          await sendEmail({
            to: matchedInspection.email,
            subject: `Your Inspection Report is Ready — ${matchedInspection.address || 'Inspectrum'}`,
            html: reportReadyHtml({
              firstName: matchedInspection.customer_name?.split(' ')[0] || 'there',
              address: matchedInspection.address,
              downloadUrl: blob.url,
              portalUrl: `${siteUrl}/portal`,
            }),
          })

          await db`
            UPDATE inspection_reports
            SET notified_at = now()
            WHERE inspection_id = ${matchedInspection.id}
            AND notified_at IS NULL
          `
        } catch (err) {
          console.error('[import-reports] notification failed:', err.message)
        }
      }

      // Mark as processed
      await db`INSERT INTO processed_emails (gmail_message_id) VALUES (${email.id}) ON CONFLICT DO NOTHING`

      results.imported++
      results.items.push({
        subject: email.subject,
        customer: matchedInspection.customer_name,
        inspection: matchedInspection.inspection_number,
        fileName: attachment.filename,
        status: 'imported',
      })

      console.log(`[import-reports] imported ${attachment.filename} for ${matchedInspection.inspection_number}`)
    } catch (err) {
      results.errors++
      results.items.push({
        subject: email.subject,
        customer: matchedInspection.customer_name,
        status: 'error',
        error: err.message,
      })
      console.error(`[import-reports] error for ${matchedInspection.inspection_number}:`, err.message)
    }
  }

  console.log(`[import-reports] scanned ${results.scanned}, imported ${results.imported}, skipped ${results.skipped}`)

  return NextResponse.json(results)
}
