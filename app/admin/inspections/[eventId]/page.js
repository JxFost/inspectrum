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
      SELECT id, file_url, file_name, file_size_bytes, uploaded_at, notified_at, downloaded_at
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
          <a href="/admin/inspections" className="text-teal hover:text-amber">Back to dashboard</a>
        </div>
      </section>
    )
  }

  const parsed = event ? parseEventDescription(event.description) : {}
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
    paymentStatus: parsed.paymentStatus || dbRecord?.payment_status,
    source: parsed.source || dbRecord?.source,
  }

  const serializedReports = reports.map((r) => ({
    id: r.id,
    fileUrl: r.file_url,
    fileName: r.file_name,
    fileSizeBytes: r.file_size_bytes,
    uploadedAt: r.uploaded_at?.toISOString?.() || r.uploaded_at,
    notifiedAt: r.notified_at?.toISOString?.() || r.notified_at,
    downloadedAt: r.downloaded_at?.toISOString?.() || r.downloaded_at,
  }))

  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-12 px-5 lg:px-8">
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
          <InspectionDetail inspection={inspection} reports={serializedReports} />
        </div>
      </section>
    </>
  )
}
