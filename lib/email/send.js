/*
 * Thin Resend wrapper. One function, takes {to, subject, html}, sends it.
 *
 * Environment variables:
 *   RESEND_API_KEY — Resend API key
 *   EMAIL_FROM     — "from" address, e.g. "Inspectrum Inspections <office@evergreeninspections.com>"
 *
 * When EMAIL_FROM is set, emails send from your verified domain.
 * When not set, falls back to Resend's test sender (delivers only to account email).
 */

import { Resend } from 'resend'

export async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY
  const configuredFrom = process.env.EMAIL_FROM

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
    // In test mode, Resend can only deliver to account email
    to: isTestMode ? ['jeff@evergreeninspections.com'] : (Array.isArray(to) ? to : [to]),
    subject,
    html,
    ...(replyTo && { replyTo }),
  })

  if (error) {
    console.error('Resend send error:', error)
    return { error }
  }

  return { data }
}
