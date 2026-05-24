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
import { buildManageUrl } from '@/lib/booking-tokens'
import { buildEventDescription, extractConfirmationCode, getNextInspectionNumber } from '@/lib/booking'
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
  const sqft = trim(body.sqft, 50)
  const yearBuilt = trim(body.yearBuilt, 4)
  const waterType = trim(body.waterType, 50)
  const garageType = trim(body.garageType, 50)
  const occupied = trim(body.occupied, 10)
  const radonAddOn = body.radonAddOn === true
  const pets = body.pets === true
  const isAgent = body.isAgent === true
  const agentType = trim(body.agentType, 50)
  const clientAttending = trim(body.clientAttending, 10)
  const accessProvidedBy = trim(body.accessProvidedBy, 200)
  // Honeypot — bots that fill hidden fields get silently rejected.
  if (trim(body.botcheck)) {
    return NextResponse.json({ ok: true })
  }

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

  // Compute radon dates if radon add-on was selected
  let radonDropDate = null
  let radonPickupDate = null
  if (radonAddOn) {
    const start = new Date(startISO)
    const drop = new Date(start)
    const pickup = new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000)
    radonDropDate = `${drop.getMonth() + 1}/${drop.getDate()}`
    radonPickupDate = `${pickup.getMonth() + 1}/${pickup.getDate()}`
  }

  // Assign inspection number for the year
  const inspectionNumber = await getNextInspectionNumber()

  // Build event description using shared helpers.
  const { description, token } = buildEventDescription({
    inspectionNumber,
    serviceName: service.name,
    customerName: name,
    phone,
    email,
    address,
    sqft,
    yearBuilt,
    waterType,
    garageType,
    occupied,
    radonAddOn,
    radonDropDate,
    radonPickupDate,
    pets,
    orderedBy: isAgent ? agentType : null,
    clientAttending,
    accessProvidedBy,
    source: 'website',
  })

  // Insert the event.
  try {
    const event = await insertEvent({
      summary: `Inspectrum: ${service.name} — ${name}`,
      description,
      location: address,
      startISO,
      endISO,
    })

    const confirmationCode = extractConfirmationCode(event.id)

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
