/*
 * GA4 event tracking helpers.
 *
 * Wraps window.gtag so components don't need to worry about whether
 * analytics has loaded yet. All calls are no-ops if gtag isn't available
 * (e.g. ad blockers, local dev without the script).
 */

export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}

// ── Contact form events ──

export function trackContactFormStart() {
  trackEvent('form_start', { form_name: 'contact' })
}

export function trackContactFormSubmit() {
  trackEvent('form_submit', { form_name: 'contact' })
}

export function trackContactFormAbandon(lastField) {
  trackEvent('form_abandon', { form_name: 'contact', last_field: lastField })
}

// ── Booking funnel events ──

const STEP_NAMES = { 1: 'service', 2: 'date_time', 3: 'details', 4: 'confirm' }

export function trackBookingStep(stepNumber) {
  trackEvent('booking_funnel_step', {
    step_number: stepNumber,
    step_name: STEP_NAMES[stepNumber] || `step_${stepNumber}`,
  })
}

export function trackBookingSubmit(service) {
  trackEvent('form_submit', { form_name: 'booking', service })
}

export function trackBookingFormStart() {
  trackEvent('form_start', { form_name: 'booking' })
}

export function trackBookingFormAbandon(stepNumber) {
  trackEvent('form_abandon', {
    form_name: 'booking',
    last_step: STEP_NAMES[stepNumber] || `step_${stepNumber}`,
  })
}
