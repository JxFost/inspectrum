/*
 * Database helpers for the customers and portal_sessions tables.
 */

import { sql } from './db.js'
import { randomUUID } from 'crypto'

/**
 * Find or create a customer by email. Returns the customer row.
 */
export async function upsertCustomer({ email, name, phone }) {
  const db = sql()
  const rows = await db`
    INSERT INTO customers (email, name, phone)
    VALUES (${email.toLowerCase().trim()}, ${name || null}, ${phone || null})
    ON CONFLICT (email) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, customers.name),
      phone = COALESCE(EXCLUDED.phone, customers.phone)
    RETURNING *
  `
  return rows[0]
}

/**
 * Find a customer by email.
 */
export async function findCustomerByEmail(email) {
  const db = sql()
  const rows = await db`
    SELECT * FROM customers WHERE email = ${email.toLowerCase().trim()}
  `
  return rows[0] || null
}

/**
 * Create a portal session. Token expires in 15 minutes (for magic link).
 * Returns the token string.
 */
export async function createMagicLinkToken(customerId) {
  const db = sql()
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await db`
    INSERT INTO portal_sessions (customer_id, token, expires_at)
    VALUES (${customerId}, ${token}, ${expiresAt})
  `
  return token
}

/**
 * Validate a magic link token. Returns the customer if valid, null if expired/invalid.
 * Deletes the token after use (single-use).
 */
export async function validateMagicLink(token) {
  const db = sql()

  // Find and delete in one step (single-use)
  const rows = await db`
    DELETE FROM portal_sessions
    WHERE token = ${token} AND expires_at > now()
    RETURNING customer_id
  `
  if (!rows[0]) return null

  const customerId = rows[0].customer_id

  // Update last_login
  await db`UPDATE customers SET last_login = now() WHERE id = ${customerId}`

  // Get the customer
  const customers = await db`SELECT * FROM customers WHERE id = ${customerId}`
  return customers[0] || null
}

/**
 * Create a long-lived session (30 days) after magic link verification.
 * Returns the session token.
 */
export async function createPortalSession(customerId) {
  const db = sql()
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await db`
    INSERT INTO portal_sessions (customer_id, token, expires_at)
    VALUES (${customerId}, ${token}, ${expiresAt})
  `
  return token
}

/**
 * Validate a portal session cookie. Returns the customer if valid, null otherwise.
 */
export async function validatePortalSession(token) {
  if (!token) return null
  const db = sql()

  const rows = await db`
    SELECT c.* FROM portal_sessions s
    JOIN customers c ON c.id = s.customer_id
    WHERE s.token = ${token} AND s.expires_at > now()
  `
  return rows[0] || null
}

/**
 * Delete a portal session (logout).
 */
export async function deletePortalSession(token) {
  const db = sql()
  await db`DELETE FROM portal_sessions WHERE token = ${token}`
}
