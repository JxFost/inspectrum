/*
 * POST /api/booking/cancel
 *
 * Cancels a booking by token. Finds the matching calendar event and deletes it.
 * Idempotent — if the event is already gone, returns success with a flag.
 */

import { NextResponse } from 'next/server'
import { findEventByToken, deleteEvent } from '@/lib/google-calendar'
import { parseEventDescription } from '@/lib/booking'
import { sendEmail } from '@/lib/email/send'
import { TIMEZONE } from '@/lib/working-hours'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''

  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 400 })
  }

  let event
  try {
    event = await findEventByToken(token)
  } catch (err) {
    console.error('Cancel lookup error:', err)
    return NextResponse.json(
      { error: 'Could not process cancellation. Please try again or call (303) 697-0990.' },
      { status: 500 },
    )
  }

  // Already cancelled or not found — that's fine, tell the customer.
  if (!event) {
    return NextResponse.json({ cancelled: true, alreadyCancelled: true })
  }

  // Parse event details before deleting
  const parsed = parseEventDescription(event.description)
  const startISO = event.start?.dateTime

  try {
    await deleteEvent(event.id)
  } catch (err) {
    console.error('Cancel delete error:', err)
    return NextResponse.json(
      { error: 'Could not cancel the booking. Please call (303) 697-0990.' },
      { status: 500 },
    )
  }

  // Alert Harry immediately about the cancellation
  const alertTo = process.env.DIGEST_EMAIL || 'harry@evergreeninspections.com'
  const firstName = parsed.customerName?.split(' ')[0] || 'A customer'
  const dateLabel = startISO ? new Date(startISO).toLocaleDateString('en-US', { timeZone: TIMEZONE, weekday: 'long', month: 'long', day: 'numeric' }) : 'unknown date'
  const timeLabel = startISO ? new Date(startISO).toLocaleTimeString('en-US', { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' }) : ''
  const isPaid = parsed.paymentStatus === 'paid'

  sendEmail({
    to: alertTo,
    subject: `Booking Cancelled — ${firstName}, ${dateLabel}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <h2 style="color:#1F2426;margin:0 0 16px;">Booking Cancelled</h2>
        <div style="background:#FAF7F1;border:1px solid #E2DDD5;border-radius:6px;padding:16px;margin-bottom:16px;">
          <p style="margin:4px 0;font-size:14px;"><strong>Customer:</strong> ${parsed.customerName || 'Unknown'}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Service:</strong> ${parsed.service || 'Inspection'}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Date:</strong> ${dateLabel} at ${timeLabel}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Address:</strong> ${parsed.address || 'N/A'}</p>
          ${parsed.phone ? `<p style="margin:4px 0;font-size:14px;"><strong>Phone:</strong> <a href="tel:${parsed.phone.replace(/[^+\d]/g, '')}" style="color:#2B7E8C;">${parsed.phone}</a></p>` : ''}
        </div>
        ${isPaid ? '<p style="color:#DC2626;font-weight:600;font-size:14px;"> &#9888; This booking had a paid invoice. A refund may be needed.</p>' : ''}
        <p style="font-size:13px;color:#9DA0A2;">This slot is now open on your calendar.</p>
      </div>
    `,
  }).catch((err) => console.error('[cancel-alert] email failed:', err))

  return NextResponse.json({ cancelled: true, alreadyCancelled: false })
}
