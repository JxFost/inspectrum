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
import { reportReadyHtml } from '@/lib/email/templates/report-ready'

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
  agreementUrl: 'http://localhost:3000/agreement/preview-token',
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
    case 'cancel-alert':
      html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#1F2426;margin:0 0 16px;">Booking Cancelled</h2>
          <div style="background:#FAF7F1;border:1px solid #E2DDD5;border-radius:6px;padding:16px;margin-bottom:16px;">
            <p style="margin:4px 0;font-size:14px;"><strong>Customer:</strong> Sarah Johnson</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Service:</strong> Full Home Inspection</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Date:</strong> Wednesday, May 28 at 9:00 AM</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Address:</strong> 4642 Plettner Ln, Evergreen, CO 80439</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Phone:</strong> <a href="tel:3035551234" style="color:#2B7E8C;">303-555-1234</a></p>
          </div>
          <p style="color:#DC2626;font-weight:600;font-size:14px;">&#9888; This booking had a paid invoice. A refund may be needed.</p>
          <p style="font-size:13px;color:#9DA0A2;">This slot is now open on your calendar.</p>
        </div>`
      break
    case 'monthly':
      html = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#2B7E8C;margin:0 0 4px;">Monthly Report</h2>
          <p style="color:#3D3F40;margin:0 0 20px;">April 2026</p>
          <table width="100%" style="border:1px solid #E2DDD5;border-radius:6px;border-collapse:collapse;">
            <tr style="background:#FAF7F1;"><td colspan="2" style="padding:10px 16px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9DA0A2;font-weight:600;">Overview</td></tr>
            <tr><td style="padding:8px 16px;font-size:14px;color:#3D3F40;">Total Inspections</td><td style="padding:8px 16px;font-size:14px;font-weight:600;text-align:right;">18</td></tr>
            <tr><td style="padding:8px 16px;font-size:14px;color:#3D3F40;">Revenue Collected</td><td style="padding:8px 16px;font-size:14px;font-weight:600;text-align:right;">$8,250</td></tr>
            <tr><td style="padding:8px 16px;font-size:14px;color:#3D3F40;">Outstanding Invoices</td><td style="padding:8px 16px;font-size:14px;font-weight:600;text-align:right;">$900</td></tr>
            <tr><td style="padding:8px 16px;font-size:14px;color:#3D3F40;">Uninvoiced</td><td style="padding:8px 16px;font-size:14px;font-weight:600;text-align:right;">2 inspections</td></tr>
          </table>
          <h3 style="font-size:14px;color:#2B7E8C;margin:20px 0 8px;">Services</h3>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#3D3F40;line-height:1.8;"><li>Full Home Inspection: 12</li><li>Radon Testing Only: 4</li><li>Mold Assessment: 2</li></ul>
          <h3 style="font-size:14px;color:#2B7E8C;margin:20px 0 8px;">Top Service Areas</h3>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#3D3F40;line-height:1.8;"><li>Evergreen (6)</li><li>Denver (4)</li><li>Golden (3)</li><li>Lakewood (3)</li><li>Conifer (2)</li></ul>
          <h3 style="font-size:14px;color:#2B7E8C;margin:20px 0 8px;">Busiest Days</h3>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#3D3F40;line-height:1.8;"><li>Wednesday (5)</li><li>Tuesday (4)</li><li>Thursday (4)</li></ul>
        </div>`
      break
    case 'digest':
      html = dailyDigestHtml({
        dateLabel: 'Monday, May 26',
        inspections: [
          { startISO: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), customerName: 'Sarah Johnson', service: 'Full Home Inspection', phone: '303-555-1234', address: '4642 Plettner Ln, Evergreen, CO 80439', distanceMiles: '8', accessProvidedBy: "Seller's Agent will let you in", inspectionNumber: '2026-048', legMiles: 8, legFromLabel: 'from home' },
          { startISO: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), customerName: 'Mike Chen', service: 'Radon Testing Only', phone: '720-555-5678', address: '1035 N Pearl St, Denver, CO 80205', distanceMiles: '32', accessProvidedBy: 'Lockbox — 4521', inspectionNumber: '2026-049', legMiles: 28, legFromLabel: 'from previous' },
        ],
      })
      break
    case 'report-ready':
      html = reportReadyHtml({
        firstName: 'Peter',
        address: '1234 Fake Street, Evergreen, CO 80439',
        downloadUrl: '#',
        portalUrl: 'http://localhost:3000/portal',
      })
      break
    default:
      return NextResponse.json({ error: 'Unknown template. Use: followup, reminder, receipt, digest, cancel-alert, monthly, report-ready' }, { status: 400 })
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
