# Inspectrum Inspections — Next.js Site

Full-stack booking, operations, and marketing site for Inspectrum Inspections, built with Next.js 16 App Router, Tailwind CSS v4, and React 19. Deployed on Vercel.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture overview

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Calendar | Google Calendar API via service account |
| Payments | Square Invoices API |
| Email | Resend (transactional emails) |
| Inbound email | CloudMailin → webhook |
| Auth | Shared password + HMAC-signed session cookie |
| Hosting | Vercel (SSG + serverless functions) |

## Project structure

```
app/
  layout.js                     Root layout, nav, footer, LocalBusiness JSON-LD
  page.js                       Homepage
  about/harry/page.js           Harry Foster bio page

  schedule/
    SchedulerClient.jsx         6-step Typeform-style booking flow

  manage/
    ManageClient.jsx             Self-serve booking management + payment status

  contact/
    ContactClient.jsx            Contact form

  services/
    full-inspection/page.js      Service pages with FAQ schema
    radon/page.js
    mold/page.js
    commercial/page.js

  admin/
    page.js                      Redirects to /admin/inspections
    login/                       Admin login page
    inspections/
      page.js                    Server component — data fetching
      InspectionsDashboard.jsx   Client component — search, filters, table, pagination
      [eventId]/invoice/         Invoice creation form
    block/                       Manual booking / vacation block form

  api/
    book/route.js                Website booking → Google Calendar
    booking/[token]/route.js     Manage page data API
    booking/cancel/route.js      Cancel booking
    availability/route.js        Slot availability checker
    contact/route.js             Contact form → Resend
    inbound/acc/route.js         ACC email webhook → calendar events
    inspection/finalize/route.js Square invoice creation
    square/webhook/route.js      Square payment webhook handler
    admin/login/route.js         Admin auth
    admin/logout/route.js        Admin logout (clears cookie)
    admin/block/route.js         Admin manual booking API
    cron/reminders/route.js      48h reminder emails (daily cron)
    cron/followup/route.js       72h follow-up + Google review ask (daily cron)
    preview-email/route.js       Dev-only email template preview

lib/
  booking.js            Shared helpers: event description builder/parser,
                        payment status, inspection numbering, mileage fields
  booking-tokens.js     Token generation, extraction, markers
  google-calendar.js    Google Calendar API wrapper
  services.js           Service catalog (IDs, names, durations, prices)
  working-hours.js      Business hours, buffer, timezone config
  slots.js              Available slot computation
  square.js             Square SDK wrapper (invoices, customers, orders)
  mileage.js            Distance calculation + trip charge constants
  acc-email-parser.js   ACC email parser (4 email types)
  email/
    send.js             Resend email wrapper
    templates/
      booking-receipt.js
      reminder.js
      followup.js       Post-inspection follow-up with Google review CTA
      shared.js          Shared email layout (logo header, head styles)
  jsonld.js             JSON-LD helpers (Service, FAQ, Breadcrumb)

components/
  Nav.jsx               Responsive nav with admin mode detection
  Footer.jsx            Footer with social links
  BrandLogo.jsx         Logo SVG lockup
  Button.jsx            Universal button
  FAQ.jsx               Accordion + FAQPage JSON-LD
  CTABanner.jsx         Closing CTA band
  GoogleAnalytics.jsx   GA4 loader
```

## Key features

### Booking system
- 6-step form: Service → Date & Time → You → Property → Access → Confirm
- Real-time Google Calendar availability with 1-hour travel buffer
- Multi-calendar conflict checking (`GOOGLE_BUSY_CALENDAR_IDS`)
- Property details: sqft, year built, water type, garage, occupied, pets
- Agent representation, client attending, access/lockbox
- Radon add-on with RECOMMENDED badge
- Inspection numbering (2026-001, 2026-002...)
- Mileage computation + trip charge (TBD until Google Maps API key configured)
- Honeypot bot protection

### ACC email pipeline
- CloudMailin webhook receives forwarded ACC emails
- Parser handles: Appointment, Reschedule, Cancelled, End of Day (ignored)
- Auto-creates/updates/deletes Google Calendar events
- 22 unit tests (`node --test lib/acc-email-parser.test.js`)

### Admin portal (`/admin/*`)
- Password-based auth with HMAC-signed session cookie
- **Inspections dashboard**: summary stats with trends, today's agenda, searchable/filterable table, paginated, CSV export
- **Manual booking**: create events or vacation blocks
- **Invoice creation**: enter final price, sends Square invoice to customer
- Overdue invoice highlighting (7+ days past due)
- Inspection numbering and distance tracking
- Admin nav mode (replaces client nav on admin pages)

### Square payments
- Invoice-based (zero PCI scope — Square hosts payment page)
- Admin sends invoice from dashboard → customer pays on Square
- Webhook updates calendar event with payment status
- Manage page shows payment status + Pay Now / View Receipt
- See `SQUARE_SETUP.md` for full setup guide

### Email system
- **Booking receipt** — sent on booking confirmation
- **48h reminder** — daily cron, idempotent via marker
- **72h follow-up** — post-inspection with Google review CTA
- All templates branded with centered logo
- Preview endpoint: `/api/preview-email?template=followup|reminder|receipt` (dev only)

### SEO / GEO
- Server-rendered HTML, per-page metadata, canonical URLs
- OG image + Twitter card
- LocalBusiness JSON-LD with aggregateRating, services, service areas
- Person schema on bio page with credentials
- FAQPage + BreadcrumbList + Service schemas
- AI crawler permissions (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot)
- llms.txt for AI discoverability
- Google reviews (static, linked to Google Business profile)
- GEO audit report: `GEO-AUDIT-REPORT.md`

## Environment variables

See `.env.example` for the full list. Key groups:

| Group | Variables |
|-------|-----------|
| Google Calendar | `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`, `GOOGLE_BUSY_CALENDAR_IDS` |
| Email (Resend) | `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL`, `CONTACT_PHONE`, `PUBLIC_SITE_URL` |
| Admin | `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` |
| ACC Pipeline | `INBOUND_WEBHOOK_SECRET` |
| Square | `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_WEBHOOK_SECRET`, `SQUARE_ENVIRONMENT` |
| Analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Mileage (future) | `GOOGLE_MAPS_API_KEY` |

## Cron jobs (vercel.json)

| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| Daily 3pm UTC (9am MT) | `/api/cron/reminders` | 48h reminder emails |
| Daily 5pm UTC (11am MT) | `/api/cron/followup` | 72h follow-up + review ask |

## Setup guides

- `SQUARE_SETUP.md` — Square Developer app, credentials, webhooks, sandbox testing
- `EMAIL_SETUP.md` — Resend domain verification, email configuration
- `DOMAIN_LAUNCH_CHECKLIST.md` — Complete checklist for moving to production domain
- `GEO-AUDIT-REPORT.md` — Full GEO audit with scores and action items

## Deployment

Deployed on **Vercel**. Push to `main` triggers auto-deploy.

```bash
npx vercel          # first-time setup
git push            # subsequent deploys
```

## Still TODO

- [ ] Move to production domain (`evergreeninspections.com`) — see `DOMAIN_LAUNCH_CHECKLIST.md`
- [ ] Verify Resend domain for real customer emails
- [ ] Switch Square from sandbox to production
- [ ] Enable Google Maps Geocoding API for mileage calculations
- [ ] Add Privacy Policy and Terms of Service pages
- [ ] Create blog / educational content section
- [ ] Build location-specific landing pages
- [ ] Add YouTube channel + embed videos on service pages
