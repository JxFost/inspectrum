'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'

const PHONE = process.env.NEXT_PUBLIC_OFFICE_PHONE || '(303) 697-0990'
const PHONE_DIGITS = PHONE.replace(/\D/g, '')
import { SERVICES } from '@/lib/services'
import { trackBookingStep, trackBookingSubmit, trackBookingFormStart, trackBookingFormAbandon } from '@/lib/analytics'

function formatDateLong(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

function isValidPhone(phone) {
  return phone.replace(/\D/g, '').length >= 10
}

// Colorado ZIP codes range from 80001–81658.
function isColoradoZip(zip) {
  const digits = zip.replace(/\s/g, '').slice(0, 5)
  if (!/^\d{5}$/.test(digits)) return false
  const num = parseInt(digits, 10)
  return num >= 80001 && num <= 81658
}

function buildGCalUrl({ service, startISO, endISO, address }) {
  const fmt = (iso) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Inspectrum Inspection — ${service}`,
    dates: `${fmt(startISO)}/${fmt(endISO)}`,
    details: `${service} with Inspectrum Inspections.\n\nAddress: ${address || 'TBD'}\n\nQuestions: ${PHONE}`,
    location: address || 'Evergreen, CO',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

function buildICS({ service, startISO, endISO, address }) {
  const fmt = (iso) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Inspectrum//Inspections//EN',
    'BEGIN:VEVENT', `UID:${Date.now()}@inspectrum.com`, `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(startISO)}`, `DTEND:${fmt(endISO)}`,
    `SUMMARY:Inspectrum Inspection — ${service}`,
    `DESCRIPTION:${service} with Inspectrum Inspections.\\n\\nAddress: ${address || 'TBD'}\\n\\nQuestions: ${PHONE}`,
    `LOCATION:${address || 'Evergreen, CO'}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
}

function Calendar({ selectedDate, onSelectDate, viewMonth, setViewMonth, service }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1))
  const canGoBack = !(year === today.getFullYear() && month === today.getMonth())

  return (
    <div className="bg-cream border border-line rounded-sm p-6">
      <div className="flex justify-between items-center mb-5">
        <button type="button" onClick={prevMonth} disabled={!canGoBack} className="bg-transparent border-0 text-ink text-xl px-3 py-1 cursor-pointer rounded-sm hover:bg-paper disabled:opacity-30 disabled:cursor-not-allowed">‹</button>
        <div className="font-serif text-lg font-medium">{monthName}</div>
        <button type="button" onClick={nextMonth} className="bg-transparent border-0 text-ink text-xl px-3 py-1 cursor-pointer rounded-sm hover:bg-paper">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs uppercase tracking-wider text-charcoal/60 font-semibold">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const isPast = date < today
          const isSunday = date.getDay() === 0
          const isDisabled = isPast || isSunday
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()
          return (
            <button
              key={i} type="button" disabled={isDisabled} onClick={() => onSelectDate(date)}
              className={[
                'aspect-square flex items-center justify-center text-sm rounded-sm transition-all',
                isSelected && 'bg-teal text-white font-semibold',
                !isSelected && !isDisabled && 'bg-paper hover:bg-amber hover:text-white cursor-pointer',
                !isSelected && isSunday && !isPast && 'text-charcoal/30 line-through cursor-not-allowed',
                isPast && 'text-charcoal/20 cursor-not-allowed',
              ].filter(Boolean).join(' ')}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-line text-xs text-charcoal/70 space-y-1">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-paper rounded-sm" /> Available</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal rounded-sm" /> Selected</div>
        <div>Sundays closed · Saturdays half-day (mornings only)</div>
      </div>
    </div>
  )
}

function SchedField({ label, value, onChange, type = 'text', placeholder, required, className = '', error, readOnly }) {
  const borderClass = error ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-teal'
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} readOnly={readOnly}
        className={`bg-cream border ${borderClass} px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)] ${readOnly ? 'cursor-default' : ''}`} />
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 pb-3 border-b border-line last:border-0 last:pb-0">
      <div className="text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/60 font-semibold">{label}</div>
      <div className="text-ink font-medium">{value}</div>
    </div>
  )
}

export default function SchedulerClient() {
  const [step, setStep] = useState(1)
  const [service, setService] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [viewMonth, setViewMonth] = useState(new Date())
  const [details, setDetails] = useState({ name: '', email: '', phone: '', street: '', city: '', zip: '', sqftRange: '', sqftExact: '', yearBuilt: '', waterType: '', garageType: '', occupied: '', radonAddOn: false, pets: false, isAgent: false, agentType: '', clientAttending: '', accessProvidedBy: '', accessNotes: '' })
  const [knowsExactSqft, setKnowsExactSqft] = useState(false)

  // API state
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState(null)
  const [booking, setBooking] = useState(null)
  const [bookingError, setBookingError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const funnelStarted = useRef(false)
  const funnelCompleted = useRef(false)
  const currentStepRef = useRef(1)
  const stepBarRef = useRef(null)

  function goToStep(num) {
    setStep(num)
    // Scroll step bar to just below the fixed nav after React renders
    setTimeout(() => {
      stepBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  // Fetch slots when date or service changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!selectedDate || !service) {
      return
    }

    const controller = new AbortController()
    setLoadingSlots(true)
    setSlotsError(null)
    setSlots([])
    setSelectedSlot(null)

    const dateStr = toDateStr(selectedDate)
    fetch(`/api/availability?date=${dateStr}&service=${service.id}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d.error || 'Failed to load availability.'))
        return res.json()
      })
      .then((data) => {
        setSlots(data.slots || [])
        setLoadingSlots(false)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setSlotsError(typeof err === 'string' ? err : `Could not load availability. Please try again or call ${PHONE}.`)
        setLoadingSlots(false)
      })

    return () => controller.abort()
  }, [selectedDate, service])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Track abandonment when user leaves mid-funnel.
  useEffect(() => {
    return () => {
      if (funnelStarted.current && !funnelCompleted.current) {
        trackBookingFormAbandon(currentStepRef.current)
      }
    }
  }, [])

  const confirmed = !!booking

  const canProceedFromStep1 = !!service
  const canProceedFromStep2 = !!selectedDate && !!selectedSlot
  const fullAddress = [details.street.trim(), details.city.trim(), details.zip.trim() ? `CO ${details.zip.trim()}` : ''].filter(Boolean).join(', ')

  const handleSubmit = useCallback(async () => {
    if (!service || !selectedSlot) return
    setSubmitting(true)
    setBookingError(null)

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: service.id,
          startISO: selectedSlot.startISO,
          name: details.name.trim(),
          email: details.email.trim(),
          phone: details.phone.trim(),
          address: fullAddress,
          sqft: knowsExactSqft ? details.sqftExact : details.sqftRange,
          yearBuilt: details.yearBuilt,
          waterType: details.waterType,
          garageType: details.garageType,
          occupied: details.occupied,
          radonAddOn: details.radonAddOn,
          pets: details.pets,
          isAgent: details.isAgent,
          agentType: details.agentType,
          clientAttending: details.clientAttending,
          accessProvidedBy: (details.accessProvidedBy === 'Other' || details.accessProvidedBy === 'Lockbox')
            ? `${details.accessProvidedBy}${details.accessNotes ? ` — ${details.accessNotes}` : ''}`
            : details.accessProvidedBy,
        }),
      })

      const data = await res.json()

      if (res.status === 409) {
        // Slot was taken — bounce back to date/time picker.
        setBookingError(data.error || 'That slot was just taken. Please choose another time.')
        setSelectedSlot(null)
        goToStep(2)
        setSubmitting(false)
        return
      }

      if (!res.ok) {
        setBookingError(data.error || `Something went wrong. Please try again or call ${PHONE}.`)
        setSubmitting(false)
        return
      }

      funnelCompleted.current = true
      trackBookingSubmit(service.name)
      setBooking(data)
    } catch {
      setBookingError(`Network error. Please check your connection and try again, or call ${PHONE}.`)
    } finally {
      setSubmitting(false)
    }
  }, [service, selectedSlot, details, fullAddress])

  const gcalUrl = confirmed && selectedSlot
    ? buildGCalUrl({ service: service.name, startISO: selectedSlot.startISO, endISO: selectedSlot.endISO, address: fullAddress })
    : '#'
  const icsUrl = confirmed && selectedSlot
    ? buildICS({ service: service.name, startISO: selectedSlot.startISO, endISO: selectedSlot.endISO, address: fullAddress })
    : '#'

  const reset = () => {
    setStep(1); setService(null); setSelectedDate(null); setSelectedSlot(null)
    setDetails({ name: '', email: '', phone: '', street: '', city: '', zip: '', sqftRange: '', sqftExact: '', yearBuilt: '', waterType: '', garageType: '', occupied: '', radonAddOn: false, pets: false, isAgent: false, agentType: '', clientAttending: '', accessProvidedBy: '', accessNotes: '' })
    setKnowsExactSqft(false)
    setBooking(null); setBookingError(null); setSlots([]); setSlotsError(null)
  }

  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-12 px-5 lg:px-8">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="hero-eyebrow justify-center">Online Booking</div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] mb-4">Schedule your <em className="italic text-amber">inspection.</em></h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto">
            Pick a service, choose a time, share a few details. We'll confirm by phone within a few hours.
          </p>
        </div>
      </header>

      {!confirmed && (
        <div ref={stepBarRef} className="bg-paper py-6 px-5 lg:px-8 border-b border-line scroll-mt-20">
          <div className="max-w-[900px] mx-auto flex items-center justify-between text-xs sm:text-sm">
            {['Service', 'Date & Time', 'You', 'Property', 'Access', 'Confirm'].map((label, i) => {
              const num = i + 1
              const isActive = step === num
              const isDone = step > num
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={[
                    'w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold shrink-0',
                    isActive && 'bg-teal text-white',
                    isDone && 'bg-amber text-white',
                    !isActive && !isDone && 'bg-cream border border-line text-charcoal/50',
                  ].filter(Boolean).join(' ')}>
                    {isDone ? '✓' : num}
                  </div>
                  <span className={`hidden md:inline text-xs ${isActive ? 'text-ink font-semibold' : 'text-charcoal/60'}`}>
                    {label}
                  </span>
                  {i < 5 && <div className="flex-1 h-px bg-line mx-1 sm:mx-2" />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[60vh]">
        <div className="max-w-[900px] mx-auto">
          {confirmed && (
            <div className="text-center bg-paper p-12 rounded-sm border border-line">
              <div className="w-16 h-16 rounded-full bg-amber text-white flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
              <h2 className="text-3xl mb-3 text-ink">Request <em className="italic text-teal">received.</em></h2>
              <p className="text-charcoal mb-2 max-w-md mx-auto">
                Thanks, {details.name.split(' ')[0]}. We'll call you at {details.phone} within a few hours to confirm.
              </p>
              <p className="text-sm text-charcoal/60 mb-8">
                Confirmation code: <span className="font-mono font-semibold text-ink">{booking.confirmationCode}</span>
              </p>
              <div className="bg-cream p-6 rounded-sm border border-line max-w-md mx-auto mb-8 text-left">
                <div className="text-xs uppercase tracking-wider text-amber mb-2 font-semibold">Your Booking</div>
                <div className="font-serif text-lg mb-1">{service.name}</div>
                <div className="text-sm text-charcoal">{formatDateLong(selectedDate)}</div>
                <div className="text-sm text-charcoal">{selectedSlot.label} · {service.durationHours} hr{service.durationHours > 1 ? 's' : ''}</div>
                <div className="text-sm text-charcoal mt-1">{fullAddress}</div>
              </div>
              <p className="text-sm text-charcoal/70 mb-6">
                We sent a confirmation to <span className="font-medium text-ink">{details.email}</span> — check your spam folder if you don't see it.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <a href={gcalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-teal">Add to Google Calendar</a>
                <a href={icsUrl} download="inspection.ics" className="btn" style={{ background: 'transparent', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }}>
                  Download .ics file
                </a>
              </div>
              {booking.token && (
                <p className="text-sm text-charcoal/70 mb-4">
                  Need to change something?{' '}
                  <a href={`/manage?token=${booking.token}`} className="text-teal font-semibold hover:text-amber no-underline">
                    Manage your booking →
                  </a>
                </p>
              )}
              <button type="button" onClick={reset} className="text-sm text-teal underline hover:text-amber">
                Schedule another inspection
              </button>
            </div>
          )}

          {!confirmed && step === 1 && (
            <div>
              <h2 className="text-2xl mb-6 text-ink">Which service?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {SERVICES.map((s) => (
                  <button key={s.id} type="button" onClick={() => { setService(s); setSelectedSlot(null) }}
                    className={[
                      'text-left p-6 rounded-sm border-2 bg-cream cursor-pointer transition-all',
                      service?.id === s.id ? 'border-teal bg-paper shadow-[0_4px_12px_rgba(43,126,140,0.15)]' : 'border-line hover:border-teal/50',
                    ].join(' ')}>
                    <div className="font-serif text-lg font-medium text-ink mb-1">
                      {s.name}
                      {s.id === 'full' && <span className="ml-2 inline-flex items-center bg-teal/10 text-teal text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full align-middle">Most Booked</span>}
                    </div>
                    <div className="text-sm text-charcoal mb-3">{s.desc}</div>
                    <div className="text-xs uppercase tracking-wider text-amber font-semibold">{s.price}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="teal" onClick={() => { if (!funnelStarted.current) { funnelStarted.current = true; trackBookingFormStart() } currentStepRef.current = 2; trackBookingStep(2); goToStep(2) }} withArrow className={!canProceedFromStep1 ? 'opacity-50 pointer-events-none' : ''}>
                  Choose Date & Time
                </Button>
              </div>
            </div>
          )}

          {!confirmed && step === 2 && (
            <div>
              <h2 className="text-2xl mb-6 text-ink">When works for you?</h2>

              {bookingError && (
                <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mb-6 text-sm">
                  {bookingError}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Calendar selectedDate={selectedDate} onSelectDate={(d) => { setSelectedDate(d); setSelectedSlot(null) }} viewMonth={viewMonth} setViewMonth={setViewMonth} service={service} />
                <div>
                  <h3 className="font-serif text-lg mb-4">{selectedDate ? formatDateLong(selectedDate) : 'Pick a date first'}</h3>

                  {loadingSlots && (
                    <div className="flex items-center gap-2 text-charcoal/60 text-sm">
                      <div className="w-4 h-4 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
                      Loading availability...
                    </div>
                  )}

                  {slotsError && (
                    <p className="text-sm text-amber-deep">{slotsError}</p>
                  )}

                  {!loadingSlots && !slotsError && selectedDate && slots.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot) => (
                        <button key={slot.startISO} type="button" onClick={() => setSelectedSlot(slot)}
                          className={[
                            'p-3 rounded-sm border text-sm font-medium transition-all',
                            selectedSlot?.startISO === slot.startISO ? 'bg-teal text-white border-teal' : 'bg-cream border-line hover:border-teal/50 text-ink',
                          ].join(' ')}>
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {!loadingSlots && !slotsError && selectedDate && slots.length === 0 && (
                    <p className="text-charcoal/60 text-sm">No availability that day. Try another date.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => goToStep(1)} className="text-charcoal hover:text-teal text-sm font-medium">← Back</button>
                <Button variant="teal" onClick={() => { currentStepRef.current = 3; trackBookingStep(3); goToStep(3) }} withArrow className={!canProceedFromStep2 ? 'opacity-50 pointer-events-none' : ''}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ---- Step 3: Your Details ---- */}
          {!confirmed && step === 3 && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const errors = {}
              if (!details.name.trim()) errors.name = 'Name is required.'
              if (!details.email.trim()) errors.email = 'Email is required.'
              else if (!isValidEmail(details.email.trim())) errors.email = 'Please enter a valid email address.'
              if (!details.phone.trim()) errors.phone = 'Phone number is required.'
              else if (!isValidPhone(details.phone)) errors.phone = 'Please enter a valid phone number (10+ digits).'
              setFieldErrors(errors)
              if (Object.keys(errors).length === 0) { currentStepRef.current = 4; trackBookingStep(4); goToStep(4) }
            }}>
              <h2 className="text-2xl mb-2 text-ink">About you</h2>
              <p className="text-sm text-charcoal/70 mb-6">Who should we contact about this inspection?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SchedField label="Your Name" value={details.name} onChange={(v) => { setDetails({ ...details, name: v }); setFieldErrors((p) => ({ ...p, name: undefined })) }} required error={fieldErrors.name} />
                <SchedField label="Phone" value={details.phone} onChange={(v) => { setDetails({ ...details, phone: v }); setFieldErrors((p) => ({ ...p, phone: undefined })) }} type="tel" required error={fieldErrors.phone} />
                <SchedField label="Email" value={details.email} onChange={(v) => { setDetails({ ...details, email: v }); setFieldErrors((p) => ({ ...p, email: undefined })) }} type="email" required className="sm:col-span-2" error={fieldErrors.email} />
                <div className="sm:col-span-2 bg-cream/50 border border-line rounded-sm p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={details.isAgent}
                      onChange={(e) => setDetails({ ...details, isAgent: e.target.checked, agentType: e.target.checked ? details.agentType : '' })}
                      className="accent-teal w-5 h-5"
                    />
                    <span className="text-sm font-semibold text-ink">I am a real estate agent representing a client</span>
                  </label>
                  {details.isAgent && (
                    <div className="ml-8 mt-3 flex flex-col gap-1.5">
                      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Agent Type</label>
                      <select value={details.agentType} onChange={(e) => setDetails({ ...details, agentType: e.target.value })}
                        className="bg-cream border border-line focus:border-teal px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]">
                        <option value="">Select</option>
                        <option value="Buyer's Agent">Buyer&apos;s Agent</option>
                        <option value="Seller's Agent">Seller&apos;s Agent</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => goToStep(2)} className="text-charcoal hover:text-teal text-sm font-medium">← Back</button>
                <Button variant="teal" type="submit" withArrow>Property Details</Button>
              </div>
            </form>
          )}

          {/* ---- Step 4: Property Details ---- */}
          {!confirmed && step === 4 && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const errors = {}
              if (!details.street.trim()) errors.street = 'Street address is required.'
              if (!details.city.trim()) errors.city = 'City is required.'
              if (!details.zip.trim()) errors.zip = 'ZIP code is required.'
              else if (!isColoradoZip(details.zip)) errors.zip = 'Please enter a valid Colorado ZIP code.'
              setFieldErrors(errors)
              if (Object.keys(errors).length === 0) { currentStepRef.current = 5; trackBookingStep(5); goToStep(5) }
            }}>
              <h2 className="text-2xl mb-2 text-ink">Property details</h2>
              <p className="text-sm text-charcoal/70 mb-6">Tell us about the property being inspected.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SchedField label="Street Address" value={details.street} onChange={(v) => { setDetails({ ...details, street: v }); setFieldErrors((p) => ({ ...p, street: undefined })) }} placeholder="123 Main St" required className="sm:col-span-2" error={fieldErrors.street} />
                <SchedField label="City" value={details.city} onChange={(v) => { setDetails({ ...details, city: v }); setFieldErrors((p) => ({ ...p, city: undefined })) }} placeholder="Evergreen" required error={fieldErrors.city} />
                <div className="flex gap-4">
                  <SchedField label="State" value="CO" onChange={() => {}} className="w-20 opacity-70" readOnly />
                  <SchedField label="ZIP Code" value={details.zip} onChange={(v) => { setDetails({ ...details, zip: v.replace(/\D/g, '').slice(0, 5) }); setFieldErrors((p) => ({ ...p, zip: undefined })) }} placeholder="80439" required className="flex-1" error={fieldErrors.zip} />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Square Footage</label>
                  {!knowsExactSqft && (
                    <select
                      value={details.sqftRange}
                      onChange={(e) => setDetails({ ...details, sqftRange: e.target.value })}
                      className="bg-cream border border-line focus:border-teal px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]"
                    >
                      <option value="">Select a range</option>
                      <option value="Under 2,000 sq ft">Under 2,000 sq ft</option>
                      <option value="2,000 – 3,000 sq ft">2,000 – 3,000 sq ft</option>
                      <option value="3,000 – 4,000 sq ft">3,000 – 4,000 sq ft</option>
                      <option value="4,000 – 5,000 sq ft">4,000 – 5,000 sq ft</option>
                      <option value="5,000+ sq ft">5,000+ sq ft</option>
                    </select>
                  )}
                  {knowsExactSqft && (
                    <input
                      type="text"
                      inputMode="numeric"
                      value={details.sqftExact}
                      onChange={(e) => setDetails({ ...details, sqftExact: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="e.g. 2500"
                      className="bg-cream border border-line focus:border-teal px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]"
                    />
                  )}
                  <label className="flex items-center gap-2 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={knowsExactSqft}
                      onChange={(e) => setKnowsExactSqft(e.target.checked)}
                      className="accent-teal"
                    />
                    <span className="text-xs text-charcoal/70">I know the exact square footage</span>
                  </label>
                </div>

                <SchedField label="Year Built" value={details.yearBuilt} onChange={(v) => setDetails({ ...details, yearBuilt: v.replace(/\D/g, '').slice(0, 4) })} placeholder="e.g. 1985" type="text" inputMode="numeric" />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Water Type</label>
                  <select value={details.waterType} onChange={(e) => setDetails({ ...details, waterType: e.target.value })}
                    className="bg-cream border border-line focus:border-teal px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]">
                    <option value="">Not sure</option>
                    <option value="Public Water">Public Water</option>
                    <option value="Well Water">Well Water</option>
                    <option value="Shared Well">Shared Well</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Garage</label>
                  <select value={details.garageType} onChange={(e) => setDetails({ ...details, garageType: e.target.value })}
                    className="bg-cream border border-line focus:border-teal px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]">
                    <option value="">Not sure</option>
                    <option value="Attached">Attached</option>
                    <option value="Detached">Detached</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Is the property occupied?</label>
                  <select value={details.occupied} onChange={(e) => setDetails({ ...details, occupied: e.target.value })}
                    className="bg-cream border border-line focus:border-teal px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]">
                    <option value="">Not sure</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="sm:col-span-2 bg-cream/50 border border-line rounded-sm p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={details.pets}
                      onChange={(e) => setDetails({ ...details, pets: e.target.checked })}
                      className="accent-teal w-5 h-5"
                    />
                    <div>
                      <span className="text-sm font-semibold text-ink">Pets on property</span>
                      <span className="text-xs text-charcoal/70 block">Let us know so our inspector can be prepared</span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => goToStep(3)} className="text-charcoal hover:text-teal text-sm font-medium">← Back</button>
                <Button variant="teal" type="submit" withArrow>Access & Add-Ons</Button>
              </div>
            </form>
          )}

          {/* ---- Step 5: Access & Add-Ons ---- */}
          {!confirmed && step === 5 && (
            <div>
              <h2 className="text-2xl mb-2 text-ink">Access & add-ons</h2>
              <p className="text-sm text-charcoal/70 mb-6">How will the inspector get in, and any extras?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Will client be attending?</label>
                  <select value={details.clientAttending} onChange={(e) => setDetails({ ...details, clientAttending: e.target.value })}
                    className="bg-cream border border-line focus:border-teal px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]">
                    <option value="">Not sure</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Who will provide entry?</label>
                  <select value={details.accessProvidedBy} onChange={(e) => setDetails({ ...details, accessProvidedBy: e.target.value, accessNotes: '' })}
                    className="bg-cream border border-line focus:border-teal px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]">
                    <option value="">Select</option>
                    <option value="Client will let you in">Client will let you in</option>
                    <option value="Buyer's Agent will let you in">Buyer&apos;s Agent will let you in</option>
                    <option value="Seller's Agent will let you in">Seller&apos;s Agent will let you in</option>
                    <option value="Lockbox">Lockbox</option>
                    <option value="Property is unlocked">Property is unlocked</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {details.accessProvidedBy === 'Lockbox' && (
                  <SchedField label="Lockbox Code" value={details.accessNotes} onChange={(v) => setDetails({ ...details, accessNotes: v })} placeholder="Enter code" className="sm:col-span-2" />
                )}
                {details.accessProvidedBy === 'Other' && (
                  <SchedField label="Access Details" value={details.accessNotes} onChange={(v) => setDetails({ ...details, accessNotes: v })} placeholder="Please describe how to access the property" className="sm:col-span-2" />
                )}
              </div>

              {service?.id === 'full' && (
                <>
                  <h3 className="text-lg font-serif text-ink mt-10 mb-4 pb-2 border-b border-line">Add-Ons</h3>
                  <div className="bg-cream/50 border border-line rounded-sm p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={details.radonAddOn}
                        onChange={(e) => setDetails({ ...details, radonAddOn: e.target.checked })}
                        className="accent-teal w-5 h-5"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-ink">Add Radon Testing</span>
                        <span className="ml-2 inline-flex items-center gap-1 bg-amber/15 text-amber text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full align-middle">Recommended</span>
                        <span className="text-xs text-charcoal/70 block mt-1">48-hour continuous monitor — drop off day of inspection, pickup 2 days later</span>
                      </div>
                    </label>
                    <div className="flex items-start gap-2 mt-3 ml-8 bg-paper/80 rounded-sm px-3 py-2">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-teal shrink-0 mt-0.5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>
                      <span className="text-xs text-charcoal/80 leading-relaxed">Nearly 1 in 2 Colorado homes have radon levels above the EPA action level of 4 pCi/L, with mountain and foothills communities at even higher risk.</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => goToStep(4)} className="text-charcoal hover:text-teal text-sm font-medium">← Back</button>
                <Button variant="teal" onClick={() => { currentStepRef.current = 6; trackBookingStep(6); goToStep(6) }} withArrow>Review</Button>
              </div>
            </div>
          )}

          {!confirmed && step === 6 && (
            <div>
              <h2 className="text-2xl mb-6 text-ink">One last look.</h2>
              <div className="bg-paper p-8 rounded-sm border border-line space-y-4">
                <SummaryRow label="Service" value={service.name} />
                <SummaryRow label="Date" value={formatDateLong(selectedDate)} />
                <SummaryRow label="Time" value={`${selectedSlot.label} (${service.durationHours} hr${service.durationHours > 1 ? 's' : ''})`} />
                <SummaryRow label="Name" value={details.name} />
                <SummaryRow label="Email" value={details.email} />
                <SummaryRow label="Phone" value={details.phone} />
                <SummaryRow label="Address" value={fullAddress} />
                {(knowsExactSqft ? details.sqftExact : details.sqftRange) && (
                  <SummaryRow label="Square Footage" value={knowsExactSqft ? `${details.sqftExact} sq ft` : details.sqftRange} />
                )}
                {details.yearBuilt && <SummaryRow label="Year Built" value={`${details.yearBuilt} (${new Date().getFullYear() - parseInt(details.yearBuilt)} yrs old)`} />}
                {details.waterType && <SummaryRow label="Water Type" value={details.waterType} />}
                {details.garageType && <SummaryRow label="Garage" value={details.garageType} />}
                {details.occupied && <SummaryRow label="Occupied" value={details.occupied} />}
                {details.isAgent && <SummaryRow label="Ordered By" value={details.agentType || 'Agent'} />}
                {details.clientAttending && <SummaryRow label="Client Attending" value={details.clientAttending} />}
                {details.accessProvidedBy && <SummaryRow label="Access" value={
                  (details.accessProvidedBy === 'Other' || details.accessProvidedBy === 'Lockbox')
                    ? `${details.accessProvidedBy}${details.accessNotes ? ` — ${details.accessNotes}` : ''}`
                    : details.accessProvidedBy
                } />}
                {details.pets && <SummaryRow label="Pets on Property" value="Yes" />}
                {details.radonAddOn && <SummaryRow label="Radon Add-On" value="Yes — 48hr continuous monitor" />}
              </div>

              {bookingError && (
                <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mt-4 text-sm">
                  {bookingError}
                </div>
              )}

              <p className="text-sm text-charcoal/70 mt-6 text-center">
                We'll call you at {details.phone} within a few hours to confirm and answer any questions.
              </p>
              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => goToStep(5)} className="text-charcoal hover:text-teal text-sm font-medium">← Back</button>
                <Button variant="primary" onClick={handleSubmit} withArrow disabled={submitting}>
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-paper py-12 px-5 lg:px-8 border-t border-line">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-charcoal mb-3">Prefer to talk to a person? Have a question first?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`tel:${PHONE_DIGITS}`} className="btn btn-teal">Call {PHONE}</a>
            <Link href="/contact" className="text-teal underline hover:text-amber py-4 px-2">Send a message instead</Link>
          </div>
        </div>
      </section>
    </>
  )
}
