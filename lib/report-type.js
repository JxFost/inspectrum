/*
 * Classify a report PDF by Harry's file-naming convention:
 *   - "...-R.pdf" / standalone capital R token → radon report
 *   - the word "Scope" anywhere in the name    → sewer scope report
 *   - everything else (e.g. "...-c.pdf")       → inspection report
 */
export function classifyReportType(fileName) {
  if (!fileName) return 'inspection'
  if (/\bscope\b/i.test(fileName)) return 'sewer'
  // Case-sensitive: a standalone capital R ("796 Louis Drive-R.pdf"),
  // not the R in "Road" or "Rd"
  if (/\bR\b/.test(fileName)) return 'radon'
  return 'inspection'
}
