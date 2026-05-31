/*
 * GET /api/cron/reminders
 *
 * Daily cron job (called by Vercel Cron) that sends 24-hour reminder emails.
 *
 * Finds calendar events starting between 12 and 36 hours from now that have
 * a booking_token but no "reminder_sent: true" marker. Sends each a reminder
 * email, then marks the event so it won't get a duplicate.
 *
 * Also checks if the inspection agreement has been signed — if not, adds
 * a prominent warning to the reminder email.
 *
 * Idempotent: re-running won't double-send because of the marker check.
 */

import { NextResponse } from 'next/server'
import { findEventsBetween, updateEventDescription } from '@/lib/google-calendar'
import { extractToken, hasReminderMarker, appendReminderMarker, buildManageUrl } from '@/lib/booking-tokens'
import { sendEmail } from '@/lib/email/send'
import { reminderHtml } from '@/lib/email/templates/reminder'
import { sql } from '@/lib/db'

function parseField(description, field) {
  if (!description) return ''
  const match = description.match(new RegExp(`${field}:\\s*(.+)`))
  return match ? match[1].trim() : ''
}

export async function GET(request) {
  // Verify cron authorization. Vercel sends this header on cron requests.
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() + 12 * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 36 * 60 * 60 * 1000)

  let events
  try {
    events = await findEventsBetween(windowStart.toISOString(), windowEnd.toISOString())
  } catch (err) {
    console.error('Reminder cron: failed to fetch events:', err)
    return NextResponse.json({ error: 'Failed to fetch events.' }, { status: 500 })
  }

  let sent = 0
  let skipped = 0
  const errors = []

  for (const event of events) {
    const description = event.description || ''
    const token = extractToken(description)

    // Skip events without a booking token (manually created events, etc.).
    if (!token) {
      skipped++
      continue
    }

    // Skip if reminder already sent.
    if (hasReminderMarker(description)) {
      skipped++
      continue
    }

    const customerEmail = parseField(description, 'Email')
    const customerName = parseField(description, 'Customer')
    const service = parseField(description, 'Service')
    const address = event.location || parseField(description, 'Address')
    const startISO = event.start?.dateTime
    const endISO = event.end?.dateTime

    if (!customerEmail || !startISO) {
      skipped++
      continue
    }

    const manageUrl = buildManageUrl(token)

    // Check if agreement is signed
    let agreementUrl = null
    let agreementSigned = true
    try {
      const db = sql()
      const rows = await db`
        SELECT sa.token, sa.signed_at
        FROM signed_agreements sa
        JOIN inspections i ON i.id = sa.inspection_id
        WHERE i.token = ${token}
      `
      if (rows[0]) {
        agreementSigned = !!rows[0].signed_at
        if (!agreementSigned) {
          const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
          agreementUrl = `${siteUrl}/agreement/${rows[0].token}`
        }
      }
    } catch { /* DB may not be available */ }

    // Send the reminder.
    try {
      const { error } = await sendEmail({
        to: customerEmail,
        subject: `Reminder: Your inspection is ${formatRelative(startISO)}${!agreementSigned ? ' — Agreement needed' : ''}`,
        html: reminderHtml({
          customerName: customerName || 'there',
          service: service || 'Home Inspection',
          startISO,
          endISO,
          address: address || 'See confirmation email',
          manageUrl,
          agreementUrl,
          agreementSigned,
        }),
      })

      if (error) {
        console.error(`Reminder email failed for event ${event.id}:`, error)
        errors.push(event.id)
        continue
      }
    } catch (err) {
      console.error(`Reminder email error for event ${event.id}:`, err)
      errors.push(event.id)
      continue
    }

    // Mark as sent so we don't double-send.
    try {
      await updateEventDescription(event.id, appendReminderMarker(description))
    } catch (err) {
      // Not fatal — worst case is one duplicate reminder next run.
      console.error(`Failed to mark reminder sent for event ${event.id}:`, err)
    }

    sent++
  }

  return NextResponse.json({ sent, skipped, errors: errors.length })
}

/**
 * Returns "the day after tomorrow" or "in 2 days" style relative label.
 */
function formatRelative(isoString) {
  const diff = new Date(isoString) - new Date()
  const hours = Math.round(diff / (1000 * 60 * 60))
  if (hours <= 24) return 'tomorrow'
  if (hours <= 48) return 'the day after tomorrow'
  return `in ${Math.round(hours / 24)} days`
}
