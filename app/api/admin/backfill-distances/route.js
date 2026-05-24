/*
 * GET /api/admin/backfill-distances
 *
 * One-time backfill: scans all events in the date window, geocodes addresses
 * that don't have distance_miles yet, and updates the event descriptions.
 *
 * Auth: admin session cookie.
 * Default window: 90 days back, 90 days forward. Override with ?from=&to=
 */

import { NextResponse } from 'next/server'
import { findEventsBetween, updateEventDescription } from '@/lib/google-calendar'
import { computeDistance } from '@/lib/mileage'

function verifyAdminSession(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

function parseField(desc, field) {
  const match = desc.match(new RegExp(`${field}:\\s*(.+)`))
  return match ? match[1].trim() : null
}

export async function GET(request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const from = searchParams.get('from') || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const to = searchParams.get('to') || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()

  const events = await findEventsBetween(from, to)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const event of events) {
    const desc = event.description || ''

    // Skip if already has distance
    if (desc.includes('distance_miles:')) {
      skipped++
      continue
    }

    // Get the address
    const address = event.location || parseField(desc, 'Address')
    if (!address || address.length < 5) {
      skipped++
      continue
    }

    try {
      const dist = await computeDistance(address)
      if (!dist) {
        failed++
        continue
      }

      // Insert distance fields before the token block
      const distBlock = [
        `distance_miles: ${dist.miles}`,
        dist.tripChargeCents ? `trip_charge_cents: ${dist.tripChargeCents}` : null,
        `geo_lat: ${dist.geoLat}`,
        `geo_lng: ${dist.geoLng}`,
      ].filter(Boolean).join('\n')

      const updatedDesc = desc.includes('\n---\n')
        ? desc.replace('\n---\n', `\n${distBlock}\n\n---\n`)
        : `${desc}\n${distBlock}`

      await updateEventDescription(event.id, updatedDesc)
      updated++
      console.log(`[backfill] ${event.id}: ${dist.miles} mi`)

      // Brief pause to avoid hitting geocoding rate limits
      await new Promise((r) => setTimeout(r, 200))
    } catch (err) {
      console.error(`[backfill] failed for ${event.id}:`, err.message)
      failed++
    }
  }

  return NextResponse.json({ updated, skipped, failed, total: events.length })
}
