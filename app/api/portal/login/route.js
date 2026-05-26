/*
 * POST /api/portal/login
 *
 * Sends a magic link email to the customer. If the email exists in the
 * customers table, creates a magic link token and emails it.
 * If not found, still returns 200 (don't reveal which emails exist).
 */

import { NextResponse } from 'next/server'
import { findCustomerByEmail, createMagicLinkToken } from '@/lib/db-customers'
import { sendEmail } from '@/lib/email/send'
import { magicLinkHtml } from '@/lib/email/templates/magic-link'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  // Always return success to prevent email enumeration
  const customer = await findCustomerByEmail(email)

  if (customer) {
    try {
      const token = await createMagicLinkToken(customer.id)
      const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
      const loginUrl = `${siteUrl}/api/portal/verify?token=${token}`

      await sendEmail({
        to: email,
        subject: 'Sign in to Inspectrum',
        html: magicLinkHtml({
          firstName: customer.name?.split(' ')[0] || null,
          loginUrl,
        }),
      })

      console.log(`[portal] magic link sent to ${email}`)
    } catch (err) {
      console.error('[portal] magic link error:', err.message)
      // Still return 200 — don't reveal errors to the client
    }
  } else {
    console.log(`[portal] login attempt for unknown email: ${email}`)
  }

  return NextResponse.json({ ok: true, message: 'If an account exists, a login link has been sent.' })
}
