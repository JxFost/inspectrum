/*
 * Shared booking helpers used by /api/book, /api/inbound/acc, and /api/admin/block.
 *
 * These ensure that calendar events created from any source are
 * structurally identical — same description format, same token block,
 * same confirmation code derivation.
 */

import { generateToken, buildTokenBlock } from './booking-tokens.js'
import { SERVICES } from './services.js'

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
