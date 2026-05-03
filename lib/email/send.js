/*
 * Thin Resend wrapper. One function, takes {to, subject, html}, sends it.
 *
 * Environment variables:
 *   RESEND_API_KEY — Resend API key
 *   EMAIL_FROM     — "from" address, e.g. "Inspectrum Inspections <office@evergreeninspections.com>"
 */

import { Resend } from 'resend'

export async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    console.error('Email not configured: missing RESEND_API_KEY or EMAIL_FROM')
    return { error: 'Email not configured' }
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
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
