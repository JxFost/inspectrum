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

## 5b. Google Maps Geocoding API (for mileage-based pricing)

Enable when ready to implement the mileage/trip charge system.

- [ ] In Google Cloud Console, enable the **Geocoding API** on the same project as Calendar
- [ ] Create an API key (or reuse existing) restricted to Geocoding API
- [ ] Add `GOOGLE_MAPS_API_KEY` to `.env.local` and Vercel env vars
- [ ] Estimated cost: ~$0.10/month at current volume ($5 per 1,000 geocode requests)

### Mileage system overview (not yet built)

Constants to configure in `lib/mileage.js`:
- `HOME_ADDRESS` = 2525 Witter Gulch Rd, Evergreen, CO 80439
- `BASE_RADIUS_MILES` = 45 (no surcharge within this)
- `SURCHARGE_PER_MILE` = $0.50 per mile beyond base radius
- `MAX_SERVICE_RADIUS` = 75 miles (show "please call" beyond this)

Touches these areas when implemented:
- Booking form step 4: show distance + auto-calculate trip charge
- Admin block form: same distance display
- ACC inbound: auto-compute and store in event description
- Invoice form: pre-populate suggested price with trip charge included
- Dashboard: distance column/tooltip for route planning
- Today's Agenda: distance next to each address
- CSV export: distance_miles and trip_charge_dollars columns
- Event description: new fields `distance_miles`, `trip_charge_cents`, `geo_lat`, `geo_lng`

Caching: geocoded lat/lng stored in event description — each unique address costs one API call ever.

## 6. Analytics & SEO

- [ ] Verify Google Analytics (`G-2VGTX0N5H4`) is tracking the new domain
- [ ] Submit new sitemap in Google Search Console
- [ ] Set up 301 redirects from `inspectrum.vercel.app` to final domain (Vercel handles this automatically if configured)

## 7. Square Payment Integration

- [ ] Update `SQUARE_ENVIRONMENT` from `sandbox` to `production`
- [ ] Replace `SQUARE_ACCESS_TOKEN` and `SQUARE_LOCATION_ID` with production credentials
- [ ] Add new webhook endpoint in Square Production dashboard pointing to `https://evergreeninspections.com/api/square/webhook`
- [ ] Update `SQUARE_WEBHOOK_SECRET` with production webhook signing key
- [ ] Test a real invoice in production

## 8. CloudMailin / ACC Pipeline

- [ ] Update CloudMailin target URL to `https://evergreeninspections.com/api/inbound/acc?secret=...`
- [ ] Verify Gmail forwarding still works after domain change
- [ ] Test with a real ACC email

## 9. Final Smoke Test

- [ ] Homepage loads with correct meta/OG tags
- [ ] OG image shows in social share previews
- [ ] Booking flow works end to end (schedule -> confirmation email)
- [ ] Contact form sends email
- [ ] Manage booking page works (`/manage?token=...`)
- [ ] Manage page shows payment status for invoiced bookings
- [ ] Reminder cron fires correctly (48h)
- [ ] Follow-up cron fires correctly (72h with Google review link)
- [ ] Logo displays in emails
- [ ] Sitemap and robots.txt accessible
- [ ] JSON-LD structured data validates (https://validator.schema.org)
- [ ] Admin login → dashboard → invoice flow works
- [ ] ACC email → calendar event creation works
- [ ] Square webhook → payment status update works
