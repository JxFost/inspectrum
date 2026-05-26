import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validatePortalSession } from '@/lib/db-customers'
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
      payment_status, invoice_amount_cents, token
    FROM inspections
    WHERE email = ${customer.email}
      AND status != 'cancelled'
    ORDER BY start_at DESC
  `

  const now = new Date()
  const serialized = inspections.map((row) => {
    const startAt = row.start_at?.toISOString?.() || row.start_at
    const endAt = row.end_at?.toISOString?.() || row.end_at
    const isPast = endAt ? new Date(endAt) < now : new Date(startAt) < now

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
      token: row.token,
    }
  })

  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-12 px-5 lg:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="hero-eyebrow justify-center">Customer Portal</div>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] mb-4">
            Welcome back, <em className="italic text-amber">{customer.name?.split(' ')[0] || 'there'}.</em>
          </h1>
        </div>
      </header>

      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[50vh]">
        <div className="max-w-[700px] mx-auto">
          <PortalDashboard inspections={serialized} customerEmail={customer.email} />
        </div>
      </section>
    </>
  )
}
