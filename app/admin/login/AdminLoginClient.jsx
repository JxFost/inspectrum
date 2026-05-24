'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginClient() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Login failed.')
        setLoading(false)
        return
      }

      router.push('/admin/inspections')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-paper p-8 rounded-sm border border-line">
      <label className="block text-sm text-charcoal mb-2 font-medium">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-cream border border-line px-4 py-3 text-base text-ink rounded-sm outline-none focus:border-teal mb-4"
        autoFocus
        required
      />
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal text-white py-3 rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-teal-darker transition-colors disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}
