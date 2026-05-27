'use client'

import { useState, useMemo, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import * as mileage from '@/lib/mileage'
import Tooltip, { TooltipProvider } from '@/components/Tooltip'

const PAGE_SIZE = 20

const RANGE_OPTIONS = [
  { value: '2w', label: '2 Weeks' },
  { value: '1m', label: '1 Month' },
  { value: '2m', label: '2 Months' },
  { value: '3m', label: '3 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'lastyear', label: 'Last Year' },
]

const SOURCE_FILTERS = ['all', 'web', 'acc', 'admin', 'unknown']
const SOURCE_LABELS = { all: 'All', web: 'Web', acc: 'ACC', admin: 'Admin', unknown: 'Unknown' }

const SERVICE_COLORS = {
  'Full Home Inspection': 'bg-teal/15 text-teal',
  'Radon Testing Only': 'bg-amber/15 text-amber',
  'Mold Assessment': 'bg-purple-100 text-purple-700',
  'Pre-Listing Inspection': 'bg-blue-100 text-blue-700',
  'Commercial Inspection': 'bg-blue-100 text-blue-700',
  'Sewer Scope': 'bg-charcoal/10 text-charcoal',
}

// Service icons — compact SVGs for table cells
function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
}
function RadonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
}
function MoldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
}
function CommercialIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" /><line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" /><line x1="9" y1="14" x2="9" y2="14.01" /><line x1="15" y1="14" x2="15" y2="14.01" /><path d="M9 18h6" /></svg>
}
function SewerIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
}
function PreListIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 12l2 2 4-4" /></svg>
}

function ServiceIconPill({ service, radonAddOn, sewerScope }) {
  const icons = []

  // Primary service icon
  const svcColor = SERVICE_COLORS[service] || 'bg-cream text-charcoal'
  const svcName = service || 'Inspection'
  if (service?.includes('Commercial')) {
    icons.push({ icon: <CommercialIcon />, color: SERVICE_COLORS['Commercial Inspection'], label: 'Commercial Inspection' })
  } else if (service?.includes('Radon')) {
    icons.push({ icon: <RadonIcon />, color: SERVICE_COLORS['Radon Testing Only'], label: 'Radon Testing' })
  } else if (service?.includes('Mold')) {
    icons.push({ icon: <MoldIcon />, color: SERVICE_COLORS['Mold Assessment'], label: 'Mold Assessment' })
  } else if (service?.includes('Pre-Listing')) {
    icons.push({ icon: <PreListIcon />, color: SERVICE_COLORS['Pre-Listing Inspection'], label: 'Pre-Listing Inspection' })
  } else if (service?.includes('Sewer')) {
    icons.push({ icon: <SewerIcon />, color: SERVICE_COLORS['Sewer Scope'], label: 'Sewer Scope' })
  } else {
    icons.push({ icon: <HomeIcon />, color: SERVICE_COLORS['Full Home Inspection'], label: svcName })
  }

  // Add-on icons
  if (radonAddOn) {
    icons.push({ icon: <RadonIcon />, color: SERVICE_COLORS['Radon Testing Only'], label: 'Radon Add-On' })
  }
  if (sewerScope) {
    icons.push({ icon: <SewerIcon />, color: SERVICE_COLORS['Sewer Scope'], label: 'Sewer Scope Add-On' })
  }

  return (
    <div className="flex items-center gap-1">
      {icons.map((item, i) => (
        <Tooltip key={i} content={item.label}>
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${item.color} cursor-default`}>
            {item.icon}
          </span>
        </Tooltip>
      ))}
    </div>
  )
}

const PAYMENT_COLORS = {
  paid: 'bg-teal/15 text-teal',
  pending: 'bg-amber/15 text-amber',
  refunded: 'bg-red-100 text-red-700',
  voided: 'bg-cream text-charcoal/50 line-through',
}

const SOURCE_COLORS = {
  web: 'bg-teal/15 text-teal',
  acc: 'bg-amber/15 text-amber',
  admin: 'bg-blue-100 text-blue-700',
  unknown: 'bg-cream text-charcoal/40',
}


function truncateAddress(address) {
  if (!address) return '—'
  // Remove state + zip (", CO 80439" or ", CO, 80439")
  return address.replace(/,?\s*CO\s*,?\s*\d{5}.*$/, '').trim() || address
}

const STATUS_COLORS = { past: 'text-charcoal/50', today: 'text-amber font-semibold', upcoming: 'text-teal font-semibold' }
const STATUS_LABELS = { past: 'Past', today: 'Today', upcoming: 'Upcoming' }
const TIMEZONE = 'America/Denver'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { timeZone: TIMEZONE, weekday: 'short', month: 'short', day: 'numeric' })
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' })
}
function formatWindowDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function formatCents(cents) {
  if (!cents) return ''
  const num = parseInt(cents, 10)
  return isNaN(num) ? '' : `$${Math.round(num / 100)}`
}
function trendArrow(current, previous) {
  if (!previous) return null
  const diff = current - previous
  if (diff === 0) return null
  return diff > 0
    ? <span className="text-teal text-[0.65rem] ml-1">↑{diff}</span>
    : <span className="text-red-500 text-[0.65rem] ml-1">↓{Math.abs(diff)}</span>
}

// Icons
function SendInvoiceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" /></svg>
}
function InvoiceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}
function ManageIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
}
function ViewIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
}

export default function InspectionsDashboard({
  inspections, from, to, range, fetchError,
  prevCompleted, prevCollected, prevTotal, ytdCount,
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sortByPayment, setSortByPayment] = useState(false)
  const [page, setPage] = useState(1)

  // Filter + search
  const filtered = useMemo(() => {
    let items = inspections

    if (sourceFilter !== 'all') {
      items = items.filter((i) => i.source === sourceFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter((i) =>
        (i.customerName || '').toLowerCase().includes(q) ||
        (i.address || '').toLowerCase().includes(q) ||
        (i.inspectionNumber || '').toLowerCase().includes(q)
      )
    }

    if (sortByPayment) {
      const ORDER = { pending: 0, paid: 1, refunded: 2, voided: 3 }
      items = [...items].sort((a, b) => {
        const aVal = a.paymentStatus ? (ORDER[a.paymentStatus] ?? 4) : 5
        const bVal = b.paymentStatus ? (ORDER[b.paymentStatus] ?? 4) : 5
        return aVal - bVal
      })
    }

    return items
  }, [inspections, sourceFilter, search, sortByPayment])

  // Customer history — count bookings per customer name (across full window)
  const customerCounts = useMemo(() => {
    const counts = {}
    for (const i of inspections) {
      if (!i.customerName) continue
      const key = i.customerName.toLowerCase().trim()
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, [inspections])

  // Pagination
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const endIdx = Math.min(startIdx + PAGE_SIZE, total)
  const pageItems = filtered.slice(startIdx, endIdx)

  // Summary stats (always from full inspections list, not filtered)
  const completed = inspections.filter((i) => i.status === 'past').length
  const upcoming = inspections.filter((i) => i.status !== 'past').length
  const collected = inspections
    .filter((i) => i.paymentStatus === 'paid' && i.paymentAmountCents)
    .reduce((sum, i) => sum + (parseInt(i.paymentAmountCents, 10) || 0), 0)
  const outstanding = inspections
    .filter((i) => i.paymentStatus === 'pending' && i.invoiceAmountCents)
    .reduce((sum, i) => sum + (parseInt(i.invoiceAmountCents, 10) || 0), 0)
  const overdueCount = inspections.filter((i) =>
    i.paymentStatus === 'pending' && i.invoicedAt &&
    (Date.now() - new Date(i.invoicedAt).getTime()) > 7 * 24 * 60 * 60 * 1000
  ).length

  // Today's agenda — sorted earliest first
  const todayItems = inspections.filter((i) => i.status === 'today')
    .sort((a, b) => new Date(a.startISO) - new Date(b.startISO))

  // Tomorrow's agenda — show after 6pm MT (working hours end)
  const now = new Date()
  const denverHour = parseInt(now.toLocaleTimeString('en-US', { timeZone: 'America/Denver', hour12: false, hour: 'numeric' }), 10)
  const tomorrowStr = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-CA', { timeZone: 'America/Denver' })
  const tomorrowItems = denverHour >= 18
    ? inspections.filter((i) => {
        const eventDate = new Date(i.startISO).toLocaleDateString('en-CA', { timeZone: 'America/Denver' })
        return eventDate === tomorrowStr
      }).sort((a, b) => new Date(a.startISO) - new Date(b.startISO))
    : []

  // Reset page when filter/search changes
  const updateSearch = (v) => { setSearch(v); setPage(1) }
  const updateSource = (v) => { setSourceFilter(v); setPage(1) }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-serif text-ink">Inspections</h1>
            <p className="text-sm text-charcoal/60 mt-1">{formatWindowDate(from)} – {formatWindowDate(to)} <span className="text-charcoal/40"> — {inspections.length} Inspections</span></p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => router.push(e.target.value === '2w' ? '/admin/inspections' : `/admin/inspections?range=${e.target.value}`)}
              className="bg-cream border border-line px-3 py-1.5 text-sm text-ink rounded-sm outline-none focus:border-teal cursor-pointer"
            >
              {RANGE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <a href={`/admin/inspections.csv?from=${from}&to=${to}`} className="inline-flex items-center gap-1.5 text-sm text-teal font-semibold hover:text-amber transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              CSV
            </a>
            <a href="/admin/block" className="hidden md:inline-flex text-sm text-charcoal/60 hover:text-teal">+ New</a>
          </div>
        </div>

        {/* Today's agenda */}
        {todayItems.length > 0 && (
          <div className="bg-amber/[0.08] border border-amber/20 rounded-sm p-4 mb-6">
            <div className="text-xs uppercase tracking-wider text-amber font-semibold mb-3">Today&apos;s Agenda</div>
            <div className="space-y-2">
              {todayItems.map((item) => (
                <div key={item.eventId} className="flex items-center gap-4 text-sm">
                  <span className="text-ink font-medium w-20 shrink-0">{formatTime(item.startISO)}</span>
                  <span className="text-ink">{item.customerName || '—'}</span>
                  <span className="text-charcoal/50">·</span>
                  {item.address ? (
                    <a href={`https://maps.apple.com/?q=${encodeURIComponent(item.address)}`} className="text-teal/70 hover:text-teal truncate max-w-[250px] no-underline hover:underline">{item.address}</a>
                  ) : (
                    <span className="text-charcoal/40">Address TBD</span>
                  )}
                  <span className="text-charcoal/40 text-xs ml-auto hidden sm:inline">{item.distanceMiles ? `${item.distanceMiles} mi` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tomorrow's agenda — visible after 6pm MT */}
        {tomorrowItems.length > 0 && (
          <div className="bg-teal/[0.06] border border-teal/20 rounded-sm p-4 mb-6">
            <div className="text-xs uppercase tracking-wider text-teal font-semibold mb-3">Tomorrow&apos;s Schedule</div>
            <div className="space-y-2">
              {tomorrowItems.map((item) => (
                <div key={item.eventId} className="flex items-center gap-4 text-sm">
                  <span className="text-ink font-medium w-20 shrink-0">{formatTime(item.startISO)}</span>
                  <span className="text-ink">{item.customerName || '—'}</span>
                  <span className="text-charcoal/50">·</span>
                  {item.address ? (
                    <a href={`https://maps.apple.com/?q=${encodeURIComponent(item.address)}`} className="text-teal/70 hover:text-teal truncate max-w-[250px] no-underline hover:underline">{item.address}</a>
                  ) : (
                    <span className="text-charcoal/40">Address TBD</span>
                  )}
                  <span className="text-charcoal/40 text-xs ml-auto hidden sm:inline">{item.distanceMiles ? `${item.distanceMiles} mi` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary strip */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 lg:grid-cols-6 sm:overflow-visible sm:pb-0">
          {/* <StatCard label="Inspections" value={inspections.length} trend={trendArrow(inspections.length, prevTotal)} /> */}
          <StatCard label="Completed" value={completed} trend={trendArrow(completed, prevCompleted)} />
          <StatCard label="Upcoming" value={upcoming} />
          <StatCard label="Collected" value={collected ? `$${Math.round(collected / 100).toLocaleString()}` : '$0'} trend={trendArrow(collected, prevCollected)} />
          <StatCard label="Outstanding" value={outstanding ? `$${Math.round(outstanding / 100).toLocaleString()}` : '$0'} />
          <StatCard label="Overdue" value={overdueCount} alert={overdueCount > 0} />
          <StatCard label="YTD Total" value={ytdCount} />
        </div>

        {/* Search + source filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search name, address, or #..."
            className="bg-paper border border-line px-3 py-2 text-sm text-ink rounded-sm outline-none focus:border-teal w-full sm:w-64"
          />
          <div className="flex gap-1">
            {SOURCE_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateSource(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm border cursor-pointer transition-colors ${
                  sourceFilter === s
                    ? 'bg-teal text-white border-teal'
                    : 'bg-paper text-charcoal/60 border-line hover:border-teal hover:text-teal'
                }`}
              >
                {SOURCE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Page relationship */}
        <p className="text-sm text-charcoal/50 mb-3">
          Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of {total} {sourceFilter !== 'all' ? `(${SOURCE_LABELS[sourceFilter]})` : ''}
          {search && ` matching "${search}"`}
        </p>

        {fetchError && (
          <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mb-4 text-sm">{fetchError}</div>
        )}

        {/* Table */}
        {total === 0 ? (
          <div className="bg-paper border border-line rounded-sm p-12 text-center">
            <p className="text-charcoal/60 mb-2">{search ? 'No matching inspections.' : 'No inspections in this window.'}</p>
            {!search && <p className="text-xs text-charcoal/40">Try a wider date range or different filters.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-paper border border-line rounded-sm text-sm">
              <thead>
                <tr className="border-b border-line text-[0.65rem] uppercase tracking-wider text-charcoal/50">
                  <th className="text-left px-3 py-2.5 hidden md:table-cell">#</th>
                  <th className="text-left px-3 py-2.5">Date & Time</th>
                  <th className="text-left px-3 py-2.5">Customer</th>
                  <th className="text-left px-3 py-2.5 hidden md:table-cell">Address</th>
                  <th className="text-right px-3 py-2.5 hidden lg:table-cell">Dist.</th>
                  <th className="text-left px-3 py-2.5">Service</th>
                  <th className="text-right px-3 py-2.5 hidden sm:table-cell">Price</th>
                  <th className="text-left px-3 py-2.5 hidden sm:table-cell">
                    <button type="button" onClick={() => setSortByPayment(!sortByPayment)} className="text-charcoal/50 hover:text-teal transition-colors inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 text-[0.65rem] uppercase tracking-wider font-semibold">
                      Payment
                      {sortByPayment && <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 text-teal"><path d="M6 2l4 5H2z" /></svg>}
                    </button>
                  </th>
                  <th className="text-left px-3 py-2.5 hidden lg:table-cell">Source</th>
                  <th className="text-left px-3 py-2.5 hidden lg:table-cell">Status</th>
                  <th className="text-right px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item, idx) => {
                  // Insert a divider when transitioning from past/today to upcoming
                  const prev = idx > 0 ? pageItems[idx - 1] : null
                  const showDivider = prev && prev.status !== 'upcoming' && item.status === 'upcoming'

                  // Overdue: pending invoice that was sent 7+ days ago
                  const isOverdue = item.paymentStatus === 'pending' && item.invoicedAt &&
                    (Date.now() - new Date(item.invoicedAt).getTime()) > 7 * 24 * 60 * 60 * 1000

                  return (<Fragment key={item.eventId}>
                    {showDivider && (
                      <tr key={`divider-${idx}`}>
                        <td colSpan="11" className="px-3 py-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-teal/30" />
                            <span className="text-[0.6rem] uppercase tracking-widest text-teal font-semibold">Upcoming</span>
                            <div className="flex-1 h-px bg-teal/30" />
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr key={item.eventId} className={`border-b border-line/50 hover:bg-cream/50 ${isOverdue ? 'bg-red-50 border-l-2 border-l-red-400' : item.status === 'past' ? 'bg-charcoal/[0.04]' : item.status === 'today' ? 'bg-amber/[0.06]' : ''}`}>
                    <td className="px-3 py-2 text-charcoal/40 text-xs font-mono hidden md:table-cell">
                      <Tooltip content={item.inspectionNumber}>
                        <span>{item.inspectionNumber ? item.inspectionNumber.split('-').pop() : '—'}</span>
                      </Tooltip>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-ink text-[0.8rem] font-medium">{formatDate(item.startISO)}</div>
                      <div className="text-charcoal/60 text-[0.75rem]">{formatTime(item.startISO)}</div>
                    </td>
                    <td className="px-3 py-2 text-ink">
                      {item.customerName || '—'}
                      {item.customerName && customerCounts[item.customerName.toLowerCase().trim()] > 1 && (
                        <Tooltip content={`Repeat customer — ${customerCounts[item.customerName.toLowerCase().trim()]} bookings`}>
                          <span className="ml-1 inline-flex items-center bg-teal/10 text-teal text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full">
                            {customerCounts[item.customerName.toLowerCase().trim()]}x
                          </span>
                        </Tooltip>
                      )}
                      {item.feedbackRating && (
                        <Tooltip content={`Customer rated ${item.feedbackRating}/5`}>
                          <span className="ml-1 text-amber text-xs">
                            {'★'.repeat(parseInt(item.feedbackRating))}
                          </span>
                        </Tooltip>
                      )}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <Tooltip content={item.address} side="bottom">
                        <span className="text-charcoal/70 text-[0.8rem] max-w-[200px] truncate block">
                          {truncateAddress(item.address)}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="px-3 py-2 text-right hidden lg:table-cell">
                      <span
                        className={`text-[0.75rem] ${
                          item.distanceMiles && parseInt(item.distanceMiles) > mileage.BASE_RADIUS_MILES
                            ? 'text-amber font-medium'
                            : 'text-charcoal/50'
                        }`}
                      >
                        <Tooltip content={item.tripChargeCents ? `Trip charge: $${Math.round(parseInt(item.tripChargeCents) / 100)}` : null}>
                          <span>{item.distanceMiles ? `${item.distanceMiles} mi` : 'TBD'}</span>
                        </Tooltip>
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <ServiceIconPill service={item.service} radonAddOn={item.radonAddOn} sewerScope={item.sewerScope} />
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell text-ink">
                      {formatCents(item.paymentAmountCents || item.invoiceAmountCents)}
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      {isOverdue ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold bg-red-100 text-red-700">Overdue</span>
                      ) : item.paymentStatus ? (
                        <span className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold ${PAYMENT_COLORS[item.paymentStatus] || 'bg-cream text-charcoal'}`}>
                          {item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1)}
                        </span>
                      ) : (
                        <span className="text-[0.7rem] text-charcoal/40">Not invoiced</span>
                      )}
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      <Tooltip content={item.source === 'unknown' ? 'Created before source tracking' : null}>
                        <span className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold ${SOURCE_COLORS[item.source] || SOURCE_COLORS.unknown}`}>
                          {SOURCE_LABELS[item.source] || 'Unknown'}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      <span className={`text-[0.8rem] ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'past' && !item.squareInvoiceUrl && item.source !== 'acc' && item.customerName && (
                          <Tooltip content="Send Invoice">
                            <a href={`/admin/inspections/${item.eventId}/invoice`} className="text-charcoal/40 hover:text-amber transition-colors">
                              <SendInvoiceIcon />
                            </a>
                          </Tooltip>
                        )}
                        {item.squareInvoiceUrl && (
                          <Tooltip content="View Invoice">
                            <a href={item.squareInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-charcoal/40 hover:text-amber transition-colors">
                              <InvoiceIcon />
                            </a>
                          </Tooltip>
                        )}
                        {item.eventId && (
                          <Tooltip content="View Details">
                            <a href={`/admin/inspections/${item.eventId}`} className="text-charcoal/40 hover:text-teal transition-colors">
                              <ViewIcon />
                            </a>
                          </Tooltip>
                        )}
                        {item.token && (
                          <Tooltip content="Manage Booking">
                            <a href={`/manage?token=${item.token}`} target="_blank" rel="noopener noreferrer" className="text-charcoal/40 hover:text-teal transition-colors">
                              <ManageIcon />
                            </a>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                  </Fragment>)
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
            <span className="text-xs text-charcoal/50">
              Showing {startIdx + 1}–{endIdx} of {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs text-charcoal/60 hover:text-teal cursor-pointer bg-transparent border border-line rounded-sm disabled:opacity-30 disabled:cursor-default"
              >
                First
              </button>
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs text-charcoal/60 hover:text-teal cursor-pointer bg-transparent border border-line rounded-sm disabled:opacity-30 disabled:cursor-default"
              >
                ←
              </button>
              {(() => {
                const pages = []
                let start = Math.max(1, currentPage - 2)
                let end = Math.min(totalPages, start + 4)
                if (end - start < 4) start = Math.max(1, end - 4)
                for (let i = start; i <= end; i++) pages.push(i)
                return pages.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-xs rounded-sm cursor-pointer border transition-colors ${
                      p === currentPage
                        ? 'bg-teal text-white border-teal font-bold'
                        : 'bg-transparent text-charcoal/60 border-line hover:text-teal hover:border-teal'
                    }`}
                  >
                    {p}
                  </button>
                ))
              })()}
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs text-charcoal/60 hover:text-teal cursor-pointer bg-transparent border border-line rounded-sm disabled:opacity-30 disabled:cursor-default"
              >
                →
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs text-charcoal/60 hover:text-teal cursor-pointer bg-transparent border border-line rounded-sm disabled:opacity-30 disabled:cursor-default"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  )
}

function StatCard({ label, value, trend, alert }) {
  return (
    <div className={`border rounded-sm p-4 min-w-[130px] shrink-0 sm:grow sm:shrink ${alert ? 'bg-red-50 border-red-200' : 'bg-paper border-line'}`}>
      <div className={`font-serif text-2xl ${alert ? 'text-red-700' : 'text-ink'}`}>{value}{trend}</div>
      <div className={`text-[0.65rem] uppercase tracking-wider mt-1 ${alert ? 'text-red-500' : 'text-charcoal/60'}`}>{label}</div>
    </div>
  )
}
