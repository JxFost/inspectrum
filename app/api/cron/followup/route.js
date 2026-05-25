/*
 * GET /api/cron/followup
 *
 * Daily cron job that sends follow-up emails 72 hours after an inspection.
 *
 * Finds calendar events that ended between 60 and 84 hours ago that have
 * a booking_token but no "followup_sent: true" marker. Sends each a
 * follow-up email with a Google review link, then marks the event.
 *
 * Idempotent: re-running won't double-send because of the marker check.
 */

import { NextResponse } from 'next/server'
import { findEventsBetween, updateEventDescription } from '@/lib/google-calendar'
import { extractToken, hasFollowupMarker, appendFollowupMarker } from '@/lib/booking-tokens'
import { sendEmail } from '@/lib/email/send'
import { followupHtml } from '@/lib/email/templates/followup'

function parseField(description, field) {
  if (!description) return ''
  const match = description.match(new RegExp(`${field}:\\s*(.+)`))
  return match ? match[1].trim() : ''
}

export async function GET(request) {
  // Verify cron authorization.
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Look for events that ended 60–84 hours ago (centers on 72h with a 24h window).
  const now = new Date()
  const windowEnd = new Date(now.getTime() - 60 * 60 * 60 * 1000)   // 60h ago
  const windowStart = new Date(now.getTime() - 84 * 60 * 60 * 1000) // 84h ago

  let events
  try {
    events = await findEventsBetween(windowStart.toISOString(), windowEnd.toISOString())
  } catch (err) {
    console.error('Followup cron: failed to fetch events:', err)
    return NextResponse.json({ error: 'Failed to fetch events.' }, { status: 500 })
  }

  let sent = 0
  let skipped = 0
  const errors = []

  for (const event of events) {
    const description = event.description || ''
    const token = extractToken(description)

    // Skip events without a booking token.
    if (!token) {
      skipped++
      continue
    }

    // Skip if follow-up already sent.
    if (hasFollowupMarker(description)) {
      skipped++
      continue
    }

    const customerEmail = parseField(description, 'Email')
    const customerName = parseField(description, 'Customer')
    const service = parseField(description, 'Service')
    const address = event.location || parseField(description, 'Address')
    const startISO = event.start?.dateTime

    if (!customerEmail || !startISO) {
      skipped++
      continue
    }

    // Don't send follow-ups for ACC bookings (they have their own flow).
    if (description.includes('acc_source: true')) {
      skipped++
      continue
    }

    // Send the follow-up.
    try {
      const { error } = await sendEmail({
        to: customerEmail,
        subject: `How did your inspection go, ${customerName.split(' ')[0]}?`,
        html: followupHtml({
          customerName: customerName || 'there',
          service: service || 'inspection',
          startISO,
          address: address || 'your property',
          token,
        }),
      })

      if (error) {
        console.error(`Followup email failed for event ${event.id}:`, error)
        errors.push(event.id)
        continue
      }
    } catch (err) {
      console.error(`Followup email error for event ${event.id}:`, err)
      errors.push(event.id)
      continue
    }

    // Mark as sent.
    try {
      await updateEventDescription(event.id, appendFollowupMarker(description))
    } catch (err) {
      console.error(`Failed to mark followup sent for event ${event.id}:`, err)
    }

    sent++
    console.log(`[followup] sent to ${customerName.split(' ')[0]}, event ${event.id}`)
  }

  return NextResponse.json({ sent, skipped, errors: errors.length })
}
