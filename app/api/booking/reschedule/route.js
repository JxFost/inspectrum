/*
 * POST /api/booking/reschedule
 *
 * Moves an existing booking to a new time slot. Body: { token, startISO }.
 * Re-checks availability (race guard), patches the calendar event + DB,
 * then emails the customer a reschedule confirmation (with .ics + agent CC)
 * and alerts the office.
 */

import { NextResponse } from 'next/server'
import { SERVICES } from '@/lib/services'
import { getBusyRanges, findEventByToken, updateEventTime } from '@/lib/google-calendar'
import { computeSlots } from '@/lib/slots'
import { parseEventDescription } from '@/lib/booking'
import { rescheduleByToken } from '@/lib/db-inspections'
import { sendEmail } from '@/lib/email/send'
import { bookingReceiptHtml } from '@/lib/email/templates/booking-receipt'
import { buildICS } from '@/lib/ics'
import { extractConfirmationCode } from '@/lib/booking'
import { buildManageUrl } from '@/lib/booking-tokens'
import { TIMEZONE } from '@/lib/working-hours'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const startISO = typeof body.startISO === 'string' ? body.startISO.trim() : ''

  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 400 })
  }
  const startDate = new Date(startISO)
  if (isNaN(startDate.getTime())) {
    return NextResponse.json({ error: 'Invalid start time.' }, { status: 400 })
  }
  if (startDate < new Date()) {
    return NextResponse.json({ error: 'Please choose a future time.' }, { status: 400 })
  }

  // Find the current event.
  let event
  try {
    event = await findEventByToken(token)
  } catch (err) {
    console.error('Reschedule lookup error:', err)
    return NextResponse.json({ error: 'Could not load your booking. Please call (303) 697-0990.' }, { status: 500 })
  }
  if (!event) {
    return NextResponse.json({ error: 'Booking not found. It may have been cancelled.' }, { status: 404 })
  }

  const parsed = parseEventDescription(event.description)
  const service = SERVICES.find((s) => s.name === parsed.service)
  const durationHours = service?.durationHours || 4
  const endISO = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000).toISOString()

  // Re-check availability for the new slot (race guard). The customer's own
  // current event counts as busy, so they can't pick their existing time.
  const dateStr = startISO.slice(0, 10)
  const dayStart = `${dateStr}T00:00:00Z`
  const dayEnd = new Date(new Date(dayStart).getTime() + 48 * 60 * 60 * 1000).toISOString()
  try {
    const busyRanges = await getBusyRanges(dayStart, dayEnd)
    const slots = computeSlots(dateStr, durationHours, busyRanges)
    if (!slots.some((s) => s.startISO === startISO)) {
      return NextResponse.json({ error: 'That slot is no longer available. Please choose another time.' }, { status: 409 })
    }
  } catch (err) {
    console.error('Reschedule availability error:', err)
    return NextResponse.json({ error: 'Could not verify availability. Please try again or call (303) 697-0990.' }, { status: 500 })
  }

  // Move the calendar event.
  try {
    await updateEventTime(event.id, startISO, endISO)
  } catch (err) {
    console.error('Reschedule calendar update error:', err)
    return NextResponse.json({ error: 'Could not reschedule. Please call (303) 697-0990.' }, { status: 500 })
  }

  // Update the DB record (non-fatal if it fails).
  rescheduleByToken(token, startISO, endISO).catch((err) => console.error('[db] reschedule update failed:', err.message))

  // Confirm to the customer (CC their agent) with a fresh calendar invite.
  const confirmationCode = extractConfirmationCode(event.id)
  const manageUrl = buildManageUrl(token)
  const icsContent = buildICS({
    title: `Inspectrum Inspection — ${parsed.service || 'Inspection'}`,
    startISO,
    endISO,
    location: parsed.address || event.location || 'Evergreen, CO',
    description: `${parsed.service || 'Inspection'} with Inspectrum Inspections.\nConfirmation: ${confirmationCode}\nQuestions: (303) 697-0990`,
    uid: confirmationCode,
  })

  if (parsed.email) {
    try {
      await sendEmail({
        to: parsed.email,
        cc: parsed.clientAgentEmail || undefined,
        subject: `Your inspection has been rescheduled — ${parsed.service || 'Inspection'}`,
        html: bookingReceiptHtml({
          customerName: parsed.customerName || 'there',
          service: parsed.service || 'Full Home Inspection',
          startISO,
          endISO,
          durationHours,
          address: parsed.address || event.location || '',
          confirmationCode,
          manageUrl,
          gcalUrl: '#',
          radonAddOn: (event.description || '').includes('Radon Add-On: Yes'),
          rescheduled: true,
        }),
        attachments: [{ filename: 'inspection.ics', content: Buffer.from(icsContent, 'utf-8') }],
        template: 'booking-reschedule',
      })
    } catch (err) {
      console.error('[reschedule] customer email failed:', err.message)
    }
  }

  // Alert the office.
  const alertTo = process.env.DIGEST_EMAIL || 'harry@evergreeninspections.com'
  const newLabel = new Date(startISO).toLocaleString('en-US', { timeZone: TIMEZONE, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  sendEmail({
    to: alertTo,
    subject: `Booking Rescheduled — ${parsed.customerName || 'A customer'}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <h2 style="color:#1F2426;margin:0 0 16px;">Booking Rescheduled</h2>
        <div style="background:#FAF7F1;border:1px solid #E2DDD5;border-radius:6px;padding:16px;">
          <p style="margin:4px 0;font-size:14px;"><strong>Customer:</strong> ${parsed.customerName || 'Unknown'}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Service:</strong> ${parsed.service || 'Inspection'}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>New time:</strong> ${newLabel}</p>
          <p style="margin:4px 0;font-size:14px;"><strong>Address:</strong> ${parsed.address || 'N/A'}</p>
        </div>
      </div>
    `,
  }).catch((err) => console.error('[reschedule-alert] email failed:', err.message))

  return NextResponse.json({ rescheduled: true, startISO, endISO })
}
