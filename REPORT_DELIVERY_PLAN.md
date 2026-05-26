# Report Upload & Delivery — Plan

**Status:** Planning (future sprint, after DATABASE_PLAN + CUSTOMER_PORTAL_PLAN)
**Last updated:** 2026-05-25

---

## Goal

Make it dead simple for Harry to deliver inspection reports to customers. He shouldn't need to think about file management, customer portals, or email templates. Upload the file → system does the rest.

---

## Harry's Experience (3 options, easiest first)

### Option A: Email It In (Recommended — zero learning curve)

Harry already emails. This is the path of least resistance.

1. Harry finishes an inspection report in his software (Spectora, HomeGauge, etc.)
2. He forwards or sends the PDF to a dedicated email address: **`reports@evergreeninspections.com`**
3. System receives the email, extracts the PDF attachment
4. System auto-matches the report to an inspection (by address, customer name, or inspection number in the filename/subject)
5. System stores the PDF, links it to the inspection
6. Customer receives an email: "Your inspection report is ready" with a download link
7. Report appears in the customer portal and admin dashboard

**Harry's entire workflow: forward one email. Done.**

### Option B: Upload Page on Admin Dashboard

A fallback for when email matching fails or Harry wants to manually assign.

1. Harry goes to `/admin/inspections` → clicks into an inspection
2. Clicks "Upload Report" → picks file or drags it in
3. System stores the PDF and sends the customer notification
4. One-click, but requires logging into admin

### Option C: Quick Upload Page (Bookmark on Phone)

A standalone page Harry can bookmark on his phone's home screen.

1. Harry opens bookmarked page → sees today's inspections
2. Taps the inspection → taps "Upload Report" → picks file from phone/tablet
3. System handles the rest

---

## How Auto-Matching Works

When a report comes in (via email or upload), the system tries to match it to an inspection. Multiple signals, checked in priority order:

### Match Strategy

| Priority | Signal | Where to Find It | Confidence |
|----------|--------|-------------------|------------|
| 1 | Inspection number in subject/filename | `2026-047` in "Report 2026-047.pdf" or email subject | Exact match |
| 2 | Address match | Filename or email body vs inspection addresses | High |
| 3 | Customer last name in filename | "Johnson_Report.pdf" vs customer names | Medium |
| 4 | Date proximity | Report uploaded same day or day after inspection | Low (tiebreaker) |

**If no confident match:** Don't guess. Queue the report for manual assignment and notify Harry via email: "We couldn't auto-match this report. Tap here to assign it."

### Filename Parsing Examples

```
Johnson_1234_Fake_St_Inspection.pdf     → match on "Johnson" + "1234 Fake St"
2026-047_Full_Home_Inspection.pdf       → match on inspection number
Report - 4642 Plettner Ln.pdf           → match on address
InspectionReport_05252026.pdf           → match on date only (low confidence)
```

The parser should be forgiving — strip underscores, dashes, normalize whitespace, case-insensitive.

---

## Email Ingest Pipeline

Reuses the same pattern as the ACC email pipeline (CloudMailin).

### Flow

```
Harry sends email with PDF attachment
        ↓
CloudMailin receives at reports@evergreeninspections.com
        ↓
POST /api/inbound/report  (JSON normalized format)
        ↓
Extract PDF attachment (base64 decode)
        ↓
Parse subject + filename for matching signals
        ↓
Auto-match to inspection (or queue for manual)
        ↓
Upload PDF to storage (Vercel Blob / R2)
        ↓
Link report to inspection in DB
        ↓
Send customer notification email
        ↓
Update admin dashboard
```

### CloudMailin Setup

- [x] Google Group created: `reports@evergreeninspections.com`
- [x] CloudMailin inbound address created and added as group member
- [ ] CloudMailin webhook target: `POST /api/inbound/report?secret=REPORT_WEBHOOK_SECRET` (set when endpoint is built)
- JSON Normalized format (same as ACC pipeline)
- Attachment size limit: CloudMailin supports up to 35MB (plenty for inspection PDFs)

### Inbound API: `/api/inbound/report`

```
POST /api/inbound/report?secret=...

Receives:
- headers.subject  → parse for inspection number, customer name
- attachments[]    → PDF files (base64 encoded)
- plain/html body  → secondary parsing for address/name

Does:
1. Validate webhook secret
2. Extract PDF attachments (reject if none)
3. Run auto-match against upcoming/recent inspections
4. If match found:
   - Upload PDF to storage
   - Create inspection_reports record in DB
   - Send customer "report ready" email
   - Log success
5. If no match:
   - Upload PDF to storage (temporary/unmatched bucket)
   - Send Harry an email: "Could not match this report — tap to assign"
   - Create a pending_reports queue entry
```

---

## Manual Assignment (Fallback UI)

When auto-match fails, Harry gets an email with a link to assign the report.

### `/admin/reports/assign/[reportId]`

- Shows the PDF filename and any parsed signals (name, address, date)
- Dropdown/search of recent inspections (last 30 days)
- One-tap to assign → triggers customer notification

### `/admin/reports`

- List of all uploaded reports
- Filter: matched, unmatched, recent
- Shows which inspections have reports vs which are missing

---

## Customer Notification Email

Sent automatically when a report is linked to an inspection.

```
Subject: Your Inspection Report is Ready — [Address]

Hi [FirstName],

Your inspection report for [Address] is ready to download.

[Download Report →]  (button — signed URL, expires in 7 days)

You can also view this report anytime in your customer portal:
[View in Portal →]

If you have questions about your report, Harry is happy to walk
through it with you:
☎ (303) 697-0990
✉ harry@evergreeninspections.com

— Inspectrum Inspections
```

The download link should be a signed URL that expires (7 days), but the portal link works forever for logged-in customers.

---

## Storage

### File Organization

```
reports/
  2026/
    2026-047/
      2026-047_Johnson_4642_Plettner_Ln.pdf
    2026-048/
      2026-048_Chen_1035_Pearl_St.pdf
  unmatched/
    pending_abc123.pdf
```

### Storage Choice

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Vercel Blob** | Zero config, signed URLs built-in | 250MB free | ~$0-5/mo |
| **Cloudflare R2** | No egress fees, S3-compatible | More setup | ~$0-3/mo |

Recommendation: **Vercel Blob** for simplicity. Signed URL generation is one function call.

---

## Database Schema

Extends the tables from DATABASE_PLAN.md and CUSTOMER_PORTAL_PLAN.md.

```sql
CREATE TABLE inspection_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id   UUID REFERENCES inspections(id),
  customer_id     UUID REFERENCES customers(id),
  file_key        TEXT NOT NULL,          -- storage path/key
  file_name       TEXT NOT NULL,          -- original filename
  file_size_bytes INT,
  mime_type       TEXT DEFAULT 'application/pdf',
  match_method    TEXT,                   -- 'inspection_number', 'address', 'name', 'manual'
  match_confidence TEXT,                  -- 'exact', 'high', 'medium', 'manual'
  status          TEXT DEFAULT 'active',  -- active, replaced, deleted
  uploaded_at     TIMESTAMPTZ DEFAULT now(),
  uploaded_via    TEXT DEFAULT 'email',   -- email, admin_upload, api
  notified_at     TIMESTAMPTZ,           -- when customer was emailed
  downloaded_at   TIMESTAMPTZ            -- first customer download
);

CREATE TABLE pending_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_key        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_size_bytes INT,
  parsed_signals  JSONB,                 -- { name: '...', address: '...', number: '...' }
  source_subject  TEXT,                  -- email subject line
  created_at      TIMESTAMPTZ DEFAULT now(),
  resolved_at     TIMESTAMPTZ,           -- when manually assigned
  resolved_to     UUID REFERENCES inspections(id)
);
```

---

## Implementation Steps

### Phase 1: Storage + Manual Upload
- [ ] Set up Vercel Blob
- [ ] Add "Upload Report" button to admin inspection detail page
- [ ] Store file + create DB record
- [ ] Send customer notification email
- [ ] Display report download link on manage page + portal

### Phase 2: Email Ingest
- [ ] Set up CloudMailin for `reports@` address
- [ ] Build `/api/inbound/report` endpoint
- [ ] PDF attachment extraction
- [ ] Auto-match logic (inspection number → address → name → date)
- [ ] Success path: store + notify customer
- [ ] Failure path: queue as unmatched + notify Harry

### Phase 3: Admin Report Management
- [ ] `/admin/reports` — report list with matched/unmatched filter
- [ ] `/admin/reports/assign/[id]` — manual assignment page
- [ ] "Missing report" indicator on inspections that are past but have no report
- [ ] Bulk upload for backfilling old reports

### Phase 4: Polish
- [ ] Quick Upload page for Harry's phone (bookmark-friendly)
- [ ] Multiple reports per inspection (e.g. main report + radon results)
- [ ] Report versioning (draft → final, replaces previous)
- [ ] Download tracking (know when customers view their reports)

---

## Cost Estimate

| Component | Provider | Monthly Cost |
|-----------|----------|-------------|
| Storage (Vercel Blob) | 50 reports × 10MB = 500MB/mo | $0-3 |
| CloudMailin (report ingest) | Free tier: 200 emails/mo | $0 |
| Email notifications (Resend) | Already included | $0 |
| **Total** | | **$0-3/month** |

---

## Effort Estimate

| Phase | Work |
|-------|------|
| Storage + manual upload | 3-4 hours |
| Email ingest + auto-match | 5-7 hours |
| Admin report management | 3-4 hours |
| Polish + phone upload | 2-3 hours |
| **Total** | **13-18 hours** |

---

## Dependencies

- DATABASE_PLAN.md (inspections table must exist)
- CUSTOMER_PORTAL_PLAN.md (customer notification + portal display)
- CloudMailin (already used for ACC — add second forwarding address)
- Vercel Blob or R2 account

---

## Security

- Signed download URLs expire after 7 days (re-generate on demand in portal)
- Verify customer owns the inspection before serving the report
- Webhook secret on inbound report endpoint (same pattern as ACC)
- Reject non-PDF attachments (or whitelist: PDF, JPG, PNG for photo reports)
- Max file size: 35MB (CloudMailin limit, reasonable for reports)
- Scan filenames for path traversal attacks before storage

---

## Harry's Day-to-Day (What This Looks Like in Practice)

```
Morning:
  Harry gets daily digest email — 2 inspections today

After Inspection #1 (10am):
  Harry generates report in his inspection software
  Exports PDF → forwards email to reports@evergreeninspections.com
  Done. Customer gets notified automatically.

After Inspection #2 (2pm):
  Same thing. Forward the report email.
  If the auto-match can't figure it out (unusual filename),
  Harry gets an email: "Tap here to assign this report"
  He taps → picks the inspection → done.

That evening:
  Both customers have their reports in their email
  and available in the portal. Zero admin work for Harry.
```

---

## Open Questions

- What inspection software does Harry use? (affects filename patterns for auto-matching)
- Should agents/realtors also get a copy of the report automatically?
- Do we want to support photo-only reports (image gallery instead of PDF)?
- Should there be a deadline reminder? (e.g. "Inspection #047 was 3 days ago — report not yet uploaded")
- ~~Can Harry CC the reports@ address when sending the report to the customer directly?~~ **YES — this is the ideal path.** Harry CCs `reports@evergreeninspections.com` when he sends the report to the customer. System captures the PDF, auto-matches it, stores it in the portal and DB. Zero workflow change for Harry. The system notification email becomes optional (customer already has the report from Harry's email) — portal just becomes the permanent archive.

---

## Notes

_Add thoughts, edge cases, and decisions here as they come up._
