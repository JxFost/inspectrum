/*
 * GET /api/admin/test-email
 *
 * Diagnostic endpoint — sends a simple test email and returns
 * the full Resend API response so we can debug delivery issues.
 *
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function verifyAdminSession(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

export async function GET(request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const configuredFrom = process.env.EMAIL_FROM

  // Diagnostics
  const diag = {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.slice(0, 8) + '...' : null,
    emailFrom: configuredFrom || '(not set — test mode)',
    isTestMode: !configuredFrom,
    testRecipient: 'jeff@evergreeninspections.com',
  }

  if (!apiKey) {
    return NextResponse.json({ ...diag, error: 'RESEND_API_KEY not set' })
  }

  const resend = new Resend(apiKey)
  const from = configuredFrom || 'Inspectrum Test <onboarding@resend.dev>'
  const to = 'jeff@evergreeninspections.com'

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: `Inspectrum Test Email — ${new Date().toLocaleTimeString()}`,
      html: `<p>This is a test email from the Inspectrum diagnostic endpoint.</p><p>Sent at: ${new Date().toISOString()}</p><p>From: ${from}</p>`,
    })

    return NextResponse.json({
      ...diag,
      resendResponse: data || null,
      resendError: error || null,
      success: !error,
    })
  } catch (err) {
    return NextResponse.json({
      ...diag,
      exception: err.message,
      success: false,
    })
  }
}
