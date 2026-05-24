/*
 * Shared booking helpers used by /api/book, /api/inbound/acc, and /api/admin/block.
 *
 * These ensure that calendar events created from any source are
 * structurally identical — same description format, same token block,
 * same confirmation code derivation.
 */

import { generateToken, buildTokenBlock, extractToken } from './booking-tokens.js'
import { findEventsBetween } from './google-calendar.js'
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
    `Service: ${fields.serviceName}`,
    `Customer: ${fields.customerName}`,
    `Phone: ${fields.phone || ''}`,
    `Email: ${fields.email || ''}`,
    `Address: ${fields.address || ''}`,
    fields.sqft ? `Square Footage: ${fields.sqft}` : null,
    fields.yearBuilt ? `Year Built: ${fields.yearBuilt} (${new Date().getFullYear() - parseInt(fields.yearBuilt)} yrs)` : null,
    fields.waterType ? `Water Type: ${fields.waterType}` : null,
    fields.garageType ? `Garage: ${fields.garageType}` : null,
    fields.occupied ? `Occupied: ${fields.occupied}` : null,
    fields.orderedBy ? `Ordered By: ${fields.orderedBy}` : null,
    fields.clientAttending ? `Client Attending: ${fields.clientAttending}` : null,
    fields.accessProvidedBy ? `Access: ${fields.accessProvidedBy}` : null,
    fields.pets ? `Pets on Property: Yes` : null,
    fields.radonAddOn ? `Radon Add-On: Yes` : null,
    fields.radonDropDate ? `Radon Drop: ${fields.radonDropDate}` : null,
    fields.radonPickupDate ? `Radon Pickup: ${fields.radonPickupDate}` : null,
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
    sqft: parseField(d, 'Square Footage'),
    paymentStatus: parseField(d, 'payment_status'),
    paymentAmountCents: parseField(d, 'payment_amount_cents'),
    invoiceAmountCents: parseField(d, 'invoice_amount_cents'),
    squareInvoiceUrl: parseField(d, 'square_invoice_url'),
    token: extractToken(d),
    source: d.includes('source: web') ? 'web'
      : d.includes('acc_source: true') ? 'acc'
      : d.includes('source: admin') ? 'admin'
      : 'unknown',
  }
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
 * Fetch all inspections in a date window, parse descriptions, sort by start time.
 * Used by both /admin/inspections page and CSV export.
 *
 * @param {{ from: string, to: string }} opts — ISO date strings (YYYY-MM-DD)
 * @returns {Array} sorted list of parsed inspection objects
 */
export async function getInspectionsInWindow({ from, to }) {
  const timeMin = new Date(`${from}T00:00:00`).toISOString()
  const timeMax = new Date(`${to}T23:59:59`).toISOString()

  const events = await findEventsBetween(timeMin, timeMax)

  const now = new Date()

  const inspections = events.map((event) => {
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

    // Compute temporal status
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
    const eventDateStr = startDate.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
    let status = 'upcoming'
    if (endDate < now) status = 'past'
    else if (eventDateStr === todayStr) status = 'today'

    return {
      eventId: event.id,
      htmlLink: event.htmlLink,
      startISO,
      endISO,
      summary: event.summary || '',
      status,
      ...parsed,
    }
  }).filter(Boolean)

  // Sort by start time, earliest first
  inspections.sort((a, b) => new Date(a.startISO) - new Date(b.startISO))

  return inspections
}
