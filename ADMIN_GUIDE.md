# Inspectrum Admin Guide

A quick reference for day-to-day operations. Bookmark the admin dashboard — that's your home base.

**Admin URL:** `https://evergreeninspections.com/admin`
**Login:** Use the admin password, then you're in for 30 days.

---

## Daily Routine

### Morning
1. Check the **admin dashboard** — today's inspections are highlighted at the top
2. The **daily digest email** arrives at 6:30 AM with the day's schedule, addresses, and drive distances
3. Review any new bookings that came in overnight (website or ACC)

### Evening (after 6 PM)
- **Tomorrow's schedule** appears on the dashboard — plan for the next day
- Check for any unsigned agreements (amber "awaiting signature" on inspection detail pages)
- Check for uninvoiced past inspections

---

## Common Tasks

### View All Inspections
1. Go to **Admin → Inspections**
2. Use the range selector (top right) to change the time window: 2 weeks, 1 month, 2 months, 3 months, full year
3. Use the search bar to find a customer by **name, address, or inspection number**
4. Use the source tabs to filter: **All | Web | ACC | Admin**

### View Inspection Details
1. Click the **eye icon** on any row in the table
2. You'll see: customer info, pricing breakdown, agreement status, uploaded reports
3. From here you can upload a report or send an invoice

### Create a Manual Booking
1. Click **+ New** on the dashboard (or go to Admin → New Booking)
2. Fill in: service, date, time, customer name, phone, email, address
3. Check **Radon** and/or **Sewer Scope** if those add-ons apply
4. Check **Send confirmation email** if you want the customer notified
5. Click **Create Event** — it goes on the calendar and into the database

### Upload an Inspection Report
1. Go to the inspection detail page (eye icon on dashboard)
2. Scroll to the **Reports** section
3. Click **Choose File** → select the PDF
4. Check **Email customer when uploaded** (they'll get a "Your report is ready" email with a download link)
5. Click **Upload Report**
6. The report also appears in the customer's portal automatically

**Note:** If Harry emails the report directly to the customer, the system will auto-import it overnight (scans Harry's Sent folder at 6:30 PM daily). No manual upload needed in that case.

### Send an Invoice
1. Go to the inspection detail page (eye icon)
2. Click **Send Invoice** (bottom of the page)
3. Enter the total price in dollars
4. Click **Send** — a Square invoice is emailed to the customer
5. When they pay, the status updates automatically (Square webhook)

### Check Agreement Status
- **On the dashboard:** click the eye icon on an inspection
- **Agreement section** shows one of:
  - **Signed ✓** — name, initials, and date
  - **Awaiting signature** — with a link you can share with the customer
  - **No agreement** — for older inspections that predate the system

### Export Data
1. On the dashboard, click the **CSV** link (top right, next to the range selector)
2. Downloads all inspections in the current date range
3. Opens in Excel/Google Sheets with: inspection number, date, customer, address, service, add-ons, pricing, payment status, feedback, and more

---

## How Bookings Come In

### From the Website
- Customer fills out the booking form at `/schedule`
- Event is created on Google Calendar automatically
- Customer gets a confirmation email with:
  - Appointment details
  - "Review & Sign Agreement" button
  - Cancel/reschedule link
  - Google Calendar link
- You'll see it on the dashboard immediately

### From ACC (Call Center)
- ACC sends an email to Shirley's inbox
- The system auto-processes it via CloudMailin
- Event appears on the calendar with all the details ACC provided
- No action needed unless something looks wrong

### Manual (Admin)
- Use the **+ New** booking form in the admin area
- Good for phone calls, repeat customers, or special requests

---

## Emails the System Sends Automatically

| Email | When | To |
|---|---|---|
| Booking confirmation | Immediately after booking | Customer |
| Agreement link | Included in confirmation | Customer |
| 48-hour reminder | 2 days before inspection | Customer |
| Follow-up + review ask | 3 days after inspection | Customer |
| Report ready | When report is uploaded | Customer |
| Daily digest | 6:30 AM daily | Harry |
| Cancellation alert | When customer cancels | Harry |
| Monthly report | 1st of each month | Harry |

**You don't need to send any of these manually.** They all happen automatically.

---

## Customer Portal

Customers can log in at `/portal` to:
- View their upcoming and past inspections
- Download their inspection reports
- See payment status

They log in with their email address — no password needed. A magic link is sent to their email that logs them in for 30 days.

**You don't need to manage customer accounts.** They're created automatically when someone books an inspection.

---

## Quick Reference

| Task | Where |
|---|---|
| View today's schedule | Dashboard (top of page) |
| Search for a customer | Dashboard search bar |
| Create a booking | Admin → + New |
| Upload a report | Inspection detail → Reports → Upload |
| Send an invoice | Inspection detail → Send Invoice |
| Check agreement status | Inspection detail → Agreement section |
| Export to spreadsheet | Dashboard → CSV button |
| View customer's manage page | Eye icon → manage link on detail page |

---

## Troubleshooting

**"I can't log in"**
- Make sure you're using the correct admin password
- Try clearing your browser cookies and logging in again
- The session lasts 30 days — after that you'll need to log in again

**"A booking didn't show up from ACC"**
- Check that the ACC email arrived in Shirley's inbox
- Look at the Vercel function logs for any errors
- You can always create the booking manually via + New

**"Customer says they didn't get an email"**
- Check the customer's email address on the inspection detail page
- Have them check spam/junk folders
- Resend emails come from `office@evergreeninspections.com`

**"The calendar and dashboard show different things"**
- The dashboard reads past data from the database, today + future from the calendar
- The nightly sync (2 AM) keeps them aligned
- If something looks off, it'll resolve by the next morning

**Need help?** Contact Jeff.
