/*
 * 48-hour reminder email — short, scannable, friendly.
 *
 * Sent by the daily cron job for appointments coming up in ~48 hours.
 */

import { TIMEZONE } from '@/lib/working-hours'

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
}) {
  const firstName = customerName.split(' ')[0]
  const date = formatDate(startISO)
  const time = formatTime(startISO)
  const endTime = formatTime(endISO)

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF7F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2426;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background-color:#143C44;padding:32px 40px;border-radius:8px 8px 0 0;">
          <h1 style="margin:0;font-size:22px;color:#E89A3F;font-weight:600;letter-spacing:-0.02em;">Inspectrum Inspections</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#FFFFFF;padding:40px;">

          <p style="font-size:18px;margin:0 0 8px;color:#2B7E8C;font-weight:600;">Heads up, ${firstName} — your inspection is coming up.</p>
          <p style="font-size:15px;margin:0 0 28px;color:#3D3F40;line-height:1.6;">
            Just a friendly reminder that we'll see you soon. Here's a quick recap.
          </p>

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
            Questions? Call <a href="tel:3036970990" style="color:#3D3F40;">(303) 697-0990</a> · Inspectrum Inspections · Evergreen, CO
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
