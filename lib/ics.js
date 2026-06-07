/*
 * Minimal iCalendar (.ics) generator for booking confirmations.
 *
 * Produces a single-event VCALENDAR string so customers on Apple Calendar,
 * Outlook, etc. can one-tap add the appointment (the booking confirmation
 * already includes a Google "Add to Calendar" link; this covers everyone else).
 */

function fmtICSDate(iso) {
  // 2026-07-30T14:00:00.000Z -> 20260730T140000Z (UTC)
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeICS(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * @param {object} opts
 * @param {string} opts.title    — event summary
 * @param {string} opts.startISO
 * @param {string} opts.endISO
 * @param {string} [opts.location]
 * @param {string} [opts.description]
 * @param {string} opts.uid      — stable unique id (e.g. confirmation code)
 * @returns {string} CRLF-delimited VCALENDAR text
 */
export function buildICS({ title, startISO, endISO, location, description, uid }) {
  const dtstamp = fmtICSDate(new Date().toISOString())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Inspectrum Inspections//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeICS(uid)}@evergreeninspections.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${fmtICSDate(startISO)}`,
    `DTEND:${fmtICSDate(endISO)}`,
    `SUMMARY:${escapeICS(title)}`,
    location ? `LOCATION:${escapeICS(location)}` : null,
    description ? `DESCRIPTION:${escapeICS(description)}` : null,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  // iCalendar requires CRLF line endings
  return lines.join('\r\n')
}
