import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { validatePortalSession } from '@/lib/db-customers'
import { sql } from '@/lib/db'
import Link from 'next/link'
import PricingBlock from '@/components/PricingBlock'

export const metadata = {
  title: 'Inspection Details — Inspectrum',
  robots: 'noindex, nofollow',
}

const TIMEZONE = 'America/Denver'
const PHONE = '(303) 697-0990'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 pb-3 border-b border-line last:border-0 last:pb-0">
      <div className="text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/60 font-semibold">{label}</div>
      <div className="text-ink font-medium text-sm">{value}</div>
    </div>
  )
}

export default async function PortalInspectionPage({ params }) {
  const { id } = await params
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('portal_session')?.value

  if (!sessionToken) redirect('/portal')
  const customer = await validatePortalSession(sessionToken)
  if (!customer) redirect('/portal?error=expired')

  const db = sql()

  // Fetch inspection — verify it belongs to this customer
  const inspections = await db`
    SELECT * FROM inspections WHERE id = ${id} AND email = ${customer.email}
  `
  const insp = inspections[0]
  if (!insp) {
    return (
      <div className="bg-cream pt-32 pb-20 px-5 min-h-screen">
        <div className="max-w-[600px] mx-auto text-center">
          <h1 className="text-2xl font-serif text-ink mb-4">Inspection not found.</h1>
          <Link href="/portal/dashboard" className="text-teal hover:text-amber">Back to dashboard</Link>
        </div>
      </div>
    )
  }

  // Fetch reports
  const reports = await db`
    SELECT file_url, file_name, file_size_bytes, uploaded_at
    FROM inspection_reports WHERE inspection_id = ${id}
    ORDER BY uploaded_at DESC
  `

  // Fetch agreement
  const agreements = await db`
    SELECT token, signed_at, signature_name FROM signed_agreements WHERE inspection_id = ${id}
  `
  const agreement = agreements[0] || null

  const startAt = insp.start_at?.toISOString?.() || insp.start_at
  const endAt = insp.end_at?.toISOString?.() || insp.end_at
  const desc = insp.raw_description || ''
  const isPast = new Date(endAt || startAt) < new Date()
  const hasRadon = desc.includes('Radon Add-On: Yes')
  const hasSewer = desc.includes('Sewer Scope: Yes')

  // Parse Square invoice URL
  const invoiceUrlMatch = desc.match(/square_invoice_url:\s*(.+)/)
  const squareInvoiceUrl = invoiceUrlMatch ? invoiceUrlMatch[1].trim() : null

  // Extract city from address for pricing
  const cityMatch = (insp.address || '').match(/,\s*([^,]+),\s*CO/)
  const city = cityMatch ? cityMatch[1].trim() : null

  // Extract sqft
  const sqftMatch = desc.match(/Square Footage:\s*(\d+)/)
  const sqft = sqftMatch ? sqftMatch[1] : null

  // Extract year built
  const ybMatch = desc.match(/Year Built:\s*(\d{4})/)
  const yearBuilt = ybMatch ? ybMatch[1] : null

  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-12 px-5 lg:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="hero-eyebrow justify-center">Your Inspection</div>
          <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] mb-2">
            {insp.service || 'Inspection'} — <em className="italic text-amber">{insp.address?.split(',')[0] || 'Details'}</em>
          </h1>
          {insp.inspection_number && (
            <p className="text-cream/60 font-mono text-sm">#{insp.inspection_number}</p>
          )}
        </div>
      </header>

      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[50vh]">
        <div className="max-w-[600px] mx-auto">

          {/* Inspection details */}
          <div className="bg-paper p-8 rounded-sm border border-line mb-6">
            <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">Appointment Details</div>
            <div className="space-y-3">
              <DetailRow label="Service" value={insp.service} />
              <DetailRow label="Date" value={formatDate(startAt)} />
              <DetailRow label="Time" value={`${formatTime(startAt)} – ${formatTime(endAt)}`} />
              <DetailRow label="Address" value={insp.address} />
              <DetailRow label="Status" value={isPast ? 'Completed' : 'Upcoming'} />
              {hasRadon && <DetailRow label="Radon Testing" value="Included" />}
              {hasSewer && <DetailRow label="Sewer Scope" value="Included" />}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <PricingBlock
              service={insp.service}
              sqft={sqft}
              yearBuilt={yearBuilt}
              city={city}
              radonAddOn={hasRadon}
              sewerScope={hasSewer}
              tripChargeCents={insp.trip_charge_cents ? String(insp.trip_charge_cents) : null}
              distanceMiles={insp.distance_miles ? String(insp.distance_miles) : null}
            />
          </div>

          {/* Agreement */}
          <div className="bg-paper p-6 rounded-sm border border-line mb-6">
            <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Agreement</div>
            {agreement?.signed_at ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center text-sm font-bold">✓</div>
                <div>
                  <div className="text-sm text-ink font-medium">Signed by {agreement.signature_name}</div>
                  <div className="text-xs text-charcoal/50">{new Date(agreement.signed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            ) : agreement ? (
              <div>
                <p className="text-sm text-charcoal mb-3">Please review and sign your inspection agreement.</p>
                <a href={`/agreement/${agreement.token}`} className="inline-block bg-teal text-white px-5 py-2 rounded-sm font-semibold text-sm no-underline hover:bg-teal-deep transition-colors">
                  Review & Sign →
                </a>
              </div>
            ) : (
              <p className="text-sm text-charcoal/50">No agreement on file.</p>
            )}
          </div>

          {/* Payment */}
          <div className="bg-paper p-6 rounded-sm border border-line mb-6">
            <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Payment</div>
            {insp.payment_status === 'paid' && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center text-sm font-bold">✓</div>
                <div>
                  <span className="text-sm text-teal font-semibold">Paid</span>
                  {insp.payment_amount_cents && <span className="text-sm text-ink ml-2">${Math.round(insp.payment_amount_cents / 100)}</span>}
                </div>
                {squareInvoiceUrl && (
                  <a href={squareInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal hover:text-amber no-underline ml-auto">
                    View receipt →
                  </a>
                )}
              </div>
            )}
            {insp.payment_status === 'pending' && (
              <div>
                <p className="text-sm text-charcoal mb-3">
                  Invoice due{insp.invoice_amount_cents ? `: $${Math.round(insp.invoice_amount_cents / 100)}` : ''}
                </p>
                {squareInvoiceUrl && (
                  <a href={squareInvoiceUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-amber text-white px-5 py-2 rounded-sm font-semibold text-sm no-underline hover:bg-amber-deep transition-colors">
                    Pay Now →
                  </a>
                )}
              </div>
            )}
            {!insp.payment_status && (
              <p className="text-sm text-charcoal/50">Payment due at completion of inspection.</p>
            )}
          </div>

          {/* Reports */}
          <div className="bg-paper p-6 rounded-sm border border-line mb-6">
            <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">
              Reports {reports.length > 0 && `(${reports.length})`}
            </div>
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-cream rounded-sm border border-line">
                    <div>
                      <div className="text-sm font-medium text-ink">{r.file_name}</div>
                      <div className="text-xs text-charcoal/50">
                        {r.file_size_bytes ? `${(r.file_size_bytes / (1024 * 1024)).toFixed(1)} MB` : ''} · {new Date(r.uploaded_at).toLocaleDateString('en-US')}
                      </div>
                    </div>
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-sm no-underline hover:bg-teal-deep transition-colors">
                      Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal/50">
                {isPast ? 'Report not yet uploaded. You\'ll receive an email when it\'s ready.' : 'Your report will be available here after the inspection.'}
              </p>
            )}
          </div>

          {/* Prep checklist for upcoming */}
          {!isPast && (
            <div className="bg-paper p-6 rounded-sm border border-line mb-6">
              <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Prepare for Your Inspection</div>
              <ul className="text-sm text-charcoal space-y-2 list-none pl-0">
                <li className="flex gap-2"><span className="text-teal font-bold">✓</span> Ensure all utilities are on (water, gas, electric)</li>
                <li className="flex gap-2"><span className="text-teal font-bold">✓</span> Clear access to attic, crawlspace, and electrical panel</li>
                <li className="flex gap-2"><span className="text-teal font-bold">✓</span> Secure pets or arrange for them to be off-site</li>
                <li className="flex gap-2"><span className="text-teal font-bold">✓</span> Unlock any gates, sheds, or outbuildings</li>
                <li className="flex gap-2"><span className="text-teal font-bold">✓</span> Plan to arrive toward the end for the walk-through</li>
                {hasRadon && <li className="flex gap-2"><span className="text-amber font-bold">✓</span> Keep all windows and exterior doors closed for radon testing</li>}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div className="bg-teal/[0.06] border border-teal/20 rounded-sm p-6 mb-6">
            <p className="text-sm text-charcoal mb-2">Questions about this inspection?</p>
            <p className="text-sm">
              <a href={`tel:${PHONE.replace(/\D/g, '')}`} className="text-teal font-semibold hover:text-amber no-underline">{PHONE}</a>
              <span className="text-charcoal/40 mx-2">·</span>
              <a href="mailto:harry@evergreeninspections.com" className="text-teal font-semibold hover:text-amber no-underline">harry@evergreeninspections.com</a>
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Link href="/portal/dashboard" className="text-sm text-teal hover:text-amber no-underline font-semibold">
              ← Back to dashboard
            </Link>
            {!isPast && insp.token && (
              <Link href={`/manage?token=${insp.token}`} className="text-sm text-teal hover:text-amber no-underline font-semibold">
                Manage appointment →
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
