'use client'

import Link from 'next/link'
import Button from '@/components/Button'

const TIMEZONE = 'America/Denver'

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

  if (status === 'paid') {
    return <span className="text-xs text-teal font-semibold">Paid {amount}</span>
  }
  if (status === 'pending') {
    return <span className="text-xs text-amber font-semibold">Invoice Due {amount}</span>
  }
  return null
}

export default function PortalDashboard({ inspections, customerEmail }) {
  const upcoming = inspections.filter((i) => i.status === 'scheduled')
  const past = inspections.filter((i) => i.status === 'completed')

  return (
    <>
      {inspections.length === 0 && (
        <div className="bg-paper p-12 rounded-sm border border-line text-center">
          <h2 className="text-xl mb-3 text-ink">No inspections yet.</h2>
          <p className="text-charcoal mb-6">
            Once you book an inspection, it will appear here.
          </p>
          <Button href="/schedule" variant="teal" withArrow>Book an Inspection</Button>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">Upcoming</div>
          <div className="space-y-4 mb-10">
            {upcoming.map((insp) => (
              <div key={insp.id} className="bg-paper p-6 rounded-sm border border-line">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="font-semibold text-ink">{insp.service || 'Inspection'}</div>
                    <div className="text-sm text-charcoal/70">{insp.address || 'Address TBD'}</div>
                  </div>
                  <StatusBadge status="scheduled" />
                </div>
                <div className="text-sm text-charcoal mb-3">
                  {formatDate(insp.startAt)}
                  {insp.endAt && ` · ${formatTime(insp.startAt)} – ${formatTime(insp.endAt)}`}
                </div>
                {insp.inspectionNumber && (
                  <div className="text-xs text-charcoal/50 font-mono mb-3">#{insp.inspectionNumber}</div>
                )}
                <div className="flex items-center gap-4">
                  <PaymentBadge status={insp.paymentStatus} amountCents={insp.invoiceAmountCents} />
                  {insp.token && (
                    <Link
                      href={`/manage?token=${insp.token}`}
                      className="text-xs text-teal hover:text-amber no-underline font-semibold"
                    >
                      Manage appointment →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">Past Inspections</div>
          <div className="space-y-3 mb-10">
            {past.map((insp) => (
              <div key={insp.id} className="bg-paper p-5 rounded-sm border border-line">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-ink">{insp.service || 'Inspection'}</div>
                    <div className="text-sm text-charcoal/70">{insp.address || ''}</div>
                    <div className="text-xs text-charcoal/50 mt-1">
                      {formatDate(insp.startAt)}
                      {insp.inspectionNumber && ` · #${insp.inspectionNumber}`}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status="completed" />
                    <PaymentBadge status={insp.paymentStatus} amountCents={insp.invoiceAmountCents} />
                  </div>
                </div>
                {insp.reports?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-line flex flex-wrap gap-3">
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
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-line">
        <p className="text-xs text-charcoal/50">Signed in as {customerEmail}</p>
        <a href="/api/portal/logout" className="text-xs text-charcoal/50 hover:text-red-700 no-underline">Sign out</a>
      </div>
    </>
  )
}
