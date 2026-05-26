import { sql } from '@/lib/db'
import AgreementClient from './AgreementClient'

export const metadata = {
  title: 'Inspection Service Agreement — Inspectrum Inspections',
  robots: 'noindex, nofollow',
}

export default async function AgreementPage({ params }) {
  const { token } = await params
  const db = sql()

  // Look up the agreement record
  const agreements = await db`
    SELECT sa.*, i.service, i.start_at, i.end_at, i.inspection_number,
           i.invoice_amount_cents, i.trip_charge_cents, i.distance_miles,
           i.raw_description
    FROM signed_agreements sa
    JOIN inspections i ON i.id = sa.inspection_id
    WHERE sa.token = ${token}
  `
  const agreement = agreements[0]

  if (!agreement) {
    return (
      <div className="bg-cream pt-32 pb-20 px-5 min-h-screen">
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="text-2xl font-serif text-ink mb-4">Agreement not found.</h1>
          <p className="text-charcoal">This link may have expired or is invalid. Please contact us at (303) 697-0990.</p>
        </div>
      </div>
    )
  }

  // Already signed
  if (agreement.signed_at) {
    return (
      <div className="bg-cream pt-32 pb-20 px-5 min-h-screen">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
          <h1 className="text-2xl font-serif text-ink mb-4">Agreement signed.</h1>
          <p className="text-charcoal mb-2">
            Thank you, {agreement.customer_name?.split(' ')[0]}. Your agreement was signed on {new Date(agreement.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
          <p className="text-sm text-charcoal/60">
            We look forward to your inspection. If you have questions, call (303) 697-0990.
          </p>
        </div>
      </div>
    )
  }

  // Parse fee info from the inspection
  const desc = agreement.raw_description || ''
  const hasRadon = desc.includes('Radon Add-On: Yes') || agreement.radon_addendum
  const hasSewer = desc.includes('Sewer Scope: Yes')

  const data = {
    token,
    customerName: agreement.customer_name || '',
    customerEmail: agreement.customer_email || '',
    propertyAddress: agreement.property_address || '',
    service: agreement.service || 'Full Home Inspection',
    inspectionDate: agreement.start_at?.toISOString?.() || agreement.start_at,
    inspectionNumber: agreement.inspection_number || '',
    hasRadon,
    hasSewer,
    tripChargeCents: agreement.trip_charge_cents ? String(agreement.trip_charge_cents) : null,
    distanceMiles: agreement.distance_miles ? String(agreement.distance_miles) : null,
  }

  return <AgreementClient data={data} />
}
