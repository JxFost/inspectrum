/*
 * Maintenance reminder email — re-engagement for past clients.
 *
 * Two types:
 *   'radon'  — 2-year radon retest nudge (EPA recommends retesting every 2 years)
 *   'annual' — yearly home-maintenance check-in
 *
 * Sent by the maintenance-reminders cron. Content is written for homeowners;
 * each links back to the site to rebook.
 */

import { EMAIL_HEAD, emailLogoHeader } from '@/lib/email/templates/shared'

const COPY = {
  radon: {
    eyebrow: 'Time to Retest',
    heading: (name) => `${name}, it's been two years — time to recheck your radon.`,
    lead: "The EPA recommends retesting your home for radon every two years, even if your last result was low. Radon levels drift over time as soil settles, foundations age, and HVAC patterns change — and Colorado averages well above the action level.",
    points: [
      'A 48-hour continuous monitor gives you a fresh, accurate reading.',
      "If you've added a mitigation system since your last test, a retest confirms it's still doing its job.",
      'Quick to schedule, and your past results stay on file for comparison.',
    ],
    ctaLabel: 'Schedule a Radon Retest',
    ctaPath: '/schedule',
  },
  annual: {
    eyebrow: 'Annual Check-In',
    heading: (name) => `${name}, how's the home treating you?`,
    lead: "It's been about a year since we inspected your home. A quick seasonal once-over now can catch small issues before they become expensive ones.",
    points: [
      'Test smoke and CO detectors; replace batteries.',
      'Clear gutters and check that downspouts drain away from the foundation.',
      'Have the furnace serviced and swap the filter before heating season.',
      'Check for caulk and weather-stripping gaps around windows and doors.',
    ],
    ctaLabel: 'Book Another Inspection',
    ctaPath: '/schedule',
  },
}

/**
 * @param {object} opts
 * @param {'radon'|'annual'} opts.type
 * @param {string} opts.customerName
 * @param {string} [opts.address]
 */
export function maintenanceReminderHtml({ type, customerName, address }) {
  const c = COPY[type] || COPY.annual
  const firstName = (customerName || 'there').split(' ')[0]
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

          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#E89A3F;font-weight:600;margin-bottom:8px;">${c.eyebrow}</div>
          <p style="font-size:18px;margin:0 0 8px;color:#2B7E8C;font-weight:600;">${c.heading(firstName)}</p>
          ${address ? `<p style="font-size:13px;margin:0 0 16px;color:#3D3F40;opacity:0.7;">${address}</p>` : ''}
          <p style="font-size:15px;margin:0 0 20px;color:#3D3F40;line-height:1.6;">${c.lead}</p>

          <ul style="margin:0 0 28px;padding-left:20px;color:#3D3F40;font-size:14px;line-height:1.7;">
            ${c.points.map((p) => `<li style="margin-bottom:6px;">${p}</li>`).join('')}
          </ul>

          <a href="${siteUrl}${c.ctaPath}" style="display:inline-block;background-color:#2B7E8C;color:#FFFFFF;padding:14px 28px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">${c.ctaLabel}</a>

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
