/*
 * Database helpers for the inspections table.
 *
 * These are called alongside Google Calendar operations — the calendar
 * remains the source of truth for today/future, the DB is the backup
 * and source of truth for past events.
 */

import { sql } from './db.js'

/**
 * Insert or update an inspection record. Uses google_event_id as the
 * unique key for upserts.
 *
 * @param {object} fields
 * @returns {object} the inserted/updated row
 */
export async function upsertInspection(fields) {
  const db = sql()

  const rows = await db`
    INSERT INTO inspections (
      google_event_id,
      inspection_number,
      customer_name,
      email,
      phone,
      address,
      service,
      start_at,
      end_at,
      source,
      status,
      payment_status,
      invoice_amount_cents,
      payment_amount_cents,
      square_invoice_id,
      distance_miles,
      trip_charge_cents,
      geo_lat,
      geo_lng,
      token,
      feedback_rating,
      raw_description
    ) VALUES (
      ${fields.googleEventId},
      ${fields.inspectionNumber || null},
      ${fields.customerName || null},
      ${fields.email || null},
      ${fields.phone || null},
      ${fields.address || null},
      ${fields.service || null},
      ${fields.startAt || null},
      ${fields.endAt || null},
      ${fields.source || null},
      ${fields.status || 'scheduled'},
      ${fields.paymentStatus || null},
      ${fields.invoiceAmountCents || null},
      ${fields.paymentAmountCents || null},
      ${fields.squareInvoiceId || null},
      ${fields.distanceMiles || null},
      ${fields.tripChargeCents || null},
      ${fields.geoLat || null},
      ${fields.geoLng || null},
      ${fields.token || null},
      ${fields.feedbackRating || null},
      ${fields.rawDescription || null}
    )
    ON CONFLICT (google_event_id) DO UPDATE SET
      inspection_number    = COALESCE(EXCLUDED.inspection_number, inspections.inspection_number),
      customer_name        = COALESCE(EXCLUDED.customer_name, inspections.customer_name),
      email                = COALESCE(EXCLUDED.email, inspections.email),
      phone                = COALESCE(EXCLUDED.phone, inspections.phone),
      address              = COALESCE(EXCLUDED.address, inspections.address),
      service              = COALESCE(EXCLUDED.service, inspections.service),
      start_at             = COALESCE(EXCLUDED.start_at, inspections.start_at),
      end_at               = COALESCE(EXCLUDED.end_at, inspections.end_at),
      source               = COALESCE(EXCLUDED.source, inspections.source),
      status               = COALESCE(EXCLUDED.status, inspections.status),
      payment_status       = COALESCE(EXCLUDED.payment_status, inspections.payment_status),
      invoice_amount_cents = COALESCE(EXCLUDED.invoice_amount_cents, inspections.invoice_amount_cents),
      payment_amount_cents = COALESCE(EXCLUDED.payment_amount_cents, inspections.payment_amount_cents),
      square_invoice_id    = COALESCE(EXCLUDED.square_invoice_id, inspections.square_invoice_id),
      distance_miles       = COALESCE(EXCLUDED.distance_miles, inspections.distance_miles),
      trip_charge_cents    = COALESCE(EXCLUDED.trip_charge_cents, inspections.trip_charge_cents),
      geo_lat              = COALESCE(EXCLUDED.geo_lat, inspections.geo_lat),
      geo_lng              = COALESCE(EXCLUDED.geo_lng, inspections.geo_lng),
      token                = COALESCE(EXCLUDED.token, inspections.token),
      feedback_rating      = COALESCE(EXCLUDED.feedback_rating, inspections.feedback_rating),
      raw_description      = COALESCE(EXCLUDED.raw_description, inspections.raw_description),
      updated_at           = now()
    RETURNING *
  `

  return rows[0]
}

/**
 * Mark an inspection as cancelled by its booking token.
 */
export async function markCancelledByToken(token) {
  const db = sql()
  const rows = await db`
    UPDATE inspections
    SET status = 'cancelled', cancelled_at = now(), updated_at = now()
    WHERE token = ${token}
    RETURNING *
  `
  return rows[0] || null
}

/**
 * Update payment status by Square invoice ID.
 */
export async function updatePaymentByInvoiceId(invoiceId, fields) {
  const db = sql()
  const rows = await db`
    UPDATE inspections
    SET
      payment_status = COALESCE(${fields.paymentStatus || null}, payment_status),
      payment_amount_cents = COALESCE(${fields.paymentAmountCents || null}, payment_amount_cents),
      updated_at = now()
    WHERE square_invoice_id = ${invoiceId}
    RETURNING *
  `
  return rows[0] || null
}

/**
 * Update feedback rating by booking token.
 */
export async function updateFeedbackByToken(token, rating) {
  const db = sql()
  const rows = await db`
    UPDATE inspections
    SET feedback_rating = ${rating}, updated_at = now()
    WHERE token = ${token}
    RETURNING *
  `
  return rows[0] || null
}

/**
 * Mark invoice created by google event ID.
 */
export async function markInvoiceByEventId(googleEventId, fields) {
  const db = sql()
  const rows = await db`
    UPDATE inspections
    SET
      square_invoice_id = ${fields.invoiceId},
      invoice_amount_cents = ${fields.amountCents},
      payment_status = 'pending',
      updated_at = now()
    WHERE google_event_id = ${googleEventId}
    RETURNING *
  `
  return rows[0] || null
}
