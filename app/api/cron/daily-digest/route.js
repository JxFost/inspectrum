/*
 * GET /api/cron/daily-digest
 *
 * Daily morning email to Harry summarizing today's inspections.
 * Runs at 12pm UTC (6am MT) via Vercel Cron.
 */

import { NextResponse } from 'next/server'
import { findEventsBetween } from '@/lib/google-calendar'
import { parseEventDescription } from '@/lib/booking'
import { sendEmail } from '@/lib/email/send'
import { TIMEZONE } from '@/lib/working-hours'
import { dailyDigestHtml } from '@/lib/email/templates/daily-digest'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: TIMEZONE })

  let events
  try {
    events = await findEventsBetween(
      `${todayStr}T00:00:00.000Z`,
      `${todayStr}T23:59:59.000Z`,
    )
  } catch (err) {
    console.error('[daily-digest] fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }

  const inspections = events
    .filter((e) => e.start?.dateTime)
    .map((e) => {
      const parsed = parseEventDescription(e.description)
      return {
        startISO: e.start.dateTime,
        ...parsed,
        accessProvidedBy: e.description?.match(/Access:\s*(.+)/)?.[1]?.trim() || null,
      }
    })
    .sort((a, b) => new Date(a.startISO) - new Date(b.startISO))

  const dateLabel = now.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const html = dailyDigestHtml({ dateLabel, inspections })
  const digestTo = process.env.DIGEST_EMAIL || 'harry@evergreeninspections.com'

  try {
    await sendEmail({
      to: digestTo,
      subject: `Today's Schedule — ${dateLabel} (${inspections.length} inspection${inspections.length !== 1 ? 's' : ''})`,
      html,
    })
    console.log(`[daily-digest] sent to ${digestTo}, ${inspections.length} inspections`)
  } catch (err) {
    console.error('[daily-digest] send error:', err)
    return NextResponse.json({ error: 'Failed to send digest' }, { status: 500 })
  }

  return NextResponse.json({ sent: true, inspections: inspections.length })
}
