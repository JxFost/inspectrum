/*
 * POST /api/admin/block
 *
 * Creates a calendar event from the admin block form.
 * Supports vacation blocks (no customer info) and manual bookings.
 * Optionally sends a confirmation email.
 */

import { NextResponse } from 'next/server'
import { SERVICES } from '@/lib/services'
import { insertEvent } from '@/lib/google-calendar'
import { buildEventDescription, extractConfirmationCode, getNextInspectionNumber } from '@/lib/booking'
import { computeDistance } from '@/lib/mileage'
import { buildManageUrl } from '@/lib/booking-tokens'
import { sendEmail } from '@/lib/email/send'
import { bookingReceiptHtml } from '@/lib/email/templates/booking-receipt'
import { upsertInspection } from '@/lib/db-inspections'
import { upsertCustomer } from '@/lib/db-customers'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const serviceId = body.service || 'full'
  const service = SERVICES.find((s) => s.id === serviceId)
  if (!service) {
    return NextResponse.json({ error: 'Unknown service.' }, { status: 400 })
  }

  const startISO = body.startISO
  if (!startISO || isNaN(new Date(startISO).getTime())) {
    return NextResponse.json({ error: 'Valid start time required.' }, { status: 400 })
  }

  const name = (body.name || '').trim() || 'Blocked'
  const phone = (body.phone || '').trim()
  const email = (body.email || '').trim()
  const address = (body.address || '').trim()
  const notes = (body.notes || '').trim()
  const radonAddOn = body.radonAddOn === true
  const sewerScope = body.sewerScope === true
  const sendConfirmation = body.sendEmail === true && email

  const endDate = new Date(new Date(startISO).getTime() + service.durationHours * 60 * 60 * 1000)
  const endISO = endDate.toISOString()

  const isVacation = name === 'Blocked' && !email && !phone
  const inspectionNumber = isVacation ? null : await getNextInspectionNumber()
  const dist = isVacation ? null : await computeDistance(address)

  const { description, token } = buildEventDescription({
    inspectionNumber,
    distanceMiles: dist?.miles,
    tripChargeCents: dist?.tripChargeCents,
    geoLat: dist?.geoLat,
    geoLng: dist?.geoLng,
    serviceName: isVacation ? 'Blocked Time' : service.name,
    customerName: name,
    phone,
    email,
    address,
    radonAddOn,
    sewerScope,
    source: 'admin',
    extra: notes ? `Notes: ${notes}` : null,
  })

  try {
    const summary = isVacation
      ? `Inspectrum: BLOCKED — ${notes || 'Vacation/Personal'}`
      : `Inspectrum: ${service.name} — ${name}`

    const event = await insertEvent({
      summary,
      description,
      location: address || undefined,
      startISO,
      endISO,
    })

    const confirmationCode = extractConfirmationCode(event.id)

    console.log(`[admin-block] created: ${name.split(' ')[0]}, ${isVacation ? 'block' : service.name}, event ${event.id}`)

    if (!isVacation) {
      if (email) {
        upsertCustomer({ email, name, phone })
          .catch((err) => console.error('[db] customer upsert failed:', err.message))
      }

      upsertInspection({
        googleEventId: event.id,
        inspectionNumber,
        customerName: name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        service: service.name,
        startAt: startISO,
        endAt: endISO,
        source: 'admin',
        distanceMiles: dist?.miles || null,
        tripChargeCents: dist?.tripChargeCents || null,
        geoLat: dist?.geoLat || null,
        geoLng: dist?.geoLng || null,
        token,
        rawDescription: description,
      }).catch((err) => console.error('[db] admin block insert failed:', err.message))
    }

    // Optionally send confirmation email
    if (sendConfirmation) {
      const manageUrl = buildManageUrl(token)
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
          gcalUrl: '#',
        }),
      }).catch((err) => {
        console.error('[admin-block] email failed:', err)
      })
    }

    return NextResponse.json({
      ok: true,
      confirmationCode,
      eventId: event.id,
      token,
    })
  } catch (err) {
    console.error('[admin-block] error:', err)
    return NextResponse.json({ error: 'Failed to create event.' }, { status: 500 })
  }
}
