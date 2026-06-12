/*
 * Admin customer detail — the customer's inspection history rendered as
 * cards mirroring what they see in their portal dashboard, with admin
 * links into each inspection.
 */

import Link from 'next/link'
import { sql } from '@/lib/db'

export const metadata = {
  title: 'Customer — Admin',
  robots: 'noindex, nofollow',
}

const TIMEZONE = 'America/Denver'

const REPORT_TYPE_SHORT = {
  inspection: 'Report',
  radon: 'Radon',
  sewer: 'Sewer Scope',
  addendum: 'Addendum',
  other: 'Document',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: TIMEZONE, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit',
  })
}

function AgreementBadge({ agreement }) {
  if (!agreement) return <span className="text-xs text-charcoal/40">No agreement</span>
  if (agreement.signedAt) return <span className="text-xs text-teal font-semibold">Agreement Signed ✓</span>
  return <span className="text-xs text-amber font-semibold">Agreement awaiting signature</span>
}

function PaymentBadge({ status, amountCents }) {
  if (!status) return <span className="text-xs text-charcoal/40">Not invoiced</span>
  const amount = amountCents ? `$${Math.round(parseInt(amountCents, 10) / 100)}` : ''
  if (status === 'paid') return <span className="text-xs text-teal font-semibold">Paid {amount}</span>
  if (status === 'pending') return <span className="text-xs text-amber font-semibold">Invoice Due {amount}</span>
  return <span className="text-xs text-charcoal/50">{status}</span>
}

function InspectionCard({ insp }) {
  return (
    <div className="bg-paper p-6 rounded-sm border border-line">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="font-semibold text-ink">{insp.service || 'Inspection'}</div>
          <div className="text-sm text-charcoal/70">{insp.address || 'Address TBD'}</div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-sm whitespace-nowrap ${
          insp.isUpcoming ? 'bg-teal/10 text-teal' : 'bg-charcoal/10 text-charcoal'
        }`}>
          {insp.isUpcoming ? 'Upcoming' : 'Completed'}
        </span>
      </div>

      <div className="text-sm text-charcoal mb-1">
        {formatDate(insp.startAt)}
        {insp.endAt && ` · ${formatTime(insp.startAt)} – ${formatTime(insp.endAt)}`}
      </div>
      {insp.inspectionNumber && (
        <div className="text-xs text-charcoal/50 font-mono mb-3">#{insp.inspectionNumber}</div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <AgreementBadge agreement={insp.agreement} />
        <PaymentBadge status={insp.paymentStatus} amountCents={insp.invoiceAmountCents} />
        {insp.radonAddOn && <span className="text-xs bg-amber/10 text-amber px-2 py-0.5 rounded">Radon</span>}
        {insp.sewerScope && <span className="text-xs bg-charcoal/10 text-charcoal px-2 py-0.5 rounded">Sewer</span>}
      </div>

      {insp.reports.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {insp.reports.map((r, i) => (
            <a
              key={i}
              href={r.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-sm no-underline hover:bg-teal-deep transition-colors"
            >
              {REPORT_TYPE_SHORT[r.reportType] || 'Report'} ↓
            </a>
          ))}
        </div>
      )}

      {insp.googleEventId && (
        <div className="pt-3 border-t border-line">
          <Link href={`/admin/inspections/${insp.googleEventId}`} className="text-xs text-teal hover:text-amber no-underline font-semibold">
            Open inspection →
          </Link>
        </div>
      )}
    </div>
  )
}

export default async function CustomerDetailPage({ params }) {
  const { id } = await params
  const db = sql()

  const customers = await db`
    SELECT id, name, email, phone, last_login FROM customers WHERE id = ${id}
  `
  const customer = customers[0]

  if (!customer) {
    return (
      <div className="min-h-screen bg-cream pt-16 px-4 text-center">
        <h1 className="text-2xl font-serif text-ink mb-4">Customer not found.</h1>
        <Link href="/admin/customers" className="text-teal hover:text-amber">Back to customers</Link>
      </div>
    )
  }

  // Same aggregation the customer portal dashboard uses
  const inspections = await db`
    SELECT
      id, google_event_id, inspection_number, service, address,
      start_at, end_at, status, payment_status, invoice_amount_cents,
      raw_description
    FROM inspections
    WHERE LOWER(email) = LOWER(${customer.email})
      AND status != 'cancelled'
    ORDER BY start_at DESC
  `

  const inspectionIds = inspections.map((r) => r.id)

  let reports = []
  let agreements = []
  if (inspectionIds.length > 0) {
    reports = await db`
      SELECT inspection_id, file_url, report_type
      FROM inspection_reports
      WHERE inspection_id = ANY(${inspectionIds})
      ORDER BY uploaded_at DESC
    `
    agreements = await db`
      SELECT inspection_id, signed_at
      FROM signed_agreements
      WHERE inspection_id = ANY(${inspectionIds})
    `
  }

  const reportsByInspection = {}
  for (const r of reports) {
    if (!reportsByInspection[r.inspection_id]) reportsByInspection[r.inspection_id] = []
    reportsByInspection[r.inspection_id].push({ fileUrl: r.file_url, reportType: r.report_type || 'inspection' })
  }
  const agreementByInspection = {}
  for (const a of agreements) {
    agreementByInspection[a.inspection_id] = { signedAt: a.signed_at?.toISOString?.() || a.signed_at }
  }

  const now = new Date()
  const cards = inspections.map((row) => {
    const startAt = row.start_at?.toISOString?.() || row.start_at
    const endAt = row.end_at?.toISOString?.() || row.end_at
    const desc = row.raw_description || ''
    return {
      id: row.id,
      googleEventId: row.google_event_id,
      inspectionNumber: row.inspection_number,
      service: row.service,
      address: row.address,
      startAt,
      endAt,
      isUpcoming: (endAt || startAt) ? new Date(endAt || startAt) >= now : false,
      paymentStatus: row.payment_status,
      invoiceAmountCents: row.invoice_amount_cents,
      reports: reportsByInspection[row.id] || [],
      agreement: agreementByInspection[row.id] || null,
      radonAddOn: desc.includes('Radon Add-On: Yes') || desc.includes('Radon: Yes'),
      sewerScope: desc.includes('Sewer Scope: Yes'),
    }
  })

  return (
    <div className="min-h-screen bg-cream pt-4 pb-12 px-4 lg:px-6">
      <div className="max-w-[700px] mx-auto">
        <Link href="/admin/customers" className="text-sm text-teal hover:text-amber no-underline font-semibold">
          ← Back to customers
        </Link>

        <div className="mt-4 mb-8">
          <h1 className="text-2xl font-serif text-ink mb-1">{customer.name || customer.email}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href={`mailto:${customer.email}`} className="text-teal hover:text-amber no-underline">{customer.email}</a>
            {customer.phone && (
              <a href={`tel:${customer.phone.replace(/[^+\d]/g, '')}`} className="text-teal hover:text-amber no-underline">{customer.phone}</a>
            )}
            <span className={customer.last_login ? 'text-teal' : 'text-charcoal/40'}>
              Portal: {customer.last_login ? 'Active' : 'Never logged in'}
            </span>
          </div>
        </div>

        <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">
          Inspections ({cards.length})
        </div>

        {cards.length === 0 ? (
          <div className="bg-paper border border-line rounded-sm p-8 text-center">
            <p className="text-sm text-charcoal/50">No inspections on file for {customer.email}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((insp) => <InspectionCard key={insp.id} insp={insp} />)}
          </div>
        )}
      </div>
    </div>
  )
}
