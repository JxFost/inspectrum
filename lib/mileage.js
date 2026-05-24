/*
 * Mileage calculation and trip charge system.
 *
 * Computes driving distance from the home base to an inspection address.
 * Uses Google Maps Geocoding API when GOOGLE_MAPS_API_KEY is configured.
 * Returns null when the API key is not set (shows "TBD" in the UI).
 *
 * Environment variables:
 *   GOOGLE_MAPS_API_KEY — enable Geocoding API in Google Cloud Console
 */

// ---- Constants ----
export const HOME_ADDRESS = '2525 Witter Gulch Rd, Evergreen, CO 80439'
export const HOME_LAT = 39.6333
export const HOME_LNG = -105.3172
export const BASE_RADIUS_MILES = 50      // no surcharge within this
export const SURCHARGE_PER_MILE = 0.50      // dollars per mile beyond base radius
export const MAX_SERVICE_RADIUS = 75     // show "please call" beyond this
export const DRIVING_FACTOR = 1.35       // multiply straight-line by this for mountain road estimate

/**
 * Haversine formula — straight-line distance between two lat/lng points in miles.
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 3959 // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Geocode an address using Google Maps Geocoding API.
 * Returns { lat, lng } or null if the API is not configured or the request fails.
 */
async function geocode(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.status === 'OK' && data.results?.[0]) {
      const { lat, lng } = data.results[0].geometry.location
      return { lat, lng }
    }

    console.warn(`[mileage] geocode failed for "${address}": ${data.status}`)
    return null
  } catch (err) {
    console.error(`[mileage] geocode error for "${address}":`, err.message)
    return null
  }
}

/**
 * Compute distance and trip charge for an inspection address.
 *
 * Returns null if GOOGLE_MAPS_API_KEY is not configured.
 * Otherwise returns { miles, tripChargeCents, withinRange, geoLat, geoLng }.
 */
export async function computeDistance(address) {
  if (!address) return null
  if (!process.env.GOOGLE_MAPS_API_KEY) return null

  const geo = await geocode(address)
  if (!geo) return null

  const straightLine = haversine(HOME_LAT, HOME_LNG, geo.lat, geo.lng)
  const miles = Math.round(straightLine * DRIVING_FACTOR)

  const withinRange = miles <= MAX_SERVICE_RADIUS
  const extraMiles = Math.max(0, miles - BASE_RADIUS_MILES)
  const tripChargeCents = extraMiles * SURCHARGE_PER_MILE * 100

  return {
    miles,
    tripChargeCents,
    withinRange,
    geoLat: geo.lat,
    geoLng: geo.lng,
  }
}

/**
 * Compute trip charge from a known distance in miles.
 * Pure function — no API call needed.
 */
export function tripChargeFromMiles(miles) {
  if (!miles || miles <= BASE_RADIUS_MILES) return 0
  return (miles - BASE_RADIUS_MILES) * SURCHARGE_PER_MILE * 100
}

/**
 * Format a distance for display. Returns "TBD" if null.
 */
export function formatDistance(miles) {
  if (miles == null) return 'TBD'
  return `${miles} mi`
}
