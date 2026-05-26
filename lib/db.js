/*
 * Database connection helper — Neon Postgres (serverless).
 *
 * Uses @neondatabase/serverless which works in Vercel Edge and Node.js.
 * Connection string is read from DATABASE_URL env var.
 */

import { neon } from '@neondatabase/serverless'

let _sql

/**
 * Get a SQL query function. Reuses the connection across calls.
 */
export function sql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL env var is not set')
    _sql = neon(url)
  }
  return _sql
}
