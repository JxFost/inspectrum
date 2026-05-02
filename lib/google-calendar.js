/*
 * Google Calendar helpers — service-account auth, freebusy query, event insert.
 *
 * Uses a service account so there's no OAuth flow or token refresh to worry
 * about. The booking calendar must be shared with the service account's email
 * address (Editor role) for both reads and writes to work.
 *
 * Environment variables:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL — the service account's email
 *   GOOGLE_PRIVATE_KEY           — the PEM private key (with literal \n)
 *   GOOGLE_CALENDAR_ID           — the calendar to query / write to
 */

import { google } from 'googleapis'

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  if (!email || !rawKey || !calendarId) {
    throw new Error('Missing Google Calendar env vars. See SCHEDULER_SETUP.md.')
  }

  // The private key is stored with literal "\n" in env vars — convert to real newlines.
  const key = rawKey.replace(/\\n/g, '\n')

  return new google.auth.JWT(email, null, key, [
    'https://www.googleapis.com/auth/calendar',
  ])
}

/**
 * Returns an array of { start, end } ISO strings representing busy periods
 * on the booking calendar between timeMin and timeMax.
 */
export async function getBusyRanges(timeMin, timeMax) {
  const auth = getAuth()
  const calendar = google.calendar({ version: 'v3', auth })
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: 'UTC',
      items: [{ id: calendarId }],
    },
  })

  return res.data.calendars[calendarId].busy || []
}

/**
 * Inserts a booking event on the calendar and returns the created event object.
 */
export async function insertEvent({ summary, description, location, startISO, endISO }) {
  const auth = getAuth()
  const calendar = google.calendar({ version: 'v3', auth })
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      description,
      location,
      start: { dateTime: startISO },
      end: { dateTime: endISO },
    },
  })

  return res.data
}
