/*
 * POST /api/inbound/acc
 *
 * Webhook endpoint for inbound ACC (call center) emails forwarded via
 * CloudMailin. Parses transactional emails from theinspectorsoffice.com
 * and creates/updates/deletes Google Calendar events.
 *
 * Authentication: INBOUND_WEBHOOK_SECRET as a query parameter or
 * Basic auth header. CloudMailin supports adding a secret to the URL.
 *
 * Email types handled:
 *   - Appointment → create new calendar event
 *   - Reschedule  → find existing event, update date/time
 *   - Cancelled   → find existing event, mark as cancelled
 *   - End of Day  → ignore (return 200)
 */

import { NextResponse } from 'next/server'
import { parseACCEmail, isValidACCSender } from '@/lib/acc-email-parser'
import { buildEventDescription, extractConfirmationCode, mapACCServiceType, getNextInspectionNumber, parseEventDescription, mergeEventDescriptions } from '@/lib/booking'
import { computeDistance } from '@/lib/mileage'
import { insertEvent, findEventsBetween, deleteEvent, patchEvent } from '@/lib/google-calendar'
import { TIMEZONE } from '@/lib/working-hours'
import { upsertInspection } from '@/lib/db-inspections'
import { upsertCustomer } from '@/lib/db-customers'

function log(action, detail) {
  // Privacy-safe logging: first name only, no full PII
  console.log(`[acc-inbound] ${action}: ${detail}`)
}

function verifyWebhookSecret(request) {
  const secret = process.env.INBOUND_WEBHOOK_SECRET
  if (!secret) {
    log('error', 'INBOUND_WEBHOOK_SECRET not configured')
    return false
  }

  const url = new URL(request.url)
  const querySecret = url.searchParams.get('secret')
  if (querySecret === secret) return true

  // Also check Basic auth header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString()
    // CloudMailin sends user:password, we just check the password part
    const parts = decoded.split(':')
    if (parts[parts.length - 1] === secret) return true
  }

  return false
}

/**
 * Find an existing calendar event matching client name + address.
 * Used for reschedule and cancel operations, and (with requireAddress +
 * upcomingOnly) to detect amended re-sends of appointment emails.
 */
async function findMatchingEvent(clientName, address, { requireAddress = false, upcomingOnly = false } = {}) {
  if (!clientName) return null

  // Search a wide window: 30 days past to 90 days future
  const now = new Date()
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const events = await findEventsBetween(past.toISOString(), future.toISOString())

  const normalizedName = clientName.toLowerCase().trim()
  const normalizedAddr = address?.toLowerCase().trim() || ''

  if (requireAddress && !normalizedAddr) return null

  // Find events that match by name in the description
  let matches = events.filter((e) => {
    const desc = (e.description || '').toLowerCase()
    return desc.includes(`customer: ${normalizedName}`)
  })

  if (requireAddress) {
    matches = matches.filter((e) => {
      const haystack = `${e.location || ''}\n${e.description || ''}`.toLowerCase()
      return haystack.includes(normalizedAddr)
    })
  }

  if (upcomingOnly) {
    // Skip events that already happened (with a same-day grace window)
    const cutoff = now.getTime() - 24 * 60 * 60 * 1000
    matches = matches.filter((e) => new Date(e.start?.dateTime || 0).getTime() >= cutoff)
  }

  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0]

  // Multiple matches — prefer one with matching address
  if (normalizedAddr) {
    const addrMatch = matches.find((e) => {
      const desc = (e.description || '').toLowerCase()
      return desc.includes(normalizedAddr)
    })
    if (addrMatch) return addrMatch
  }

  // Fall back to closest in time
  matches.sort((a, b) => {
    const da = Math.abs(new Date(a.start?.dateTime || 0) - now)
    const db = Math.abs(new Date(b.start?.dateTime || 0) - now)
    return da - db
  })

  return matches[0]
}

/**
 * Build extra description lines from ACC-specific fields.
 */
function buildACCExtraLines(parsed) {
  const lines = []
  if (parsed.inspectionType) lines.push(`ACC Inspection Type: ${parsed.inspectionType}`)
  if (parsed.squareFeet) lines.push(`Square Footage: ${parsed.squareFeet}`)
  if (parsed.yearBuilt) lines.push(`Year Built: ${parsed.yearBuilt}`)
  if (parsed.radon === 'Yes') {
    lines.push(`Radon: Yes`)
    if (parsed.radonDropDate) lines.push(`Radon Drop: ${parsed.radonDropDate}`)
    if (parsed.radonPickupDate) lines.push(`Radon Pickup: ${parsed.radonPickupDate}`)
  }
  if (parsed.sewerScope === 'Yes') lines.push(`Sewer Scope: Yes`)
  if (parsed.totalFee) lines.push(`ACC Fee: $${parsed.totalFee}`)
  if (parsed.occupied) lines.push(`Occupied: ${parsed.occupied}`)
  if (parsed.accessProvidedBy) lines.push(`Access: ${parsed.accessProvidedBy}`)
  if (parsed.comments) lines.push(`Comments: ${parsed.comments}`)
  if (parsed.takenBy) lines.push(`Taken By: ${parsed.takenBy}`)
  if (parsed.buyersAgent?.name) lines.push(`Buyer's Agent: ${parsed.buyersAgent.name}`)
  if (parsed.sellersAgent?.name) lines.push(`Seller's Agent: ${parsed.sellersAgent.name}`)
  if (parsed.orderedBy) lines.push(`Ordered By: ${parsed.orderedBy}`)
  if (parsed.cancelReason) lines.push(`Cancel Reason: ${parsed.cancelReason}`)
  return lines.join('\n')
}

export async function POST(request) {
  // 1. Verify webhook secret
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody
  try {
    rawBody = await request.text()
  } catch (err) {
    console.log('[acc-inbound] failed to read body:', err.message)
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // CloudMailin JSON multipart format provides headers, plain, and html
  const from = body.headers?.from || body.envelope?.from || ''
  const subject = body.headers?.subject || ''
  const html = body.html || ''
  const plainText = body.plain || ''

  // 2. Verify sender domain
  if (!isValidACCSender(from)) {
    log('rejected', `invalid sender domain: ${from.split('@')[1] || 'unknown'}`)
    return NextResponse.json({ error: 'Invalid sender' }, { status: 403 })
  }

  // 3. Parse the email
  const result = parseACCEmail({ subject, from, html, plainText })

  // 4. Handle ignored types
  if (result.type === 'end_of_day') {
    log('ignored', 'End of Day Schedule email')
    return NextResponse.json({ ok: true, action: 'ignored' })
  }

  if (result.type === 'unknown') {
    log('ignored', `unrecognized subject: ${subject.slice(0, 60)}`)
    return NextResponse.json({ ok: true, action: 'ignored' })
  }

  const { parsed, startISO } = result
  const firstName = parsed.clientName?.split(' ')[0] || 'unknown'
  const fullAddress = [parsed.address, parsed.city, parsed.state, parsed.zip]
    .filter(Boolean).join(', ')

  // 5. Handle Appointment (new booking)
  if (result.type === 'appointment') {
    if (!startISO) {
      log('error', `could not parse date/time from subject: ${subject}`)
      return NextResponse.json({ error: 'Could not parse date/time' }, { status: 400 })
    }

    const service = mapACCServiceType(parsed.inspectionType)
    const endDate = new Date(new Date(startISO).getTime() + service.durationHours * 60 * 60 * 1000)
    const endISO = endDate.toISOString()

    // ACC sometimes re-sends an appointment email for the same job with
    // amended or added fields. If an upcoming event already matches this
    // client + address, merge the new details into it instead of duplicating.
    let existing = null
    try {
      existing = await findMatchingEvent(parsed.clientName, parsed.address || fullAddress, {
        requireAddress: true,
        upcomingOnly: true,
      })
    } catch (err) {
      log('warn', `duplicate check failed, proceeding to create: ${err.message}`)
    }

    if (existing) {
      try {
        const prev = parseEventDescription(existing.description)

        const { description } = buildEventDescription({
          inspectionNumber: prev.inspectionNumber,
          token: prev.token,
          distanceMiles: prev.distanceMiles,
          tripChargeCents: prev.tripChargeCents,
          geoLat: prev.geoLat,
          geoLng: prev.geoLng,
          serviceName: service.name,
          customerName: parsed.clientName || prev.customerName || 'ACC Client',
          phone: parsed.clientPhone || prev.phone || '',
          email: parsed.clientEmail || prev.email || '',
          address: fullAddress || prev.address || '',
          sqft: parsed.squareFeet || prev.sqft,
          source: 'acc',
          accSubject: subject,
          extra: buildACCExtraLines(parsed),
        })

        const merged = mergeEventDescriptions(existing.description, description)

        const patch = {
          summary: `Inspectrum: ${service.name} — ${parsed.clientName || prev.customerName || 'ACC Client'}`,
          description: merged,
          location: fullAddress || existing.location,
        }
        const prevStart = existing.start?.dateTime
        if (prevStart && new Date(prevStart).getTime() !== new Date(startISO).getTime()) {
          patch.start = { dateTime: startISO }
          patch.end = { dateTime: endISO }
        }
        await patchEvent(existing.id, patch)

        log('merged', `amended appointment for ${firstName} into event ${existing.id}`)

        if (parsed.clientEmail) {
          upsertCustomer({ email: parsed.clientEmail, name: parsed.clientName, phone: parsed.clientPhone })
            .catch((err) => console.error('[db] customer upsert failed:', err.message))
        }

        upsertInspection({
          googleEventId: existing.id,
          customerName: parsed.clientName || null,
          email: parsed.clientEmail || null,
          phone: parsed.clientPhone || null,
          address: fullAddress || null,
          service: service.name,
          startAt: startISO,
          endAt: endISO,
          source: 'acc',
          rawDescription: merged,
        }).catch((err) => console.error('[db] ACC merge update failed:', err.message))

        return NextResponse.json({ ok: true, action: 'merged', eventId: existing.id })
      } catch (err) {
        log('error', `failed to merge amended appointment: ${err.message}`)
        return NextResponse.json({ error: 'Failed to merge appointment update' }, { status: 500 })
      }
    }

    const inspectionNumber = await getNextInspectionNumber()
    const dist = await computeDistance(fullAddress)

    const { description, token } = buildEventDescription({
      inspectionNumber,
      distanceMiles: dist?.miles,
      tripChargeCents: dist?.tripChargeCents,
      geoLat: dist?.geoLat,
      geoLng: dist?.geoLng,
      serviceName: service.name,
      customerName: parsed.clientName || 'ACC Client',
      phone: parsed.clientPhone || '',
      email: parsed.clientEmail || '',
      address: fullAddress,
      sqft: parsed.squareFeet,
      source: 'acc',
      accSubject: subject,
      extra: buildACCExtraLines(parsed),
    })

    try {
      const event = await insertEvent({
        summary: `Inspectrum: ${service.name} — ${parsed.clientName || 'ACC Client'}`,
        description,
        location: fullAddress,
        startISO,
        endISO,
      })

      log('created', `appointment for ${firstName}, event ${event.id}`)

      if (parsed.clientEmail) {
        upsertCustomer({ email: parsed.clientEmail, name: parsed.clientName, phone: parsed.clientPhone })
          .catch((err) => console.error('[db] customer upsert failed:', err.message))
      }

      upsertInspection({
        googleEventId: event.id,
        inspectionNumber,
        customerName: parsed.clientName || 'ACC Client',
        email: parsed.clientEmail || null,
        phone: parsed.clientPhone || null,
        address: fullAddress,
        service: service.name,
        startAt: startISO,
        endAt: endISO,
        source: 'acc',
        distanceMiles: dist?.miles || null,
        tripChargeCents: dist?.tripChargeCents || null,
        geoLat: dist?.geoLat || null,
        geoLng: dist?.geoLng || null,
        token,
        rawDescription: description,
      }).catch((err) => console.error('[db] ACC insert failed:', err.message))

      return NextResponse.json({
        ok: true,
        action: 'created',
        eventId: event.id,
        confirmationCode: extractConfirmationCode(event.id),
      })
    } catch (err) {
      log('error', `failed to create event: ${err.message}`)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }
  }

  // 6. Handle Reschedule
  if (result.type === 'reschedule') {
    if (!startISO) {
      log('error', `could not parse new date/time from subject: ${subject}`)
      return NextResponse.json({ error: 'Could not parse date/time' }, { status: 400 })
    }

    try {
      const existing = await findMatchingEvent(parsed.clientName, parsed.address || fullAddress)

      if (!existing) {
        // No match found — create a new event instead and log warning
        log('warn', `no existing event found for reschedule of ${firstName}, creating new`)

        const service = mapACCServiceType(parsed.inspectionType)
        const endDate = new Date(new Date(startISO).getTime() + service.durationHours * 60 * 60 * 1000)

        const { description } = buildEventDescription({
          serviceName: service.name,
          customerName: parsed.clientName || 'ACC Client',
          phone: parsed.clientPhone || '',
          email: parsed.clientEmail || '',
          address: fullAddress,
          sqft: parsed.squareFeet,
          source: 'acc',
          accSubject: subject,
          extra: buildACCExtraLines(parsed),
        })

        const event = await insertEvent({
          summary: `Inspectrum: ${service.name} — ${parsed.clientName || 'ACC Client'}`,
          description,
          location: fullAddress,
          startISO,
          endISO: endDate.toISOString(),
        })

        log('created', `new event for reschedule of ${firstName}, event ${event.id}`)
        return NextResponse.json({ ok: true, action: 'created_from_reschedule', eventId: event.id })
      }

      // Delete old event and create new one at the new time
      // (Google Calendar API's patch doesn't easily update start/end with our setup)
      const service = mapACCServiceType(parsed.inspectionType)
      const endDate = new Date(new Date(startISO).getTime() + service.durationHours * 60 * 60 * 1000)

      // Preserve description from existing event but update key fields
      const { description } = buildEventDescription({
        serviceName: service.name,
        customerName: parsed.clientName || 'ACC Client',
        phone: parsed.clientPhone || '',
        email: parsed.clientEmail || '',
        address: fullAddress,
        sqft: parsed.squareFeet,
        source: 'acc',
        accSubject: subject,
        extra: buildACCExtraLines(parsed),
      })

      await deleteEvent(existing.id)

      const newEvent = await insertEvent({
        summary: `Inspectrum: ${service.name} — ${parsed.clientName || 'ACC Client'}`,
        description,
        location: fullAddress,
        startISO,
        endISO: endDate.toISOString(),
      })

      log('rescheduled', `${firstName}, old ${existing.id} → new ${newEvent.id}`)
      return NextResponse.json({ ok: true, action: 'rescheduled', eventId: newEvent.id })
    } catch (err) {
      log('error', `reschedule failed: ${err.message}`)
      return NextResponse.json({ error: 'Failed to reschedule' }, { status: 500 })
    }
  }

  // 7. Handle Cancelled
  if (result.type === 'cancelled') {
    try {
      const existing = await findMatchingEvent(parsed.clientName, parsed.address || fullAddress)

      if (!existing) {
        log('warn', `no event found to cancel for ${firstName}`)
        return NextResponse.json({ ok: true, action: 'not_found' })
      }

      await deleteEvent(existing.id)
      log('cancelled', `event ${existing.id} for ${firstName}`)
      return NextResponse.json({ ok: true, action: 'cancelled', eventId: existing.id })
    } catch (err) {
      log('error', `cancel failed: ${err.message}`)
      return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, action: 'no_action' })
}
