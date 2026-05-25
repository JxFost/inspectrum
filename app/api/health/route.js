/*
 * GET /api/health
 *
 * Verifies that the Google Calendar API is responding.
 * Returns 200 if healthy, 503 if the calendar API is unreachable.
 *
 * Can be used by uptime monitors (e.g. Vercel Cron, UptimeRobot)
 * to alert when bookings would silently fail.
 */

import { NextResponse } from 'next/server'
import { getBusyRanges } from '@/lib/google-calendar'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()

  try {
    // Lightweight freebusy query — 1-hour window, minimal data
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

    await getBusyRanges(now.toISOString(), oneHourLater.toISOString())

    const latencyMs = Date.now() - start

    return NextResponse.json({
      status: 'healthy',
      calendar: 'connected',
      latencyMs,
      checkedAt: now.toISOString(),
    })
  } catch (err) {
    const latencyMs = Date.now() - start

    console.error('[health] Google Calendar check failed:', err.message)

    return NextResponse.json(
      {
        status: 'unhealthy',
        calendar: 'disconnected',
        error: err.message,
        latencyMs,
        checkedAt: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
