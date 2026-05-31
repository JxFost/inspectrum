/*
 * 24-hour reminder email — short, scannable, friendly.
 *
 * Sent by the daily cron job for appointments coming up in ~24 hours.
 * Includes agreement warning if not yet signed.
 */

import { TIMEZONE } from '@/lib/working-hours'
import { EMAIL_HEAD, emailLogoHeader } from '@/lib/email/templates/shared'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * @param {Object} opts
 * @param {string} opts.customerName
 * @param {string} opts.service
 * @param {string} opts.startISO
 * @param {string} opts.endISO
 * @param {string} opts.address
 * @param {string} opts.manageUrl
 */
export function reminderHtml({
  customerName,
  service,
  startISO,
  endISO,
  address,
  manageUrl,
  agreementUrl,
  agreementSigned = true,
}) {
  const firstName = customerName.split(' ')[0]
  const date = formatDate(startISO)
  const time = formatTime(startISO)
  const endTime = formatTime(endISO)
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
  const officePhone = process.env.OFFICE_PHONE || '(303) 697-0990'
  const officePhoneDigits = officePhone.replace(/\D/g, '')
  const logoUrl = `${siteUrl}/InspectrumLogo_440.png`

  return `
<!DOCTYPE html>
<html lang="en">
${EMAIL_HEAD}
<body style="margin:0;padding:0;background-color:#FAF7F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2426;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

${emailLogoHeader(logoUrl)}

        <!-- Body -->
        <tr><td style="background-color:#FFFFFF;padding:40px;">

          <p style="font-size:18px;margin:0 0 8px;color:#2B7E8C;font-weight:600;">Heads up, ${firstName} — your inspection is tomorrow.</p>
          <p style="font-size:15px;margin:0 0 28px;color:#3D3F40;line-height:1.6;">
            Just a friendly reminder that we'll see you soon. Here's a quick recap.
          </p>

${!agreementSigned && agreementUrl ? `
          <!-- Agreement warning -->
          <div style="background-color:#FEF3C7;border:1px solid #E89A3F;border-radius:6px;padding:20px;margin-bottom:28px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#E89A3F;font-weight:600;margin-bottom:8px;">Action Required</div>
            <p style="font-size:14px;color:#1F2426;line-height:1.5;margin:0 0 12px;">
              Your Inspection Service Agreement has not been signed yet. Please sign it before your appointment tomorrow.
            </p>
            <a href="${agreementUrl}" style="display:inline-block;background-color:#2B7E8C;color:#FFFFFF;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">Sign Agreement Now</a>
          </div>
` : ''}
          <!-- Appointment details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;border-radius:6px;padding:24px;margin-bottom:28px;">
            <tr><td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#3D3F40;width:80px;vertical-align:top;">When</td>
                  <td style="padding:6px 0;font-size:15px;font-weight:500;">${date}, ${time} – ${endTime}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#3D3F40;vertical-align:top;">What</td>
                  <td style="padding:6px 0;font-size:15px;font-weight:500;">${service}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#3D3F40;vertical-align:top;">Where</td>
                  <td style="padding:6px 0;font-size:15px;font-weight:500;">${address}</td>
                </tr>
              </table>
            </td></tr>
          </table>

          <p style="font-size:14px;color:#3D3F40;line-height:1.6;margin:0 0 24px;">
            Plans change — no hard feelings. You can cancel or reschedule with one click:
          </p>

          <a href="${manageUrl}" style="display:inline-block;background-color:#E89A3F;color:#FFFFFF;padding:14px 28px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">Manage Your Booking</a>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#F5F1EA;padding:24px 40px;border-radius:0 0 8px 8px;border-top:1px solid rgba(31,36,38,0.08);">
          <p style="font-size:12px;color:#3D3F40;opacity:0.7;margin:0;line-height:1.6;">
            Questions? Call <a href="tel:${officePhoneDigits}" style="color:#3D3F40;">${officePhone}</a> · Inspectrum Inspections · Evergreen, CO
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
