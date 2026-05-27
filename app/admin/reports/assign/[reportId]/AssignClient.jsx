'use client'

import { useState } from 'react'
import Link from 'next/link'

const TIMEZONE = 'America/Denver'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
  })
}

export default function AssignClient({ data }) {
  const [selectedId, setSelectedId] = useState('')
  const [search, setSearch] = useState('')
  const [notify, setNotify] = useState(true)
  const [state, setState] = useState('idle') // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState(null)

  const filtered = data.inspections.filter((i) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (i.customerName || '').toLowerCase().includes(q) ||
      (i.address || '').toLowerCase().includes(q) ||
      (i.inspectionNumber || '').toLowerCase().includes(q)
  })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedId) {
      setErrorMsg('Please select an inspection.')
      return
    }

    setState('submitting')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/admin/assign-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendingReportId: data.reportId,
          inspectionId: selectedId,
          notify,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        setErrorMsg(d.error || 'Failed to assign.')
        setState('idle')
        return
      }

      setState('done')
    } catch {
      setErrorMsg('Network error.')
      setState('idle')
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-paper p-8 rounded-sm border border-line text-center">
        <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
        <h2 className="text-xl mb-3 text-ink">Report assigned.</h2>
        <p className="text-sm text-charcoal mb-6">{notify ? 'Customer has been notified.' : 'Report linked — customer was not notified.'}</p>
        <Link href="/admin/inspections" className="text-teal hover:text-amber no-underline font-semibold text-sm">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Report info */}
      <div className="bg-paper border border-line rounded-sm p-6 mb-6">
        <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Report File</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal/60">File</span>
            <a href={data.fileUrl} target="_blank" rel="noopener noreferrer" className="text-teal hover:text-amber no-underline font-medium">{data.fileName}</a>
          </div>
          {data.recipientEmail && (
            <div className="flex justify-between">
              <span className="text-charcoal/60">Sent to</span>
              <span className="text-ink">{data.recipientEmail}</span>
            </div>
          )}
          {data.subject && (
            <div className="flex justify-between">
              <span className="text-charcoal/60">Subject</span>
              <span className="text-ink truncate max-w-[300px]">{data.subject}</span>
            </div>
          )}
        </div>
      </div>

      {/* Inspection picker */}
      <div className="bg-paper border border-line rounded-sm p-6 mb-6">
        <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Assign to Inspection</div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, address, or #..."
          className="w-full px-3 py-2 border border-line rounded-sm text-sm text-ink bg-cream outline-none focus:border-teal mb-3"
        />

        <div className="max-h-64 overflow-y-auto space-y-1">
          {filtered.map((i) => (
            <label
              key={i.id}
              className={`flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-colors ${selectedId === i.id ? 'bg-teal/10 border border-teal/30' : 'bg-cream border border-transparent hover:bg-cream/80'}`}
            >
              <input
                type="radio"
                name="inspection"
                value={i.id}
                checked={selectedId === i.id}
                onChange={() => setSelectedId(i.id)}
                className="accent-teal"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink">{i.customerName || 'Unknown'}</div>
                <div className="text-xs text-charcoal/60 truncate">
                  {i.inspectionNumber && `#${i.inspectionNumber} · `}{formatDate(i.date)} · {i.address || 'No address'}
                </div>
              </div>
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-charcoal/50 text-center py-4">No inspections match your search.</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-teal" />
        <span className="text-sm text-charcoal">Email customer that their report is ready</span>
      </label>

      {errorMsg && (
        <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mb-4 text-sm">{errorMsg}</div>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full py-3 bg-teal text-white rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-teal-deep transition-colors disabled:opacity-50"
      >
        {state === 'submitting' ? 'Assigning...' : 'Assign Report'}
      </button>
    </form>
  )
}
