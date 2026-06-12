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
import { isUnsubscribed, unsubscribeUrl } from '@/lib/email/unsubscribe'

/**
 * @param {object} opts
 * @param {string|string[]} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 * @param {string|string[]} [opts.cc] — carbon-copy recipients (e.g. buyer's agent). Dropped in test mode.
 * @param {string} [opts.replyTo]
 * @param {Array} [opts.tags]
 * @param {Array<{filename: string, content: Buffer|string}>} [opts.attachments] — file attachments (e.g. .ics)
 * @param {boolean} [opts.marketing] — true for subscription/marketing email (unsubscribable, separate sender)
 * @param {string} [opts.inspectionId] — UUID for logging
 * @param {string} [opts.template] — template name for logging
 */
export async function sendEmail({ to, subject, html, cc, replyTo, tags, attachments, marketing = false, inspectionId, template }) {
  const apiKey = process.env.RESEND_API_KEY
  const configuredFrom = process.env.EMAIL_FROM
  // Marketing email may send from a distinct address (e.g. updates@) to keep
  // its sending reputation separate from transactional mail.
  const configuredMarketingFrom = process.env.EMAIL_FROM_MARKETING || configuredFrom
  const officeEmail = process.env.OFFICE_EMAIL || 'office@evergreeninspections.com'

  const isTestMode = !configuredFrom
  const from = marketing
    ? (configuredMarketingFrom || 'Inspectrum Inspections <onboarding@resend.dev>')
    : (configuredFrom || 'Inspectrum Inspections <onboarding@resend.dev>')
  const primaryTo = Array.isArray(to) ? to[0] : to

  // Honor opt-outs for marketing email — never block transactional mail.
  if (marketing && primaryTo && await isUnsubscribed(primaryTo)) {
    return { skipped: 'unsubscribed' }
  }

  const toAddresses = isTestMode ? ['jeff@evergreeninspections.com'] : (Array.isArray(to) ? to : [to])

  // Only CC real recipients in production — test mode routes everything to one inbox.
  const ccAddresses = !isTestMode && cc
    ? (Array.isArray(cc) ? cc : [cc]).filter(Boolean)
    : null

  if (!apiKey) {
    console.error('Email not configured: missing RESEND_API_KEY')
    return { error: 'Email not configured' }
  }

  // List-Unsubscribe only on marketing email — transactional mail is exempt
  // and must not appear opt-out-able.
  const marketingHeaders = marketing && primaryTo
    ? {
        'List-Unsubscribe': `<${unsubscribeUrl(primaryTo)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      }
    : {}

  // Append a "sent to" footer on client-facing email. Internal mail
  // (digest, alerts to the office/inspector) is left alone.
  const internalAddresses = new Set(
    [
      officeEmail,
      process.env.CONTACT_EMAIL,
      process.env.OFFICE_EMAIL,
      process.env.INSPECTOR_GMAIL_ADDRESS,
      process.env.ACC_GMAIL_ADDRESS,
    ].filter(Boolean).map((e) => e.toLowerCase())
  )
  let finalHtml = html
  if (primaryTo && !internalAddresses.has(primaryTo.toLowerCase()) && html.includes('</body>')) {
    const sentToFooter = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;"><tr><td align="center" style="padding:0 20px 32px;">
    <p style="font-size:11px;color:#9B9890;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;">
      This email was sent to ${primaryTo} because you have a booking or inspection with Inspectrum Inspections.<br>
      Please don't reply to automated messages you weren't expecting — reach us anytime at <a href="mailto:${officeEmail}" style="color:#9B9890;">${officeEmail}</a>.
    </p>
  </td></tr></table>`
    finalHtml = html.replace('</body>', `${sentToFooter}\n</body>`)
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: toAddresses,
    subject,
    html: finalHtml,
    replyTo: replyTo || officeEmail,
    headers: marketingHeaders,
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
    const { sql } = await import('../db.js')
    const db = sql()
    await db`
      INSERT INTO email_log (inspection_id, to_email, subject, template, resend_id, status, error)
      VALUES (${inspectionId}, ${toEmail}, ${subject}, ${template || null}, ${resendId || null}, ${status}, ${error || null})
    `
  } catch { /* DB might not be available */ }
}
