'use client'

import { useState } from 'react'

const TIMEZONE = 'America/Denver'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { timeZone: TIMEZONE, month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CustomersClient({ customers }) {
  const [search, setSearch] = useState('')

  const filtered = customers.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (c.name || '').toLowerCase().includes(q)
      || (c.email || '').toLowerCase().includes(q)
      || (c.phone || '').includes(q)
  })

  return (
    <>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, or phone..."
        className="w-full bg-white border border-line px-4 py-3 shadow-sm text-sm text-ink rounded-sm outline-none focus:border-teal mb-4"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line/60">
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold">Name</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold">Email</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold hidden sm:table-cell">Phone</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold hidden md:table-cell text-center">Inspections</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold hidden md:table-cell text-center">Reports</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold hidden lg:table-cell">Last Inspection</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold hidden lg:table-cell">Portal</th>
              <th className="px-4 py-3 text-[0.65rem] uppercase tracking-wider text-charcoal/40 font-semibold hidden sm:table-cell"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-line/30 hover:bg-white transition-colors">
                <td className="px-4 py-3 text-sm text-ink font-medium">{c.name}</td>
                <td className="px-4 py-3 text-sm">
                  <a href={`mailto:${c.email}`} className="text-teal hover:text-amber no-underline">{c.email}</a>
                </td>
                <td className="px-4 py-3 text-sm text-charcoal hidden sm:table-cell">
                  {c.phone ? (
                    <a href={`tel:${c.phone.replace(/[^+\d]/g, '')}`} className="text-charcoal/70 hover:text-teal no-underline">{c.phone}</a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-center hidden md:table-cell">
                  {c.inspectionCount > 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal/10 text-teal text-xs font-bold">{c.inspectionCount}</span>
                  ) : (
                    <span className="text-charcoal/30">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-center hidden md:table-cell">
                  {c.reportCount > 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber/10 text-amber text-xs font-bold">{c.reportCount}</span>
                  ) : (
                    <span className="text-charcoal/30">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-charcoal/60 hidden lg:table-cell">{formatDate(c.lastInspection)}</td>
                <td className="px-4 py-3 text-xs hidden lg:table-cell">
                  {c.lastLogin ? (
                    <span className="text-teal font-medium">Active</span>
                  ) : (
                    <span className="text-charcoal/40">Never</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs hidden sm:table-cell">
                  <a
                    href={`/admin/inspections?search=${encodeURIComponent(c.email)}&range=all`}
                    className="text-teal hover:text-amber no-underline font-semibold"
                  >
                    Inspections
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-charcoal/50">
                  {search ? 'No customers match your search.' : 'No customers yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-charcoal/40 text-center mt-4">
        Customers are created automatically when inspections are booked.
      </p>
    </>
  )
}
