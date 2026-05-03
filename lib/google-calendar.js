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

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
}

/**
 * Returns an array of { start, end } ISO strings representing busy periods
 * on the booking calendar between timeMin and timeMax.
 */
export async function getBusyRanges(timeMin, timeMax) {
  const auth = getAuth()
  await auth.authorize()
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
  await auth.authorize()
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

/**
 * List events between two ISO timestamps. Returns the full event objects.
 */
export async function findEventsBetween(timeMin, timeMax) {
  const auth = getAuth()
  await auth.authorize()
  const calendar = google.calendar({ version: 'v3', auth })
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  const res = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  })

  return res.data.items || []
}

/**
 * Update an event's description field by event ID.
 */
export async function updateEventDescription(eventId, newDescription) {
  const auth = getAuth()
  await auth.authorize()
  const calendar = google.calendar({ version: 'v3', auth })
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  const res = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: { description: newDescription },
  })

  return res.data
}

/**
 * Delete an event by ID. Returns true if deleted, false if already gone.
 */
export async function deleteEvent(eventId) {
  const auth = getAuth()
  await auth.authorize()
  const calendar = google.calendar({ version: 'v3', auth })
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  try {
    await calendar.events.delete({ calendarId, eventId })
    return true
  } catch (err) {
    if (err.code === 404 || err.code === 410) return false
    throw err
  }
}

/**
 * Get a single event by ID. Returns the event or null if not found.
 */
export async function getEvent(eventId) {
  const auth = getAuth()
  await auth.authorize()
  const calendar = google.calendar({ version: 'v3', auth })
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  try {
    const res = await calendar.events.get({ calendarId, eventId })
    return res.data
  } catch (err) {
    if (err.code === 404 || err.code === 410) return null
    throw err
  }
}

/**
 * Find a single event whose description contains the given booking token.
 * Searches events in the next 90 days. Returns the event or null.
 */
export async function findEventByToken(token) {
  const now = new Date()
  const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const events = await findEventsBetween(now.toISOString(), future.toISOString())
  return events.find((e) => e.description && e.description.includes(`booking_token: ${token}`)) || null
}
