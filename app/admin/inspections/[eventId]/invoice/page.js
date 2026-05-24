/*
 * Invoice creation page — /admin/inspections/[eventId]/invoice
 *
 * Fetches event details from Google Calendar, shows a read-only summary,
 * and renders a price-entry form to create a Square invoice.
 */

import { getEvent } from '@/lib/google-calendar'
import { parseEventDescription } from '@/lib/booking'
import { TIMEZONE } from '@/lib/working-hours'
import InvoiceForm from './InvoiceForm'

export const metadata = {
  title: 'Send Invoice — Inspectrum Admin',
  robots: 'noindex, nofollow',
}

function formatDate(iso) {
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

export default async function InvoicePage({ params }) {
  const { eventId } = await params

  let event
  try {
    event = await getEvent(eventId)
  } catch (err) {
    return (
      <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-serif text-ink mb-4">Event not found</h1>
          <p className="text-charcoal mb-6">Could not load this event. It may have been deleted.</p>
          <a href="/admin/inspections" className="text-teal text-sm font-semibold hover:text-amber">← Back to Inspections</a>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-serif text-ink mb-4">Event not found</h1>
          <p className="text-charcoal mb-6">This event doesn't exist or has been cancelled.</p>
          <a href="/admin/inspections" className="text-teal text-sm font-semibold hover:text-amber">← Back to Inspections</a>
        </div>
      </div>
    )
  }

  const parsed = parseEventDescription(event.description)
  const startISO = event.start?.dateTime
  const isACC = parsed.source === 'acc'

  // Already invoiced?
  if (parsed.paymentStatus && parsed.paymentStatus !== 'none') {
    return (
      <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-serif text-ink mb-4">Already invoiced</h1>
          <p className="text-charcoal mb-6">This inspection already has an invoice (status: {parsed.paymentStatus}).</p>
          <a href="/admin/inspections" className="text-teal text-sm font-semibold hover:text-amber">← Back to Inspections</a>
        </div>
      </div>
    )
  }

  // Determine suggested price from service name
  const priceMap = { 'Full Home Inspection': 450, 'Radon Testing Only': 150, 'Mold Assessment': 250, 'Pre-Listing Inspection': 400 }
  const suggestedPrice = priceMap[parsed.service] || ''

  return (
    <div className="min-h-screen bg-cream pt-32 pb-12 px-5">
      <div className="max-w-lg mx-auto">
        <a href="/admin/inspections" className="text-sm text-charcoal/60 hover:text-teal mb-6 inline-block">← Back to Inspections</a>
        <h1 className="text-2xl font-serif text-ink mb-6">Send Invoice</h1>

        {isACC && (
          <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mb-6 text-sm">
            This is an ACC-booked inspection. ACC typically handles payment directly. Proceed only if you need to invoice this customer separately.
          </div>
        )}

        {/* Booking summary */}
        <div className="bg-paper border border-line rounded-sm p-6 mb-6">
          <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Inspection Details</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-charcoal/60">Customer</span><span className="text-ink font-medium">{parsed.customerName || '—'}</span></div>
            <div className="flex justify-between"><span className="text-charcoal/60">Service</span><span className="text-ink font-medium">{parsed.service || '—'}</span></div>
            {startISO && <div className="flex justify-between"><span className="text-charcoal/60">Date</span><span className="text-ink font-medium">{formatDate(startISO)}</span></div>}
            {startISO && <div className="flex justify-between"><span className="text-charcoal/60">Time</span><span className="text-ink font-medium">{formatTime(startISO)}</span></div>}
            <div className="flex justify-between"><span className="text-charcoal/60">Address</span><span className="text-ink font-medium text-right max-w-[200px]">{parsed.address || '—'}</span></div>
            <div className="flex justify-between"><span className="text-charcoal/60">Email</span><span className="text-ink font-medium">{parsed.email || 'No email on file'}</span></div>
          </div>
        </div>

        <InvoiceForm
          eventId={eventId}
          suggestedPrice={suggestedPrice}
          customerName={parsed.customerName || ''}
          customerEmail={parsed.email || ''}
          isACC={isACC}
        />
      </div>
    </div>
  )
}
