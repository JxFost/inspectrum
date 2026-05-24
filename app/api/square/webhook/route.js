/*
 * POST /api/square/webhook
 *
 * Receives Square webhook events (invoice.payment_made, invoice.canceled,
 * invoice.refunded). Verifies HMAC-SHA1 signature, updates the corresponding
 * calendar event's payment status.
 *
 * Returns 200 for all requests to prevent Square retries.
 */

import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { updatePaymentStatusByInvoiceId } from '@/lib/booking'

function verifySignature(rawBody, receivedSig) {
  const secret = process.env.SQUARE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[square-webhook] SQUARE_WEBHOOK_SECRET not configured')
    return false
  }

  const notificationUrl = `${process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'}/api/square/webhook`
  const hmac = createHmac('sha1', secret)
  hmac.update(notificationUrl + rawBody)
  const expected = hmac.digest('base64')

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSig))
  } catch {
    return false
  }
}

export async function POST(request) {
  const rawBody = await request.text()
  const receivedSig = request.headers.get('x-square-hmacsha256-signature') || ''

  if (!verifySignature(rawBody, receivedSig)) {
    console.warn('[square-webhook] signature verification failed')
    return NextResponse.json({ ok: false }, { status: 200 }) // 200 to prevent retries
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    console.error('[square-webhook] invalid JSON body')
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const eventType = body.type
  const invoice = body.data?.object?.invoice
  const invoiceId = invoice?.id

  if (!invoiceId) {
    console.log(`[square-webhook] received ${eventType}, no invoice ID`)
    return NextResponse.json({ ok: true })
  }

  console.log(`[square-webhook] ${eventType} for invoice ${invoiceId}`)

  try {
    switch (eventType) {
      case 'invoice.payment_made': {
        const amountCents = invoice.payment_requests?.[0]?.total_completed_amount_money?.amount
        await updatePaymentStatusByInvoiceId(invoiceId, 'paid', {
          paid_at: new Date().toISOString(),
          ...(amountCents != null && { payment_amount_cents: String(amountCents) }),
        })
        break
      }

      case 'invoice.canceled': {
        await updatePaymentStatusByInvoiceId(invoiceId, 'voided', {
          voided_at: new Date().toISOString(),
        })
        break
      }

      case 'invoice.refunded': {
        await updatePaymentStatusByInvoiceId(invoiceId, 'refunded', {
          refunded_at: new Date().toISOString(),
        })
        break
      }

      default:
        console.log(`[square-webhook] ignoring event type: ${eventType}`)
    }
  } catch (err) {
    console.error(`[square-webhook] error processing ${eventType}:`, err.message)
  }

  return NextResponse.json({ ok: true })
}
