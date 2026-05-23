/*
 * ACC (Answering/Call Center) email parser.
 *
 * Parses transactional emails from theinspectorsoffice.com into structured
 * booking data. Handles four email types identified by subject line:
 *   - Appointment — new booking
 *   - Reschedule  — existing booking moved to new time
 *   - Cancelled   — existing booking cancelled
 *   - End of Day Schedule — daily summary (ignored)
 *
 * The parser works from the plain-text body since the HTML is complex nested
 * tables. The plain text has a consistent label/value pattern with lots of
 * whitespace. The subject line is the most reliable source for date, time,
 * city, and address.
 */

import { TIMEZONE } from './working-hours.js'

// ---- Subject line parsing ----

const SUBJECT_PATTERNS = {
  appointment: /^Appointment:\s*(.+)$/i,
  reschedule: /^Reschedule:\s*(.+)$/i,
  cancelled: /^Cancelled:\s*(.+)$/i,
  endOfDay: /^End of Day Schedule$/i,
}

/**
 * Classify an ACC email by its subject line.
 * Returns { type, dateTimeStr, city, state, address } or { type: 'end_of_day' } or { type: 'unknown' }.
 */
export function classifyEmail(subject) {
  if (!subject) return { type: 'unknown' }
  const trimmed = subject.trim()

  if (SUBJECT_PATTERNS.endOfDay.test(trimmed)) {
    return { type: 'end_of_day' }
  }

  for (const [type, pattern] of Object.entries(SUBJECT_PATTERNS)) {
    if (type === 'endOfDay') continue
    const match = trimmed.match(pattern)
    if (match) {
      const rest = match[1].trim()
      // Pattern: "5/22/26 8:30 AM - Evergreen, CO - 4642 Plettner Ln"
      const parts = rest.split(/\s*-\s*/)
      const dateTimeStr = parts[0] || ''
      const cityState = parts[1] || ''
      const address = parts[2] || ''
      const [city, state] = cityState.split(',').map((s) => s.trim())
      return { type, dateTimeStr, city: city || '', state: state || '', address: address || '' }
    }
  }

  return { type: 'unknown' }
}

/**
 * Parse a date/time string like "5/22/26 8:30 AM" into an ISO string in America/Denver.
 */
export function parseACCDateTime(dateTimeStr) {
  if (!dateTimeStr) return null

  // Match: M/D/YY H:MM AM/PM
  const match = dateTimeStr.trim().match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  )
  if (!match) return null

  let [, month, day, year, hours, minutes, ampm] = match
  month = parseInt(month, 10)
  day = parseInt(day, 10)
  year = parseInt(year, 10)
  hours = parseInt(hours, 10)
  minutes = parseInt(minutes, 10)

  // Handle 2-digit year
  if (year < 100) year += 2000

  // Convert to 24-hour
  if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12
  if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0

  // Build date in Denver timezone using Intl to resolve offset
  const rough = new Date(Date.UTC(year, month - 1, day, hours, minutes))
  const utcStr = rough.toLocaleString('en-US', { timeZone: 'UTC' })
  const localStr = rough.toLocaleString('en-US', { timeZone: TIMEZONE })
  const offsetMs = new Date(utcStr) - new Date(localStr)
  const adjusted = new Date(rough.getTime() + offsetMs)

  return adjusted.toISOString()
}

// ---- Plain text body parsing ----

/**
 * Extract a labeled value from the ACC plain text body.
 * Pattern: "Label:\n<whitespace>\n<value>\n" — value is on the next non-empty line.
 */
function extractField(text, label) {
  // Escape regex special chars in label
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Match label followed by optional colon, then capture the next non-empty line
  const regex = new RegExp(`${escaped}:?\\s*\\n([^\\n]*(?:\\n[^\\n]*)?)`, 'i')
  const match = text.match(regex)
  if (!match) return null
  // The value might be on the same line after whitespace, or the next non-blank line
  const lines = match[1].split('\n').map((l) => l.trim()).filter(Boolean)
  return lines[0] || null
}

/**
 * Extract a value that appears right after a label on the same logical line
 * in the plain text. Handles ACC's format where label and value are separated
 * by lots of whitespace.
 */
function extractInlineField(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`${escaped}:?\\s+([^\\n]+)`, 'i')
  const match = text.match(regex)
  if (!match) return null
  const val = match[1].trim()
  return val || null
}

// ---- HTML body parsing ----

/**
 * Strip HTML tags and decode entities, preserving line breaks.
 */
function htmlToText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:tr|td|th|p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
}

/**
 * Extract table cell pairs from HTML. The ACC emails use a consistent pattern:
 * <td>Label:</td><td>Value</td> or <th>Label</th><th>Value</th>
 * Labels may contain nested tags like <u>.
 */
function extractHTMLTablePairs(html) {
  const pairs = {}

  // Extract all th/td cells in order, then pair consecutive ones as label/value
  const cellPattern = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi
  const cells = []
  let match
  while ((match = cellPattern.exec(html)) !== null) {
    cells.push(htmlToText(match[1]).trim())
  }

  // Pair cells: if a cell looks like a label (ends with : or is a known label), pair with next
  for (let i = 0; i < cells.length - 1; i++) {
    const label = cells[i].replace(/:$/, '').trim()
    const value = cells[i + 1]
    // A cell is a label if it ends with ":" or matches known field names
    if (cells[i].endsWith(':') || cells[i].endsWith('?') || KNOWN_LABELS.has(label)) {
      if (value && !pairs[label]) {
        pairs[label] = value
      }
    }
  }

  return pairs
}

const KNOWN_LABELS = new Set([
  "Client's Name", 'Cell Phone', 'Home phone', 'Work Phone', 'Email',
  'Property Address', 'Occupied', 'Utilities On', 'Type of Inspection',
  'Square Feet', 'Year Built', 'Years Old', 'Radon', 'Radon Drop Date',
  'Radon Pickup Date', 'Sewer Scope', 'Contract Deadline Date', 'Status',
  'Date of Inspection', 'Time of Inspection', 'Ordered By', 'Taken By',
  'Provided By', 'Client Attending', 'Company', "Buyer's Agent",
  "Seller's Agent", 'Referred By', 'Water Type', 'Garage', 'Got All Client Names',
  'Pets On Property', 'Inspection Fee', 'Subtotal', 'Total', 'Adjustment',
  'Primary', 'Features', 'Services', 'Other', 'Reason',
  'Home Fax', 'Work Fax', 'Client at Inspection', 'Will Pay',
  'Neighborhood/Subdivision', 'Cross Street', 'Directions',
  'Time Attending', 'Company Name', 'Inspector', 'Contract',
  "Multi-Family, ADD'L Units",
])

/**
 * Parse the full ACC email body (HTML preferred, falls back to plain text).
 * Returns a structured object with all extracted fields.
 */
export function parseACCBody(html, plainText) {
  const result = {
    clientName: null,
    clientPhone: null,
    clientEmail: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    occupied: null,
    utilitiesOn: null,
    inspectionType: null,
    squareFeet: null,
    yearBuilt: null,
    totalFee: null,
    radon: null,
    radonDropDate: null,
    radonPickupDate: null,
    sewerScope: null,
    comments: null,
    accessProvidedBy: null,
    orderedBy: null,
    takenBy: null,
    contractDeadline: null,
    clientAttending: null,
    buyersAgent: null,
    sellersAgent: null,
    referredBy: null,
    status: null,
    dateOfInspection: null,
    timeOfInspection: null,
    cancelReason: null,
  }

  // Parse from HTML first (more structured)
  if (html) {
    const pairs = extractHTMLTablePairs(html)
    const text = htmlToText(html)

    result.clientName = pairs["Client's Name"] || null
    result.clientPhone = pairs['Cell Phone'] || pairs['Home phone'] || pairs['Work Phone'] || null
    result.clientEmail = pairs['Email'] || null
    result.status = pairs['Status'] || null
    result.inspectionType = pairs['Type of Inspection'] || null
    result.squareFeet = pairs['Square Feet'] || null
    result.yearBuilt = pairs['Year Built'] || null
    result.occupied = pairs['Occupied'] || null
    result.utilitiesOn = pairs['Utilities On'] || null
    result.orderedBy = pairs['Ordered By'] || null
    result.takenBy = pairs['Taken By'] || null
    result.accessProvidedBy = pairs['Provided By'] || null
    result.clientAttending = pairs['Client Attending'] || null
    result.radon = pairs['Radon'] || null
    result.radonDropDate = pairs['Radon Drop Date'] || null
    result.radonPickupDate = pairs['Radon Pickup Date'] || null
    result.sewerScope = pairs['Sewer Scope'] || null
    result.contractDeadline = pairs['Contract Deadline Date'] || null
    result.referredBy = pairs['Referred By'] || null

    // Property address — look for the structured block
    const addrMatch = html.match(/Property Address:<\/u><\/th>\s*<th[^>]*>([\s\S]*?)<\/th>/i)
    if (addrMatch) {
      const addrText = htmlToText(addrMatch[1]).trim()
      const lines = addrText.split('\n').map((l) => l.trim()).filter(Boolean)
      if (lines.length >= 2) {
        result.address = lines[0]
        const cityStateZip = lines[1].match(/^(.+),\s*(\w{2})\s*(\d{5})$/)
        if (cityStateZip) {
          result.city = cityStateZip[1]
          result.state = cityStateZip[2]
          result.zip = cityStateZip[3]
        }
      } else if (lines.length === 1) {
        result.address = lines[0]
      }
    }

    // Date/time of inspection from HTML
    result.dateOfInspection = pairs['Date of Inspection'] || null
    result.timeOfInspection = pairs['Time of Inspection'] || null

    // Buyer's agent
    const baMatch = html.match(/Buyer's Agent:<\/td>\s*<td[^>]*>([^<]+)/i)
    if (baMatch) {
      const baName = baMatch[1].trim()
      if (baName) {
        const baCompany = pairs['Company'] || null
        const baPhone = null // extracted separately below
        const baEmail = null
        result.buyersAgent = { name: baName, company: baCompany, phone: baPhone, email: baEmail }
      }
    }

    // Seller's agent
    const saMatch = html.match(/Seller's Agent:<\/td>\s*<td[^>]*>([^<]+)/i)
    if (saMatch) {
      const saName = saMatch[1].trim()
      if (saName) {
        result.sellersAgent = { name: saName }
      }
    }

    // Total fee
    const totalMatch = text.match(/Total[\s\S]*?\$\s*([\d,]+)/i)
    if (totalMatch) {
      result.totalFee = totalMatch[1].replace(/,/g, '')
    }

    // Cancel reason (appears in cancelled emails)
    const reasonMatch = html.match(/Reason:<\/th>\s*<th[^>]*>([\s\S]*?)<\/th>/i)
    if (reasonMatch) {
      result.cancelReason = htmlToText(reasonMatch[1]).trim() || null
    }

    // Comments
    const commentsMatch = html.match(/Comments:<\/td><\/tr>\s*<tr>\s*<td[^>]*>([\s\S]*?)<\/td>/i)
    if (commentsMatch) {
      const comment = htmlToText(commentsMatch[1]).trim()
      if (comment) result.comments = comment
    }
  }

  // Fall back to plain text for any missing fields
  if (plainText) {
    const text = plainText

    if (!result.clientName) result.clientName = extractField(text, "Client's Name")
    if (!result.clientPhone) result.clientPhone = extractField(text, 'Cell Phone')
    if (!result.clientEmail) result.clientEmail = extractField(text, 'Email')
    if (!result.inspectionType) {
      const typeMatch = text.match(/Type of Inspection\s*\n\s*(.+)/i)
      if (typeMatch) result.inspectionType = typeMatch[1].trim()
    }
    if (!result.squareFeet) {
      const sqftMatch = text.match(/Square Feet(\d+)/i)
      if (sqftMatch) result.squareFeet = sqftMatch[1]
    }
    if (!result.totalFee) {
      const feeMatch = text.match(/\$\s*([\d,]+)\s*$/m)
      if (feeMatch) result.totalFee = feeMatch[1].replace(/,/g, '')
    }
    if (!result.address) {
      const addrMatch = text.match(/Property Address:\s*\n\s*\n\s*(.+)\n\s*(.+,\s*\w{2}\s*\d{5})/i)
      if (addrMatch) {
        result.address = addrMatch[1].trim()
        const csz = addrMatch[2].trim().match(/^(.+),\s*(\w{2})\s*(\d{5})$/)
        if (csz) {
          result.city = csz[1]
          result.state = csz[2]
          result.zip = csz[3]
        }
      }
    }
    if (!result.takenBy) result.takenBy = extractField(text, 'Taken By')
    if (!result.cancelReason) {
      const reasonMatch = text.match(/Reason:\s*\n\s*\n\s*(.+)/i)
      if (reasonMatch) result.cancelReason = reasonMatch[1].trim()
    }
  }

  // Clean up whitespace in all string fields
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      result[key] = result[key].replace(/\s+/g, ' ').trim() || null
    }
  }

  return result
}

/**
 * Verify the sender domain matches the expected ACC domain.
 */
export function isValidACCSender(fromAddress) {
  if (!fromAddress) return false
  return /@theinspectorsoffice\.com\b/i.test(fromAddress)
}

/**
 * Full parse of an ACC email. Takes subject, from, html body, and plain text body.
 * Returns { type, subject, parsed } where parsed contains all extracted fields
 * plus the computed startISO.
 */
export function parseACCEmail({ subject, from, html, plainText }) {
  const classification = classifyEmail(subject)

  if (classification.type === 'end_of_day' || classification.type === 'unknown') {
    return { type: classification.type, subject }
  }

  const parsed = parseACCBody(html, plainText)

  // Build full address from subject if body parsing didn't get it
  if (!parsed.address && classification.address) {
    parsed.address = classification.address
  }
  if (!parsed.city && classification.city) {
    parsed.city = classification.city
  }
  if (!parsed.state && classification.state) {
    parsed.state = classification.state
  }

  // Compute startISO from subject's date/time
  const startISO = parseACCDateTime(classification.dateTimeStr)

  return {
    type: classification.type,
    subject,
    startISO,
    parsed,
  }
}
