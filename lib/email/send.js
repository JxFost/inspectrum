/*
 * Thin Resend wrapper. One function, takes {to, subject, html}, sends it.
 *
 * Environment variables:
 *   RESEND_API_KEY — Resend API key
 *   EMAIL_FROM     — "from" address, e.g. "Inspectrum Inspections <office@evergreeninspections.com>"
 *
 * When EMAIL_FROM is set, emails send from your verified domain.
 * When not set, falls back to Resend's test sender (delivers only to account email).
 *
 * Deliverability best practices applied:
 * - List-Unsubscribe header (reduces spam complaints)
 * - Reply-To defaults to office email
 * - Plain text name in From (not just email)
 */

import { Resend } from 'resend'

export async function sendEmail({ to, subject, html, replyTo, tags }) {
  const apiKey = process.env.RESEND_API_KEY
  const configuredFrom = process.env.EMAIL_FROM
  const officeEmail = process.env.OFFICE_EMAIL || 'office@evergreeninspections.com'

  // Use verified domain sender if configured, otherwise test sender
  const from = configuredFrom || 'Inspectrum Inspections <onboarding@resend.dev>'
  const isTestMode = !configuredFrom

  if (!apiKey) {
    console.error('Email not configured: missing RESEND_API_KEY')
    return { error: 'Email not configured' }
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: isTestMode ? ['jeff@evergreeninspections.com'] : (Array.isArray(to) ? to : [to]),
    subject,
    html,
    replyTo: replyTo || officeEmail,
    headers: {
      'List-Unsubscribe': `<mailto:${officeEmail}?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    ...(tags && { tags }),
  })

  if (error) {
    console.error('Resend send error:', error)
    return { error }
  }

  return { data }
}
