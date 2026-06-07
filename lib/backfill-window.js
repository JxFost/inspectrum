/*
 * Shared helper for backfill endpoints: parse `?from=YYYY-MM-DD` and an
 * optional `?to=YYYY-MM-DD` query param into the date formats the various
 * jobs need.
 *
 * `from` defaults to Jan 1 of the current year, which preserves the prior
 * hardcoded behavior when no param is supplied. Pass e.g.
 * `?from=2025-01-01&to=2025-12-31` to import only a specific year — useful
 * for jobs that create records (e.g. backfill-legacy) so a re-run can't
 * duplicate events already imported for another year.
 *
 * `to` returns null when absent, so callers keep their own default upper
 * bound (e.g. now + 90 days) unless explicitly capped.
 */
export function parseBackfillFrom(searchParams) {
  const raw = searchParams.get('from')
  const valid = raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)
  const fromDate = valid ? raw : `${new Date().getFullYear()}-01-01`

  const rawTo = searchParams.get('to')
  const validTo = rawTo && /^\d{4}-\d{2}-\d{2}$/.test(rawTo)
  const toDate = validTo ? rawTo : null

  return {
    fromDate,                                       // 'YYYY-MM-DD'
    fromISO: `${fromDate}T00:00:00Z`,               // calendar timeMin
    fromGmail: `after:${fromDate.replace(/-/g, '/')}`, // gmail fragment: 'after:YYYY/MM/DD'
    toDate,                                          // 'YYYY-MM-DD' or null
    toISO: toDate ? `${toDate}T23:59:59Z` : null,    // calendar timeMax (null = use caller default)
    toGmail: toDate ? `before:${toDate.replace(/-/g, '/')}` : '', // gmail fragment or ''
  }
}
