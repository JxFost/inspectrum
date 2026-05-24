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
