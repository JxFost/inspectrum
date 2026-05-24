/*
 * GET /api/booking/check-duplicate?name=...&address=...
 *
 * Checks for an existing upcoming inspection that matches the given
 * customer name and address. Returns the match if found.
 *
 * Matching is fuzzy: case-insensitive, trimmed, common abbreviations
 * normalized (St/Street, Dr/Drive, etc.)
 */

import { NextResponse } from 'next/server'
import { findEventsBetween } from '@/lib/google-calendar'
import { parseEventDescription } from '@/lib/booking'
import { TIMEZONE } from '@/lib/working-hours'

function normalize(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bstreet\b/g, 'st')
    .replace(/\bdrive\b/g, 'dr')
    .replace(/\bavenue\b/g, 'ave')
    .replace(/\bboulevard\b/g, 'blvd')
    .replace(/\blane\b/g, 'ln')
    .replace(/\bcourt\b/g, 'ct')
    .replace(/\bplace\b/g, 'pl')
    .replace(/\broad\b/g, 'rd')
    .replace(/\bcircle\b/g, 'cir')
    .replace(/\bway\b/g, 'wy')
    .replace(/[.,#]/g, '')
}

function namesMatch(a, b) {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return false
  // Exact match
  if (na === nb) return true
  // One contains the other (handles "Jeff" vs "Jeffrey", "Jeff Foster" vs "Jeffrey P Foster")
  if (na.includes(nb) || nb.includes(na)) return true
  // Last name match + first initial
  const aParts = na.split(' ')
  const bParts = nb.split(' ')
  if (aParts.length > 1 && bParts.length > 1) {
    const aLast = aParts[aParts.length - 1]
    const bLast = bParts[bParts.length - 1]
    if (aLast === bLast && aParts[0][0] === bParts[0][0]) return true
  }
  return false
}

function addressesMatch(a, b) {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return false
  if (na === nb) return true
  // Check if the street number + first word match (most distinctive part)
  const aNum = na.match(/^\d+/)
  const bNum = nb.match(/^\d+/)
  if (aNum && bNum && aNum[0] === bNum[0]) {
    // Same house number — check if street names overlap
    const aStreet = na.replace(/^\d+\s*/, '').split(/[,\s]/)[0]
    const bStreet = nb.replace(/^\d+\s*/, '').split(/[,\s]/)[0]
    if (aStreet && bStreet && (aStreet === bStreet || aStreet.includes(bStreet) || bStreet.includes(aStreet))) {
      return true
    }
  }
  return false
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const address = searchParams.get('address')

  if (!name && !address) {
    return NextResponse.json({ match: null })
  }

  try {
    // Search upcoming events (next 60 days)
    const now = new Date()
    const future = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    const events = await findEventsBetween(now.toISOString(), future.toISOString())

    for (const event of events) {
      const parsed = parseEventDescription(event.description)
      const startISO = event.start?.dateTime
      if (!startISO) continue

      const nameHit = name && parsed.customerName && namesMatch(name, parsed.customerName)
      const addressHit = address && parsed.address && addressesMatch(address, parsed.address)

      // Require at least name match, or address match, or both
      if (nameHit || addressHit) {
        const dateLabel = new Date(startISO).toLocaleDateString('en-US', {
          timeZone: TIMEZONE,
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
        const timeLabel = new Date(startISO).toLocaleTimeString('en-US', {
          timeZone: TIMEZONE,
          hour: 'numeric',
          minute: '2-digit',
        })

        return NextResponse.json({
          match: {
            eventId: event.id,
            customerName: parsed.customerName,
            address: parsed.address,
            service: parsed.service,
            date: dateLabel,
            time: timeLabel,
            startISO,
            token: parsed.token,
          },
        })
      }
    }

    return NextResponse.json({ match: null })
  } catch (err) {
    console.error('[check-duplicate] error:', err.message)
    return NextResponse.json({ match: null })
  }
}
