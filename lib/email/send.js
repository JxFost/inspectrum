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
  // TODO: Once evergreeninspections.com is verified in Resend, switch to:
  //   const from = process.env.EMAIL_FROM
  //   and remove the to override below.
  const from = 'Inspectrum Website <onboarding@resend.dev>'

  if (!apiKey) {
    console.error('Email not configured: missing RESEND_API_KEY')
    return { error: 'Email not configured' }
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    // Resend test sender can only deliver to your account email.
    to: ['jeff@evergreeninspections.com'],
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
