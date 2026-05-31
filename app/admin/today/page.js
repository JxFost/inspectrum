import { findEventsBetween } from '@/lib/google-calendar'
import { parseEventDescription } from '@/lib/booking'
import { TIMEZONE } from '@/lib/working-hours'
import { sql } from '@/lib/db'
import TodayClient from './TodayClient'

export const metadata = {
  title: 'Today — Admin',
  robots: 'noindex, nofollow',
}

export const dynamic = 'force-dynamic'

export default async function TodayPage() {
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
  const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const tomorrowStr = tomorrowDate.toLocaleDateString('en-CA', { timeZone: TIMEZONE })

  // Fetch today + tomorrow from calendar
  const timeMin = `${todayStr}T00:00:00Z`
  const timeMax = `${tomorrowStr}T23:59:59Z`

  let events = []
  try {
    events = await findEventsBetween(timeMin, timeMax)
  } catch (err) {
    console.error('[today] fetch error:', err.message)
  }

  // Parse events
  const inspections = events
    .filter((e) => e.start?.dateTime)
    .map((e) => {
      const parsed = parseEventDescription(e.description)
      const desc = e.description || ''
      const startISO = e.start.dateTime
      const endISO = e.end?.dateTime
      const eventDate = new Date(startISO).toLocaleDateString('en-CA', { timeZone: TIMEZONE })

      return {
        eventId: e.id,
        startISO,
        endISO,
        day: eventDate === todayStr ? 'today' : 'tomorrow',
        customerName: parsed.customerName,
        email: parsed.email,
        phone: parsed.phone,
        address: parsed.address || e.location,
        service: parsed.service,
        inspectionNumber: parsed.inspectionNumber,
        distanceMiles: parsed.distanceMiles,
        token: parsed.token,
        radonAddOn: desc.includes('Radon Add-On: Yes'),
        sewerScope: desc.includes('Sewer Scope: Yes'),
        accessInfo: desc.match(/Access:\s*(.+)/)?.[1]?.trim() || null,
        listingAgent: desc.match(/Listing Agent:\s*(.+)/)?.[1]?.trim() || null,
        listingAgentPhone: desc.match(/Listing Agent Phone:\s*(.+)/)?.[1]?.trim() || null,
        sqft: desc.match(/Square Footage:\s*(\d+)/)?.[1] || null,
        yearBuilt: desc.match(/Year Built:\s*(\d{4})/)?.[1] || null,
      }
    })
    .sort((a, b) => new Date(a.startISO) - new Date(b.startISO))

  // Fetch agreements + reports from DB
  const db = sql()
  const eventIds = inspections.map((i) => i.eventId).filter(Boolean)

  let agreementMap = {}
  let reportMap = {}

  if (eventIds.length > 0) {
    try {
      const agreements = await db`
        SELECT i.google_event_id, sa.signed_at, sa.token AS agreement_token
        FROM signed_agreements sa
        JOIN inspections i ON i.id = sa.inspection_id
        WHERE i.google_event_id = ANY(${eventIds})
      `
      for (const a of agreements) {
        agreementMap[a.google_event_id] = {
          signed: !!a.signed_at,
          token: a.agreement_token,
        }
      }

      const reports = await db`
        SELECT i.google_event_id, COUNT(ir.id) AS report_count
        FROM inspections i
        LEFT JOIN inspection_reports ir ON ir.inspection_id = i.id
        WHERE i.google_event_id = ANY(${eventIds})
        GROUP BY i.google_event_id
      `
      for (const r of reports) {
        reportMap[r.google_event_id] = parseInt(r.report_count, 10) || 0
      }
    } catch { /* DB may not be available */ }
  }

  // Merge
  const enriched = inspections.map((i) => ({
    ...i,
    agreementSigned: agreementMap[i.eventId]?.signed ?? null,
    agreementToken: agreementMap[i.eventId]?.token || null,
    reportCount: reportMap[i.eventId] || 0,
  }))

  const todayLabel = now.toLocaleDateString('en-US', { timeZone: TIMEZONE, weekday: 'long', month: 'long', day: 'numeric' })
  const tomorrowLabel = tomorrowDate.toLocaleDateString('en-US', { timeZone: TIMEZONE, weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-cream pt-4 pb-12 px-4 lg:px-6">
      <TodayClient
        inspections={enriched}
        todayLabel={todayLabel}
        tomorrowLabel={tomorrowLabel}
      />
    </div>
  )
}
