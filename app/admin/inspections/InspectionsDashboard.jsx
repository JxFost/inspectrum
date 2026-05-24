'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

const PAGE_SIZE = 20

const RANGE_OPTIONS = [
  { value: '2w', label: '2 Weeks' },
  { value: '1m', label: '1 Month' },
  { value: '2m', label: '2 Months' },
  { value: '3m', label: '3 Months' },
]

const SOURCE_FILTERS = ['all', 'web', 'acc', 'admin', 'unknown']
const SOURCE_LABELS = { all: 'All', web: 'Web', acc: 'ACC', admin: 'Admin', unknown: 'Unknown' }

const SERVICE_COLORS = {
  'Full Home Inspection': 'bg-teal/15 text-teal',
  'Radon Testing Only': 'bg-amber/15 text-amber',
  'Mold Assessment': 'bg-purple-100 text-purple-700',
  'Pre-Listing Inspection': 'bg-blue-100 text-blue-700',
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
function ManageIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
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

  // Today's agenda
  const todayItems = inspections.filter((i) => i.status === 'today')

  // Reset page when filter/search changes
  const updateSearch = (v) => { setSearch(v); setPage(1) }
  const updateSource = (v) => { setSourceFilter(v); setPage(1) }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-serif text-ink">Inspections</h1>
            <p className="text-sm text-charcoal/60 mt-1">{formatWindowDate(from)} – {formatWindowDate(to)}</p>
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
            <a href="/admin/block" className="text-sm text-charcoal/60 hover:text-teal">+ New</a>
          </div>
        </div>

        {/* Today's agenda */}
        {todayItems.length > 0 && (
          <div className="bg-amber/[0.08] border border-amber/20 rounded-sm p-4 mb-6">
            <div className="text-xs uppercase tracking-wider text-amber font-semibold mb-3">Today&apos;s Agenda</div>
            <div className="space-y-2">
              {todayItems.map((item) => (
                <div key={item.eventId} className="flex items-center gap-4 text-sm">
                  <span className="text-ink font-medium w-20">{formatTime(item.startISO)}</span>
                  <span className="text-ink">{item.customerName || '—'}</span>
                  <span className="text-charcoal/50 hidden sm:inline">·</span>
                  <span className="text-charcoal/60 hidden sm:inline truncate max-w-[200px]">{item.address || ''}</span>
                  {item.inspectionNumber && <span className="text-charcoal/40 text-xs font-mono ml-auto">{item.inspectionNumber}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard label="Inspections" value={inspections.length} trend={trendArrow(inspections.length, prevTotal)} />
          <StatCard label="Completed" value={completed} trend={trendArrow(completed, prevCompleted)} />
          <StatCard label="Upcoming" value={upcoming} />
          <StatCard label="Collected" value={collected ? `$${Math.round(collected / 100).toLocaleString()}` : '$0'} trend={trendArrow(collected, prevCollected)} />
          <StatCard label="Outstanding" value={outstanding ? `$${Math.round(outstanding / 100).toLocaleString()}` : '$0'} />
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
                  <th className="text-left px-3 py-2.5">#</th>
                  <th className="text-left px-3 py-2.5">Date & Time</th>
                  <th className="text-left px-3 py-2.5">Customer</th>
                  <th className="text-left px-3 py-2.5 hidden md:table-cell">Address</th>
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

                  return (<>
                    {showDivider && (
                      <tr key={`divider-${idx}`}>
                        <td colSpan="10" className="px-3 py-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-teal/30" />
                            <span className="text-[0.6rem] uppercase tracking-widest text-teal font-semibold">Upcoming</span>
                            <div className="flex-1 h-px bg-teal/30" />
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr key={item.eventId} className={`border-b border-line/50 hover:bg-cream/50 ${item.status === 'past' ? 'bg-charcoal/[0.02]' : ''} ${item.status === 'today' ? 'bg-amber/[0.06]' : ''}`}>
                    <td className="px-3 py-2 text-charcoal/40 text-xs font-mono">{item.inspectionNumber || '—'}</td>
                    <td className="px-3 py-2">
                      <div className="text-ink text-[0.8rem] font-medium">{formatDate(item.startISO)}</div>
                      <div className="text-charcoal/60 text-[0.75rem]">{formatTime(item.startISO)}</div>
                    </td>
                    <td className="px-3 py-2 text-ink">{item.customerName || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <span className="text-charcoal/70 text-[0.8rem] max-w-[200px] truncate block" title={item.address || ''}>
                        {item.address ? (item.address.length > 40 ? item.address.slice(0, 40) + '…' : item.address) : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold ${SERVICE_COLORS[item.service] || 'bg-cream text-charcoal'}`}>
                        {item.service || '?'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell text-ink">
                      {formatCents(item.paymentAmountCents || item.invoiceAmountCents)}
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      {item.paymentStatus ? (
                        <span className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold ${PAYMENT_COLORS[item.paymentStatus] || 'bg-cream text-charcoal'}`}>
                          {item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1)}
                        </span>
                      ) : (
                        <span className="text-[0.7rem] text-charcoal/40">Not invoiced</span>
                      )}
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold ${SOURCE_COLORS[item.source] || SOURCE_COLORS.unknown}`}
                        title={item.source === 'unknown' ? 'Created before source tracking was added' : undefined}
                      >
                        {SOURCE_LABELS[item.source] || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-3 py-2 hidden lg:table-cell">
                      <span className={`text-[0.8rem] ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'past' && !item.squareInvoiceUrl && item.source !== 'acc' && item.customerName && (
                          <a href={`/admin/inspections/${item.eventId}/invoice`} title="Send Invoice" className="text-charcoal/40 hover:text-amber transition-colors">
                            <SendInvoiceIcon />
                          </a>
                        )}
                        {item.squareInvoiceUrl && (
                          <a href={item.squareInvoiceUrl} target="_blank" rel="noopener noreferrer" title="View Invoice" className="text-charcoal/40 hover:text-amber transition-colors">
                            <InvoiceIcon />
                          </a>
                        )}
                        {item.token && (
                          <a href={`/manage?token=${item.token}`} target="_blank" rel="noopener noreferrer" title="Manage booking" className="text-charcoal/40 hover:text-teal transition-colors">
                            <ManageIcon />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                  </>)
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            {currentPage > 1 ? (
              <button type="button" onClick={() => setPage(currentPage - 1)} className="text-sm text-teal font-medium hover:text-amber cursor-pointer bg-transparent border-0">← Previous</button>
            ) : <span />}
            <span className="text-xs text-charcoal/50">Page {currentPage} of {totalPages}</span>
            {currentPage < totalPages ? (
              <button type="button" onClick={() => setPage(currentPage + 1)} className="text-sm text-teal font-medium hover:text-amber cursor-pointer bg-transparent border-0">Next →</button>
            ) : <span />}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, trend }) {
  return (
    <div className="bg-paper border border-line rounded-sm p-4">
      <div className="font-serif text-2xl text-ink">{value}{trend}</div>
      <div className="text-[0.65rem] uppercase tracking-wider text-charcoal/60 mt-1">{label}</div>
    </div>
  )
}
