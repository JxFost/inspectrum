/*
 * GET /api/admin/backfill-payments?dryRun=true
 *
 * Scans Harry's and Shirley's email for Square payment notifications.
 * Matches to inspections by customer email or name + date proximity.
 * Updates payment_status, payment_amount_cents in the DB.
 *
 * Looks for:
 * - Square invoice payment confirmations
 * - Square receipt emails
 * - Emails with subjects containing "payment", "invoice", "receipt" from Square
 *
 * Auth: admin session cookie.
 */

import { NextResponse } from 'next/server'
import { searchEmails } from '@/lib/gmail'
import { sql } from '@/lib/db'

function verifyAdminSession(request) {
  const cookie = request.cookies.get('admin_session')?.value
  if (!cookie) return false
  const parts = cookie.split('.')
  if (parts.length !== 2) return false
  const age = Date.now() - parseInt(parts[0], 10)
  return !isNaN(age) && age < 30 * 24 * 60 * 60 * 1000
}

/**
 * Parse a Square payment email for amount and customer info.
 */
function parseSquareEmail(email) {
  const text = email.plain || email.html || ''

  // Try to find dollar amount
  const amountMatch = text.match(/\$\s*([\d,]+(?:\.\d{2})?)/)?.[1]
  const amountCents = amountMatch ? Math.round(parseFloat(amountMatch.replace(/,/g, '')) * 100) : null

  // Try to find customer name
  // Square emails often have "Payment from <name>" or "<name> paid"
  const nameMatch = text.match(/(?:Payment from|paid by|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)?.[1]
    || text.match(/(?:Invoice to|Customer:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)?.[1]

  // Try to find customer email in the body
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)?.[1]
  // Filter out Square/Inspectrum emails
  const customerEmail = emailMatch && !emailMatch.includes('square') && !emailMatch.includes('evergreeninspections')
    ? emailMatch.toLowerCase() : null

  // Try to find invoice ID
  const invoiceMatch = text.match(/(?:Invoice|Invoice #|inv[_-])\s*([A-Za-z0-9-]+)/i)?.[1]

  // Parse date from email headers
  const emailDate = email.date ? new Date(email.date) : null

  return {
    amountCents,
    customerName: nameMatch?.trim() || null,
    customerEmail,
    invoiceId: invoiceMatch || null,
    emailDate,
    subject: email.subject,
  }
}

export async function GET(request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dryRun = searchParams.get('dryRun') !== 'false'
  const limit = parseInt(searchParams.get('limit'), 10) || 200

  const db = sql()
  const inspectorEmail = process.env.INSPECTOR_GMAIL_ADDRESS
  const accEmail = process.env.ACC_GMAIL_ADDRESS

  // Search both inboxes for Square-related payment emails
  const queries = [
    { email: inspectorEmail, label: 'harry' },
    { email: accEmail, label: 'shirley' },
  ].filter((q) => q.email)

  let allEmails = []
  for (const { email: delegate, label } of queries) {
    try {
      const emails = await searchEmails(
        'from:squareup.com OR from:square.com subject:(payment OR invoice OR receipt OR paid) after:2026/01/01',
        limit,
        delegate
      )
      allEmails.push(...emails.map((e) => ({ ...e, _source: label })))
    } catch (err) {
      console.error(`[backfill-payments] ${label} Gmail error:`, err.message)
    }
  }

  // Deduplicate by message ID
  const seen = new Set()
  allEmails = allEmails.filter((e) => {
    if (seen.has(e.id)) return false
    seen.add(e.id)
    return true
  })

  const results = {
    dryRun,
    scanned: allEmails.length,
    matched: 0,
    updated: 0,
    skipped: 0,
    noMatch: 0,
    errors: 0,
    items: [],
  }

  for (const email of allEmails) {
    const parsed = parseSquareEmail(email)

    if (!parsed.amountCents) {
      results.skipped++
      continue
    }

    // Try to match to an inspection
    let inspection = null

    // 1. Match by customer email
    if (parsed.customerEmail) {
      const rows = await db`
        SELECT id, inspection_number, customer_name, email, payment_status
        FROM inspections
        WHERE LOWER(email) = ${parsed.customerEmail}
          AND status != 'cancelled'
        ORDER BY start_at DESC
        LIMIT 1
      `
      if (rows[0]) inspection = rows[0]
    }

    // 2. Match by customer name + amount (if email didn't match)
    if (!inspection && parsed.customerName) {
      const nameLower = parsed.customerName.toLowerCase()
      const rows = await db`
        SELECT id, inspection_number, customer_name, email, payment_status
        FROM inspections
        WHERE LOWER(customer_name) LIKE ${'%' + nameLower + '%'}
          AND status != 'cancelled'
        ORDER BY start_at DESC
        LIMIT 1
      `
      if (rows[0]) inspection = rows[0]
    }

    if (!inspection) {
      results.noMatch++
      results.items.push({
        subject: email.subject,
        amount: parsed.amountCents ? `$${(parsed.amountCents / 100).toFixed(2)}` : null,
        parsedName: parsed.customerName,
        parsedEmail: parsed.customerEmail,
        source: email._source,
        status: 'no-match',
      })
      continue
    }

    results.matched++

    // Skip if already marked as paid
    if (inspection.payment_status === 'paid') {
      results.skipped++
      continue
    }

    const record = {
      customer: inspection.customer_name,
      inspection: inspection.inspection_number,
      amount: `$${(parsed.amountCents / 100).toFixed(2)}`,
      source: email._source,
    }

    if (!dryRun) {
      try {
        await db`
          UPDATE inspections
          SET
            payment_status = 'paid',
            payment_amount_cents = ${parsed.amountCents},
            updated_at = now()
          WHERE id = ${inspection.id}
        `
        record.status = 'updated'
        results.updated++
      } catch (err) {
        record.status = 'error'
        record.error = err.message
        results.errors++
      }
    } else {
      record.status = 'dry-run'
      results.updated++
    }

    results.items.push(record)
  }

  return NextResponse.json(results)
}
