import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validatePortalSession } from '@/lib/db-customers'
import { CONTACT_PHONE } from '@/lib/constants'
import { sql } from '@/lib/db'
import PortalDashboard from './PortalDashboard'

export const metadata = {
  title: 'Your Inspections — Inspectrum',
  robots: 'noindex, nofollow',
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('portal_session')?.value

  if (!sessionToken) redirect('/portal')

  const customer = await validatePortalSession(sessionToken)
  if (!customer) redirect('/portal?error=expired')

  // Fetch this customer's inspections from the DB
  const db = sql()
  const inspections = await db`
    SELECT
      id, google_event_id, inspection_number, customer_name,
      service, address, start_at, end_at, status,
      payment_status, invoice_amount_cents, payment_amount_cents,
      token, raw_description
    FROM inspections
    WHERE email = ${customer.email}
      AND status != 'cancelled'
    ORDER BY start_at DESC
  `

  const inspectionIds = inspections.map((r) => r.id)

  // Fetch reports
  let reports = []
  if (inspectionIds.length > 0) {
    reports = await db`
      SELECT inspection_id, file_url, file_name, report_type
      FROM inspection_reports
      WHERE inspection_id = ANY(${inspectionIds})
      ORDER BY uploaded_at DESC
    `
  }
  const reportsByInspection = {}
  for (const r of reports) {
    if (!reportsByInspection[r.inspection_id]) reportsByInspection[r.inspection_id] = []
    reportsByInspection[r.inspection_id].push({ fileUrl: r.file_url, fileName: r.file_name, reportType: r.report_type || 'inspection' })
  }

  // Fetch agreements
  let agreements = []
  if (inspectionIds.length > 0) {
    agreements = await db`
      SELECT inspection_id, token, signed_at
      FROM signed_agreements
      WHERE inspection_id = ANY(${inspectionIds})
    `
  }
  const agreementByInspection = {}
  for (const a of agreements) {
    agreementByInspection[a.inspection_id] = {
      token: a.token,
      signedAt: a.signed_at?.toISOString?.() || a.signed_at,
    }
  }

  // Fetch Square invoice URLs from raw descriptions
  let invoiceUrls = {}
  for (const row of inspections) {
    if (row.raw_description) {
      const match = row.raw_description.match(/square_invoice_url:\s*(.+)/)
      if (match) invoiceUrls[row.id] = match[1].trim()
    }
  }

  const now = new Date()
  const serialized = inspections.map((row) => {
    const startAt = row.start_at?.toISOString?.() || row.start_at
    const endAt = row.end_at?.toISOString?.() || row.end_at
    const isPast = endAt ? new Date(endAt) < now : new Date(startAt) < now

    const desc = row.raw_description || ''
    return {
      id: row.id,
      inspectionNumber: row.inspection_number,
      service: row.service,
      address: row.address,
      startAt,
      endAt,
      status: isPast ? 'completed' : row.status,
      paymentStatus: row.payment_status,
      invoiceAmountCents: row.invoice_amount_cents,
      paymentAmountCents: row.payment_amount_cents,
      token: row.token,
      reports: reportsByInspection[row.id] || [],
      agreement: agreementByInspection[row.id] || null,
      squareInvoiceUrl: invoiceUrls[row.id] || null,
      radonAddOn: desc.includes('Radon Add-On: Yes'),
      sewerScope: desc.includes('Sewer Scope: Yes'),
    }
  })

  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-12 px-5 lg:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="hero-eyebrow justify-center">Customer Portal</div>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] mb-4">
            Welcome home, <em className="italic text-amber">{customer.name?.split(' ')[0] || 'there'}.</em>
          </h1>
        </div>
      </header>

      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[50vh]">
        <div className="max-w-[700px] mx-auto">
          <PortalDashboard inspections={serialized} customerEmail={customer.email} contactPhone={CONTACT_PHONE} />
        </div>
      </section>
    </>
  )
}
