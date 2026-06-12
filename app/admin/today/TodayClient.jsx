'use client'

import Link from 'next/link'

const TIMEZONE = 'America/Denver'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' })
}

function Alert({ type, children }) {
  const styles = {
    warning: 'bg-amber/10 border-amber text-amber-deep',
    error: 'bg-red-50 border-red-300 text-red-700',
    info: 'bg-teal/10 border-teal/30 text-teal',
    success: 'bg-teal/10 border-teal/30 text-teal',
  }
  return (
    <div className={`text-xs font-semibold px-2.5 py-1 rounded border ${styles[type] || styles.info}`}>
      {children}
    </div>
  )
}

function InspectionCard({ insp }) {
  const isPast = new Date(insp.endISO || insp.startISO) < new Date()

  // Collect alerts
  const alerts = []
  if (insp.agreementSigned === false) alerts.push({ type: 'warning', text: 'Agreement not signed' })
  if (isPast && insp.reportCount === 0) alerts.push({ type: 'warning', text: 'Report not sent' })
  if (!insp.email) alerts.push({ type: 'error', text: 'No customer email' })
  if (!insp.phone) alerts.push({ type: 'error', text: 'No customer phone' })
  if (insp.agreementSigned === true) alerts.push({ type: 'success', text: 'Agreement signed ✓' })
  if (insp.reportCount > 0) alerts.push({ type: 'success', text: `${insp.reportCount} report${insp.reportCount > 1 ? 's' : ''} uploaded` })

  return (
    <Link
      href={`/admin/inspections/${insp.eventId}`}
      className={`group relative block bg-white rounded-sm border shadow-sm no-underline transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-teal/50 ${
        alerts.some((a) => a.type === 'warning' || a.type === 'error')
          ? 'border-amber/40'
          : 'border-line/30'
      }`}
    >
      {/* Hover affordance — overlay passes clicks through so tel/mailto/maps links
          stay clickable, but the pill itself is clickable and navigates via the Link */}
      <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <span className="pointer-events-auto cursor-pointer bg-teal text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg scale-95 group-hover:scale-100 transition-transform duration-150">
          View details →
        </span>
      </span>
      <div className="p-5 sm:p-6">
        {/* Time + Service */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold text-ink">{formatTime(insp.startISO)}</span>
            <span className="text-sm text-charcoal/50">– {formatTime(insp.endISO)}</span>
          </div>
          <div className="flex items-center gap-2">
            {insp.radonAddOn && <span className="text-xs bg-amber/15 text-amber px-2 py-0.5 rounded font-semibold">Radon</span>}
            {insp.sewerScope && <span className="text-xs bg-charcoal/10 text-charcoal px-2 py-0.5 rounded font-semibold">Sewer</span>}
            {insp.inspectionNumber && <span className="text-xs text-charcoal/30 font-mono">#{insp.inspectionNumber.split('-').pop()}</span>}
          </div>
        </div>

        {/* Customer */}
        <div className="mb-3">
          <div className="text-lg font-semibold text-ink">{insp.customerName || 'Unknown'}</div>
          <div className="text-sm text-charcoal/60">{insp.service || 'Inspection'}</div>
        </div>

        {/* Contact — stopPropagation (not preventDefault) so the inner links still
            fire while the outer card Link doesn't */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-sm" onClick={(e) => e.stopPropagation()}>
          {insp.phone && (
            <a href={`tel:${insp.phone.replace(/[^+\d]/g, '')}`} className="text-teal hover:text-amber no-underline">{insp.phone}</a>
          )}
          {insp.email && (
            <a href={`mailto:${insp.email}`} className="text-teal hover:text-amber no-underline">{insp.email}</a>
          )}
        </div>

        {/* Address + Distance */}
        <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
          <a
            href={`https://maps.apple.com/?daddr=${encodeURIComponent(insp.address || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink hover:text-teal no-underline"
          >
            {insp.address || 'No address'}
          </a>
          {insp.distanceMiles && (
            <span className="text-sm text-charcoal/50 whitespace-nowrap ml-3">
              {insp.distanceMiles} mi · ~{Math.round(insp.distanceMiles * 1.5)} min
            </span>
          )}
        </div>

        {/* Get Directions — mobile only, opens the map app with the route */}
        {insp.address && (
          <a
            href={`https://maps.apple.com/?daddr=${encodeURIComponent(insp.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="sm:hidden flex items-center justify-center gap-2 w-full bg-teal/10 text-teal border border-teal/30 rounded-sm py-2.5 mb-3 text-sm font-semibold no-underline"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Get Directions
          </a>
        )}

        {/* Property details */}
        {(insp.sqft || insp.yearBuilt || insp.accessInfo) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/50 mb-3">
            {insp.sqft && <span>{parseInt(insp.sqft).toLocaleString()} sq ft</span>}
            {insp.yearBuilt && <span>Built {insp.yearBuilt} ({new Date().getFullYear() - parseInt(insp.yearBuilt)} yrs)</span>}
            {insp.accessInfo && <span className="text-teal">Access: {insp.accessInfo}</span>}
          </div>
        )}

        {/* Listing agent */}
        {insp.listingAgent && (
          <div className="text-xs text-charcoal/50 mb-3" onClick={(e) => e.stopPropagation()}>
            Listing Agent: {insp.listingAgent}
            {insp.listingAgentPhone && (
              <> · <a href={`tel:${insp.listingAgentPhone.replace(/[^+\d]/g, '')}`} className="text-teal hover:text-amber no-underline">{insp.listingAgentPhone}</a></>
            )}
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-line/30">
            {alerts.map((a, i) => <Alert key={i} type={a.type}>{a.text}</Alert>)}
          </div>
        )}
      </div>
    </Link>
  )
}

function DaySection({ label, inspections, emptyMessage }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-serif text-ink mb-4">{label}</h2>
      {inspections.length === 0 ? (
        <div className="bg-white border border-line/30 rounded-sm p-8 text-center shadow-sm">
          <p className="text-charcoal/50">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {inspections.map((insp) => <InspectionCard key={insp.eventId} insp={insp} />)}
        </div>
      )}
    </div>
  )
}

export default function TodayClient({ inspections, todayLabel, tomorrowLabel }) {
  const todayItems = inspections.filter((i) => i.day === 'today')
  const tomorrowItems = inspections.filter((i) => i.day === 'tomorrow')

  // Summary counts
  const unsignedToday = todayItems.filter((i) => i.agreementSigned === false).length
  const missingReports = todayItems.filter((i) => new Date(i.endISO || i.startISO) < new Date() && i.reportCount === 0).length

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-ink">Today</h1>
        {(unsignedToday > 0 || missingReports > 0) && (
          <div className="flex gap-2">
            {unsignedToday > 0 && <Alert type="warning">{unsignedToday} unsigned agreement{unsignedToday > 1 ? 's' : ''}</Alert>}
            {missingReports > 0 && <Alert type="warning">{missingReports} report{missingReports > 1 ? 's' : ''} not sent</Alert>}
          </div>
        )}
      </div>

      <DaySection
        label={todayLabel}
        inspections={todayItems}
        emptyMessage="No inspections today. Enjoy the day off!"
      />

      <DaySection
        label={`Tomorrow — ${tomorrowLabel}`}
        inspections={tomorrowItems}
        emptyMessage="Nothing scheduled for tomorrow."
      />

      <div className="text-center pt-4">
        <Link href="/admin/inspections" className="inline-flex items-center gap-2 text-sm text-teal font-semibold hover:text-amber no-underline transition-colors">
          See all inspections →
        </Link>
      </div>
    </>
  )
}
