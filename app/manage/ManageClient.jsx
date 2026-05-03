'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'

const TIMEZONE = 'America/Denver'

function formatDateLong(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 pb-4 border-b border-line last:border-0 last:pb-0">
      <div className="text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/60 font-semibold">{label}</div>
      <div className="text-ink font-medium">{value}</div>
    </div>
  )
}

export default function ManageClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelState, setCancelState] = useState('idle') // idle | confirming | cancelling | cancelled
  const [cancelError, setCancelError] = useState(null)

  useEffect(() => {
    if (!token) {
      setError('No booking token provided. Check the link in your email.')
      setLoading(false)
      return
    }

    fetch(`/api/booking/${token}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Could not load booking details.')
        } else {
          setBooking(data)
        }
      })
      .catch(() => {
        setError('Could not reach the server. Please try again or call (303) 697-0990.')
      })
      .finally(() => setLoading(false))
  }, [token])

  async function handleCancel() {
    setCancelState('cancelling')
    setCancelError(null)

    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCancelError(data.error || 'Could not cancel. Please call (303) 697-0990.')
        setCancelState('idle')
        return
      }

      setCancelState('cancelled')
    } catch {
      setCancelError('Network error. Please try again or call (303) 697-0990.')
      setCancelState('idle')
    }
  }

  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-12 px-5 lg:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="hero-eyebrow justify-center">Your Booking</div>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] mb-4">
            Manage your <em className="italic text-amber">appointment.</em>
          </h1>
        </div>
      </header>

      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[50vh]">
        <div className="max-w-[600px] mx-auto">

          {loading && (
            <div className="flex items-center justify-center gap-3 py-20 text-charcoal/60">
              <div className="w-5 h-5 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
              Loading your booking...
            </div>
          )}

          {error && !loading && (
            <div className="text-center bg-paper p-12 rounded-sm border border-line">
              <p className="text-lg text-ink mb-4">{error}</p>
              <p className="text-sm text-charcoal/70">
                Need help? Call <a href="tel:3036970990" className="text-teal font-semibold">(303) 697-0990</a>
              </p>
            </div>
          )}

          {cancelState === 'cancelled' && (
            <div className="text-center bg-paper p-12 rounded-sm border border-line">
              <div className="w-14 h-14 rounded-full bg-amber text-white flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
              <h2 className="text-2xl mb-3 text-ink">Booking <em className="italic text-teal">cancelled.</em></h2>
              <p className="text-charcoal mb-6">
                Your appointment has been removed. No charges, no hassle.
              </p>
              <p className="text-sm text-charcoal/70 mb-8">
                Changed your mind? You can always rebook.
              </p>
              <Button href="/schedule" variant="teal" withArrow>Book a New Inspection</Button>
            </div>
          )}

          {booking && cancelState !== 'cancelled' && (
            <div className="bg-paper p-8 sm:p-10 rounded-sm border border-line">
              <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Appointment Details</div>
              <div className="space-y-4 mb-8">
                <DetailRow label="Service" value={booking.service} />
                <DetailRow label="Date" value={formatDateLong(booking.startISO)} />
                <DetailRow label="Time" value={`${formatTime(booking.startISO)} – ${formatTime(booking.endISO)}`} />
                <DetailRow label="Address" value={booking.address} />
              </div>

              {cancelError && (
                <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mb-6 text-sm">
                  {cancelError}
                </div>
              )}

              {cancelState === 'idle' && (
                <div className="space-y-4">
                  <Button variant="teal" href="/schedule" withArrow fullWidth>
                    Reschedule This Inspection
                  </Button>
                  <button
                    type="button"
                    onClick={() => setCancelState('confirming')}
                    className="w-full text-center py-3 text-sm text-charcoal/70 hover:text-red-700 transition-colors cursor-pointer bg-transparent border-0"
                  >
                    Cancel this appointment
                  </button>
                </div>
              )}

              {cancelState === 'confirming' && (
                <div className="bg-cream p-6 rounded-sm border border-line">
                  <p className="text-sm text-ink mb-4 font-medium">Are you sure you want to cancel this appointment?</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 py-3 bg-red-700 text-white rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-red-800 transition-colors"
                    >
                      Yes, Cancel It
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelState('idle')}
                      className="flex-1 py-3 bg-transparent border border-line text-ink rounded-sm font-semibold text-sm cursor-pointer hover:bg-paper transition-colors"
                    >
                      Never Mind
                    </button>
                  </div>
                </div>
              )}

              {cancelState === 'cancelling' && (
                <div className="flex items-center justify-center gap-2 py-4 text-charcoal/60 text-sm">
                  <div className="w-4 h-4 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
                  Cancelling...
                </div>
              )}
            </div>
          )}

          <p className="text-center text-sm text-charcoal/60 mt-8">
            Questions? Call <a href="tel:3036970990" className="text-teal font-semibold hover:text-amber">(303) 697-0990</a> ·{' '}
            <Link href="/contact" className="text-teal font-semibold hover:text-amber no-underline">Send a message</Link>
          </p>
        </div>
      </section>
    </>
  )
}
