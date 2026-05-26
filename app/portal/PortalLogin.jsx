'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

const PHONE = process.env.NEXT_PUBLIC_OFFICE_PHONE || '(303) 697-0990'
const PHONE_DIGITS = PHONE.replace(/\D/g, '')

export default function PortalLogin() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState(
    errorParam === 'expired' ? 'That link has expired. Please request a new one.' :
    errorParam === 'invalid' ? 'Invalid login link. Please try again.' : null
  )

  async function handleSubmit(e) {
    e.preventDefault()
    setState('sending')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.')
        setState('idle')
        return
      }

      setState('sent')
    } catch {
      setErrorMsg(`Could not reach the server. Please try again or call ${PHONE}.`)
      setState('idle')
    }
  }

  if (state === 'sent') {
    return (
      <div className="bg-paper p-8 sm:p-10 rounded-sm border border-line text-center">
        <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
        <h2 className="text-2xl mb-3 text-ink">Check your <em className="italic text-teal">email.</em></h2>
        <p className="text-charcoal mb-2">
          We sent a login link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-charcoal/70 mb-6">
          The link expires in 15 minutes. Check your spam folder if you don't see it.
        </p>
        <button
          type="button"
          onClick={() => { setState('idle'); setEmail('') }}
          className="text-sm text-teal hover:text-amber cursor-pointer bg-transparent border-0"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="bg-paper p-8 sm:p-10 rounded-sm border border-line">
      <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Sign In</div>
      <p className="text-sm text-charcoal/70 mb-6">
        Enter the email address you used when booking your inspection. We'll send you a secure login link — no password needed.
      </p>

      {errorMsg && (
        <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mb-6 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="block text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/60 font-semibold mb-2">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-line rounded-sm text-ink bg-cream focus:outline-none focus:border-teal mb-4"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="w-full py-3 bg-teal text-white rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-teal-deep transition-colors disabled:opacity-50"
        >
          {state === 'sending' ? 'Sending...' : 'Send Login Link'}
        </button>
      </form>

      <p className="text-xs text-charcoal/50 text-center mt-6">
        Don't have an account? One is created automatically when you <a href="/schedule" className="text-teal hover:text-amber no-underline font-semibold">book an inspection</a>.
      </p>
      <p className="text-xs text-charcoal/50 text-center mt-3">
        Need help? Call <a href={`tel:${PHONE_DIGITS}`} className="text-teal font-semibold">{PHONE}</a>
      </p>
    </div>
  )
}
