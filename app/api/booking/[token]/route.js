/*
 * GET /api/booking/[token]
 *
 * Returns appointment details for the manage page. The token is the
 * unguessable secret — no login required.
 *
 * Returns 404 if not found, 410 if the appointment is in the past.
 */

import { NextResponse } from 'next/server'
import { findEventByToken } from '@/lib/google-calendar'
import { TIMEZONE } from '@/lib/working-hours'
import { SERVICES } from '@/lib/services'
import { sql } from '@/lib/db'

function parseCustomerField(description, field) {
  if (!description) return ''
  const match = description.match(new RegExp(`${field}:\\s*(.+)`))
  return match ? match[1].trim() : ''
}

export async function GET(_request, { params }) {
  const { token } = await params

  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 400 })
  }

  let event
  try {
    event = await findEventByToken(token)
  } catch (err) {
    console.error('Error looking up booking:', err)
    return NextResponse.json(
      { error: 'Could not look up this booking. Please try again or call (303) 697-0990.' },
      { status: 500 },
    )
  }

  if (!event) {
    return NextResponse.json({ error: 'Booking not found. It may have been cancelled.' }, { status: 404 })
  }

  const startISO = event.start?.dateTime
  const endISO = event.end?.dateTime

  if (!startISO) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }

  const description = event.description || ''
  const paymentStatus = parseCustomerField(description, 'payment_status') || null
  const isPast = new Date(startISO) < new Date()

  // Only block past events if they have no payment info — customers may need to view/pay
  if (isPast && !paymentStatus) {
    return NextResponse.json({ error: 'This appointment has already passed.' }, { status: 410 })
  }

  // Look up agreement status from DB
  let agreementStatus = null
  let agreementToken = null
  try {
    const db = sql()
    const rows = await db`
      SELECT sa.token, sa.signed_at
      FROM signed_agreements sa
      JOIN inspections i ON i.id = sa.inspection_id
      WHERE i.token = ${token}
    `
    if (rows[0]) {
      agreementToken = rows[0].token
      agreementStatus = rows[0].signed_at ? 'signed' : 'pending'
    }
  } catch { /* DB may not be available */ }

  const serviceName = parseCustomerField(description, 'Service')
  const serviceId = SERVICES.find((s) => s.name === serviceName)?.id || null

  // Pricing inputs (so the manage page quotes from the live pricing engine,
  // matching the booking estimate). City is parsed from the stored address
  // (format: "street, city, CO zip").
  const fullAddress = event.location || parseCustomerField(description, 'Address')
  const city = (fullAddress || '').split(',')[1]?.trim() || ''
  const yearBuiltRaw = parseCustomerField(description, 'Year Built') // e.g. "1985 (40 yrs)"
  const yearBuilt = (yearBuiltRaw.match(/\d{4}/) || [''])[0]

  return NextResponse.json({
    service: serviceName,
    serviceId,
    sqft: parseCustomerField(description, 'Square Footage') || null,
    yearBuilt: yearBuilt || null,
    city: city || null,
    garageType: parseCustomerField(description, 'Garage') || null,
    outbuilding: parseCustomerField(description, 'Outbuilding') || null,
    name: parseCustomerField(description, 'Customer'),
    email: parseCustomerField(description, 'Email'),
    phone: parseCustomerField(description, 'Phone'),
    address: event.location || parseCustomerField(description, 'Address'),
    startISO,
    endISO,
    status: event.status,
    paymentStatus,
    invoiceAmountCents: parseCustomerField(description, 'invoice_amount_cents') || null,
    paymentAmountCents: parseCustomerField(description, 'payment_amount_cents') || null,
    squareInvoiceUrl: parseCustomerField(description, 'square_invoice_url') || null,
    paidAt: parseCustomerField(description, 'paid_at') || null,
    agreementStatus,
    agreementToken,
    radonAddOn: description.includes('Radon Add-On: Yes'),
    sewerScope: description.includes('Sewer Scope: Yes'),
    tripChargeCents: parseCustomerField(description, 'trip_charge_cents') || null,
    distanceMiles: parseCustomerField(description, 'distance_miles') || null,
  })
}
