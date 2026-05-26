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
 * Strategy: match by client last name + date (within 1 day tolerance).
 */
function findMatch(accParsed, startISO, calendarEvents) {
  if (!accParsed.clientName) return null

  const accName = accParsed.clientName.toLowerCase().trim()
  const accDate = startISO ? new Date(startISO) : null

  // Try exact name match in event description or summary
  const candidates = calendarEvents.filter((e) => {
    const desc = (e.description || '').toLowerCase()
    const summary = (e.summary || '').toLowerCase()
    // Check if client name appears in description or summary
    return desc.includes(accName) || summary.includes(accName) ||
      // Also try last name only (Shirley often only used last names)
      accName.split(' ').some((part) => part.length > 2 && (summary.includes(part) || desc.includes(`customer: ${part}`)))
  })

  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  // Multiple matches — find closest by date
  if (accDate) {
    candidates.sort((a, b) => {
      const da = Math.abs(new Date(a.start?.dateTime || 0) - accDate)
      const db = Math.abs(new Date(b.start?.dateTime || 0) - accDate)
      return da - db
    })
    // Only match if within 2 days
    const closest = candidates[0]
    const diff = Math.abs(new Date(closest.start?.dateTime || 0) - accDate)
    if (diff < 2 * 24 * 60 * 60 * 1000) return closest
  }

  return candidates[0]
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

  // 3. Parse each email and try to match
  const results = {
    emailsFound: emails.length,
    matched: 0,
    unmatched: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    items: [],
    unmatchedEmails: [],
  }

  for (const email of emails) {
    // Parse the ACC email
    const result = parseACCEmail({
      subject: email.subject,
      from: email.from,
      html: email.html,
      plainText: email.plain,
    })

    // Skip non-appointment types
    if (result.type !== 'appointment' && result.type !== 'reschedule') {
      results.skipped++
      continue
    }

    const { parsed, startISO } = result
    const fullAddress = [parsed.address, parsed.city, parsed.state, parsed.zip]
      .filter(Boolean).join(', ')

    // Try to match to an existing calendar event
    const match = findMatch(parsed, startISO, calendarEvents)

    if (!match) {
      results.unmatched++
      results.unmatchedEmails.push({
        subject: email.subject,
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
