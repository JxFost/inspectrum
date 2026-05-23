# Domain Launch Checklist

Steps to complete when moving the site to its final domain (e.g. `evergreeninspections.com`).

---

## 1. DNS & Vercel

- [ ] Add custom domain in Vercel project settings
- [ ] Update DNS records (A / CNAME) to point to Vercel
- [ ] Verify SSL certificate is issued

## 2. Vercel Environment Variables

- [ ] `PUBLIC_SITE_URL` — update to `https://evergreeninspections.com`

## 3. Hardcoded URLs in Code

These files reference `evergreeninspections.com` and should be verified/updated if the domain changes:

- [ ] `app/layout.js` — `metadataBase`, JSON-LD schema, `url`, `email`, booking target
- [ ] `app/sitemap.js` — `BASE` constant
- [ ] `app/robots.js` — sitemap URL
- [ ] `app/contact/page.js` — canonical URL
- [ ] `app/contact/ContactClient.jsx` — email display/link
- [ ] `app/schedule/page.js` — canonical URL
- [ ] `app/services/full-inspection/page.js` — canonical URL
- [ ] `app/services/commercial/page.js` — canonical URL
- [ ] `app/services/radon/page.js` — canonical URL
- [ ] `app/services/mold/page.js` — canonical URL
- [ ] `lib/jsonld.js` — `BASE_URL` constant
- [ ] `components/Footer.jsx` — email link

## 4. Email (Resend)

- [ ] Verify `evergreeninspections.com` domain in Resend (add DNS records)
- [ ] Set `EMAIL_FROM` env var (e.g. `Inspectrum Inspections <office@evergreeninspections.com>`)
- [ ] Update `lib/email/send.js` — remove hardcoded `onboarding@resend.dev` fallback
- [ ] Update `app/api/contact/route.js` — switch `to` address if needed
- [ ] Test booking receipt and reminder emails with new from address

## 5. Google Integrations

- [ ] Update authorized domains in Google Cloud Console (OAuth/service account)
- [ ] Verify Google Search Console for new domain
- [ ] Update Google Business Profile website URL

## 6. Analytics & SEO

- [ ] Verify Google Analytics (`G-2VGTX0N5H4`) is tracking the new domain
- [ ] Submit new sitemap in Google Search Console
- [ ] Set up 301 redirects from `inspectrum.vercel.app` to final domain (Vercel handles this automatically if configured)

## 7. Final Smoke Test

- [ ] Homepage loads with correct meta/OG tags
- [ ] Booking flow works end to end (schedule -> confirmation email)
- [ ] Contact form sends email
- [ ] Manage booking page works (`/manage?token=...`)
- [ ] Reminder cron fires correctly
- [ ] Logo displays in emails
- [ ] Sitemap and robots.txt accessible
- [ ] JSON-LD structured data validates (https://validator.schema.org)
