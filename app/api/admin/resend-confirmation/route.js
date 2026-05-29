/*
 * POST /api/admin/resend-confirmation
 *
 * Resends the booking confirmation email for an inspection.
 * Body: { eventId }
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { getEvent } from '@/lib/google-calendar'
import { parseEventDescription, extractConfirmationCode } from '@/lib/booking'
import { buildManageUrl } from '@/lib/booking-tokens'
import { sendEmail } from '@/lib/email/send'
import { bookingReceiptHtml } from '@/lib/email/templates/booking-receipt'
import { SERVICES } from '@/lib/services'
import { sql } from '@/lib/db'

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

  const { eventId } = body
  if (!eventId) {
    return NextResponse.json({ error: 'eventId required.' }, { status: 400 })
  }

  // Fetch event from calendar
  const event = await getEvent(eventId)
  if (!event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }

  const parsed = parseEventDescription(event.description)
  if (!parsed.email) {
    return NextResponse.json({ error: 'No customer email on file.' }, { status: 400 })
  }

  const startISO = event.start?.dateTime
  const endISO = event.end?.dateTime
  const confirmationCode = extractConfirmationCode(event.id)
  const manageUrl = parsed.token ? buildManageUrl(parsed.token) : null
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'

  // Find agreement URL
  let agreementUrl = null
  try {
    const db = sql()
    const rows = await db`
      SELECT sa.token FROM signed_agreements sa
      JOIN inspections i ON i.id = sa.inspection_id
      WHERE i.google_event_id = ${eventId}
    `
    if (rows[0]) agreementUrl = `${siteUrl}/agreement/${rows[0].token}`
  } catch { /* ignore */ }

  // Find service duration
  const service = SERVICES.find((s) => s.name === parsed.service)
  const durationHours = service?.durationHours || 4

  // Get inspection DB id for logging
  let inspectionDbId = null
  try {
    const db = sql()
    const rows = await db`SELECT id FROM inspections WHERE google_event_id = ${eventId}`
    if (rows[0]) inspectionDbId = rows[0].id
  } catch { /* ignore */ }

  // Build gcal URL
  const fmt = (iso) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Inspectrum Inspection — ${parsed.service}`)}&dates=${fmt(startISO)}/${fmt(endISO)}&location=${encodeURIComponent(parsed.address || '')}`

  const result = await sendEmail({
    to: parsed.email,
    subject: `Your inspection is booked — ${parsed.service || 'Inspection'}`,
    html: bookingReceiptHtml({
      customerName: parsed.customerName || 'Customer',
      service: parsed.service || 'Full Home Inspection',
      startISO,
      endISO,
      durationHours,
      address: parsed.address || event.location || '',
      confirmationCode,
      manageUrl: manageUrl || '#',
      gcalUrl,
      agreementUrl,
    }),
    inspectionId: inspectionDbId,
    template: 'booking-receipt-resend',
  })

  if (result.error) {
    return NextResponse.json({ error: 'Email send failed.' }, { status: 500 })
  }

  console.log(`[resend-confirmation] sent to ${parsed.email} for event ${eventId}`)
  return NextResponse.json({ ok: true })
}
