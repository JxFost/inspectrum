/*
 * POST /api/inspection/finalize
 *
 * Creates a Square invoice for a completed inspection.
 * Auth: admin session cookie (route is under /api/ but we check manually).
 *
 * Body: { eventId, priceCents, notes? }
 */

import { NextResponse } from 'next/server'
import { getEvent } from '@/lib/google-calendar'
import { parseEventDescription, markInvoiceCreated } from '@/lib/booking'
import { createInvoice } from '@/lib/square'

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
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const { eventId, priceCents, notes } = body

  if (!eventId || !priceCents || priceCents <= 0) {
    return NextResponse.json({ error: 'eventId and priceCents (> 0) are required.' }, { status: 400 })
  }

  // Fetch the calendar event
  let event
  try {
    event = await getEvent(eventId)
  } catch (err) {
    console.error('[square] failed to fetch event:', err.message)
    return NextResponse.json({ error: 'Could not load event.' }, { status: 500 })
  }

  if (!event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
  }

  const parsed = parseEventDescription(event.description)

  // Check if already invoiced
  if (parsed.paymentStatus && parsed.paymentStatus !== 'none') {
    return NextResponse.json({ error: 'This inspection has already been invoiced.' }, { status: 409 })
  }

  // Warn if ACC event
  if (parsed.source === 'acc') {
    console.warn(`[square] manually invoicing ACC event ${eventId} for ${parsed.customerName?.split(' ')[0]}`)
  }

  if (!parsed.email) {
    return NextResponse.json({ error: 'No customer email on file — cannot send invoice.' }, { status: 400 })
  }

  // Create the Square invoice
  try {
    const result = await createInvoice({
      customerName: parsed.customerName || 'Customer',
      customerEmail: parsed.email,
      customerPhone: parsed.phone,
      serviceName: parsed.service || 'Home Inspection',
      priceCents,
      inspectionDate: event.start?.dateTime,
      notes,
    })

    // Update calendar event with invoice details
    await markInvoiceCreated(eventId, {
      invoiceId: result.invoiceId,
      invoiceUrl: result.invoiceUrl,
      customerId: result.customerId,
      amountCents: priceCents,
    })

    const firstName = parsed.customerName?.split(' ')[0] || 'customer'
    console.log(`[square] invoice ${result.invoiceId} sent to ${firstName}, $${(priceCents / 100).toFixed(2)}`)

    return NextResponse.json({
      ok: true,
      invoiceId: result.invoiceId,
      invoiceUrl: result.invoiceUrl,
    })
  } catch (err) {
    console.error('[square] invoice creation failed:', err)
    return NextResponse.json({ error: 'Failed to create invoice. ' + (err.message || '') }, { status: 500 })
  }
}
