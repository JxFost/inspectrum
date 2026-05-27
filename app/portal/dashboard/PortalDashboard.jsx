'use client'

import Link from 'next/link'
import Button from '@/components/Button'

const TIMEZONE = 'America/Denver'
const PHONE = '(303) 697-0990'
const PHONE_DIGITS = '3036970990'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  })
}

function StatusBadge({ status }) {
  const styles = {
    scheduled: 'bg-teal/10 text-teal',
    completed: 'bg-charcoal/10 text-charcoal',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${styles[status] || styles.completed}`}>
      {status === 'scheduled' ? 'Upcoming' : 'Completed'}
    </span>
  )
}

function PaymentBadge({ status, amountCents }) {
  if (!status) return null
  const amount = amountCents ? `$${Math.round(parseInt(amountCents, 10) / 100)}` : ''
  if (status === 'paid') return <span className="text-xs text-teal font-semibold">Paid {amount}</span>
  if (status === 'pending') return <span className="text-xs text-amber font-semibold">Invoice Due {amount}</span>
  return null
}

function AgreementBadge({ agreement }) {
  if (!agreement) return null
  if (agreement.signedAt) {
    return <span className="text-xs text-teal font-semibold">Agreement Signed ✓</span>
  }
  return (
    <a
      href={`/agreement/${agreement.token}`}
      className="text-xs text-amber font-semibold no-underline hover:text-amber-deep"
    >
      Sign Agreement →
    </a>
  )
}

function InspectionCard({ insp, isUpcoming }) {
  return (
    <div className="bg-paper p-6 rounded-sm border border-line">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="font-semibold text-ink">{insp.service || 'Inspection'}</div>
          <div className="text-sm text-charcoal/70">{insp.address || 'Address TBD'}</div>
        </div>
        <StatusBadge status={isUpcoming ? 'scheduled' : 'completed'} />
      </div>

      <div className="text-sm text-charcoal mb-3">
        {formatDate(insp.startAt)}
        {insp.endAt && ` · ${formatTime(insp.startAt)} – ${formatTime(insp.endAt)}`}
      </div>

      {insp.inspectionNumber && (
        <div className="text-xs text-charcoal/50 font-mono mb-3">#{insp.inspectionNumber}</div>
      )}

      {/* Status row: agreement + payment + add-ons */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <AgreementBadge agreement={insp.agreement} />
        <PaymentBadge status={insp.paymentStatus} amountCents={insp.invoiceAmountCents} />
        {insp.radonAddOn && <span className="text-xs bg-amber/10 text-amber px-2 py-0.5 rounded">Radon</span>}
        {insp.sewerScope && <span className="text-xs bg-charcoal/10 text-charcoal px-2 py-0.5 rounded">Sewer</span>}
      </div>

      {/* Pay Now button */}
      {insp.paymentStatus === 'pending' && insp.squareInvoiceUrl && (
        <a
          href={insp.squareInvoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-amber text-white px-5 py-2 rounded-sm font-semibold text-sm no-underline hover:bg-amber-deep transition-colors mb-3"
        >
          Pay Invoice →
        </a>
      )}

      {/* Prep checklist for upcoming */}
      {isUpcoming && (
        <div className="bg-cream border border-line rounded-sm p-4 mb-3">
          <div className="text-[0.65rem] uppercase tracking-wider text-teal font-semibold mb-2">Before Your Inspection</div>
          <ul className="text-xs text-charcoal space-y-1.5 list-none pl-0">
            <li className="flex gap-2"><span className="text-teal">✓</span> Ensure all utilities are on (water, gas, electric)</li>
            <li className="flex gap-2"><span className="text-teal">✓</span> Clear access to attic, crawlspace, and electrical panel</li>
            <li className="flex gap-2"><span className="text-teal">✓</span> Secure pets or arrange for them to be off-site</li>
            <li className="flex gap-2"><span className="text-teal">✓</span> Unlock any gates, sheds, or outbuildings</li>
            {insp.radonAddOn && <li className="flex gap-2"><span className="text-amber">✓</span> Keep all windows and exterior doors closed (radon testing)</li>}
          </ul>
        </div>
      )}

      {/* Reports */}
      {insp.reports?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {insp.reports.map((r, i) => (
            <a
              key={i}
              href={r.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-sm no-underline hover:bg-teal-deep transition-colors"
            >
              Download Report
            </a>
          ))}
        </div>
      )}

      {/* Action links */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-line">
        <Link href={`/portal/inspections/${insp.id}`} className="text-xs text-teal hover:text-amber no-underline font-semibold">
          View details →
        </Link>
        {isUpcoming && insp.token && (
          <Link href={`/manage?token=${insp.token}`} className="text-xs text-teal hover:text-amber no-underline font-semibold">
            Manage appointment →
          </Link>
        )}
        <a href={`tel:${PHONE_DIGITS}`} className="text-xs text-charcoal/50 hover:text-teal no-underline ml-auto">
          Questions? Call Harry
        </a>
      </div>
    </div>
  )
}

export default function PortalDashboard({ inspections, customerEmail }) {
  const upcoming = inspections.filter((i) => i.status === 'scheduled')
  const past = inspections.filter((i) => i.status === 'completed')

  return (
    <>
      {inspections.length === 0 && (
        <div className="bg-paper p-12 rounded-sm border border-line text-center">
          <h2 className="text-xl mb-3 text-ink">No inspections yet.</h2>
          <p className="text-charcoal mb-6">Once you book an inspection, it will appear here.</p>
          <Button href="/schedule" variant="teal" withArrow>Book an Inspection</Button>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">Upcoming</div>
          <div className="space-y-4 mb-10">
            {upcoming.map((insp) => <InspectionCard key={insp.id} insp={insp} isUpcoming />)}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">Past Inspections</div>
          <div className="space-y-3 mb-10">
            {past.map((insp) => <InspectionCard key={insp.id} insp={insp} isUpcoming={false} />)}
          </div>
        </>
      )}

      {/* Book another CTA */}
      {inspections.length > 0 && (
        <div className="bg-teal/[0.06] border border-teal/20 rounded-sm p-6 text-center mb-8">
          <p className="text-sm text-charcoal mb-3">Need another inspection?</p>
          <Button href="/schedule" variant="teal" withArrow>Book a New Inspection</Button>
        </div>
      )}

      {/* Contact */}
      <div className="bg-paper border border-line rounded-sm p-6 mb-8">
        <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Questions?</div>
        <p className="text-sm text-charcoal mb-3">Harry is happy to walk through any report or answer questions about your inspection.</p>
        <div className="flex flex-wrap gap-4">
          <a href={`tel:${PHONE_DIGITS}`} className="text-sm text-teal font-semibold hover:text-amber no-underline">{PHONE}</a>
          <a href="mailto:harry@evergreeninspections.com" className="text-sm text-teal font-semibold hover:text-amber no-underline">harry@evergreeninspections.com</a>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-line">
        <div className="flex items-center gap-4">
          <p className="text-xs text-charcoal/50">Signed in as {customerEmail}</p>
          <Link href="/portal/profile" className="text-xs text-teal hover:text-amber no-underline">Profile</Link>
        </div>
        <a href="/api/portal/logout" className="text-xs text-charcoal/50 hover:text-red-700 no-underline">Sign out</a>
      </div>
    </>
  )
}
