/*
 * Working hours configuration for Inspectrum Inspections.
 *
 * Edit this file to change availability windows, slot intervals, buffer time,
 * or booking constraints. Push the change and Vercel will pick it up — no admin
 * UI needed. All times are interpreted in the TIMEZONE below.
 */

export const TIMEZONE = 'America/Denver'

// Slot length in minutes — every start time is a multiple of this.
export const SLOT_INTERVAL_MINUTES = 60

// Buffer after each booking in minutes (drive time, paperwork, etc.).
export const BUFFER_MINUTES = 30

// How far ahead a customer can book (calendar days).
export const MAX_DAYS_AHEAD = 60

// Minimum lead time in hours — blocks same-day / next-few-hours bookings.
export const MIN_LEAD_HOURS = 24

// Per-day-of-week open/close hours (24-hour clock). null = closed.
// 0 = Sunday, 1 = Monday, …, 6 = Saturday.
export const DAILY_HOURS = {
  0: null,             // Sunday — closed
  1: { open: 8, close: 18 },
  2: { open: 8, close: 18 },
  3: { open: 8, close: 18 },
  4: { open: 8, close: 18 },
  5: { open: 8, close: 18 },
  6: { open: 8, close: 12 },  // Saturday — morning only
}
