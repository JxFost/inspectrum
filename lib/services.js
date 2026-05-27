/*
 * Service catalog for Inspectrum Inspections.
 *
 * Shared between the client UI and the booking API so that IDs, durations, and
 * names stay in sync. To add a service, add an entry here and redeploy.
 *
 * NOTE: Public-facing prices show "From $XXX" starting ranges.
 * Actual pricing is calculated by lib/pricing.js based on sqft, age, city, add-ons.
 */

export const SERVICES = [
  {
    id: 'full',
    name: 'Full Home Inspection',
    desc: 'Top-to-bottom inspection of every major system. 3-4 hrs.',
    price: 'From $430',
    basePrice: 430, // lowest sqft tier (1-1000), includes kitchen
    durationHours: 4,
  },
  {
    id: 'radon',
    name: 'Radon Testing Only',
    desc: '48-hour continuous monitor test. EPA-certified equipment.',
    price: 'From $125',
    basePrice: 125,
    durationHours: 1,
  },
  {
    id: 'mold',
    name: 'Mold Assessment',
    desc: 'Visual inspection with moisture mapping & thermal imaging.',
    price: 'From $280',
    basePrice: 280,
    durationHours: 2,
  },
  {
    id: 'pre-listing',
    name: 'Pre-Listing Inspection',
    desc: 'For sellers - find issues before buyers do.',
    price: 'From $430',
    basePrice: 430, // same sqft-based pricing as full
    durationHours: 3,
  },
]

export const ADD_ONS = [
  {
    id: 'radon',
    name: 'Radon Testing',
    desc: '48-hour continuous monitor — drop off day of inspection, pickup 2 days later.',
    price: 125,
  },
  {
    id: 'sewer-scope',
    name: 'Sewer Scope',
    desc: 'Camera inspection of the main sewer line.',
    price: 200,
  },
]
