/*
 * Daily morning digest email template.
 *
 * Summarizes today's inspection schedule for Harry.
 */

import { TIMEZONE } from '@/lib/working-hours'
import { EMAIL_HEAD, emailLogoHeader } from './shared'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * @param {object} opts
 * @param {string} opts.dateLabel — e.g. "Monday, May 26"
 * @param {Array} opts.inspections — parsed inspection objects with startISO, customerName, service, phone, address, distanceMiles, accessProvidedBy, inspectionNumber
 */
export function dailyDigestHtml({ dateLabel, inspections }) {
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
  const logoUrl = `${siteUrl}/InspectrumLogo_440.png`
  const officePhone = process.env.OFFICE_PHONE || '(303) 697-0990'

  const rows = inspections.map((i, idx) => {
    // Drive distance divider between appointments
    const driveDivider = i.legMiles != null ? `
    <tr>
      <td colspan="3" style="padding:6px 16px;background-color:#F5F1EA;border-bottom:1px solid #E2DDD5;">
        <div style="font-size:11px;color:#9DA0A2;text-align:center;">
          🚗 ~${i.legMiles} mi ${i.legFromLabel || ''}${i.legMiles > 0 ? ` · ~${Math.round(i.legMiles * 1.5)} min drive` : ''}
        </div>
      </td>
    </tr>` : ''

    return `${idx > 0 || i.legMiles != null ? driveDivider : ''}
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #E2DDD5;vertical-align:top;">
        <div style="font-weight:600;color:#1F2426;font-size:15px;">${formatTime(i.startISO)}</div>
        ${i.inspectionNumber ? `<div style="font-size:11px;color:#9DA0A2;font-family:monospace;">${i.inspectionNumber}</div>` : ''}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #E2DDD5;vertical-align:top;">
        <div style="font-weight:600;color:#1F2426;">${i.customerName || 'TBD'}</div>
        <div style="font-size:13px;color:#3D3F40;">${i.service || 'Inspection'}</div>
        ${i.phone ? `<div style="font-size:13px;color:#3D3F40;"> <a href="tel:${i.phone.replace(/[^+\d]/g, '')}" style="color:#2B7E8C;text-decoration:none;">${i.phone}</a></div>` : ''}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #E2DDD5;vertical-align:top;">
        <div style="font-size:13px;color:#3D3F40;">${i.address || 'No address'}</div>
        ${i.distanceMiles ? `<div style="font-size:12px;color:#9DA0A2;">${i.distanceMiles} mi from home</div>` : ''}
        ${i.accessProvidedBy ? `<div style="font-size:12px;color:#2B7E8C;margin-top:4px;">Access: ${i.accessProvidedBy}</div>` : ''}
      </td>
    </tr>`
  }).join('')

  const emptyRow = inspections.length === 0
    ? '<tr><td colspan="3" style="padding:24px 16px;text-align:center;color:#9DA0A2;font-size:14px;">No inspections scheduled today. Enjoy the day off!</td></tr>'
    : ''

  return `
<!DOCTYPE html>
<html lang="en">
${EMAIL_HEAD}
<body style="margin:0;padding:0;background-color:#FAF7F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2426;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

${emailLogoHeader(logoUrl)}

        <tr><td style="background-color:#FFFFFF;padding:32px 24px;">

          <p style="font-size:18px;margin:0 0 4px;color:#2B7E8C;font-weight:600;">Good morning, Harry.</p>
          <p style="font-size:15px;margin:0 0 24px;color:#3D3F40;line-height:1.6;">
            Here's your schedule for <strong>${dateLabel}</strong> — ${inspections.length} inspection${inspections.length !== 1 ? 's' : ''} today.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2DDD5;border-radius:6px;overflow:hidden;">
            <tr style="background-color:#FAF7F1;">
              <th style="padding:8px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9DA0A2;font-weight:600;">Time</th>
              <th style="padding:8px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9DA0A2;font-weight:600;">Customer</th>
              <th style="padding:8px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#9DA0A2;font-weight:600;">Location</th>
            </tr>
            ${rows}${emptyRow}
          </table>

          <div style="margin-top:24px;text-align:center;">
            <a href="${siteUrl}/admin/inspections" style="display:inline-block;background-color:#2B7E8C;color:#FFFFFF;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">View Dashboard</a>
          </div>

        </td></tr>

        <tr><td style="background-color:#F5F1EA;padding:24px 40px;border-radius:0 0 8px 8px;border-top:1px solid rgba(31,36,38,0.08);">
          <p style="font-size:12px;color:#3D3F40;opacity:0.7;margin:0;line-height:1.6;">
            Inspectrum Inspections · Evergreen, CO
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
