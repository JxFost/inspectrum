/*
 * POST /api/book
 *
 * Creates a confirmed booking on the Google Calendar. Re-checks availability
 * before inserting to guard against race conditions (two people booking the
 * same slot between the availability fetch and this call).
 *
 * After inserting, sends a booking receipt email via Resend. If the email
 * fails, the booking still stands — we log the failure and return success.
 */

import { NextResponse } from 'next/server'
import { SERVICES } from '@/lib/services'
import { getBusyRanges, insertEvent } from '@/lib/google-calendar'
import { computeSlots } from '@/lib/slots'
import { generateToken, buildTokenBlock, buildManageUrl } from '@/lib/booking-tokens'
import { sendEmail } from '@/lib/email/send'
import { bookingReceiptHtml } from '@/lib/email/templates/booking-receipt'

const MAX_FIELD_LENGTH = 500

function trim(value, maxLen = MAX_FIELD_LENGTH) {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : ''
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

function hasColoradoZip(address) {
  const match = address.match(/\b(\d{5})\b/)
  if (!match) return false
  const num = parseInt(match[1], 10)
  return num >= 80001 && num <= 81658
}

function buildGCalUrl({ service, startISO, endISO, address }) {
  const fmt = (iso) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Inspectrum Inspection — ${service}`,
    dates: `${fmt(startISO)}/${fmt(endISO)}`,
    details: `${service} with Inspectrum Inspections.\n\nAddress: ${address || 'TBD'}\n\nQuestions: (303) 697-0990`,
    location: address || 'Evergreen, CO',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const serviceId = trim(body.service, 50)
  const startISO = trim(body.startISO, 50)
  const name = trim(body.name)
  const email = trim(body.email)
  const phone = trim(body.phone)
  const address = trim(body.address)

  // Validate service.
  const service = SERVICES.find((s) => s.id === serviceId)
  if (!service) {
    return NextResponse.json({ error: 'Unknown service.' }, { status: 400 })
  }

  // Validate start time format.
  const startDate = new Date(startISO)
  if (isNaN(startDate.getTime())) {
    return NextResponse.json({ error: 'Invalid start time.' }, { status: 400 })
  }

  // Validate customer details.
  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: 'Phone must have at least 10 digits.' }, { status: 400 })
  }
  if (!address) {
    return NextResponse.json({ error: 'Property address is required.' }, { status: 400 })
  }
  if (!hasColoradoZip(address)) {
    return NextResponse.json({ error: 'Please provide a valid Colorado address with ZIP code.' }, { status: 400 })
  }

  // Compute the end time from service duration.
  const endDate = new Date(startDate.getTime() + service.durationHours * 60 * 60 * 1000)
  const endISO = endDate.toISOString()

  // Re-check availability (race condition guard).
  const dateStr = startISO.slice(0, 10)
  const dayStart = `${dateStr}T00:00:00Z`
  const dayEndDate = new Date(new Date(dayStart).getTime() + 48 * 60 * 60 * 1000)

  try {
    const busyRanges = await getBusyRanges(dayStart, dayEndDate.toISOString())
    const slots = computeSlots(dateStr, service.durationHours, busyRanges)
    const stillAvailable = slots.some((s) => s.startISO === startISO)

    if (!stillAvailable) {
      return NextResponse.json(
        { error: 'That slot was just taken. Please choose another time.' },
        { status: 409 },
      )
    }
  } catch (err) {
    console.error('Availability re-check error:', err)
    return NextResponse.json(
      { error: 'Could not verify availability. Please try again or call (303) 697-0990.' },
      { status: 500 },
    )
  }

  // Generate a booking token for self-serve management.
  const token = generateToken()

  // Insert the event.
  try {
    const event = await insertEvent({
      summary: `Inspectrum: ${service.name} — ${name}`,
      description: [
        `Service: ${service.name}`,
        `Customer: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Address: ${address}`,
        '',
        'Booked via inspectrum.com',
        buildTokenBlock(token),
      ].join('\n'),
      location: address,
      startISO,
      endISO,
    })

    // Derive a short confirmation code from the event ID.
    const confirmationCode = event.id
      ? event.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
      : 'CONFIRMED'

    // Send booking receipt email (non-blocking — don't fail the booking if email fails).
    const manageUrl = buildManageUrl(token)
    const gcalUrl = buildGCalUrl({ service: service.name, startISO, endISO, address })

    sendEmail({
      to: email,
      subject: `Your inspection is booked — ${service.name}`,
      html: bookingReceiptHtml({
        customerName: name,
        service: service.name,
        startISO,
        endISO,
        durationHours: service.durationHours,
        address,
        confirmationCode,
        manageUrl,
        gcalUrl,
      }),
    }).catch((err) => {
      console.error('Booking receipt email failed:', err)
    })

    return NextResponse.json({
      confirmationCode,
      startISO,
      endISO,
      service: service.name,
      token,
    })
  } catch (err) {
    console.error('Booking insert error:', err)
    return NextResponse.json(
      { error: 'Could not create the booking. Please try again or call (303) 697-0990.' },
      { status: 500 },
    )
  }
}
