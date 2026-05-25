/*
 * Admin Inspections Dashboard — server component that fetches data
 * and passes it to the interactive client component.
 */

import { getInspectionsInWindow } from '@/lib/booking'
import { findEventsBetween } from '@/lib/google-calendar'
import InspectionsDashboard from './InspectionsDashboard'

export const metadata = {
  title: 'Admin — Inspections',
  robots: 'noindex, nofollow',
}

const RANGE_OPTIONS = {
  '2w': 14,
  '1m': 30,
  '2m': 60,
  '3m': 90,
}

function windowFromRange(range) {
  const now = new Date()
  const year = now.getFullYear()

  if (range === 'year') {
    return { from: `${year}-01-01`, to: `${year}-12-31` }
  }
  if (range === 'lastyear') {
    return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` }
  }

  const days = RANGE_OPTIONS[range] || 14
  return {
    from: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  }
}

function prevWindowFromRange(range) {
  const now = new Date()
  const year = now.getFullYear()

  if (range === 'year') {
    return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31` }
  }
  if (range === 'lastyear') {
    return { from: `${year - 2}-01-01`, to: `${year - 2}-12-31` }
  }

  const days = RANGE_OPTIONS[range] || 14
  return {
    from: new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  }
}

export default async function InspectionsPage({ searchParams }) {
  const params = await searchParams
  const range = params.range || '2w'
  const win = windowFromRange(range)
  const from = params.from || win.from
  const to = params.to || win.to

  let inspections = []
  let prevInspections = []
  let ytdCount = 0
  let fetchError = null

  try {
    inspections = await getInspectionsInWindow({ from, to })

    // Previous period for trends
    const prev = prevWindowFromRange(range)
    prevInspections = await getInspectionsInWindow({ from: prev.from, to: prev.to })

    // YTD count — count events that have an inspection number (excludes cancelled,
    // which are deleted from calendar, so gaps from cancellations are naturally excluded)
    const year = new Date().getFullYear()
    const ytdEvents = await findEventsBetween(`${year}-01-01T00:00:00Z`, new Date().toISOString())
    ytdCount = ytdEvents.filter((e) => e.description?.match(/inspection_number:\s*\d{4}-\d+/)).length
  } catch (err) {
    console.error('[admin-inspections] fetch error:', err)
    fetchError = err.message
  }

  // Reverse for newest-first default
  inspections.reverse()

  // Compute previous period stats for trends
  const prevCompleted = prevInspections.filter((i) => i.status === 'past').length
  const prevCollected = prevInspections
    .filter((i) => i.paymentStatus === 'paid' && i.paymentAmountCents)
    .reduce((sum, i) => sum + (parseInt(i.paymentAmountCents, 10) || 0), 0)

  return (
    <InspectionsDashboard
      inspections={inspections}
      from={from}
      to={to}
      range={range}
      fetchError={fetchError}
      prevCompleted={prevCompleted}
      prevCollected={prevCollected}
      prevTotal={prevInspections.length}
      ytdCount={ytdCount}
    />
  )
}
