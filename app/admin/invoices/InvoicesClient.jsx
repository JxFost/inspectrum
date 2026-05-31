'use client'

import { useState } from 'react'

const TIMEZONE = 'America/Denver'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { timeZone: TIMEZONE, month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCents(cents) {
  if (!cents) return '—'
  const num = parseInt(cents, 10)
  return isNaN(num) ? '—' : `$${Math.round(num / 100).toLocaleString()}`
}

const STATUS_FILTERS = ['All', 'Paid', 'Pending', 'Overdue', 'Not Invoiced']

const STATUS_STYLES = {
  paid: 'bg-teal/15 text-teal',
  pending: 'bg-amber/15 text-amber',
  overdue: 'bg-red-100 text-red-700',
  not_invoiced: 'bg-charcoal/10 text-charcoal/50',
  voided: 'bg-cream text-charcoal/40 line-through',
  refunded: 'bg-red-100 text-red-700',
}

export default function InvoicesClient({ inspections }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Compute overdue (pending > 7 days)
  const now = new Date()
  const withOverdue = inspections.map((i) => {
    const isOverdue = i.paymentStatus === 'pending' && i.invoicedAt &&
      (now - new Date(i.invoicedAt)) > 7 * 24 * 60 * 60 * 1000
    return { ...i, displayStatus: isOverdue ? 'overdue' : i.paymentStatus }
  })

  // Summary stats
  const totalPaid = withOverdue.filter((i) => i.paymentStatus === 'paid')
    .reduce((sum, i) => sum + (parseInt(i.paymentAmountCents, 10) || 0), 0)
  const totalPending = withOverdue.filter((i) => i.paymentStatus === 'pending')
    .reduce((sum, i) => sum + (parseInt(i.invoiceAmountCents, 10) || 0), 0)
  const overdueCount = withOverdue.filter((i) => i.displayStatus === 'overdue').length
  const uninvoicedCount = withOverdue.filter((i) => i.paymentStatus === 'not_invoiced').length

  // Filter
  const filtered = withOverdue.filter((i) => {
    if (statusFilter === 'Paid' && i.paymentStatus !== 'paid') return false
    if (statusFilter === 'Pending' && i.paymentStatus !== 'pending') return false
    if (statusFilter === 'Overdue' && i.displayStatus !== 'overdue') return false
    if (statusFilter === 'Not Invoiced' && i.paymentStatus !== 'not_invoiced') return false

    if (search) {
      const q = search.toLowerCase()
      return (i.customerName || '').toLowerCase().includes(q)
        || (i.email || '').toLowerCase().includes(q)
        || (i.inspectionNumber || '').toLowerCase().includes(q)
        || (i.address || '').toLowerCase().includes(q)
    }
    return true
  })

  return (
    <>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-line/30 rounded-sm p-4 shadow-sm">
          <div className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold mb-1">Collected</div>
          <div className="text-xl font-semibold text-teal">${Math.round(totalPaid / 100).toLocaleString()}</div>
        </div>
        <div className="bg-white border border-line/30 rounded-sm p-4 shadow-sm">
          <div className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold mb-1">Outstanding</div>
          <div className="text-xl font-semibold text-amber">${Math.round(totalPending / 100).toLocaleString()}</div>
        </div>
        <div className={`bg-paper border rounded-sm p-4 ${overdueCount > 0 ? 'border-red-200 bg-red-50' : 'border-line'}`}>
          <div className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold mb-1">Overdue</div>
          <div className={`text-xl font-semibold ${overdueCount > 0 ? 'text-red-700' : 'text-charcoal/30'}`}>{overdueCount}</div>
        </div>
        <div className="bg-white border border-line/30 rounded-sm p-4 shadow-sm">
          <div className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold mb-1">Not Invoiced</div>
          <div className={`text-xl font-semibold ${uninvoicedCount > 0 ? 'text-charcoal' : 'text-charcoal/30'}`}>{uninvoicedCount}</div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, address, or #..."
          className="bg-white border border-line px-4 py-3 shadow-sm text-sm text-ink rounded-sm outline-none focus:border-teal w-full"
        />
        <div className="flex gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm border cursor-pointer transition-colors ${
                statusFilter === s
                  ? 'bg-teal text-white border-teal'
                  : 'bg-transparent text-charcoal/60 border-line hover:border-teal'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line/60">
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold">#</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold">Date</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold">Customer</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold hidden md:table-cell">Service</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold text-right">Amount</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold">Status</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold hidden sm:table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b border-line/30 hover:bg-white transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-charcoal/40">
                  {i.inspectionNumber ? i.inspectionNumber.split('-').pop() : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-charcoal">{formatDate(i.startAt)}</td>
                <td className="px-4 py-3">
                  <div className="text-sm text-ink font-medium">{i.customerName}</div>
                  <div className="text-xs text-charcoal/50">{i.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-charcoal hidden md:table-cell">{i.service}</td>
                <td className="px-4 py-3 text-sm text-ink font-medium text-right">
                  {formatCents(i.paymentAmountCents || i.invoiceAmountCents)}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-[0.7rem] font-semibold ${STATUS_STYLES[i.displayStatus] || STATUS_STYLES.not_invoiced}`}>
                    {i.displayStatus === 'not_invoiced' ? 'Not invoiced'
                      : i.displayStatus === 'overdue' ? 'Overdue'
                      : i.displayStatus.charAt(0).toUpperCase() + i.displayStatus.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    {i.squareInvoiceUrl && (
                      <a href={i.squareInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-teal hover:text-amber no-underline font-semibold">
                        View
                      </a>
                    )}
                    {i.paymentStatus === 'not_invoiced' && i.eventId && (
                      <a href={`/admin/inspections/${i.eventId}/invoice`} className="text-xs text-amber hover:text-amber-deep no-underline font-semibold">
                        Send Invoice
                      </a>
                    )}
                    <a href={`/admin/inspections/${i.eventId}`} className="text-xs text-charcoal/40 hover:text-teal no-underline">
                      Details
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-charcoal/50">
                  {search || statusFilter !== 'All' ? 'No invoices match your filter.' : 'No invoices yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
