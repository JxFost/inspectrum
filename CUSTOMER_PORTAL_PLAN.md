# Customer Portal — Plan

**Status:** Phases 1-4 complete, Phase 5 polish pending
**Last updated:** 2026-05-25

---

## Goal

Give customers a login where they can view past, current, and upcoming inspections, and download their inspection report PDFs — without needing to call the office or dig through emails.

---

## User Experience

### Flow
1. Customer books inspection → account created automatically (email as identifier)
2. After inspection, Harry uploads the PDF report
3. Customer receives email: "Your report is ready — view it in your portal"
4. Customer logs in → sees all their inspections + downloads reports

### Portal Pages
- `/portal` — login/register
- `/portal/dashboard` — list of inspections (upcoming, past)
- `/portal/inspections/[id]` — single inspection detail + PDF download

---

## Architecture Options

### Authentication

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Magic link (email)** | No passwords, simple UX, matches current token-based manage page | Requires email access each login | $0 (Resend already set up) |
| **NextAuth.js + email provider** | Battle-tested, session management built in, extensible | More setup, another dependency | $0 |
| **Clerk** | Beautiful UI, handles everything, React components | Vendor lock-in, pricing at scale | Free < 10K MAU, then $0.02/MAU |
| **Supabase Auth** | Pairs with Supabase DB if we go that route | Ties you to Supabase ecosystem | Free < 50K MAU |

**Recommendation:** Magic link via Resend (simplest, no new dependencies, customers already get emails from you). Or NextAuth if you want Google/Apple sign-in later.

### Database (required — no way around this)

Customer portal needs persistent storage. This overlaps with the DATABASE_PLAN.md work.

```sql
-- Extends the inspections table from DATABASE_PLAN.md

CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  last_login  TIMESTAMPTZ
);

CREATE TABLE sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inspection_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id   UUID REFERENCES inspections(id),
  customer_id     UUID REFERENCES customers(id),
  file_key        TEXT NOT NULL,       -- storage path/key
  file_name       TEXT NOT NULL,       -- original filename
  file_size_bytes INT,
  uploaded_at     TIMESTAMPTZ DEFAULT now(),
  uploaded_by     TEXT DEFAULT 'admin' -- admin or system
);

CREATE INDEX idx_reports_customer ON inspection_reports(customer_id);
CREATE INDEX idx_reports_inspection ON inspection_reports(inspection_id);
```

### PDF Storage

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Vercel Blob** | Zero config, integrates with Vercel | 250MB free, then $0.15/GB | ~$0-3/mo |
| **AWS S3** | Industry standard, cheap at scale | More setup (IAM, SDK) | ~$0.023/GB stored + $0.09/GB transfer |
| **Cloudflare R2** | S3-compatible, no egress fees | Slightly less ecosystem | $0.015/GB stored, $0 egress |
| **Supabase Storage** | Pairs with Supabase DB/Auth | Tied to ecosystem | 1GB free, then $0.021/GB |

**Recommendation:** Vercel Blob for simplicity (you're already on Vercel), or Cloudflare R2 if costs matter at scale. Inspection reports are ~5-15MB each. At 50 inspections/month = ~500MB/month new storage.

---

## Implementation Steps

### Phase 1: Database + Auth Foundation ✅
- [x] Neon Postgres (customers + portal_sessions tables)
- [x] Magic link auth: `/portal` login, `/api/portal/login`, `/api/portal/verify`, `/api/portal/logout`
- [x] Middleware protects `/portal/dashboard/*`
- [x] Auto-create customer record on booking (web, ACC, admin endpoints)
- [x] `lib/db-customers.js` — upsert, find, magic link, session helpers

### Phase 2: Customer Dashboard ✅
- [x] `/portal/dashboard` — shows upcoming + past inspections
- [x] Date, service, address, status, payment status
- [x] "Manage appointment" link for upcoming inspections
- [x] Signed in as / sign out footer

### Phase 3: Report Upload + Storage ✅
- [x] Vercel Blob for PDF storage (`@vercel/blob`)
- [x] `inspection_reports` DB table
- [x] `/admin/inspections/[eventId]` — inspection detail page with upload UI
- [x] `/api/admin/upload-report` — handles file upload + DB record
- [x] "Report ready" email template with download + portal links
- [x] Optional customer notification on upload (checkbox)

### Phase 4: Report Download ✅
- [x] "Download Report" button on portal dashboard for completed inspections
- [x] Reports queried and joined per customer from DB
- [x] Direct download via Vercel Blob URL

### Phase 5: Polish (future)
- [ ] Download tracking (log when customer views report)
- [ ] Share report link with real estate agent
- [ ] Email notification preferences
- [ ] Re-download receipt/invoice from portal
- [ ] `/portal/inspections/[id]` — dedicated inspection detail page

---

## Cost Estimate

| Component | Provider | Monthly Cost |
|-----------|----------|-------------|
| Database | Neon Postgres (free tier) | $0 |
| Auth | Magic links via Resend (already have) | $0 |
| PDF Storage (first year) | Vercel Blob or R2 | $0-5 |
| PDF Storage (year 2+) | ~6GB accumulated | $1-3 |
| **Total** | | **$0-5/month** |

At 50 inspections/month with ~10MB reports = ~500MB/month = ~6GB/year. Well within free/cheap tiers.

---

## Effort Estimate

| Phase | Work |
|-------|------|
| Database + Auth | 4-6 hours |
| Customer Dashboard | 3-4 hours |
| Report Upload (admin) | 2-3 hours |
| Report Download (portal) | 2-3 hours |
| Polish + emails | 2-3 hours |
| **Total** | **13-19 hours** |

Note: Phase 1 overlaps significantly with DATABASE_PLAN.md — doing that first reduces this estimate by ~3 hours.

---

## Dependencies

- **DATABASE_PLAN.md must be done first** (or done together) — the portal needs persistent storage
- Resend already configured (magic link emails)
- Admin upload UI needs the inspection detail page expanded

---

## Security Considerations

- Magic link tokens: single-use, expire in 15 minutes
- Sessions: httpOnly cookies, 30-day expiry (same pattern as admin)
- PDF access: verify customer owns the inspection before serving
- Signed download URLs: expire in 1 hour
- Rate limit login attempts (prevent email spam)
- No PII in URLs (use UUIDs, not email addresses)

---

## Open Questions

- Should real estate agents get their own login? (They often want reports too)
- Do we want to support multiple report versions per inspection? (Draft → Final)
- Should customers be able to leave notes or ask questions through the portal?
- Do we want to show payment history/receipts in the portal?
- ~~What about the manage page (`/manage?token=...`) — does it get absorbed into the portal, or stay as a lightweight no-login option?~~ **DECIDED: Keep both.** Manage page stays as the no-login option for one-time customers. Portal is the value-add for repeat customers who want report history.
- Should Harry be able to bulk-upload older reports for past customers?

---

## v2/v3: CRM + Bulk Email

Once the customer table and portal exist, we have the foundation for a lightweight CRM.

### Phase 6: Contact Import + Account Invitations
- [ ] Admin UI: CSV import of past customers (name, email, phone, address)
- [ ] Bulk "invite to portal" email — sends magic link to create account
- [ ] Import de-duplication (match on email, merge if existing)
- [ ] Track invite status: sent, opened, account created

### Phase 7: CRM Basics
- [ ] `/admin/customers` — searchable customer list with inspection history
- [ ] Customer detail page: all inspections, reports, payment history, notes
- [ ] Tags/segments: repeat customer, agent referral, commercial, residential
- [ ] Admin notes per customer (private, not visible to customer)
- [ ] Quick filters: has upcoming inspection, has unpaid invoice, no portal account

### Phase 8: Bulk Email
- [ ] Compose + send email to filtered customer segments
- [ ] Templates: seasonal reminders, radon season, annual re-inspection, promotions
- [ ] Unsubscribe handling (CAN-SPAM compliance — required for bulk email)
- [ ] Track: delivered, opened, clicked (Resend supports webhooks for this)
- [ ] Rate limiting: Resend free tier = 100 emails/day, $20/mo plan = 50K/month

### CRM Cost Impact

| Component | Provider | Additional Cost |
|-----------|----------|----------------|
| Bulk email (< 100/day) | Resend free tier | $0 |
| Bulk email (scaling up) | Resend Pro | $20/month |
| Unsubscribe/preference DB | Same Neon Postgres | $0 |
| **Total** | | **$0-20/month** |

### CRM Effort Estimate

| Phase | Work |
|-------|------|
| Contact import + invitations | 3-4 hours |
| CRM basics (admin customer list) | 4-5 hours |
| Bulk email + templates | 5-7 hours |
| Compliance (unsubscribe, CAN-SPAM) | 2-3 hours |
| **Total** | **14-19 hours** |

### CRM Notes
- This turns the customer table from a portal feature into a real business asset
- Agent/realtor contacts could be a separate table — they refer multiple customers
- Seasonal bulk emails (e.g. "radon testing season starts in October") are high-ROI for repeat business
- Must include physical mailing address + unsubscribe link in every bulk email (CAN-SPAM)

---

## Notes

_Add thoughts, edge cases, and decisions here as they come up._
