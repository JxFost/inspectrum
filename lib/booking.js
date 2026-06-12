/*
 * Shared booking helpers used by /api/book, /api/inbound/acc, and /api/admin/block.
 *
 * These ensure that calendar events created from any source are
 * structurally identical — same description format, same token block,
 * same confirmation code derivation.
 */

import { generateToken, buildTokenBlock, extractToken } from './booking-tokens.js'
import { findEventsBetween, getEvent, updateEventDescription } from './google-calendar.js'
import { getInspectionsFromDB } from './db-inspections.js'
import { SERVICES } from './services.js'
import { TIMEZONE } from './working-hours.js'

/**
 * Build the structured event description that all booking sources share.
 *
 * @param {object} fields
 * @param {string} fields.serviceName — display name of the service
 * @param {string} fields.customerName
 * @param {string} fields.phone
 * @param {string} fields.email
 * @param {string} fields.address
 * @param {string} [fields.sqft] — square footage
 * @param {string} [fields.yearBuilt] — year the structure was built
 * @param {string} [fields.waterType] — Public Water, Well Water, etc.
 * @param {string} [fields.garageType] — Attached, Detached, None
 * @param {string} [fields.occupied] — Yes/No
 * @param {string} [fields.notes] — free-form customer notes from the intake form
 * @param {boolean} [fields.radonAddOn] — whether radon testing was added
 * @param {string} [fields.radonDropDate] — radon drop date
 * @param {string} [fields.radonPickupDate] — radon pickup date
 * @param {string} [fields.source] — 'website', 'acc', 'admin'
 * @param {string} [fields.token] — booking token (generated if omitted)
 * @param {string} [fields.extra] — additional lines (ACC details, admin notes, etc.)
 * @param {string} [fields.accSubject] — original ACC subject line for traceability
 * @returns {{ description: string, token: string }}
 */
export function buildEventDescription(fields) {
  const token = fields.token || generateToken()
  const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:3000'

  const sourceLabel = {
    website: `Booked via ${siteUrl}`,
    acc: 'Booked via ACC (call center)',
    admin: 'Created by admin',
  }[fields.source] || `Booked via ${siteUrl}`

  const lines = [
    fields.inspectionNumber ? `inspection_number: ${fields.inspectionNumber}` : null,
    `Service: ${fields.serviceName}`,
    `Customer: ${fields.customerName}`,
    `Phone: ${fields.phone || ''}`,
    `Email: ${fields.email || ''}`,
    `Address: ${fields.address || ''}`,
    fields.sqft ? `Square Footage: ${fields.sqft}` : null,
    fields.yearBuilt ? `Year Built: ${fields.yearBuilt} (${new Date().getFullYear() - parseInt(fields.yearBuilt)} yrs)` : null,
    fields.waterType ? `Water Type: ${fields.waterType}` : null,
    fields.garageType ? `Garage: ${fields.garageType}` : null,
    fields.outbuilding ? `Outbuilding: ${fields.outbuilding}` : null,
    fields.occupied ? `Occupied: ${fields.occupied}` : null,
    fields.orderedBy ? `Ordered By: ${fields.orderedBy}` : null,
    fields.clientAttending ? `Client Attending: ${fields.clientAttending}` : null,
    fields.accessProvidedBy ? `Access: ${fields.accessProvidedBy}` : null,
    fields.clientAgentEmail ? `Client Agent Email: ${fields.clientAgentEmail}` : null,
    fields.pets ? `Pets on Property: Yes` : null,
    fields.radonAddOn ? `Radon Add-On: Yes` : null,
    fields.radonDropDate ? `Radon Drop: ${fields.radonDropDate}` : null,
    fields.radonPickupDate ? `Radon Pickup: ${fields.radonPickupDate}` : null,
    fields.sewerScope ? `Sewer Scope: Yes` : null,
    fields.notes ? `Notes: ${fields.notes}` : null,
    fields.distanceMiles != null ? `distance_miles: ${fields.distanceMiles}` : null,
    fields.tripChargeCents ? `trip_charge_cents: ${fields.tripChargeCents}` : null,
    fields.geoLat != null ? `geo_lat: ${fields.geoLat}` : null,
    fields.geoLng != null ? `geo_lng: ${fields.geoLng}` : null,
    fields.source === 'website' ? `source: web` : null,
    fields.source === 'admin' ? `source: admin` : null,
    fields.accSubject ? `acc_source: true` : null,
    fields.accSubject ? `acc_subject: ${fields.accSubject}` : null,
    fields.extra || null,
    '',
    sourceLabel,
    buildTokenBlock(token),
  ].filter((v) => v !== null).join('\n')

  return { description: lines, token }
}

/**
 * Derive a short confirmation code from a Google Calendar event ID.
 */
export function extractConfirmationCode(eventId) {
  return eventId
    ? eventId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
    : 'CONFIRMED'
}

/**
 * Map an ACC inspection type string to our service catalog.
 * Returns the matched service or defaults to 'full' (Full Home Inspection).
 */
export function mapACCServiceType(inspectionType) {
  if (!inspectionType) return SERVICES.find((s) => s.id === 'full')

  const lower = inspectionType.toLowerCase()

  // Radon-only
  if (/^radon\b/i.test(lower) && !/house|home|inspection/i.test(lower)) {
    return SERVICES.find((s) => s.id === 'radon')
  }

  // Mold
  if (/mold/i.test(lower)) {
    return SERVICES.find((s) => s.id === 'mold')
  }

  // Pre-listing
  if (/pre-?list/i.test(lower)) {
    return SERVICES.find((s) => s.id === 'pre-listing')
  }

  // Default to full inspection for everything else
  // (Whole House, Multi-Family, Condo, Townhome, etc.)
  return SERVICES.find((s) => s.id === 'full')
}

// ---- Description parser ----

function parseField(description, field) {
  if (!description) return null
  const match = description.match(new RegExp(`${field}:\\s*(.+)`))
  return match ? match[1].trim() || null : null
}

/**
 * Parse a calendar event description into structured booking fields.
 */
export function parseEventDescription(description) {
  const d = description || ''
  return {
    service: parseField(d, 'Service'),
    customerName: parseField(d, 'Customer'),
    phone: parseField(d, 'Phone'),
    email: parseField(d, 'Email'),
    address: parseField(d, 'Address'),
    clientAgentEmail: parseField(d, 'Client Agent Email'),
    sqft: parseField(d, 'Square Footage'),
    notes: parseField(d, 'Notes'),
    paymentStatus: parseField(d, 'payment_status'),
    paymentAmountCents: parseField(d, 'payment_amount_cents'),
    invoiceAmountCents: parseField(d, 'invoice_amount_cents'),
    squareInvoiceUrl: parseField(d, 'square_invoice_url'),
    invoicedAt: parseField(d, 'invoiced_at'),
    distanceMiles: parseField(d, 'distance_miles'),
    tripChargeCents: parseField(d, 'trip_charge_cents'),
    feedbackRating: parseField(d, 'feedback_rating'),
    inspectionNumber: parseField(d, 'inspection_number'),
    geoLat: parseField(d, 'geo_lat'),
    geoLng: parseField(d, 'geo_lng'),
    token: extractToken(d),
    source: d.includes('source: web') ? 'web'
      : d.includes('acc_source: true') ? 'acc'
      : d.includes('source: admin') ? 'admin'
      : 'unknown',
  }
}

/**
 * Merge two event descriptions for the same job — used when a booking source
 * re-sends details with amendments (e.g. an updated ACC appointment email).
 *
 * The new description wins for shared fields, but labeled lines that only
 * exist in the old description are carried over: system markers added after
 * booking (payment_status, reminder_sent, ...) and fields the new email
 * dropped. Comments are kept from both versions when the new text doesn't
 * already contain the old.
 */
export function mergeEventDescriptions(oldDescription, newDescription) {
  if (!oldDescription) return newDescription
  if (!newDescription) return oldDescription

  const labelOf = (line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_'() /-]*):(?:\s|$)/)
    return match ? match[1].trim().toLowerCase() : null
  }
  const valueOf = (line) => line.slice(line.indexOf(':') + 1).trim()

  const newLines = newDescription.split('\n')
  const newLabelIndex = new Map()
  newLines.forEach((line, i) => {
    const label = labelOf(line)
    if (label && !newLabelIndex.has(label)) newLabelIndex.set(label, i)
  })

  const carried = []
  for (const line of oldDescription.split('\n')) {
    const label = labelOf(line)
    if (!label) continue
    const value = valueOf(line)
    if (!value) continue

    if (!newLabelIndex.has(label)) {
      carried.push(line)
      continue
    }

    const idx = newLabelIndex.get(label)
    const newValue = valueOf(newLines[idx])
    if (!newValue) {
      // New version kept the label but lost the value — restore the old line
      newLines[idx] = line
    } else if (label === 'comments' && !newValue.toLowerCase().includes(value.toLowerCase())) {
      carried.push(`Prior Comments: ${value}`)
    }
  }

  if (carried.length === 0) return newLines.join('\n')

  // Insert carried lines before the blank line that precedes the footer
  let insertAt = newLines.findIndex((l) => l.trim() === '')
  if (insertAt === -1) insertAt = newLines.length
  newLines.splice(insertAt, 0, ...carried)
  return newLines.join('\n')
}

/**
 * Compute the next inspection number for the current year.
 * Format: YYYY-NNN (e.g., 2026-045). Gaps from cancellations are expected.
 */
export async function getNextInspectionNumber() {
  const year = new Date().getFullYear()
  const yearStart = `${year}-01-01T00:00:00Z`
  const yearEnd = `${year}-12-31T23:59:59Z`

  let events
  try {
    events = await findEventsBetween(yearStart, yearEnd)
  } catch {
    return `${year}-001`
  }

  // INSPECTION_NUMBER_OFFSET accounts for inspections done before the system went live
  const offset = parseInt(process.env.INSPECTION_NUMBER_OFFSET, 10) || 0
  let maxNum = offset
  for (const event of events) {
    const desc = event.description || ''
    const match = desc.match(/inspection_number:\s*\d{4}-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  }

  return `${year}-${String(maxNum + 1).padStart(3, '0')}`
}

/**
 * Map a service name string to a service ID for pill coloring.
 */
export function serviceNameToId(serviceName) {
  if (!serviceName) return null
  const s = SERVICES.find((svc) => svc.name === serviceName)
  return s ? s.id : null
}

// ---- Inspections window fetcher ----

/**
 * Fetch all inspections in a date window, sort by start time.
 *
 * Hybrid reads:
 * - Past dates (before today) → read from Postgres DB (faster, no API calls)
 * - Today + future → read from Google Calendar (real-time accuracy)
 *
 * Falls back to calendar-only if DB read fails.
 *
 * @param {{ from: string, to: string }} opts — ISO date strings (YYYY-MM-DD)
 * @returns {Array} sorted list of parsed inspection objects
 */
export async function getInspectionsInWindow({ from, to }) {
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  const requestedFrom = from
  const requestedTo = to

  const inspections = []

  // --- Past portion: read from DB ---
  if (requestedFrom < todayStr) {
    const pastEnd = requestedTo < todayStr ? requestedTo : todayStr
    const pastFromISO = new Date(`${requestedFrom}T00:00:00`).toISOString()
    const pastToISO = new Date(`${pastEnd}T00:00:00`).toISOString()

    try {
      const dbRows = await getInspectionsFromDB(pastFromISO, pastToISO)

      for (const row of dbRows) {
        const startISO = row.start_at?.toISOString?.() || row.start_at
        const endISO = row.end_at?.toISOString?.() || row.end_at
        if (!startISO) continue

        const gcalLink = row.google_event_id
          ? `https://calendar.google.com/calendar/r/event/${row.google_event_id}?cid=${encodeURIComponent(calendarId)}`
          : null

        inspections.push({
          eventId: row.google_event_id,
          htmlLink: gcalLink,
          startISO,
          endISO,
          summary: '',
          status: 'past',
          service: row.service,
          customerName: row.customer_name,
          phone: row.phone,
          email: row.email,
          address: row.address,
          sqft: null,
          paymentStatus: row.payment_status,
          paymentAmountCents: row.payment_amount_cents ? String(row.payment_amount_cents) : null,
          invoiceAmountCents: row.invoice_amount_cents ? String(row.invoice_amount_cents) : null,
          squareInvoiceUrl: null,
          distanceMiles: row.distance_miles ? String(row.distance_miles) : null,
          tripChargeCents: row.trip_charge_cents ? String(row.trip_charge_cents) : null,
          feedbackRating: row.feedback_rating ? String(row.feedback_rating) : null,
          inspectionNumber: row.inspection_number,
          geoLat: row.geo_lat ? String(row.geo_lat) : null,
          geoLng: row.geo_lng ? String(row.geo_lng) : null,
          token: row.token,
          source: row.source || 'unknown',
          radonAddOn: (row.raw_description || '').includes('Radon Add-On: Yes'),
          sewerScope: (row.raw_description || '').includes('Sewer Scope: Yes'),
        })
      }
    } catch (err) {
      // Fallback: read past from calendar if DB fails
      console.warn('[inspections] DB read failed, falling back to calendar:', err.message)
      const fallbackEvents = await findEventsBetween(
        new Date(`${requestedFrom}T00:00:00`).toISOString(),
        new Date(`${todayStr}T00:00:00`).toISOString()
      )
      inspections.push(...parseCalendarEvents(fallbackEvents, now, calendarId))
    }
  }

  // --- Today + future portion: read from calendar ---
  if (requestedTo >= todayStr) {
    const calFrom = requestedFrom >= todayStr ? requestedFrom : todayStr
    const calFromISO = new Date(`${calFrom}T00:00:00`).toISOString()
    const calToISO = new Date(`${requestedTo}T23:59:59`).toISOString()

    const events = await findEventsBetween(calFromISO, calToISO)
    inspections.push(...parseCalendarEvents(events, now, calendarId))
  }

  // Sort by start time, earliest first
  inspections.sort((a, b) => new Date(a.startISO) - new Date(b.startISO))

  return inspections
}

/**
 * Parse calendar events into the standard inspection format.
 */
function parseCalendarEvents(events, now, calendarId) {
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: TIMEZONE })

  return events.map((event) => {
    const startISO = event.start?.dateTime
    const endISO = event.end?.dateTime
    if (!startISO) return null

    let parsed
    try {
      parsed = parseEventDescription(event.description)
    } catch (err) {
      console.warn(`[inspections] failed to parse event ${event.id}:`, err.message)
      parsed = {
        service: null, customerName: null, phone: null, email: null,
        address: null, sqft: null, paymentStatus: null, paymentAmountCents: null,
        invoiceAmountCents: null, squareInvoiceUrl: null, token: null, source: 'unknown',
      }
    }

    const startDate = new Date(startISO)
    const endDate = endISO ? new Date(endISO) : startDate
    const eventDateStr = startDate.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
    let status = 'upcoming'
    if (endDate < now) status = 'past'
    else if (eventDateStr === todayStr) status = 'today'

    const gcalLink = `https://calendar.google.com/calendar/r/event/${event.id}?cid=${encodeURIComponent(calendarId)}`

    const desc = event.description || ''
    return {
      eventId: event.id,
      htmlLink: gcalLink,
      startISO,
      endISO,
      summary: event.summary || '',
      status,
      ...parsed,
      radonAddOn: desc.includes('Radon Add-On: Yes'),
      sewerScope: desc.includes('Sewer Scope: Yes'),
    }
  }).filter(Boolean)
}

// ---- Payment status helpers ----

/**
 * Append structured payment fields to a calendar event description.
 * Reads current description, appends new fields before the token block.
 */
export async function markInvoiceCreated(eventId, { invoiceId, invoiceUrl, customerId, amountCents }) {
  const event = await getEvent(eventId)
  if (!event) throw new Error(`Event ${eventId} not found`)

  const desc = event.description || ''
  const paymentBlock = [
    `square_invoice_id: ${invoiceId}`,
    invoiceUrl ? `square_invoice_url: ${invoiceUrl}` : null,
    customerId ? `square_customer_id: ${customerId}` : null,
    `invoice_amount_cents: ${amountCents}`,
    `payment_status: pending`,
    `invoiced_at: ${new Date().toISOString()}`,
  ].filter(Boolean).join('\n')

  // Insert payment fields before the token block separator
  const updated = desc.includes('\n---\n')
    ? desc.replace('\n---\n', `\n${paymentBlock}\n\n---\n`)
    : `${desc}\n${paymentBlock}`

  await updateEventDescription(eventId, updated)
  console.log(`[square] marked event ${eventId} as invoiced, invoice ${invoiceId}`)
}

/**
 * Update payment status on a calendar event by searching for its square_invoice_id.
 */
export async function updatePaymentStatusByInvoiceId(invoiceId, status, additionalFields = {}) {
  // Search recent + upcoming events for the invoice ID
  const now = new Date()
  const past = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const events = await findEventsBetween(past.toISOString(), future.toISOString())
  const event = events.find((e) => e.description?.includes(`square_invoice_id: ${invoiceId}`))

  if (!event) {
    console.warn(`[square-webhook] no event found for invoice ${invoiceId}`)
    return null
  }

  let desc = event.description || ''

  // Update payment_status
  if (desc.includes('payment_status:')) {
    desc = desc.replace(/payment_status:\s*.+/, `payment_status: ${status}`)
  } else {
    desc += `\npayment_status: ${status}`
  }

  // Add additional fields
  for (const [key, value] of Object.entries(additionalFields)) {
    if (desc.includes(`${key}:`)) {
      desc = desc.replace(new RegExp(`${key}:\\s*.+`), `${key}: ${value}`)
    } else {
      // Insert before token block
      desc = desc.includes('\n---\n')
        ? desc.replace('\n---\n', `\n${key}: ${value}\n\n---\n`)
        : `${desc}\n${key}: ${value}`
    }
  }

  await updateEventDescription(event.id, desc)
  console.log(`[square-webhook] updated event ${event.id}: payment_status → ${status}`)
  return event.id
}
