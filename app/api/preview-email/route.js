/*
 * GET /api/preview-email?template=followup|reminder|receipt
 *
 * Dev-only endpoint that renders email templates with sample data.
 * Only works in development — returns 404 in production.
 */

import { NextResponse } from 'next/server'
import { followupHtml } from '@/lib/email/templates/followup'
import { reminderHtml } from '@/lib/email/templates/reminder'
import { bookingReceiptHtml } from '@/lib/email/templates/booking-receipt'

const SAMPLE = {
  customerName: 'Peter McDougall',
  service: 'Full Home Inspection',
  startISO: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  endISO: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
  durationHours: 4,
  address: '1234 Fake Street, Evergreen, CO 80439',
  confirmationCode: 'ABC12345',
  manageUrl: 'http://localhost:3000/manage?token=preview',
  gcalUrl: '#',
}

export async function GET(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const template = searchParams.get('template') || 'followup'

  let html
  switch (template) {
    case 'followup':
      html = followupHtml(SAMPLE)
      break
    case 'reminder':
      html = reminderHtml(SAMPLE)
      break
    case 'receipt':
      html = bookingReceiptHtml(SAMPLE)
      break
    default:
      return NextResponse.json({ error: 'Unknown template. Use: followup, reminder, receipt' }, { status: 400 })
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
