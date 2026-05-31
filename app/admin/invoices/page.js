import { sql } from '@/lib/db'
import InvoicesClient from './InvoicesClient'

export const metadata = {
  title: 'Invoices — Admin',
  robots: 'noindex, nofollow',
}

export default async function InvoicesPage() {
  const db = sql()

  const inspections = await db`
    SELECT
      id, google_event_id, inspection_number, customer_name, email,
      address, service, start_at, payment_status,
      invoice_amount_cents, payment_amount_cents, raw_description
    FROM inspections
    WHERE (payment_status IS NOT NULL OR (status = 'completed' OR start_at < now()))
      AND status != 'cancelled'
      AND customer_name IS NOT NULL
    ORDER BY start_at DESC
  `

  const serialized = inspections.map((row) => {
    const desc = row.raw_description || ''
    const invoiceUrlMatch = desc.match(/square_invoice_url:\s*(.+)/)
    const invoicedAtMatch = desc.match(/invoiced_at:\s*(.+)/)
    const paidAtMatch = desc.match(/paid_at:\s*(.+)/)

    return {
      id: row.id,
      eventId: row.google_event_id,
      inspectionNumber: row.inspection_number,
      customerName: row.customer_name,
      email: row.email,
      address: row.address,
      service: row.service,
      startAt: row.start_at?.toISOString?.() || row.start_at,
      paymentStatus: row.payment_status || 'not_invoiced',
      invoiceAmountCents: row.invoice_amount_cents,
      paymentAmountCents: row.payment_amount_cents,
      squareInvoiceUrl: invoiceUrlMatch ? invoiceUrlMatch[1].trim() : null,
      invoicedAt: invoicedAtMatch ? invoicedAtMatch[1].trim() : null,
      paidAt: paidAtMatch ? paidAtMatch[1].trim() : null,
    }
  })

  return (
    <div className="min-h-screen bg-cream pt-4 pb-12 px-4 lg:px-6">
      <div className="mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-ink mb-1">Invoices</h1>
          <p className="text-sm text-charcoal/60">{serialized.length} inspection{serialized.length !== 1 ? 's' : ''}</p>
        </div>
        <InvoicesClient inspections={serialized} />
      </div>
    </div>
  )
}
