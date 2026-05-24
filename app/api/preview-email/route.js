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
import { dailyDigestHtml } from '@/lib/email/templates/daily-digest'

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

function verifyAdmin(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

export async function GET(request) {
  // Allow in dev, or in production with admin auth
  if (process.env.NODE_ENV === 'production' && !verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    case 'digest':
      html = dailyDigestHtml({
        dateLabel: 'Monday, May 26',
        inspections: [
          { startISO: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), customerName: 'Sarah Johnson', service: 'Full Home Inspection', phone: '303-555-1234', address: '4642 Plettner Ln, Evergreen, CO 80439', distanceMiles: '8', accessProvidedBy: "Seller's Agent will let you in", inspectionNumber: '2026-048' },
          { startISO: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), customerName: 'Mike Chen', service: 'Radon Testing Only', phone: '720-555-5678', address: '1035 N Pearl St, Denver, CO 80205', distanceMiles: '32', accessProvidedBy: 'Lockbox — 4521', inspectionNumber: '2026-049' },
        ],
      })
      break
    default:
      return NextResponse.json({ error: 'Unknown template. Use: followup, reminder, receipt' }, { status: 400 })
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
