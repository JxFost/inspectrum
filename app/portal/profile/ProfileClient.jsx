'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ProfileClient({ name, email, phone }) {
  const [form, setForm] = useState({ name, phone })
  const [state, setState] = useState('idle') // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState(null)

  async function handleSave(e) {
    e.preventDefault()
    setState('saving')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/portal/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      })

      if (!res.ok) {
        const d = await res.json()
        setErrorMsg(d.error || 'Could not save.')
        setState('idle')
        return
      }

      setState('saved')
      setTimeout(() => setState('idle'), 3000)
    } catch {
      setErrorMsg('Network error.')
      setState('idle')
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-paper p-8 rounded-sm border border-line">
      <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-6">Your Information</div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/60 font-semibold mb-2">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 border border-line rounded-sm text-ink bg-cream focus:outline-none focus:border-teal"
          />
        </div>

        <div>
          <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/60 font-semibold mb-2">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 border border-line rounded-sm text-charcoal/50 bg-cream/50 cursor-not-allowed"
          />
          <p className="text-xs text-charcoal/40 mt-1">Email cannot be changed — it's tied to your login.</p>
        </div>

        <div>
          <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/60 font-semibold mb-2">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 border border-line rounded-sm text-ink bg-cream focus:outline-none focus:border-teal"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mb-4 text-sm">{errorMsg}</div>
      )}

      {state === 'saved' && (
        <div className="bg-teal/10 border border-teal/30 text-teal rounded-sm p-4 mb-4 text-sm font-medium">Saved.</div>
      )}

      <button
        type="submit"
        disabled={state === 'saving'}
        className="w-full py-3 bg-teal text-white rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-teal-deep transition-colors disabled:opacity-50"
      >
        {state === 'saving' ? 'Saving...' : 'Save Changes'}
      </button>

      <Link href="/portal/dashboard" className="block text-center text-sm text-teal hover:text-amber no-underline mt-4">
        ← Back to dashboard
      </Link>
    </form>
  )
}
