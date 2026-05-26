/*
 * Magic link email template for customer portal login.
 */

import { EMAIL_HEAD, emailLogoHeader } from './shared'

export function magicLinkHtml({ firstName, loginUrl }) {
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
  const logoUrl = `${siteUrl}/InspectrumLogo_440.png`
  const officePhone = process.env.OFFICE_PHONE || '(303) 697-0990'

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

          <p style="font-size:18px;margin:0 0 8px;color:#2B7E8C;font-weight:600;">Hi${firstName ? ` ${firstName}` : ''},</p>
          <p style="font-size:15px;margin:0 0 28px;color:#3D3F40;line-height:1.6;">
            Tap the button below to sign in to your Inspectrum customer portal. This link expires in 15 minutes.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td align="center">
              <a href="${loginUrl}" style="display:inline-block;background-color:#2B7E8C;color:#FFFFFF;padding:16px 32px;border-radius:4px;font-size:16px;font-weight:600;text-decoration:none;">Sign In to Your Portal</a>
            </td></tr>
          </table>

          <p style="font-size:13px;color:#3D3F40;line-height:1.6;margin:0 0 16px;">
            If you didn't request this link, you can safely ignore this email.
          </p>

          <p style="font-size:12px;color:#3D3F40;opacity:0.6;line-height:1.5;margin:0;padding:12px 0 0;border-top:1px solid #E2DDD5;">
            Questions? Call <a href="tel:${officePhone.replace(/\\D/g, '')}" style="color:#2B7E8C;">${officePhone}</a>
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
