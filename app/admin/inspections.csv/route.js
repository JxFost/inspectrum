/*
 * GET /admin/inspections.csv?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Downloads all inspections in the date window as CSV.
 * Auth: protected by admin middleware (inside /admin/*).
 */

import { NextResponse } from 'next/server'
import { getInspectionsInWindow } from '@/lib/booking'
import { TIMEZONE } from '@/lib/working-hours'

function csvEscape(value) {
  if (value == null) return ''
  const str = String(value)
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function csvRow(fields) {
  return fields.map(csvEscape).join(',')
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' })
}

function formatCents(cents) {
  if (!cents) return ''
  const num = parseInt(cents, 10)
  if (isNaN(num)) return ''
  return (num / 100).toFixed(2)
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const now = new Date()
  const from = searchParams.get('from') || new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const to = searchParams.get('to') || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  let inspections
  try {
    inspections = await getInspectionsInWindow({ from, to })
  } catch (err) {
    console.error('[admin-csv] fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch inspections.' }, { status: 500 })
  }

  const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:3000'

  const headers = [
    'inspection_number', 'date', 'time', 'customer_name', 'customer_phone', 'customer_email',
    'address', 'service', 'radon_add_on', 'sewer_scope', 'distance_miles', 'trip_charge_dollars',
    'price_dollars', 'payment_status', 'feedback_rating', 'source', 'status',
    'manage_url', 'calendar_event_id',
  ]

  const rows = inspections.map((i) => {
    const desc = i.rawDescription || ''
    return csvRow([
      i.inspectionNumber || '',
      formatDate(i.startISO),
      formatTime(i.startISO),
      i.customerName || '',
      i.phone || '',
      i.email || '',
      i.address || '',
      i.service || '',
      desc.includes('Radon Add-On: Yes') ? 'Yes' : '',
      desc.includes('Sewer Scope: Yes') ? 'Yes' : '',
      i.distanceMiles || '',
      i.tripChargeCents ? (parseInt(i.tripChargeCents) / 100).toFixed(2) : '',
      formatCents(i.paymentAmountCents || i.invoiceAmountCents),
      i.paymentStatus || 'not_invoiced',
      i.feedbackRating || '',
      i.source || '',
      i.status || '',
      i.token ? `${siteUrl}/manage?token=${i.token}` : '',
      i.eventId || '',
    ])
  })

  const csv = [csvRow(headers), ...rows].join('\r\n')
  const filename = `inspections-${from}-to-${to}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
