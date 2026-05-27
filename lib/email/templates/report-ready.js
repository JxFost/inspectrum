/*
 * Report ready email — sent when Harry uploads an inspection report.
 */

import { EMAIL_HEAD, emailLogoHeader } from './shared'

export function reportReadyHtml({ firstName, address, downloadUrl, portalUrl }) {
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
  const logoUrl = `${siteUrl}/InspectrumLogo_440.png`
  const officePhone = process.env.CONTACT_PHONE || process.env.OFFICE_PHONE || '(303) 697-0990'
  const officePhoneDigits = officePhone.replace(/\D/g, '')

  return `
<!DOCTYPE html>
<html lang="en">
${EMAIL_HEAD}
<body style="margin:0;padding:0;background-color:#FAF7F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2426;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

${emailLogoHeader(logoUrl)}

        <tr><td style="background-color:#FFFFFF;padding:40px;">

          <p style="font-size:18px;margin:0 0 8px;color:#2B7E8C;font-weight:600;">Hi ${firstName},</p>
          <p style="font-size:15px;margin:0 0 8px;color:#3D3F40;line-height:1.6;">
            Your inspection report${address ? ` for <strong>${address}</strong>` : ''} is ready.
          </p>
          <p style="font-size:15px;margin:0 0 28px;color:#3D3F40;line-height:1.6;">
            You can download it now or access it anytime from your customer portal.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding-right:8px;">
                <a href="${downloadUrl}" target="_blank" style="display:block;text-align:center;background-color:#2B7E8C;color:#FFFFFF;padding:14px 20px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">Download Report</a>
              </td>
              <td style="padding-left:8px;">
                <a href="${portalUrl}" style="display:block;text-align:center;background-color:#E89A3F;color:#FFFFFF;padding:14px 20px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">View in Portal</a>
              </td>
            </tr>
          </table>

          <p style="font-size:13px;color:#3D3F40;line-height:1.6;margin:0 0 16px;">
            If you have questions about your report, Harry is happy to walk through it with you.
          </p>

          <p style="font-size:13px;color:#3D3F40;line-height:1.6;margin:0;">
            <a href="tel:${officePhoneDigits}" style="color:#2B7E8C;font-weight:500;">${officePhone}</a>
          </p>

        </td></tr>

        <tr><td style="background-color:#F5F1EA;padding:24px 40px;border-radius:0 0 8px 8px;border-top:1px solid rgba(31,36,38,0.08);">
          <p style="font-size:12px;color:#3D3F40;opacity:0.7;margin:0;line-height:1.6;">
            Inspectrum Inspections · Evergreen, CO 80439
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
