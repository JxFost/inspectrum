/*
 * GET /api/cron/monthly-report
 *
 * Runs on the 1st of each month. Sends a summary of last month's
 * inspections: count, revenue, outstanding, busiest days, top areas.
 * Runs at 2pm UTC (8am MT) on the 1st.
 */

import { NextResponse } from 'next/server'
import { getInspectionsFromDB } from '@/lib/db-inspections'
import { sendEmail } from '@/lib/email/send'
import { TIMEZONE } from '@/lib/working-hours'
import { EMAIL_HEAD, emailLogoHeader } from '@/lib/email/templates/shared'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Calculate last month's date range
  const now = new Date()
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59) // last day of prev month
  const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1)
  const monthLabel = lastMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  let dbRows
  try {
    dbRows = await getInspectionsFromDB(lastMonthStart.toISOString(), lastMonthEnd.toISOString())
  } catch (err) {
    console.error('[monthly-report] DB fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 })
  }

  // Map DB rows to the format the report expects
  const inspections = dbRows
    .filter((r) => r.customer_name && r.service !== 'Blocked Time')
    .map((r) => {
      const desc = r.raw_description || ''
      return {
        startISO: r.start_at?.toISOString?.() || r.start_at,
        service: r.service,
        customerName: r.customer_name,
        address: r.address,
        paymentStatus: r.payment_status,
        paymentAmountCents: r.payment_amount_cents ? String(r.payment_amount_cents) : null,
        invoiceAmountCents: r.invoice_amount_cents ? String(r.invoice_amount_cents) : null,
        source: r.source,
        radonAddOn: desc.includes('Radon Add-On: Yes'),
        sewerScope: desc.includes('Sewer Scope: Yes'),
      }
    })

  const totalCount = inspections.length

  // Revenue
  const collected = inspections
    .filter((i) => i.paymentStatus === 'paid' && i.paymentAmountCents)
    .reduce((sum, i) => sum + (parseInt(i.paymentAmountCents, 10) || 0), 0)

  const outstanding = inspections
    .filter((i) => i.paymentStatus === 'pending' && i.invoiceAmountCents)
    .reduce((sum, i) => sum + (parseInt(i.invoiceAmountCents, 10) || 0), 0)

  const uninvoiced = inspections.filter((i) => !i.paymentStatus).length

  // Busiest days
  const dayCounts = {}
  for (const i of inspections) {
    const day = new Date(i.startISO).toLocaleDateString('en-US', { timeZone: TIMEZONE, weekday: 'long' })
    dayCounts[day] = (dayCounts[day] || 0) + 1
  }
  const busiestDays = Object.entries(dayCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([day, count]) => `${day} (${count})`)

  // Top cities/areas
  const cityCounts = {}
  for (const i of inspections) {
    const city = i.address?.match(/,\s*([^,]+),\s*\w{2}/)?.[1]?.trim()
    if (city) cityCounts[city] = (cityCounts[city] || 0) + 1
  }
  const topAreas = Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([city, count]) => `${city} (${count})`)

  // Service breakdown
  const serviceCounts = {}
  for (const i of inspections) {
    if (i.service) serviceCounts[i.service] = (serviceCounts[i.service] || 0) + 1
  }
  const serviceBreakdown = Object.entries(serviceCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([svc, count]) => `${svc}: ${count}`)

  // Add-on breakdown
  const radonCount = inspections.filter((i) => i.radonAddOn).length
  const sewerCount = inspections.filter((i) => i.sewerScope).length
  const addOnBreakdown = [
    radonCount > 0 ? `Radon Testing: ${radonCount}` : null,
    sewerCount > 0 ? `Sewer Scope: ${sewerCount}` : null,
  ].filter(Boolean)

  // Source breakdown
  const sourceCounts = {}
  for (const i of inspections) {
    sourceCounts[i.source] = (sourceCounts[i.source] || 0) + 1
  }
  const sourceBreakdown = Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([src, count]) => `${src === 'web' ? 'Website' : src === 'acc' ? 'ACC (Call Center)' : src === 'admin' ? 'Admin' : 'Other'}: ${count}`)

  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
  const logoUrl = `${siteUrl}/InspectrumLogo_440.png`

  const statRow = (label, value) => `
    <tr>
      <td style="padding:8px 16px;font-size:14px;color:#3D3F40;">${label}</td>
      <td style="padding:8px 16px;font-size:14px;font-weight:600;color:#1F2426;text-align:right;">${value}</td>
    </tr>`

  const listSection = (title, items) => items.length === 0 ? '' : `
    <h3 style="font-size:14px;color:#2B7E8C;margin:20px 0 8px;font-weight:600;">${title}</h3>
    <ul style="margin:0;padding-left:20px;font-size:13px;color:#3D3F40;line-height:1.8;">
      ${items.map((item) => `<li>${item}</li>`).join('')}
    </ul>`

  const html = `
<!DOCTYPE html>
<html lang="en">
${EMAIL_HEAD}
<body style="margin:0;padding:0;background-color:#FAF7F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2426;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

${emailLogoHeader(logoUrl)}

        <tr><td style="background-color:#FFFFFF;padding:32px 24px;">

          <p style="font-size:20px;margin:0 0 4px;color:#2B7E8C;font-weight:600;">Monthly Report</p>
          <p style="font-size:15px;margin:0 0 24px;color:#3D3F40;">${monthLabel}</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2DDD5;border-radius:6px;overflow:hidden;">
            <tr style="background-color:#FAF7F1;">
              <td colspan="2" style="padding:10px 16px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9DA0A2;font-weight:600;">Overview</td>
            </tr>
            ${statRow('Total Inspections', totalCount)}
            ${statRow('Revenue Collected', `$${Math.round(collected / 100).toLocaleString()}`)}
            ${statRow('Outstanding Invoices', outstanding > 0 ? `$${Math.round(outstanding / 100).toLocaleString()}` : '$0')}
            ${statRow('Uninvoiced', uninvoiced > 0 ? `${uninvoiced} inspections` : 'All invoiced')}
          </table>

          ${listSection('Services', serviceBreakdown)}
          ${listSection('Add-Ons', addOnBreakdown)}
          ${listSection('Booking Sources', sourceBreakdown)}
          ${listSection('Busiest Days', busiestDays)}
          ${listSection('Top Service Areas', topAreas)}

          <div style="margin-top:24px;text-align:center;">
            <a href="${siteUrl}/admin/inspections?range=1m" style="display:inline-block;background-color:#2B7E8C;color:#FFFFFF;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">View Dashboard</a>
          </div>

        </td></tr>

        <tr><td style="background-color:#F5F1EA;padding:24px 40px;border-radius:0 0 8px 8px;border-top:1px solid rgba(31,36,38,0.08);">
          <p style="font-size:12px;color:#3D3F40;opacity:0.7;margin:0;">Inspectrum Inspections · Evergreen, CO</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const reportTo = process.env.DIGEST_EMAIL || 'harry@evergreeninspections.com'

  try {
    await sendEmail({
      to: reportTo,
      subject: `Monthly Report — ${monthLabel} (${totalCount} inspections)`,
      html,
    })
    console.log(`[monthly-report] sent for ${monthLabel}, ${totalCount} inspections`)
  } catch (err) {
    console.error('[monthly-report] send error:', err)
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 })
  }

  return NextResponse.json({ sent: true, month: monthLabel, inspections: totalCount })
}
