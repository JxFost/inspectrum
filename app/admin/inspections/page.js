/*
 * Admin Inspections Dashboard — read-only table of recent and upcoming inspections.
 *
 * Default window: 14 days back through 14 days forward.
 * Override via ?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Pagination via ?page=N (1-indexed, 20 per page)
 */

import Link from 'next/link'
import { getInspectionsInWindow, serviceNameToId } from '@/lib/booking'
import { TIMEZONE } from '@/lib/working-hours'

export const metadata = {
  title: 'Admin — Inspections',
  robots: 'noindex, nofollow',
}

const PAGE_SIZE = 20

function defaultWindow() {
  const now = new Date()
  const from = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const to = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatWindowDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatCents(cents) {
  if (!cents) return ''
  const num = parseInt(cents, 10)
  if (isNaN(num)) return ''
  return `$${Math.round(num / 100)}`
}

function buildUrl(from, to, page) {
  const params = new URLSearchParams()
  params.set('from', from)
  params.set('to', to)
  if (page > 1) params.set('page', String(page))
  return `/admin/inspections?${params}`
}

// ---- Pill components ----

const SERVICE_COLORS = {
  full: 'bg-teal/15 text-teal',
  radon: 'bg-amber/15 text-amber',
  mold: 'bg-purple-100 text-purple-700',
  'pre-listing': 'bg-blue-100 text-blue-700',
}

function ServicePill({ name }) {
  const id = serviceNameToId(name)
  const color = SERVICE_COLORS[id] || 'bg-cream text-charcoal'
  return <span className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold ${color}`}>{name || '?'}</span>
}

const PAYMENT_COLORS = {
  paid: 'bg-teal/15 text-teal',
  pending: 'bg-amber/15 text-amber',
  refunded: 'bg-red-100 text-red-700',
  voided: 'bg-cream text-charcoal/50 line-through',
}

function PaymentPill({ status }) {
  if (!status) return <span className="text-[0.7rem] text-charcoal/40">Not invoiced</span>
  const color = PAYMENT_COLORS[status] || 'bg-cream text-charcoal'
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return <span className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold ${color}`}>{label}</span>
}

const SOURCE_COLORS = {
  web: 'bg-teal/15 text-teal',
  acc: 'bg-amber/15 text-amber',
  admin: 'bg-blue-100 text-blue-700',
  unknown: 'bg-cream text-charcoal/40',
}

const SOURCE_LABELS = { web: 'Web', acc: 'ACC', admin: 'Admin', unknown: 'Unknown' }

function SourcePill({ source }) {
  const color = SOURCE_COLORS[source] || SOURCE_COLORS.unknown
  const label = SOURCE_LABELS[source] || 'Unknown'
  const title = source === 'unknown' ? 'Created before source tracking was added — most likely a website booking.' : undefined
  return <span className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold ${color}`} title={title}>{label}</span>
}

const STATUS_COLORS = { past: 'text-charcoal/50', today: 'text-amber font-semibold', upcoming: 'text-teal font-semibold' }
const STATUS_LABELS = { past: 'Past', today: 'Today', upcoming: 'Upcoming' }

// ---- Action icons ----

function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function ManageIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
}

function InvoiceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
}

function SendInvoiceIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="12" y1="1" x2="12" y2="15" /><polyline points="16 11 12 15 8 11" /><path d="M20 21H4a2 2 0 01-2-2v-4h4l2 2h8l2-2h4v4a2 2 0 01-2 2z" /></svg>
}

// ---- Main page ----

export default async function InspectionsPage({ searchParams }) {
  const params = await searchParams
  const defaults = defaultWindow()
  const from = params.from || defaults.from
  const to = params.to || defaults.to
  const page = Math.max(1, parseInt(params.page, 10) || 1)

  let inspections = []
  let fetchError = null

  try {
    inspections = await getInspectionsInWindow({ from, to })
  } catch (err) {
    console.error('[admin-inspections] fetch error:', err)
    fetchError = err.message
  }

  const total = inspections.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const endIdx = Math.min(startIdx + PAGE_SIZE, total)
  const pageItems = inspections.slice(startIdx, endIdx)

  // Summary stats across full window
  const completed = inspections.filter((i) => i.status === 'past').length
  const upcoming = inspections.filter((i) => i.status !== 'past').length
  const collected = inspections
    .filter((i) => i.paymentStatus === 'paid' && i.paymentAmountCents)
    .reduce((sum, i) => sum + (parseInt(i.paymentAmountCents, 10) || 0), 0)
  const outstanding = inspections
    .filter((i) => i.paymentStatus === 'pending' && i.invoiceAmountCents)
    .reduce((sum, i) => sum + (parseInt(i.invoiceAmountCents, 10) || 0), 0)

  const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif text-ink">Inspections</h1>
            <p className="text-sm text-charcoal/60 mt-1">{formatWindowDate(from)} – {formatWindowDate(to)}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/admin/inspections.csv?from=${from}&to=${to}`}
              className="inline-flex items-center gap-1.5 text-sm text-teal font-semibold hover:text-amber transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Download CSV
            </a>
            <a href="/admin/block" className="text-sm text-charcoal/60 hover:text-teal">+ New</a>
            <a href="/admin/login" className="text-sm text-charcoal/60 hover:text-teal">Logout</a>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Inspections', value: total },
            { label: 'Completed', value: completed },
            { label: 'Upcoming', value: upcoming },
            { label: 'Collected', value: collected ? `$${Math.round(collected / 100).toLocaleString()}` : '$0' },
            { label: 'Outstanding', value: outstanding ? `$${Math.round(outstanding / 100).toLocaleString()}` : '$0' },
          ].map((stat) => (
            <div key={stat.label} className="bg-paper border border-line rounded-sm p-4">
              <div className="font-serif text-2xl text-ink">{stat.value}</div>
              <div className="text-[0.7rem] uppercase tracking-wider text-charcoal/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Page relationship */}
        <p className="text-sm text-charcoal/50 mb-4">
          Showing inspections {startIdx + 1}–{endIdx} of {total} · {formatWindowDate(from)} – {formatWindowDate(to)}
        </p>

        {fetchError && (
          <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mb-4 text-sm">{fetchError}</div>
        )}

        {/* Table */}
        {total === 0 ? (
          <div className="bg-paper border border-line rounded-sm p-12 text-center">
            <p className="text-charcoal/60 mb-2">No inspections scheduled in this window.</p>
            <p className="text-xs text-charcoal/40">Try adjusting the date range: ?from=YYYY-MM-DD&to=YYYY-MM-DD</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-paper border border-line rounded-sm text-sm">
              <thead>
                <tr className="border-b border-line text-[0.65rem] uppercase tracking-wider text-charcoal/50">
                  <th className="text-left px-3 py-2.5">Date & Time</th>
                  <th className="text-left px-3 py-2.5">Customer</th>
                  <th className="text-left px-3 py-2.5 hidden md:table-cell">Address</th>
                  <th className="text-left px-3 py-2.5">Service</th>
                  <th className="text-right px-3 py-2.5 hidden sm:table-cell">Price</th>
                  <th className="text-left px-3 py-2.5 hidden sm:table-cell">Payment</th>
                  <th className="text-left px-3 py-2.5 hidden lg:table-cell">Source</th>
                  <th className="text-left px-3 py-2.5 hidden lg:table-cell">Status</th>
                  <th className="text-right px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.eventId} className="border-b border-line/50 hover:bg-cream/50">
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
                    <td className="px-3 py-2"><ServicePill name={item.service} /></td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell text-ink">
                      {formatCents(item.paymentAmountCents || item.invoiceAmountCents)}
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell"><PaymentPill status={item.paymentStatus} /></td>
                    <td className="px-3 py-2 hidden lg:table-cell"><SourcePill source={item.source} /></td>
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
                          <a href={item.squareInvoiceUrl} target="_blank" rel="noopener noreferrer" title="View Square invoice" className="text-charcoal/40 hover:text-amber transition-colors">
                            <InvoiceIcon />
                          </a>
                        )}
                        {item.htmlLink && (
                          <a href={item.htmlLink} target="_blank" rel="noopener noreferrer" title="Open in Google Calendar" className="text-charcoal/40 hover:text-teal transition-colors">
                            <CalendarIcon />
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            {currentPage > 1 ? (
              <Link href={buildUrl(from, to, currentPage - 1)} className="text-sm text-teal font-medium hover:text-amber no-underline">← Previous</Link>
            ) : <span />}
            {currentPage < totalPages ? (
              <Link href={buildUrl(from, to, currentPage + 1)} className="text-sm text-teal font-medium hover:text-amber no-underline">Next →</Link>
            ) : <span />}
          </div>
        )}
      </div>
    </div>
  )
}
