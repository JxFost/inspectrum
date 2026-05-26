/*
 * GET/POST /api/admin/migrate
 *
 * Creates all tables and indexes. Safe to run multiple times
 * (uses IF NOT EXISTS). Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

function verifyAdminSession(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

export async function GET(request) {
  return run(request)
}

export async function POST(request) {
  return run(request)
}

async function run(request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = sql()

  try {
    await db`
      CREATE TABLE IF NOT EXISTS inspections (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        google_event_id      TEXT UNIQUE,
        inspection_number    TEXT,
        customer_name        TEXT,
        email                TEXT,
        phone                TEXT,
        address              TEXT,
        service              TEXT,
        start_at             TIMESTAMPTZ,
        end_at               TIMESTAMPTZ,
        source               TEXT,
        status               TEXT DEFAULT 'scheduled',
        payment_status       TEXT,
        invoice_amount_cents INT,
        payment_amount_cents INT,
        square_invoice_id    TEXT,
        distance_miles       REAL,
        trip_charge_cents    INT,
        geo_lat              REAL,
        geo_lng              REAL,
        token                TEXT UNIQUE,
        feedback_rating      INT,
        created_at           TIMESTAMPTZ DEFAULT now(),
        updated_at           TIMESTAMPTZ DEFAULT now(),
        cancelled_at         TIMESTAMPTZ,
        raw_description      TEXT
      )
    `

    await db`CREATE INDEX IF NOT EXISTS idx_inspections_start ON inspections(start_at)`
    await db`CREATE INDEX IF NOT EXISTS idx_inspections_token ON inspections(token)`
    await db`CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status)`
    await db`CREATE INDEX IF NOT EXISTS idx_inspections_number ON inspections(inspection_number)`
    await db`CREATE INDEX IF NOT EXISTS idx_inspections_event ON inspections(google_event_id)`
    await db`CREATE INDEX IF NOT EXISTS idx_inspections_email ON inspections(email)`

    // ---- Customers table ----
    await db`
      CREATE TABLE IF NOT EXISTS customers (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email       TEXT UNIQUE NOT NULL,
        name        TEXT,
        phone       TEXT,
        created_at  TIMESTAMPTZ DEFAULT now(),
        last_login  TIMESTAMPTZ
      )
    `

    // ---- Portal sessions table ----
    await db`
      CREATE TABLE IF NOT EXISTS portal_sessions (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        token       TEXT UNIQUE NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT now()
      )
    `
    await db`CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON portal_sessions(token)`
    await db`CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON portal_sessions(expires_at)`

    // ---- Inspection reports table ----
    await db`
      CREATE TABLE IF NOT EXISTS inspection_reports (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inspection_id   UUID REFERENCES inspections(id) ON DELETE CASCADE,
        customer_email  TEXT,
        file_url        TEXT NOT NULL,
        file_name       TEXT NOT NULL,
        file_size_bytes INT,
        mime_type       TEXT DEFAULT 'application/pdf',
        uploaded_at     TIMESTAMPTZ DEFAULT now(),
        uploaded_via    TEXT DEFAULT 'admin',
        notified_at     TIMESTAMPTZ,
        downloaded_at   TIMESTAMPTZ
      )
    `
    await db`CREATE INDEX IF NOT EXISTS idx_reports_inspection ON inspection_reports(inspection_id)`
    await db`CREATE INDEX IF NOT EXISTS idx_reports_email ON inspection_reports(customer_email)`

    // ---- Processed emails table (dedup for cron imports) ----
    await db`
      CREATE TABLE IF NOT EXISTS processed_emails (
        gmail_message_id TEXT PRIMARY KEY,
        processed_at     TIMESTAMPTZ DEFAULT now()
      )
    `

    return NextResponse.json({ success: true, message: 'Migration complete — all tables ready.' })
  } catch (err) {
    console.error('[migrate] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
