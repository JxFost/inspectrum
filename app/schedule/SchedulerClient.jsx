'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
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

function buildGCalUrl({ service, startISO, endISO, address }) {
  const fmt = (iso) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Inspectrum Inspection — ${service}`,
    dates: `${fmt(startISO)}/${fmt(endISO)}`,
    details: `${service} with Inspectrum Inspections.\n\nAddress: ${address || 'TBD'}\n\nQuestions: (303) 697-0990`,
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
    `DESCRIPTION:${service} with Inspectrum Inspections.\\n\\nAddress: ${address || 'TBD'}\\n\\nQuestions: (303) 697-0990`,
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

function SchedField({ label, value, onChange, type = 'text', placeholder, required, className = '', error }) {
  const borderClass = error ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-teal'
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className={`bg-cream border ${borderClass} px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]`} />
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
  const [details, setDetails] = useState({ name: '', email: '', phone: '', address: '' })

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

  // Fetch slots when date or service changes.
  useEffect(() => {
    if (!selectedDate || !service) {
      setSlots([])
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
        setSlotsError(typeof err === 'string' ? err : 'Could not load availability. Please try again or call (303) 697-0990.')
        setLoadingSlots(false)
      })

    return () => controller.abort()
  }, [selectedDate, service])

  // Track abandonment when user leaves mid-funnel.
  useEffect(() => {
    return () => {
      if (funnelStarted.current && !funnelCompleted.current) {
        trackBookingFormAbandon(currentStepRef.current)
      }
    }
  }, [])

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
          address: details.address.trim(),
        }),
      })

      const data = await res.json()

      if (res.status === 409) {
        // Slot was taken — bounce back to date/time picker.
        setBookingError(data.error || 'That slot was just taken. Please choose another time.')
        setSelectedSlot(null)
        setStep(2)
        setSubmitting(false)
        return
      }

      if (!res.ok) {
        setBookingError(data.error || 'Something went wrong. Please try again or call (303) 697-0990.')
        setSubmitting(false)
        return
      }

      funnelCompleted.current = true
      trackBookingSubmit(service.name)
      setBooking(data)
    } catch {
      setBookingError('Network error. Please check your connection and try again, or call (303) 697-0990.')
    } finally {
      setSubmitting(false)
    }
  }, [service, selectedSlot, details])

  const confirmed = !!booking

  const canProceedFromStep1 = !!service
  const canProceedFromStep2 = !!selectedDate && !!selectedSlot
  const canSubmit = details.name.trim() && isValidEmail(details.email.trim()) && isValidPhone(details.phone) && details.address.trim()

  const gcalUrl = confirmed && selectedSlot
    ? buildGCalUrl({ service: service.name, startISO: selectedSlot.startISO, endISO: selectedSlot.endISO, address: details.address })
    : '#'
  const icsUrl = confirmed && selectedSlot
    ? buildICS({ service: service.name, startISO: selectedSlot.startISO, endISO: selectedSlot.endISO, address: details.address })
    : '#'

  const reset = () => {
    setStep(1); setService(null); setSelectedDate(null); setSelectedSlot(null)
    setDetails({ name: '', email: '', phone: '', address: '' })
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
        <div className="bg-paper py-6 px-5 lg:px-8 border-b border-line">
          <div className="max-w-[900px] mx-auto flex items-center justify-between text-xs sm:text-sm">
            {['Service', 'Date & Time', 'Your Details', 'Confirm'].map((label, i) => {
              const num = i + 1
              const isActive = step === num
              const isDone = step > num
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                    isActive && 'bg-teal text-white',
                    isDone && 'bg-amber text-white',
                    !isActive && !isDone && 'bg-cream border border-line text-charcoal/50',
                  ].filter(Boolean).join(' ')}>
                    {isDone ? '✓' : num}
                  </div>
                  <span className={`hidden sm:inline ${isActive ? 'text-ink font-semibold' : 'text-charcoal/60'}`}>
                    {label}
                  </span>
                  {i < 3 && <div className="flex-1 h-px bg-line mx-2" />}
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
                <div className="text-sm text-charcoal mt-1">{details.address}</div>
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
                    <div className="font-serif text-lg font-medium text-ink mb-1">{s.name}</div>
                    <div className="text-sm text-charcoal mb-3">{s.desc}</div>
                    <div className="text-xs uppercase tracking-wider text-amber font-semibold">{s.price}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="teal" onClick={() => { if (!funnelStarted.current) { funnelStarted.current = true; trackBookingFormStart() } currentStepRef.current = 2; trackBookingStep(2); setStep(2) }} withArrow className={!canProceedFromStep1 ? 'opacity-50 pointer-events-none' : ''}>
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
                <button type="button" onClick={() => setStep(1)} className="text-charcoal hover:text-teal text-sm font-medium">← Back</button>
                <Button variant="teal" onClick={() => { currentStepRef.current = 3; trackBookingStep(3); setStep(3) }} withArrow className={!canProceedFromStep2 ? 'opacity-50 pointer-events-none' : ''}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {!confirmed && step === 3 && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const errors = {}
              if (!details.name.trim()) errors.name = 'Name is required.'
              if (!details.email.trim()) errors.email = 'Email is required.'
              else if (!isValidEmail(details.email.trim())) errors.email = 'Please enter a valid email address.'
              if (!details.phone.trim()) errors.phone = 'Phone number is required.'
              else if (!isValidPhone(details.phone)) errors.phone = 'Please enter a valid phone number (10+ digits).'
              if (!details.address.trim()) errors.address = 'Property address is required.'
              setFieldErrors(errors)
              if (Object.keys(errors).length === 0) { currentStepRef.current = 4; trackBookingStep(4); setStep(4) }
            }}>
              <h2 className="text-2xl mb-6 text-ink">Tell us about you & the property</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SchedField label="Your Name" value={details.name} onChange={(v) => { setDetails({ ...details, name: v }); setFieldErrors((p) => ({ ...p, name: undefined })) }} required error={fieldErrors.name} />
                <SchedField label="Phone" value={details.phone} onChange={(v) => { setDetails({ ...details, phone: v }); setFieldErrors((p) => ({ ...p, phone: undefined })) }} type="tel" required error={fieldErrors.phone} />
                <SchedField label="Email" value={details.email} onChange={(v) => { setDetails({ ...details, email: v }); setFieldErrors((p) => ({ ...p, email: undefined })) }} type="email" required className="sm:col-span-2" error={fieldErrors.email} />
                <SchedField label="Property Address" value={details.address} onChange={(v) => { setDetails({ ...details, address: v }); setFieldErrors((p) => ({ ...p, address: undefined })) }} placeholder="Street, City, ZIP" required className="sm:col-span-2" error={fieldErrors.address} />
              </div>
              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => setStep(2)} className="text-charcoal hover:text-teal text-sm font-medium">← Back</button>
                <Button variant="teal" type="submit" withArrow className={!canSubmit ? 'opacity-50 pointer-events-none' : ''}>Review</Button>
              </div>
            </form>
          )}

          {!confirmed && step === 4 && (
            <div>
              <h2 className="text-2xl mb-6 text-ink">One last look.</h2>
              <div className="bg-paper p-8 rounded-sm border border-line space-y-4">
                <SummaryRow label="Service" value={service.name} />
                <SummaryRow label="Date" value={formatDateLong(selectedDate)} />
                <SummaryRow label="Time" value={`${selectedSlot.label} (${service.durationHours} hr${service.durationHours > 1 ? 's' : ''})`} />
                <SummaryRow label="Name" value={details.name} />
                <SummaryRow label="Email" value={details.email} />
                <SummaryRow label="Phone" value={details.phone} />
                <SummaryRow label="Address" value={details.address} />
              </div>

              {bookingError && (
                <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mt-4 text-sm">
                  {bookingError}
                </div>
              )}

              <p className="text-sm text-charcoal/70 mt-6 text-center">
                We'll call you within a few hours to confirm and answer any questions.
              </p>
              <div className="flex justify-between mt-8">
                <button type="button" onClick={() => setStep(3)} className="text-charcoal hover:text-teal text-sm font-medium">← Back</button>
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
            <a href="tel:3036970990" className="btn btn-teal">Call (303) 697-0990</a>
            <Link href="/contact" className="text-teal underline hover:text-amber py-4 px-2">Send a message instead</Link>
          </div>
        </div>
      </section>
    </>
  )
}
