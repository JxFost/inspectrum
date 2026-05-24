/*
 * Site-wide constants — reads from env vars with sensible fallbacks.
 *
 * Use these instead of hardcoding phone/email/address throughout the site.
 * Server-side only (env vars aren't exposed to client unless NEXT_PUBLIC_).
 */

export const OFFICE_PHONE = process.env.OFFICE_PHONE || '(303) 697-0990'
export const OFFICE_EMAIL = process.env.OFFICE_EMAIL || 'office@evergreeninspections.com'
export const OFFICE_ADDRESS = process.env.OFFICE_ADDRESS || 'Evergreen, CO 80439'
export const CONTACT_PHONE = process.env.CONTACT_PHONE || OFFICE_PHONE
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'hello@evergreeninspections.com'
export const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
