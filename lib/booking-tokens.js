/*
 * Booking token utilities.
 *
 * Tokens are unguessable UUIDs stored inside Google Calendar event descriptions
 * as a structured tag. This lets customers manage their booking via a link
 * without needing an account or a database — the calendar is the source of truth.
 */

import { randomUUID } from 'crypto'

const TOKEN_PREFIX = 'booking_token:'
const REMINDER_MARKER = 'reminder_sent: true'

export function generateToken() {
  return randomUUID()
}

/**
 * Build the structured block that gets appended to an event description.
 */
export function buildTokenBlock(token) {
  return `\n---\n${TOKEN_PREFIX} ${token}\n`
}

/**
 * Extract the booking token from an event description, or null if not found.
 */
export function extractToken(description) {
  if (!description) return null
  const match = description.match(new RegExp(`${TOKEN_PREFIX}\\s*([\\w-]+)`))
  return match ? match[1] : null
}

/**
 * Check whether the event description has the reminder-sent marker.
 */
export function hasReminderMarker(description) {
  return !!description && description.includes(REMINDER_MARKER)
}

/**
 * Append the reminder-sent marker to a description string.
 */
export function appendReminderMarker(description) {
  return `${description}\n${REMINDER_MARKER}\n`
}

/**
 * Build an absolute URL to the manage page for a given token.
 */
export function buildManageUrl(token) {
  const base = process.env.PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${base}/manage?token=${token}`
}
