/*
 * Thin Resend wrapper with email logging.
 *
 * Environment variables:
 *   RESEND_API_KEY — Resend API key
 *   EMAIL_FROM     — "from" address, e.g. "Inspectrum Inspections <office@evergreeninspections.com>"
 *
 * When EMAIL_FROM is set, emails send from your verified domain.
 * When not set, falls back to Resend's test sender (delivers only to account email).
 */

import { Resend } from 'resend'

/**
 * @param {object} opts
 * @param {string|string[]} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 * @param {string|string[]} [opts.cc] — carbon-copy recipients (e.g. buyer's agent). Dropped in test mode.
 * @param {string} [opts.replyTo]
 * @param {Array} [opts.tags]
 * @param {Array<{filename: string, content: Buffer|string}>} [opts.attachments] — file attachments (e.g. .ics)
 * @param {string} [opts.inspectionId] — UUID for logging
 * @param {string} [opts.template] — template name for logging
 */
export async function sendEmail({ to, subject, html, cc, replyTo, tags, attachments, inspectionId, template }) {
  const apiKey = process.env.RESEND_API_KEY
  const configuredFrom = process.env.EMAIL_FROM
  const officeEmail = process.env.OFFICE_EMAIL || 'office@evergreeninspections.com'

  const from = configuredFrom || 'Inspectrum Inspections <onboarding@resend.dev>'
  const isTestMode = !configuredFrom
  const toAddresses = isTestMode ? ['jeff@evergreeninspections.com'] : (Array.isArray(to) ? to : [to])

  // Only CC real recipients in production — test mode routes everything to one inbox.
  const ccAddresses = !isTestMode && cc
    ? (Array.isArray(cc) ? cc : [cc]).filter(Boolean)
    : null

  if (!apiKey) {
    console.error('Email not configured: missing RESEND_API_KEY')
    return { error: 'Email not configured' }
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: toAddresses,
    subject,
    html,
    replyTo: replyTo || officeEmail,
    headers: {
      'List-Unsubscribe': `<mailto:${officeEmail}?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    ...(ccAddresses && ccAddresses.length && { cc: ccAddresses }),
    ...(attachments && attachments.length && { attachments }),
    ...(tags && { tags }),
  })

  // Log to DB (non-blocking)
  if (inspectionId) {
    logEmail({
      inspectionId,
      toEmail: Array.isArray(to) ? to[0] : to,
      subject,
      template,
      resendId: data?.id || null,
      status: error ? 'failed' : 'sent',
      error: error?.message || null,
    }).catch((err) => console.error('[email-log] failed:', err.message))
  }

  if (error) {
    console.error('Resend send error:', error)
    return { error }
  }

  return { data }
}

async function logEmail({ inspectionId, toEmail, subject, template, resendId, status, error }) {
  try {
    const { sql } = await import('./db.js')
    const db = sql()
    await db`
      INSERT INTO email_log (inspection_id, to_email, subject, template, resend_id, status, error)
      VALUES (${inspectionId}, ${toEmail}, ${subject}, ${template || null}, ${resendId || null}, ${status}, ${error || null})
    `
  } catch { /* DB might not be available */ }
}
