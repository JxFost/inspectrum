/*
 * Post-inspection follow-up email — sent ~72 hours after the appointment.
 *
 * Thanks the customer, asks for a Google review, and offers to answer questions.
 */

import { TIMEZONE } from '@/lib/working-hours'
import { EMAIL_HEAD, emailLogoHeader } from '@/lib/email/templates/shared'

const GOOGLE_REVIEW_URL = 'https://g.page/Inspectrum/review'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * @param {Object} opts
 * @param {string} opts.customerName
 * @param {string} opts.service
 * @param {string} opts.startISO
 * @param {string} opts.address
 */
export function followupHtml({ customerName, service, startISO, address }) {
  const firstName = customerName.split(' ')[0]
  const contactPhone = process.env.CONTACT_PHONE || '(303) 653-7579'
  const date = formatDate(startISO)
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
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

          <p style="font-size:18px;margin:0 0 8px;color:#2B7E8C;font-weight:600;">Thanks for choosing Inspectrum, ${firstName}.</p>
          <p style="font-size:15px;margin:0 0 24px;color:#3D3F40;line-height:1.6;">
            We hope your ${service.toLowerCase()} on ${date} at ${address || 'your property'} went smoothly and that you found the report helpful.
          </p>

          <p style="font-size:15px;margin:0 0 8px;color:#1F2426;font-weight:600;">Have questions about your report?</p>
          <p style="font-size:15px;margin:0 0 28px;color:#3D3F40;line-height:1.6;">
            Harry is always happy to walk through findings or answer questions — even months after the inspection. Just call <a href="tel:${contactPhone}" style="color:#2B7E8C;">${contactPhone}</a> or reply to this email.
          </p>

          <!-- Star Rating -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;border-radius:6px;padding:24px;margin-bottom:16px;">
            <tr><td>
              <p style="font-size:15px;margin:0 0 8px;color:#1F2426;font-weight:600;">How did we do?</p>
              <p style="font-size:14px;margin:0 0 16px;color:#3D3F40;line-height:1.6;">
                Tap a star to rate your experience — it's quick and helps us improve.
              </p>
              <table cellpadding="0" cellspacing="0"><tr>
                ${[1,2,3,4,5].map((n) => `<td style="padding:0 4px;">
                  <a href="${siteUrl}/api/feedback?rating=${n}&name=${encodeURIComponent(customerName)}&service=${encodeURIComponent(service)}" style="text-decoration:none;font-size:32px;color:#E89A3F;" title="${n} star${n !== 1 ? 's' : ''}">★</a>
                </td>`).join('')}
              </tr></table>
              <p style="font-size:11px;color:#9DA0A2;margin:12px 0 0;">Your rating is private — only shared with our team.</p>
            </td></tr>
          </table>

          <!-- Review CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F1;border-radius:6px;padding:24px;margin-bottom:28px;">
            <tr><td>
              <p style="font-size:15px;margin:0 0 12px;color:#1F2426;font-weight:600;">Mind leaving us a public review?</p>
              <p style="font-size:14px;margin:0 0 16px;color:#3D3F40;line-height:1.6;">
                A short Google review helps other homebuyers in the Front Range find a trustworthy inspector. It only takes a minute and means a lot to us.
              </p>
              <a href="${GOOGLE_REVIEW_URL}" style="display:inline-block;background-color:#E89A3F;color:#FFFFFF;padding:14px 28px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">Leave a Google Review</a>
            </td></tr>
          </table>

          <p style="font-size:13px;color:#3D3F40;opacity:0.7;line-height:1.6;margin:0;">
            Thank you for trusting us with one of the biggest decisions of your life. We're here whenever you need us.
          </p>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#F5F1EA;padding:24px 40px;border-radius:0 0 8px 8px;border-top:1px solid rgba(31,36,38,0.08);">
          <p style="font-size:12px;color:#3D3F40;opacity:0.7;margin:0;line-height:1.6;">
            Questions? Call <a href="tel:${contactPhone}" style="color:#3D3F40;">${contactPhone}</a> · Inspectrum Inspections · Evergreen, CO
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
