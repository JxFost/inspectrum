/*
 * Slot computation — pure function, no side effects.
 *
 * Given a date string (YYYY-MM-DD), a service duration, and an array of busy
 * ranges from Google Calendar, returns the available start times. All
 * reasoning happens in the configured IANA timezone so Vercel's UTC runtime
 * doesn't cause off-by-one-day bugs.
 */

import {
  TIMEZONE,
  SLOT_INTERVAL_MINUTES,
  BUFFER_MINUTES,
  MIN_LEAD_HOURS,
  MAX_DAYS_AHEAD,
  DAILY_HOURS,
} from './working-hours.js'

/**
 * Convert a Date to "HH:MM" in the configured timezone.
 */
function toLocalHHMM(date) {
  return date.toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get the day-of-week (0-6) for a date in the configured timezone.
 */
function localDayOfWeek(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
  }).formatToParts(date)
  const wd = parts.find((p) => p.type === 'weekday').value
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd)
}

/**
 * Build a Date from a YYYY-MM-DD string and HH:MM time in TIMEZONE.
 * Uses Intl to resolve the correct UTC offset for that date/time.
 */
function buildDateInTZ(dateStr, hours, minutes) {
  // Create a rough UTC guess, then adjust by the actual offset.
  const [year, month, day] = dateStr.split('-').map(Number)
  const rough = new Date(Date.UTC(year, month - 1, day, hours, minutes))

  // Determine the offset between UTC and TIMEZONE at this rough time.
  const utcStr = rough.toLocaleString('en-US', { timeZone: 'UTC' })
  const localStr = rough.toLocaleString('en-US', { timeZone: TIMEZONE })
  const offsetMs = new Date(utcStr) - new Date(localStr)

  return new Date(rough.getTime() + offsetMs)
}

/**
 * Format an hour (24h) as "8:00 AM" style label.
 */
function formatSlotLabel(hours, minutes) {
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  const m = String(minutes).padStart(2, '0')
  return `${h}:${m} ${ampm}`
}

// Fixed booking windows — only 8:00 AM and 1:00 PM are offered.
// Each window requires a full 4-hour block + 1-hour buffer to be free.
const FIXED_WINDOWS = [
  { hour: 8, minute: 0, label: '8:00 AM' },
  { hour: 13, minute: 0, label: '1:00 PM' },
]

// Minimum duration (hours) a window must have clear to be bookable.
const WINDOW_DURATION_HOURS = 4

/**
 * Returns available slots for a given date and service.
 *
 * Only offers fixed windows (8 AM and 1 PM). A window is available
 * if the full 4-hour block + 1-hour buffer on each side is free
 * of any calendar conflicts.
 *
 * @param {string} dateStr — "YYYY-MM-DD"
 * @param {number} durationHours — how long the service takes
 * @param {Array<{start: string, end: string}>} busyRanges — from Google freebusy
 * @returns {Array<{label: string, startISO: string, endISO: string}>}
 */
export function computeSlots(dateStr, durationHours, busyRanges) {
  // Figure out the day-of-week in local TZ.
  const refDate = buildDateInTZ(dateStr, 12, 0)
  const dow = localDayOfWeek(refDate)
  const hours = DAILY_HOURS[dow]

  if (!hours) return [] // Closed that day.

  // Enforce max days ahead.
  const now = new Date()
  const dayStart = buildDateInTZ(dateStr, 0, 0)
  const daysAhead = (dayStart - now) / (1000 * 60 * 60 * 24)
  if (daysAhead > MAX_DAYS_AHEAD) return []

  // Earliest allowed booking time (MIN_LEAD_HOURS from now).
  const earliestAllowed = new Date(now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000)

  // Use the larger of service duration or the fixed window minimum
  const effectiveDuration = Math.max(durationHours, WINDOW_DURATION_HOURS)
  const durationMs = effectiveDuration * 60 * 60 * 1000
  const bufferMs = BUFFER_MINUTES * 60 * 1000

  // Convert busy ranges to ms timestamps for fast comparison.
  const busy = busyRanges.map((r) => ({
    start: new Date(r.start).getTime(),
    end: new Date(r.end).getTime(),
  }))

  const slots = []

  for (const window of FIXED_WINDOWS) {
    // Skip if window is outside business hours
    if (window.hour < hours.open || window.hour + effectiveDuration > hours.close) continue

    const slotStart = buildDateInTZ(dateStr, window.hour, window.minute).getTime()
    const slotEnd = slotStart + durationMs

    // Skip if this slot starts before the min lead time
    if (slotStart < earliestAllowed.getTime()) continue

    // Check if slot overlaps any busy range (with travel buffer on both sides)
    const overlaps = busy.some(
      (b) => slotStart < (b.end + bufferMs) && slotEnd > (b.start - bufferMs)
    )
    if (overlaps) continue

    const startDate = new Date(slotStart)
    const endDate = new Date(slotStart + durationHours * 60 * 60 * 1000) // actual service duration for the event

    slots.push({
      label: window.label,
      startISO: startDate.toISOString(),
      endISO: endDate.toISOString(),
    })
  }

  return slots
}
