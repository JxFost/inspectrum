/*
 * Shared address parsing helper for Google Places API (new PlaceAutocompleteElement).
 *
 * Parses addressComponents from the new API format (camelCase properties:
 * longText, shortText, types) into structured form fields.
 *
 * Handles edge cases: missing components, rural addresses without locality,
 * addresses without street numbers.
 */

/**
 * Parse Google Places addressComponents into structured form fields.
 *
 * @param {Array} components — place.addressComponents from fetchFields()
 * @returns {{ street: string, city: string, state: string, zip: string }}
 */
export function parseAddressComponents(components) {
  if (!components || !Array.isArray(components)) {
    return { street: '', city: '', state: '', zip: '' }
  }

  const get = (type) => components.find((c) => c.types?.includes(type)) || null

  const streetNumber = get('street_number')?.longText || ''
  const route = get('route')?.longText || ''
  const city = get('locality')?.longText
    || get('sublocality')?.longText
    || get('sublocality_level_1')?.longText
    || get('postal_town')?.longText
    || ''
  const state = get('administrative_area_level_1')?.shortText || ''
  const zip = get('postal_code')?.longText || ''

  const street = [streetNumber, route].filter(Boolean).join(' ').trim()

  return { street, city, state, zip }
}

// ---- Client-side trip charge calculation ----

const HOME_LAT = 39.6333
const HOME_LNG = -105.3172
const BASE_RADIUS_MILES = 25
const SURCHARGE_PER_MILE = 0.5
const DRIVING_FACTOR = 1.35

function haversine(lat1, lng1, lat2, lng2) {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Compute estimated trip charge from a lat/lng.
 * Returns { miles, tripChargeDollars } or null if no coordinates.
 */
export function estimateTripCharge(lat, lng) {
  if (lat == null || lng == null) return null
  const miles = Math.round(haversine(HOME_LAT, HOME_LNG, lat, lng) * DRIVING_FACTOR)
  const extraMiles = Math.max(0, miles - BASE_RADIUS_MILES)
  const tripChargeDollars = extraMiles * SURCHARGE_PER_MILE
  return { miles, tripChargeDollars }
}
