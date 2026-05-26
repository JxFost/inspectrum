/*
 * GET /api/admin/backfill-acc?dryRun=true
 *
 * Reads ACC emails from Shirley's Gmail, parses them with the ACC parser,
 * and matches them to existing calendar events by client name + date.
 * Backfills missing fields (address, phone, email, service, sqft, etc.)
 * into both the calendar event description and the DB.
 *
 * Auth: admin session cookie.
 * Pass ?dryRun=false to actually update events and DB.
 * Pass ?limit=50 to control how many emails to process (default 200).
 */

import { NextResponse } from 'next/server'
import { searchEmails } from '@/lib/gmail'
import { parseACCEmail, isValidACCSender } from '@/lib/acc-email-parser'
import { parseEventDescription, buildEventDescription, mapACCServiceType } from '@/lib/booking'
import { findEventsBetween, updateEventDescription } from '@/lib/google-calendar'
import { upsertInspection } from '@/lib/db-inspections'
import { upsertCustomer } from '@/lib/db-customers'

function verifyAdminSession(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

/**
 * Match a parsed ACC email to an existing calendar event.
 *
 * Strategy (in priority order):
 * 1. Same date + address street match (strongest signal)
 * 2. Same date + last name match in summary/description
 * 3. Same date only (if only one event that day)
 *
 * Shirley's events have abbreviated titles like "Insp - Morris" so we
 * can't match on full client names — last name + date is the key.
 */
function findMatch(accParsed, startISO, accAddress, calendarEvents) {
  const accDate = startISO ? new Date(startISO) : null
  if (!accDate) return null

  // Normalize the ACC street address for comparison
  const accStreet = (accAddress || accParsed.address || '').toLowerCase().trim()
  // Extract just the street number + name (first part before comma)
  const accStreetShort = accStreet.split(',')[0].trim()

  const accName = (accParsed.clientName || '').toLowerCase().trim()
  const accLastName = accName.split(/\s+/).pop() || ''
  // For names like "Tim & Christine Andersen", also grab the last word
  const accNameParts = accName.split(/[\s&]+/).filter((p) => p.length > 2)

  // Find events on the same day (within 24 hours)
  const sameDayEvents = calendarEvents.filter((e) => {
    const eventDate = e.start?.dateTime ? new Date(e.start.dateTime) : null
    if (!eventDate) return false
    return Math.abs(eventDate - accDate) < 24 * 60 * 60 * 1000
  })

  if (sameDayEvents.length === 0) return null

  // Score each same-day event
  const scored = sameDayEvents.map((e) => {
    const desc = (e.description || '').toLowerCase()
    const summary = (e.summary || '').toLowerCase()
    const location = (e.location || '').toLowerCase()
    let score = 0

    // Address match (very strong)
    if (accStreetShort && (
      summary.includes(accStreetShort) ||
      desc.includes(accStreetShort) ||
      location.includes(accStreetShort)
    )) {
      score += 10
    }

    // Last name match
    if (accLastName && accLastName.length > 2 && (
      summary.includes(accLastName) ||
      desc.includes(accLastName)
    )) {
      score += 5
    }

    // Any name part match (for "Insp - Morris" matching "Larry Morris")
    for (const part of accNameParts) {
      if (summary.includes(part) || desc.includes(part)) {
        score += 2
        break
      }
    }

    // City match from summary (Shirley often put city in title)
    const accCity = (accParsed.city || '').toLowerCase()
    if (accCity && summary.includes(accCity)) {
      score += 1
    }

    return { event: e, score }
  })

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Return best match if score > 0, or the only same-day event
  if (scored[0].score > 0) return scored[0].event
  if (sameDayEvents.length === 1) return sameDayEvents[0]

  return null
}

export async function GET(request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') !== 'false'
  const limit = parseInt(searchParams.get('limit'), 10) || 200

  // 1. Fetch ACC emails from Shirley's inbox
  let emails
  try {
    emails = await searchEmails(
      'from:theinspectorsoffice.com subject:(Appointment OR Reschedule) after:2026/01/01',
      limit
    )
  } catch (err) {
    console.error('[backfill-acc] Gmail fetch error:', err.message)
    return NextResponse.json({ error: `Gmail error: ${err.message}` }, { status: 500 })
  }

  // 2. Fetch all calendar events for matching
  let calendarEvents
  try {
    const year = new Date().getFullYear()
    calendarEvents = await findEventsBetween(
      `${year}-01-01T00:00:00Z`,
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    )
  } catch (err) {
    console.error('[backfill-acc] calendar fetch error:', err.message)
    return NextResponse.json({ error: `Calendar error: ${err.message}` }, { status: 500 })
  }

  // 3. Parse each email, deduplicate, and try to match
  //    ACC often sends multiple emails for the same appointment (updates, resends)
  //    Deduplicate by client name + date
  const parsedEmails = []
  const seen = new Set()

  for (const email of emails) {
    const result = parseACCEmail({
      subject: email.subject,
      from: email.from,
      html: email.html,
      plainText: email.plain,
    })

    if (result.type !== 'appointment' && result.type !== 'reschedule') continue

    const { parsed, startISO } = result
    const fullAddress = [parsed.address, parsed.city, parsed.state, parsed.zip]
      .filter(Boolean).join(', ')

    // Dedupe key: client name + date (day only)
    const dedupeKey = `${(parsed.clientName || '').toLowerCase()}|${(startISO || '').slice(0, 10)}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    parsedEmails.push({ result, parsed, startISO, fullAddress, subject: email.subject })
  }

  const results = {
    emailsFound: emails.length,
    uniqueAppointments: parsedEmails.length,
    matched: 0,
    unmatched: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    items: [],
    unmatchedEmails: [],
  }

  for (const { parsed, startISO, fullAddress, subject } of parsedEmails) {
    // Try to match to an existing calendar event
    const match = findMatch(parsed, startISO, fullAddress, calendarEvents)

    if (!match) {
      results.unmatched++
      results.unmatchedEmails.push({
        subject,
        clientName: parsed.clientName,
        date: startISO,
        address: fullAddress,
      })
      continue
    }

    results.matched++

    // Check what fields are missing from the existing event
    const existing = parseEventDescription(match.description)
    const fieldsToUpdate = {}
    let needsUpdate = false

    if (!existing.customerName && parsed.clientName) { fieldsToUpdate.customerName = parsed.clientName; needsUpdate = true }
    if (!existing.phone && parsed.clientPhone) { fieldsToUpdate.phone = parsed.clientPhone; needsUpdate = true }
    if (!existing.email && parsed.clientEmail) { fieldsToUpdate.email = parsed.clientEmail; needsUpdate = true }
    if (!existing.address && fullAddress) { fieldsToUpdate.address = fullAddress; needsUpdate = true }
    if (!existing.sqft && parsed.squareFeet) { fieldsToUpdate.sqft = parsed.squareFeet; needsUpdate = true }
    if (!existing.service && parsed.inspectionType) {
      const service = mapACCServiceType(parsed.inspectionType)
      fieldsToUpdate.service = service.name
      needsUpdate = true
    }

    const record = {
      eventId: match.id,
      originalSummary: match.summary,
      clientName: parsed.clientName,
      fieldsAdded: Object.keys(fieldsToUpdate),
      startISO: match.start?.dateTime,
    }

    if (!needsUpdate) {
      results.skipped++
      record.status = 'already-complete'
      results.items.push(record)
      continue
    }

    if (!dryRun) {
      try {
        // Rebuild the event description with merged data
        let desc = match.description || ''

        // Update specific fields in the description
        if (fieldsToUpdate.customerName && !desc.includes('Customer:')) {
          desc = `Customer: ${fieldsToUpdate.customerName}\n${desc}`
        } else if (fieldsToUpdate.customerName) {
          desc = desc.replace(/Customer:\s*.*/, `Customer: ${fieldsToUpdate.customerName}`)
        }
        if (fieldsToUpdate.phone) {
          if (desc.includes('Phone:')) {
            desc = desc.replace(/Phone:\s*\n?/, `Phone: ${fieldsToUpdate.phone}\n`)
          } else {
            desc = desc.replace(/(Customer:.*\n)/, `$1Phone: ${fieldsToUpdate.phone}\n`)
          }
        }
        if (fieldsToUpdate.email) {
          if (desc.includes('Email:')) {
            desc = desc.replace(/Email:\s*\n?/, `Email: ${fieldsToUpdate.email}\n`)
          } else {
            desc = desc.replace(/(Phone:.*\n)/, `$1Email: ${fieldsToUpdate.email}\n`)
          }
        }
        if (fieldsToUpdate.address) {
          if (desc.includes('Address:')) {
            desc = desc.replace(/Address:\s*\n?/, `Address: ${fieldsToUpdate.address}\n`)
          } else {
            desc = desc.replace(/(Email:.*\n)/, `$1Address: ${fieldsToUpdate.address}\n`)
          }
        }
        if (fieldsToUpdate.sqft && !desc.includes('Square Footage:')) {
          desc = desc.replace(/(Address:.*\n)/, `$1Square Footage: ${fieldsToUpdate.sqft}\n`)
        }
        if (fieldsToUpdate.service && !desc.includes('Service:')) {
          desc = `Service: ${fieldsToUpdate.service}\n${desc}`
        }

        await updateEventDescription(match.id, desc)

        // Update DB too
        await upsertInspection({
          googleEventId: match.id,
          customerName: fieldsToUpdate.customerName || existing.customerName,
          email: fieldsToUpdate.email || existing.email,
          phone: fieldsToUpdate.phone || existing.phone,
          address: fieldsToUpdate.address || existing.address,
          service: fieldsToUpdate.service || existing.service,
          startAt: match.start?.dateTime,
          endAt: match.end?.dateTime,
          rawDescription: desc,
        })

        // Upsert customer if we have an email
        const customerEmail = fieldsToUpdate.email || existing.email
        if (customerEmail) {
          await upsertCustomer({
            email: customerEmail,
            name: fieldsToUpdate.customerName || existing.customerName,
            phone: fieldsToUpdate.phone || existing.phone,
          })
        }

        results.updated++
        record.status = 'updated'
      } catch (err) {
        results.errors++
        record.status = 'error'
        record.error = err.message
      }
    } else {
      record.status = 'dry-run'
      record.wouldUpdate = fieldsToUpdate
    }

    results.items.push(record)
  }

  return NextResponse.json({ dryRun, ...results })
}
