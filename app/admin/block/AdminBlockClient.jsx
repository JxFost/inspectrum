'use client'

import { useState } from 'react'

const SERVICES = [
  { id: 'full', name: 'Full Home Inspection', duration: 4 },
  { id: 'radon', name: 'Radon Testing Only', duration: 1 },
  { id: 'mold', name: 'Mold Assessment', duration: 2 },
  { id: 'pre-listing', name: 'Pre-Listing Inspection', duration: 3 },
]

export default function AdminBlockClient() {
  const [form, setForm] = useState({
    service: 'full',
    date: '',
    time: '08:00',
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    skipAvailability: false,
    sendEmail: false,
  })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.date || !form.time) return

    setStatus('sending')
    setErrorMsg('')

    // Build ISO start time in Denver timezone
    const [hours, minutes] = form.time.split(':').map(Number)
    const [year, month, day] = form.date.split('-').map(Number)
    const rough = new Date(Date.UTC(year, month - 1, day, hours, minutes))
    const utcStr = rough.toLocaleString('en-US', { timeZone: 'UTC' })
    const localStr = rough.toLocaleString('en-US', { timeZone: 'America/Denver' })
    const offsetMs = new Date(utcStr) - new Date(localStr)
    const startISO = new Date(rough.getTime() + offsetMs).toISOString()

    try {
      const res = await fetch('/api/admin/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: form.service,
          startISO,
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          notes: form.notes,
          sendEmail: form.sendEmail,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create event.')
        setStatus('error')
        return
      }

      setResult(data)
      setStatus('success')
    } catch {
      setErrorMsg('Network error.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-paper p-8 rounded-sm border border-line text-center">
        <div className="w-14 h-14 rounded-full bg-amber text-white flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
        <h2 className="text-xl mb-3 text-ink">Event Created</h2>
        <p className="text-sm text-charcoal mb-2">Confirmation: <span className="font-mono font-bold">{result.confirmationCode}</span></p>
        {result.token && (
          <p className="text-xs text-charcoal/60 mb-6">Manage URL: /manage?token={result.token}</p>
        )}
        <button
          type="button"
          onClick={() => { setStatus('idle'); setResult(null); setForm((f) => ({ ...f, name: '', phone: '', email: '', address: '', notes: '' })) }}
          className="text-teal text-sm underline hover:text-amber cursor-pointer bg-transparent border-0"
        >
          Create another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-paper p-8 rounded-sm border border-line space-y-4">
      <Field label="Service">
        <select value={form.service} onChange={(e) => update('service', e.target.value)} className="input-style">
          {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.duration}h)</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date">
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="input-style" required />
        </Field>
        <Field label="Start Time">
          <input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} className="input-style" required />
        </Field>
      </div>

      <Field label="Customer Name (blank for vacation block)">
        <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className="input-style" placeholder="Leave blank for time block" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone">
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-style" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-style" />
        </Field>
      </div>

      <Field label="Property Address">
        <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className="input-style" />
      </Field>

      <Field label="Notes">
        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input-style" rows={3} />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.sendEmail} onChange={(e) => update('sendEmail', e.target.checked)} disabled={!form.email} className="accent-teal" />
        <span className={`text-sm ${!form.email ? 'text-charcoal/40' : 'text-charcoal'}`}>Send confirmation email</span>
      </label>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-teal text-white py-3 rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-teal-darker transition-colors disabled:opacity-50"
      >
        {status === 'sending' ? 'Creating...' : 'Create Event'}
      </button>

      <style jsx>{`
        .input-style {
          width: 100%;
          background: var(--color-cream, #FAF7F1);
          border: 1px solid var(--color-line, #E2DDD5);
          padding: 10px 14px;
          font-size: 14px;
          color: var(--color-ink, #1F2426);
          border-radius: 2px;
          outline: none;
        }
        .input-style:focus {
          border-color: var(--color-teal, #2B7E8C);
        }
      `}</style>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-charcoal/70 font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  )
}
