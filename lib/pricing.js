/*
 * Pricing engine for Inspectrum Inspections.
 *
 * NOT public-facing — used for internal calculations only.
 * Public pages show "From $XXX" ranges.
 *
 * Pricing rules based on ACC fee schedule:
 * - Base price by square footage
 * - Age surcharge by year built
 * - City/location surcharge (replaces per-mile trip charge for known cities)
 * - Feature add-ons (additional kitchen, furnace, garage, pool, etc.)
 * - Service add-ons (radon, sewer scope)
 * - Discounts (repeat client, save inspection)
 */

// ---- Base price by square footage (residential) ----

const SQFT_TIERS = [
  { min: 1, max: 1000, price: 405 },
  { min: 1001, max: 1999, price: 430 },
  { min: 2000, max: 2499, price: 455 },
  { min: 2500, max: 2999, price: 480 },
  { min: 3000, max: 3499, price: 530 },
  { min: 3500, max: 3999, price: 555 },
  { min: 4000, max: 4499, price: 580 },
]

function basePriceBySqft(sqft) {
  if (!sqft || sqft <= 0) return 455 // default to mid-range
  for (const tier of SQFT_TIERS) {
    if (sqft >= tier.min && sqft <= tier.max) return tier.price
  }
  // 4500+ : $630 + $50 per additional 500 sqft
  if (sqft >= 4500) {
    const extra = Math.ceil((sqft - 4500) / 500)
    return 630 + extra * 50
  }
  return 455
}

// ---- Age surcharge ----

function ageSurcharge(yearBuilt) {
  if (!yearBuilt) return 0
  const age = new Date().getFullYear() - parseInt(yearBuilt, 10)
  if (age <= 20) return 0
  if (age <= 40) return 30
  if (age <= 60) return 55
  return 80
}

// ---- City/location surcharge ----

const CITY_SURCHARGES = {
  'alice': 25, 'alma': 75, 'arvada': 25, 'aurora': 50,
  'bailey': 50, 'black hawk': 50, 'boulder': 75, 'brighton': 50,
  'broomfield': 50, 'buffalo creek': 50,
  'castle pines': 50, 'castle rock': 75, 'centennial': 50,
  'central city': 50, 'cherry hills village': 25, 'commerce city': 50,
  'como': 100, 'conifer': 0,
  'denver': 25, 'eastbrook': 50, 'elizabeth': 75, 'empire': 25,
  'englewood': 25, 'erie': 100, 'evergreen': 0,
  'fairplay': 100, 'federal heights': 25, 'franktown': 75, 'fraser': 75,
  'georgetown': 25, 'glendale': 25, 'golden': 25,
  'golden coal creek canyon': 50, 'golden gate canyon': 50,
  'granby': 75, 'grand lake': 100, 'grant': 50, 'greenwood village': 25,
  'highlands ranch': 50, 'hudson': 75,
  'idaho springs': 0, 'indian hills': 0,
  'jefferson': 75,
  'lafayette': 50, 'lakewood': 25, 'larkspur': 75, 'littleton': 25,
  'lone pine': 25, 'lone tree': 50, 'louisville': 50, 'louviers': 75,
  'morrison': 0,
  'nederland': 75, 'northglenn': 50,
  'parker': 75, 'pine': 50,
  'sedalia': 50, 'shawnee': 25, 'silver plume': 25, 'silverthorne': 75,
  'superior': 75,
  'thornton': 50,
  'watkins': 100, 'westminster': 25, 'winter park': 75,
}

function citySurcharge(city) {
  if (!city) return 0
  const normalized = city.toLowerCase().trim()
  return CITY_SURCHARGES[normalized] ?? null // null = unknown city
}

// ---- Feature add-ons ----

const FEATURE_PRICES = {
  additionalKitchen: 25,
  additionalFurnaceCloset: 25,
  additionalFurnaceAttic: 50,
  detachedGarage: 25,
  pool: 50,
  lawnSprinklers: 25,
  outbuildingFull: 50,       // with electricity & water
  outbuildingElecOnly: 25,   // with electricity, no water
  outbuildingStructure: 25,  // structure only
}

// ---- Service add-ons ----

const SERVICE_PRICES = {
  radon: 125,
  radonWithTrip: 150,
  sewerScope: 200,
}

// ---- Discounts ----

const DISCOUNTS = {
  repeatClient: -25,
  saveInspection: -50,
}

// ---- Special inspection types ----

const SPECIAL_TYPE_PRICES = {
  commercial: null,          // custom quote
  multiFamily: null,         // custom quote
  singleItem: 155,
  newConstructionProgress: 180,
}

// ---- Main pricing calculator ----

/**
 * Calculate the estimated price for an inspection.
 *
 * @param {object} opts
 * @param {number} [opts.sqft] — total square footage including basement
 * @param {string} [opts.yearBuilt] — year built (e.g. "1985")
 * @param {string} [opts.city] — city name
 * @param {string} [opts.serviceType] — 'full', 'commercial', 'radon', 'mold', etc.
 * @param {boolean} [opts.radonAddOn]
 * @param {boolean} [opts.sewerScope]
 * @param {boolean} [opts.hasTrip] — whether a trip charge applies (for radon pricing)
 * @param {object} [opts.features] — { detachedGarage, pool, lawnSprinklers, additionalKitchen, etc. }
 * @param {string} [opts.discount] — 'repeatClient' or 'saveInspection'
 * @returns {{ total, breakdown: Array<{label, amount}>, cityUnknown: boolean }}
 */
export function calculatePrice({
  sqft,
  yearBuilt,
  city,
  serviceType = 'full',
  radonAddOn = false,
  sewerScope = false,
  hasTrip = false,
  features = {},
  discount,
} = {}) {
  const breakdown = []

  // Special types
  if (serviceType === 'commercial' || serviceType === 'multiFamily') {
    return { total: null, breakdown: [{ label: 'Custom quote required', amount: null }], cityUnknown: false }
  }
  if (serviceType === 'singleItem') {
    breakdown.push({ label: 'Single Item Inspection', amount: 155 })
    return { total: 155, breakdown, cityUnknown: false }
  }
  if (serviceType === 'newConstruction') {
    breakdown.push({ label: 'New Construction Progress Inspection', amount: 180 })
    return { total: 180, breakdown, cityUnknown: false }
  }

  // Radon-only
  if (serviceType === 'radon') {
    const radonPrice = hasTrip ? SERVICE_PRICES.radonWithTrip : SERVICE_PRICES.radon
    breakdown.push({ label: 'Radon Testing', amount: radonPrice })
    return { total: radonPrice, breakdown, cityUnknown: false }
  }

  // Mold assessment (standalone pricing)
  if (serviceType === 'mold') {
    breakdown.push({ label: 'Mold Assessment', amount: 280 })
    return { total: 280, breakdown, cityUnknown: false }
  }

  // Full / pre-listing inspection
  // Combine base + age + city + features into one "Inspection Fee" line
  const sqftNum = sqft ? parseInt(sqft, 10) : 0
  let inspectionFee = basePriceBySqft(sqftNum)
  inspectionFee += ageSurcharge(yearBuilt)

  let cityUnknown = false
  const cityCharge = citySurcharge(city)
  if (cityCharge === null) {
    cityUnknown = true
  } else {
    inspectionFee += cityCharge
  }

  // Kitchen is always included in every inspection
  inspectionFee += FEATURE_PRICES.additionalKitchen

  // Feature add-ons rolled into inspection fee
  if (features.additionalKitchen) inspectionFee += FEATURE_PRICES.additionalKitchen // second kitchen
  if (features.additionalFurnaceCloset) inspectionFee += FEATURE_PRICES.additionalFurnaceCloset
  if (features.additionalFurnaceAttic) inspectionFee += FEATURE_PRICES.additionalFurnaceAttic
  if (features.detachedGarage) inspectionFee += FEATURE_PRICES.detachedGarage
  if (features.pool) inspectionFee += FEATURE_PRICES.pool
  if (features.lawnSprinklers) inspectionFee += FEATURE_PRICES.lawnSprinklers
  if (features.outbuildingFull) inspectionFee += FEATURE_PRICES.outbuildingFull
  if (features.outbuildingElecOnly) inspectionFee += FEATURE_PRICES.outbuildingElecOnly
  if (features.outbuildingStructure) inspectionFee += FEATURE_PRICES.outbuildingStructure

  breakdown.push({ label: 'Inspection fee', amount: inspectionFee })

  // Service add-ons (shown separately)
  if (radonAddOn) {
    const radonPrice = (cityCharge && cityCharge > 0) ? SERVICE_PRICES.radonWithTrip : SERVICE_PRICES.radon
    breakdown.push({ label: 'Radon testing', amount: radonPrice })
  }
  if (sewerScope) {
    breakdown.push({ label: 'Sewer scope', amount: SERVICE_PRICES.sewerScope })
  }

  // Discounts (shown separately)
  if (discount === 'repeatClient') breakdown.push({ label: 'Repeat client discount', amount: DISCOUNTS.repeatClient })
  if (discount === 'saveInspection') breakdown.push({ label: 'Save inspection discount', amount: DISCOUNTS.saveInspection })

  const total = breakdown.reduce((sum, item) => sum + (item.amount || 0), 0)

  return { total, breakdown, cityUnknown }
}

// Export constants for use elsewhere
export { CITY_SURCHARGES, SQFT_TIERS, FEATURE_PRICES, SERVICE_PRICES, DISCOUNTS }
