/*
 * Database helpers for the signed_agreements table.
 */

import { sql } from './db.js'
import { randomUUID } from 'crypto'

/**
 * Create an agreement record for a new booking.
 * Returns the agreement token (used in the signing URL).
 */
export async function createAgreement({ inspectionId, customerName, customerEmail, propertyAddress, radonAddendum }) {
  const db = sql()
  const token = randomUUID()

  await db`
    INSERT INTO signed_agreements (
      inspection_id, token, customer_name, customer_email, property_address, radon_addendum
    ) VALUES (
      ${inspectionId}, ${token}, ${customerName || null},
      ${customerEmail || null}, ${propertyAddress || null}, ${radonAddendum || false}
    )
  `

  return token
}

/**
 * Check if an inspection has a signed agreement.
 */
export async function getAgreementByInspectionId(inspectionId) {
  const db = sql()
  const rows = await db`
    SELECT * FROM signed_agreements WHERE inspection_id = ${inspectionId}
  `
  return rows[0] || null
}
