/*
 * GET/POST /api/unsubscribe?email=...&token=...
 *
 * Opt a recipient out of marketing/subscription email (maintenance reminders).
 * The token is an HMAC of the email so the link can't be forged.
 *
 * - POST: RFC 8058 one-click unsubscribe (from the List-Unsubscribe-Post header).
 * - GET:  the human-clickable link — records the opt-out and shows a confirmation.
 *
 * Transactional email (confirmations, reminders, reports) is unaffected.
 */

import { NextResponse } from 'next/server'
import { verifyUnsubscribeToken, addUnsubscribe } from '@/lib/email/unsubscribe'

function page(title, message) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Inspectrum Inspections</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#FAF7F1;color:#1F2426;">
  <div style="max-width:520px;margin:0 auto;padding:80px 24px;text-align:center;">
    <h1 style="font-size:24px;color:#2B7E8C;margin:0 0 12px;">${title}</h1>
    <p style="font-size:15px;color:#3D3F40;line-height:1.6;margin:0 0 24px;">${message}</p>
    <a href="https://evergreeninspections.com" style="display:inline-block;background:#2B7E8C;color:#fff;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">Back to Inspectrum</a>
  </div>
</body></html>`
}

async function process(email, token) {
  if (!email || !verifyUnsubscribeToken(email, token)) return false
  try {
    await addUnsubscribe(email, 'marketing')
    return true
  } catch (err) {
    console.error('[unsubscribe] failed:', err.message)
    return false
  }
}

export async function POST(request) {
  const { searchParams } = new URL(request.url)
  const ok = await process(searchParams.get('email'), searchParams.get('token'))
  return NextResponse.json({ unsubscribed: ok }, { status: ok ? 200 : 400 })
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const ok = await process(searchParams.get('email'), searchParams.get('token'))
  const html = ok
    ? page('You’re unsubscribed', 'You won’t receive any more maintenance reminders or seasonal tips from us. Don’t worry — booking confirmations, appointment reminders, and your reports will still come through.')
    : page('Link expired or invalid', 'We couldn’t process that unsubscribe link. Please reply to the email you received and we’ll take care of it.')
  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
