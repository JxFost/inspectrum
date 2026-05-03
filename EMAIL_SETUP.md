# Email Setup Guide (Resend)

Transactional emails for booking confirmations and reminders, powered by [Resend](https://resend.com/).

> **⚠️ CURRENT STATUS: TEST MODE**
>
> All emails are currently hardcoded to send from `onboarding@resend.dev` and deliver only to `jeff@evergreeninspections.com`. This is because the `evergreeninspections.com` domain has **not yet been verified** in Resend.
>
> **Once the domain is verified**, update `lib/email/send.js`:
> 1. Change `from` back to `process.env.EMAIL_FROM`
> 2. Change `to` back to the actual recipient (remove the hardcoded override)
> 3. Also update `app/api/contact/route.js` — the `from` and `to` are hardcoded there too
>
> Search for `TODO` in both files to find the exact lines.

## 1. Create a Resend account

1. Sign up at [resend.com](https://resend.com/)
2. Go to **API Keys** and create a new key
3. Copy it — this is your `RESEND_API_KEY`

## 2. Verify your sending domain

This is the most important step for deliverability. Without it, emails land in spam or get rejected entirely.

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **Add Domain** and enter `evergreeninspections.com`
3. Resend gives you DNS records to add:
   - **SPF** — a TXT record that authorizes Resend to send on your behalf
   - **DKIM** — two CNAME records for email signing
   - **DMARC** — a TXT record (add one if you don't have it: `v=DMARC1; p=none;`)
4. Add these records in your domain registrar (GoDaddy, Cloudflare, Namecheap, etc.)
5. Back in Resend, click **Verify** — it can take a few minutes to propagate

### Why this matters

Unverified domains use Resend's shared sender (`onboarding@resend.dev`), which:
- Can only deliver to your own Resend account email
- Has poor deliverability
- Looks unprofessional in the customer's inbox

Once verified, emails come from your domain and land in the primary inbox.

### New sender reputation

The first ~100 emails from a fresh domain may still hit spam folders for some recipients. This is normal — reputation builds over time. The booking success page tells customers to check their spam folder.

## 3. Set environment variables

### Locally (`.env.local`)

```
RESEND_API_KEY=re_your_key_here
EMAIL_FROM="Inspectrum Inspections <office@evergreeninspections.com>"
PUBLIC_SITE_URL=http://localhost:3000
```

### On Vercel

1. Go to your project on [vercel.com](https://vercel.com/)
2. **Settings > Environment Variables**
3. Add these for Production (and Preview if desired):
   - `RESEND_API_KEY`
   - `EMAIL_FROM` — e.g. `Inspectrum Inspections <office@evergreeninspections.com>`
   - `PUBLIC_SITE_URL` — `https://evergreeninspections.com`

`CRON_SECRET` is auto-injected by Vercel for cron job protection — you don't need to set it manually.

## 4. How the emails work

### Booking receipt

Sent immediately when a customer books via `/schedule`. Contains:
- All appointment details (service, date, time, address)
- "Add to Google Calendar" link
- "Cancel or reschedule" link → `/manage?token=...`

If the email fails to send, the booking still goes through. The customer can always call.

### 48-hour reminder

Sent by a daily Vercel Cron job (`/api/cron/reminders`) at 9am Mountain (3pm UTC).

The cron finds calendar events starting between 36 and 60 hours from now that have a booking token but haven't been marked as "reminder sent". It sends each a short reminder email and marks the event so it won't double-send.

### Self-serve manage page

`/manage?token=<uuid>` — customers can view their appointment and cancel it. The token is an unguessable UUID stored in the calendar event description. No login required.

"Reschedule" links to `/schedule` — the customer books a new slot and cancels the old one. Simple, no complex rescheduling logic needed.

## 5. Cron protection

Vercel signs cron requests with an `Authorization: Bearer <CRON_SECRET>` header. The route rejects requests without a valid token.

### Testing the cron locally

Run the reminder cron manually:

```bash
# Without auth (works locally since CRON_SECRET isn't set):
curl http://localhost:3000/api/cron/reminders

# With auth (mimicking Vercel):
curl -H "Authorization: Bearer your-test-secret" http://localhost:3000/api/cron/reminders
```

The response shows how many reminders were sent, skipped, and errored.

## 6. Previewing email templates

The email templates are plain HTML with inline styles in `lib/email/templates/`. To preview them, you can:

1. Import the template function in a test script and log the HTML
2. Paste the output into an HTML file and open it in a browser
3. Use a tool like [Litmus](https://litmus.com/) or [Email on Acid](https://www.emailonacid.com/) for cross-client testing

## 7. Bounce handling

Resend surfaces bounces via their dashboard and webhooks. For now, bounces are logged on the server. If bounce handling becomes important (e.g., marking bad emails), Resend's webhook feature can POST bounce events to an endpoint you create.

## 8. Rate limiting

The booking endpoint now sends an email on every successful booking. There's no rate limit on the endpoint itself — if this becomes a concern (spam bookings), add rate limiting at the API route or Vercel edge level.
