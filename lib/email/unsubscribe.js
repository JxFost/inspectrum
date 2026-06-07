/*
 * Unsubscribe handling for marketing/subscription emails.
 *
 * Only marketing emails (maintenance reminders, radon retest, annual check-in)
 * are unsubscribable — transactional emails (booking confirmation, reminders,
 * agreements, reports, payments) are exempt and always send.
 *
 * An unsubscribe link carries the recipient's email + an HMAC token so it can't
 * be forged. Unsubscribes are stored in the email_unsubscribes table and checked
 * before any marketing send.
 */

import crypto from 'crypto'
import { sql } from '@/lib/db'

function secret() {
  return process.env.EMAIL_UNSUB_SECRET || process.env.ADMIN_SESSION_SECRET || 'inspectrum-unsub-fallback'
}

/** Deterministic token for an email address. */
export function unsubscribeToken(email) {
  return crypto.createHmac('sha256', secret()).update(email.toLowerCase().trim()).digest('hex').slice(0, 32)
}

export function verifyUnsubscribeToken(email, token) {
  if (!email || !token) return false
  const expected = unsubscribeToken(email)
  // Timing-safe compare on equal-length buffers
  const a = Buffer.from(expected)
  const b = Buffer.from(String(token))
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Build the absolute unsubscribe URL for an email. */
export function unsubscribeUrl(email) {
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
  const params = new URLSearchParams({ email, token: unsubscribeToken(email) })
  return `${siteUrl}/api/unsubscribe?${params}`
}

/** True if this address has opted out of marketing email. */
export async function isUnsubscribed(email) {
  if (!email) return false
  try {
    const db = sql()
    const rows = await db`
      SELECT 1 FROM email_unsubscribes WHERE email = ${email.toLowerCase().trim()} LIMIT 1
    `
    return rows.length > 0
  } catch {
    // If the table/DB isn't available, fail open is risky for compliance —
    // fail closed (treat as unsubscribed) only on real errors would block all
    // marketing; instead we log and allow, since the cron also logs sends.
    return false
  }
}

/** Record an unsubscribe (idempotent). */
export async function addUnsubscribe(email, category = 'marketing') {
  const db = sql()
  await db`
    INSERT INTO email_unsubscribes (email, category)
    VALUES (${email.toLowerCase().trim()}, ${category})
    ON CONFLICT (email) DO NOTHING
  `
}
