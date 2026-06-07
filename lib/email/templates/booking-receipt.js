/*
 * Booking receipt email — sent immediately after a successful booking.
 *
 * Uses inline styles and tables for email client compatibility.
 * All dates formatted in America/Denver timezone.
 */

import { TIMEZONE } from '@/lib/working-hours'
import { EMAIL_HEAD, emailLogoHeader } from '@/lib/email/templates/shared'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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
 * @param {number} opts.durationHours
 * @param {string} opts.address
 * @param {string} opts.confirmationCode
 * @param {string} opts.manageUrl
 * @param {string} opts.gcalUrl
 * @param {string} [opts.agreementUrl]
 */
export function bookingReceiptHtml({
  customerName,
  service,
  startISO,
  endISO,
  durationHours,
  address,
  confirmationCode,
  manageUrl,
  gcalUrl,
  agreementUrl,
}) {
  const firstName = customerName.split(' ')[0]
  const date = formatDate(startISO)
  const time = formatTime(startISO)
  const endTime = formatTime(endISO)
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
  const officePhone = process.env.OFFICE_PHONE || '(303) 697-0990'
  const officePhoneDigits = officePhone.replace(/\D/g, '')
  const logoUrl = `${siteUrl}/InspectrumLogo_440.png`
  const inspectorPhotoUrl = `${siteUrl}/harry-foster-circle.png`

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

          <p style="font-size:18px;margin:0 0 8px;color:#2B7E8C;font-weight:600;">Great news, ${firstName} — your inspection is booked.</p>
          <p style="font-size:15px;margin:0 0 28px;color:#3D3F40;line-height:1.6;">
            Here are your details below. We'll send a reminder 48 hours beforehand.
          </p>

${agreementUrl ? `
          <!-- Agreement -->
          <div style="background-color:#FAF7F1;border-radius:6px;padding:20px;margin-bottom:28px;border:1px solid #E2DDD5;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#E89A3F;font-weight:600;margin-bottom:8px;">Action Required</div>
            <p style="font-size:14px;color:#3D3F40;line-height:1.5;margin:0 0 12px;">
              Please review and sign your Inspection Service Agreement before your appointment. It only takes a minute.
            </p>
            <a href="${agreementUrl}" style="display:inline-block;background-color:#2B7E8C;color:#FFFFFF;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">Review & Sign Agreement</a>
          </div>
` : ''}
          <!-- Appointment details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;border-radius:6px;padding:24px;margin-bottom:28px;">
            <tr><td>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#E89A3F;font-weight:600;margin-bottom:16px;">Appointment Details</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#3D3F40;text-transform:uppercase;letter-spacing:0.1em;width:120px;vertical-align:top;">Service</td>
                  <td style="padding:8px 0;font-size:15px;font-weight:500;">${service}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#3D3F40;text-transform:uppercase;letter-spacing:0.1em;vertical-align:top;">Date</td>
                  <td style="padding:8px 0;font-size:15px;font-weight:500;">${date}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#3D3F40;text-transform:uppercase;letter-spacing:0.1em;vertical-align:top;">Time</td>
                  <td style="padding:8px 0;font-size:15px;font-weight:500;">${time} – ${endTime} (${durationHours} hr${durationHours > 1 ? 's' : ''})</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#3D3F40;text-transform:uppercase;letter-spacing:0.1em;vertical-align:top;">Address</td>
                  <td style="padding:8px 0;font-size:15px;font-weight:500;">${address}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;color:#3D3F40;text-transform:uppercase;letter-spacing:0.1em;vertical-align:top;">Confirmation</td>
                  <td style="padding:8px 0;font-size:15px;font-weight:600;font-family:monospace;">${confirmationCode}</td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Your inspector -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td width="64" style="vertical-align:middle;padding-right:16px;">
                <img src="${inspectorPhotoUrl}" alt="Harry Foster" width="64" height="64" style="display:block;width:64px;height:64px;border-radius:50%;" />
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#2B7E8C;font-weight:600;margin-bottom:3px;">Your Inspector</div>
                <div style="font-size:16px;font-weight:600;color:#1F2426;">Harry Foster</div>
                <div style="font-size:13px;color:#3D3F40;">Inspectrum Inspections · Evergreen, CO</div>
              </td>
            </tr>
          </table>

          <!-- Buttons -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding-right:8px;">
                <a href="${gcalUrl}" target="_blank" style="display:block;text-align:center;background-color:#2B7E8C;color:#FFFFFF;padding:14px 20px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">Add to Calendar</a>
              </td>
              <td style="padding-left:8px;">
                <a href="${manageUrl}" style="display:block;text-align:center;background-color:#E89A3F;color:#FFFFFF;padding:14px 20px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">Cancel or Reschedule</a>
              </td>
            </tr>
          </table>

          <p style="font-size:13px;color:#3D3F40;line-height:1.6;margin:0 0 16px;">
            Need to make changes? Use the link above — no need to call. If anything looks wrong, reach us at <a href="tel:${officePhoneDigits}" style="color:#2B7E8C;font-weight:500;">${officePhone}</a>.
          </p>

          <p style="font-size:12px;color:#3D3F40;opacity:0.6;line-height:1.5;margin:0;padding:12px 0 0;border-top:1px solid #E2DDD5;">
            <strong>Cancellation policy:</strong> Please provide at least 24 hours notice if you need to cancel or reschedule. Cancellations made less than 24 hours before the appointment may be subject to a cancellation fee.
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#F5F1EA;padding:24px 40px;border-radius:0 0 8px 8px;border-top:1px solid rgba(31,36,38,0.08);">
          <p style="font-size:12px;color:#3D3F40;opacity:0.7;margin:0;line-height:1.6;">
            Inspectrum Inspections · Evergreen, CO 80439 · <a href="tel:${officePhoneDigits}" style="color:#3D3F40;">${officePhone}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
