'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InvoiceForm({ eventId, suggestedPrice, customerEmail }) {
  const [price, setPrice] = useState(suggestedPrice ? String(suggestedPrice) : '')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | error
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()

    const dollars = parseFloat(price)
    if (!dollars || dollars <= 0) {
      setErrorMsg('Please enter a valid price.')
      return
    }

    if (!customerEmail) {
      setErrorMsg('No email on file — cannot send an invoice without a customer email.')
      return
    }

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/inspection/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          priceCents: Math.round(dollars * 100),
          notes: notes.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create invoice.')
        setStatus('error')
        return
      }

      router.push(`/admin/inspections?invoiced=${eventId}`)
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-paper border border-line rounded-sm p-6">
      <div className="mb-4">
        <label className="block text-xs uppercase tracking-wider text-charcoal/70 font-semibold mb-1.5">
          Final Price (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/50 text-lg">$</span>
          <input
            type="number"
            step="0.01"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="450.00"
            className="w-full bg-cream border border-line pl-8 pr-4 py-3 text-lg text-ink rounded-sm outline-none focus:border-teal"
            autoFocus
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs uppercase tracking-wider text-charcoal/70 font-semibold mb-1.5">
          Internal Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Radon add-on included, sewer scope coordinated"
          className="w-full bg-cream border border-line px-4 py-3 text-sm text-ink rounded-sm outline-none focus:border-teal"
          rows={2}
        />
      </div>

      <p className="text-xs text-charcoal/50 mb-4">
        This will create and send a Square invoice to <span className="font-medium text-ink">{customerEmail || 'the customer'}</span>. Payment is due within 7 days.
      </p>

      {errorMsg && <p className="text-sm text-red-600 mb-4">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-teal text-white py-3 rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-teal-darker transition-colors disabled:opacity-50"
      >
        {status === 'sending' ? 'Creating Invoice...' : `Send Invoice${price ? ` — $${parseFloat(price).toFixed(2)}` : ''}`}
      </button>
    </form>
  )
}
