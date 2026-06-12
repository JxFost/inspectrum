import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getEvent } from '@/lib/google-calendar'
import { parseEventDescription } from '@/lib/booking'
import { sql } from '@/lib/db'
import InspectionDetail from './InspectionDetail'

export const metadata = {
  title: 'Inspection Detail — Admin',
  robots: 'noindex, nofollow',
}

// Labels already rendered as dedicated rows elsewhere on the page.
const SHOWN_LABELS = new Set([
  'service', 'customer', 'phone', 'email', 'address',
  'ordered by', 'listing agent', 'listing agent phone', 'listing agent email',
])

/**
 * Pull every human-labeled line out of the event description so all booking
 * info shows on the page regardless of source (web, admin, ACC). System
 * markers use snake_case keys and footer lines have no "Label: value" shape,
 * so requiring an uppercase first letter filters both out.
 */
function extractExtraFields(description) {
  const fields = []
  const seen = new Set()
  for (const line of (description || '').split('\n')) {
    const match = line.match(/^([A-Z][A-Za-z'() /-]*):\s+(.+)$/)
    if (!match) continue
    const label = match[1].trim()
    const key = label.toLowerCase()
    if (SHOWN_LABELS.has(key) || seen.has(key)) continue
    seen.add(key)
    fields.push({ label, value: match[2].trim() })
  }
  return fields
}

export default async function InspectionDetailPage({ params }) {
  const { eventId } = await params

  // Fetch from calendar
  let event
  try {
    event = await getEvent(eventId)
  } catch { event = null }

  // Fetch from DB
  const db = sql()
  const dbRows = await db`
    SELECT * FROM inspections WHERE google_event_id = ${eventId}
  `
  const dbRecord = dbRows[0] || null

  // Fetch reports
  let reports = []
  if (dbRecord) {
    reports = await db`
      SELECT id, file_url, file_name, file_size_bytes, report_type, uploaded_at, notified_at, downloaded_at
      FROM inspection_reports
      WHERE inspection_id = ${dbRecord.id}
      ORDER BY uploaded_at DESC
    `
  }

  if (!event && !dbRecord) {
    return (
      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[50vh]">
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="text-2xl mb-4">Inspection not found.</h1>
          <Link href="/admin/inspections" className="text-teal hover:text-amber">Back to dashboard</Link>
        </div>
      </section>
    )
  }

  const parsed = event ? parseEventDescription(event.description) : {}
  const extraFields = extractExtraFields(event?.description || dbRecord?.raw_description)
  const startISO = event?.start?.dateTime || dbRecord?.start_at?.toISOString?.() || dbRecord?.start_at
  const endISO = event?.end?.dateTime || dbRecord?.end_at?.toISOString?.() || dbRecord?.end_at

  const inspection = {
    eventId,
    inspectionId: dbRecord?.id || null,
    inspectionNumber: parsed.inspectionNumber || dbRecord?.inspection_number,
    customerName: parsed.customerName || dbRecord?.customer_name,
    email: parsed.email || dbRecord?.email,
    phone: parsed.phone || dbRecord?.phone,
    address: parsed.address || dbRecord?.address,
    service: parsed.service || dbRecord?.service,
    startISO,
    endISO,
    isPast: (endISO || startISO) ? new Date(endISO || startISO) < new Date() : false,
    paymentStatus: parsed.paymentStatus || dbRecord?.payment_status,
    source: parsed.source || dbRecord?.source,
    radonAddOn: (event?.description || '').includes('Radon Add-On: Yes'),
    sewerScope: (event?.description || '').includes('Sewer Scope: Yes'),
    tripChargeCents: parsed.tripChargeCents || (dbRecord?.trip_charge_cents ? String(dbRecord.trip_charge_cents) : null),
    distanceMiles: parsed.distanceMiles || (dbRecord?.distance_miles ? String(dbRecord.distance_miles) : null),
    listingAgentName: (event?.description || '').match(/Listing Agent:\s*(.+)/)?.[1]?.trim() || null,
    listingAgentPhone: (event?.description || '').match(/Listing Agent Phone:\s*(.+)/)?.[1]?.trim() || null,
    listingAgentEmail: (event?.description || '').match(/Listing Agent Email:\s*(.+)/)?.[1]?.trim() || null,
    orderedBy: (event?.description || '').match(/Ordered By:\s*(.+)/)?.[1]?.trim() || null,
  }

  // Fetch agreement status
  let agreement = null
  if (dbRecord) {
    const agreements = await db`
      SELECT token, signed_at, signature_name, initials, sent_at
      FROM signed_agreements WHERE inspection_id = ${dbRecord.id}
    `
    if (agreements[0]) {
      const a = agreements[0]
      agreement = {
        token: a.token,
        signedAt: a.signed_at?.toISOString?.() || a.signed_at,
        signatureName: a.signature_name,
        initials: a.initials,
        sentAt: a.sent_at?.toISOString?.() || a.sent_at,
      }
    }
  }

  // Fetch email log
  let emailLog = []
  if (dbRecord) {
    try {
      const logs = await db`
        SELECT id, to_email, subject, template, status, error, sent_at
        FROM email_log
        WHERE inspection_id = ${dbRecord.id}
        ORDER BY sent_at DESC
      `
      emailLog = logs.map((l) => ({
        id: l.id,
        toEmail: l.to_email,
        subject: l.subject,
        template: l.template,
        status: l.status,
        error: l.error,
        sentAt: l.sent_at?.toISOString?.() || l.sent_at,
      }))
    } catch { /* table may not exist yet */ }
  }

  const serializedReports = reports.map((r) => ({
    id: r.id,
    fileUrl: r.file_url,
    fileName: r.file_name,
    fileSizeBytes: r.file_size_bytes,
    reportType: r.report_type || 'inspection',
    uploadedAt: r.uploaded_at?.toISOString?.() || r.uploaded_at,
    notifiedAt: r.notified_at?.toISOString?.() || r.notified_at,
    downloadedAt: r.downloaded_at?.toISOString?.() || r.downloaded_at,
  }))

  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-8 pb-12 px-5 lg:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="hero-eyebrow justify-center">Admin</div>
          <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] mb-2">
            {inspection.customerName || 'Inspection'} — <em className="italic text-amber">{inspection.service || 'Details'}</em>
          </h1>
          {inspection.inspectionNumber && (
            <p className="text-cream/60 font-mono text-sm">#{inspection.inspectionNumber}</p>
          )}
        </div>
      </header>

      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[50vh]">
        <div className="max-w-[600px] mx-auto">
          <InspectionDetail inspection={inspection} extraFields={extraFields} reports={serializedReports} agreement={agreement} emailLog={emailLog} />
        </div>
      </section>
    </>
  )
}
