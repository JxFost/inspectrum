# Local Database — Inspection Records Backup

**Status:** Planning (future sprint)
**Last updated:** 2026-05-24

---

## Goal

Store all inspection data locally so the business has a complete, queryable record independent of Google Calendar. Protects against accidental event deletion, API outages, and enables faster reads + better reporting.

---

## Recommended Provider

**Neon Postgres** (free tier: 512MB, 3GB transfer) or **Turso/LibSQL** (free tier: 9GB).

Postgres is preferred for flexibility — SQL queries for reporting, customer history, revenue tracking.

---

## Schema (Draft)

```sql
CREATE TABLE inspections (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_event_id     TEXT UNIQUE,
  inspection_number   TEXT,
  customer_name       TEXT,
  email               TEXT,
  phone               TEXT,
  address             TEXT,
  service             TEXT,
  start_at            TIMESTAMPTZ,
  end_at              TIMESTAMPTZ,
  source              TEXT,  -- web, acc, admin
  status              TEXT DEFAULT 'scheduled',  -- scheduled, completed, cancelled
  payment_status      TEXT,  -- null, pending, paid, refunded
  invoice_amount_cents INT,
  payment_amount_cents INT,
  square_invoice_id   TEXT,
  distance_miles      REAL,
  trip_charge_cents   INT,
  geo_lat             REAL,
  geo_lng             REAL,
  token               TEXT UNIQUE,
  feedback_rating     INT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  cancelled_at        TIMESTAMPTZ,
  raw_description     TEXT  -- full calendar description snapshot
);

CREATE INDEX idx_inspections_start ON inspections(start_at);
CREATE INDEX idx_inspections_token ON inspections(token);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_number ON inspections(inspection_number);
```

---

## Implementation Steps

### Phase 1: Setup
- [ ] Choose provider (Neon vs Turso)
- [ ] Add SDK (`@neondatabase/serverless` or `@libsql/client`)
- [ ] Create database + run migration
- [ ] Add connection string to env vars (`DATABASE_URL`)
- [ ] Create `lib/db.js` — connection helper + basic query wrapper

### Phase 2: Write Path
- [ ] `/api/book` — insert on successful booking
- [ ] `/api/inbound/acc` — insert on ACC event creation
- [ ] `/api/admin/block` — insert on admin-created event
- [ ] `/api/booking/cancel` — mark as cancelled (preserve record)
- [ ] `/api/square/webhook` — update payment_status, payment_amount_cents
- [ ] `/api/feedback` — update feedback_rating

### Phase 3: Backfill
- [ ] One-time script: fetch all calendar events → parse → bulk insert
- [ ] Handle duplicates (upsert on google_event_id)
- [ ] Verify counts match

### Phase 4: Sync & Reconciliation
- [ ] Periodic cron (daily?) compares DB records vs calendar events
- [ ] Flag discrepancies: missing from calendar, missing from DB, field mismatches
- [ ] Alert email if discrepancies found
- [ ] Consider: what's the source of truth? (Calendar for scheduling, DB for records)

### Phase 5: Migrate Reads (optional)
- [ ] Dashboard reads from DB instead of calendar API (faster, no rate limits)
- [ ] Manage page reads from DB with calendar as fallback
- [ ] CSV export from DB
- [ ] Monthly report from DB

---

## Cost Estimate

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Neon Postgres | 512MB, 3GB transfer | $19/mo (Pro) |
| Turso (LibSQL) | 9GB, 500M reads | $29/mo (Scaler) |
| Vercel Postgres | 256MB | $20/mo |

At 20-50 inspections/month, free tier is sufficient for years.

---

## What This Enables (Future)

- Customer history / repeat customer detection from DB (faster than scanning calendar)
- Revenue dashboards and trend reporting via SQL
- Full audit trail (cancelled inspections preserved with reason/timestamp)
- Reduced Google Calendar API calls (dashboard loads instantly)
- Export/migration if you ever switch calendar providers
- Multi-inspector scheduling (if the business grows)

---

## Decisions

**Source of truth: split by time horizon.**
- Today and future → Google Calendar is the source of truth. DB mirrors it.
- Past events → DB is the source of truth. No need to re-query the calendar for historical data.
- This means reads for the dashboard can use calendar for today/upcoming and DB for past, reducing API calls significantly.

**Customers table: yes, when the customer portal is built.**
- Not needed for the initial DB sprint — inspections table stores name/email/phone inline.
- When the customer portal goes live (see CUSTOMER_PORTAL_PLAN.md), normalize into a `customers` table and add `customer_id` FK to inspections.
- Until then, repeat customer detection can use email matching on the inspections table.

**Cancelled inspections retain their inspection number.**
- Numbers are sequential and represent work that was scheduled, even if cancelled.
- Gaps in the sequence are expected and tell their own story (cancellation rate).
- Simpler than renumbering — avoids confusion if a number was already referenced in emails or invoices.
- YTD counter on the dashboard counts actual events with inspection numbers on the calendar (not the max number), so cancellations are naturally excluded since deleted events disappear from the calendar.
- When DB is live: YTD = `SELECT COUNT(*) FROM inspections WHERE status != 'cancelled' AND inspection_number IS NOT NULL AND YEAR(start_at) = current_year`.

**Calendar edits: nightly sync cron, not webhooks.**
- Google Calendar push notifications require a public HTTPS endpoint and channel management — more complexity than it's worth at this scale.
- A nightly cron (e.g. 2am MT) syncs today + future events from calendar → DB, flags any discrepancies.
- If Harry edits an event directly in Google Calendar during the day, it's picked up that night.
- For past events, no sync needed — DB is already the record.

---

## Notes

_Add thoughts, edge cases, and decisions here as they come up._
