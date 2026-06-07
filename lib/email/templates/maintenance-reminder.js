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
    lead: "It's been about a year since we inspected your home — congratulations on a year of ownership. A little seasonal attention now is the difference between a small fix and an expensive one, so we put together a season-by-season maintenance guide built specifically for Front Range homes. A few of the essentials:",
    points: [
      'Test smoke and CO detectors; replace batteries and any alarm over 10 years old.',
      'Clear gutters and confirm downspouts drain well away from the foundation.',
      'Service the furnace and swap the filter before heating season.',
      'Keep your wildfire defensible space clear within the first 5 feet of the house.',
      'Retest for radon every two years — even after a low result.',
    ],
    // Anchor links into the seasonal guide
    seasonLinks: [
      { label: 'Spring', path: '/guides/home-maintenance#spring' },
      { label: 'Summer', path: '/guides/home-maintenance#summer' },
      { label: 'Fall', path: '/guides/home-maintenance#fall' },
      { label: 'Winter', path: '/guides/home-maintenance#winter' },
    ],
    ctaLabel: 'Open the Full Maintenance Guide',
    ctaPath: '/guides/home-maintenance',
  },
}

/**
 * @param {object} opts
 * @param {'radon'|'annual'} opts.type
 * @param {string} opts.customerName
 * @param {string} [opts.address]
 * @param {string} [opts.unsubscribeUrl] — visible opt-out link (marketing email)
 */
export function maintenanceReminderHtml({ type, customerName, address, unsubscribeUrl }) {
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

          <ul style="margin:0 0 24px;padding-left:20px;color:#3D3F40;font-size:14px;line-height:1.7;">
            ${c.points.map((p) => `<li style="margin-bottom:6px;">${p}</li>`).join('')}
          </ul>

          ${c.seasonLinks ? `
          <div style="margin:0 0 28px;padding:16px 20px;background-color:#FAF7F1;border:1px solid #E2DDD5;border-radius:6px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#2B7E8C;font-weight:600;margin-bottom:10px;">Jump to a season</div>
            ${c.seasonLinks.map((l) => `<a href="${siteUrl}${l.path}" style="display:inline-block;margin:0 14px 4px 0;font-size:14px;font-weight:600;color:#2B7E8C;text-decoration:none;">${l.label} →</a>`).join('')}
          </div>
          ` : ''}

          <a href="${siteUrl}${c.ctaPath}" style="display:inline-block;background-color:#2B7E8C;color:#FFFFFF;padding:14px 28px;border-radius:4px;font-size:14px;font-weight:600;text-decoration:none;">${c.ctaLabel}</a>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#F5F1EA;padding:24px 40px;border-radius:0 0 8px 8px;border-top:1px solid rgba(31,36,38,0.08);">
          <p style="font-size:12px;color:#3D3F40;opacity:0.7;margin:0;line-height:1.6;">
            Questions? Call <a href="tel:${officePhoneDigits}" style="color:#3D3F40;">${officePhone}</a> · Inspectrum Inspections · Evergreen, CO
          </p>
          <p style="font-size:11px;color:#3D3F40;opacity:0.55;margin:10px 0 0;line-height:1.6;">
            You're receiving these seasonal tips because you've had an inspection with us.${unsubscribeUrl ? ` <a href="${unsubscribeUrl}" style="color:#3D3F40;">Unsubscribe from reminders</a>.` : ''} This won't affect booking confirmations or report deliveries.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
