'use client'

import { calculatePrice } from '@/lib/pricing'

/**
 * Reusable pricing breakdown block.
 * Uses the full pricing engine when sqft/yearBuilt/city are available,
 * falls back to simple display for legacy data.
 *
 * @param {object} props
 * @param {string} props.service — service name or ID
 * @param {string|number} [props.sqft]
 * @param {string} [props.yearBuilt]
 * @param {string} [props.city]
 * @param {boolean} [props.radonAddOn]
 * @param {boolean} [props.sewerScope]
 * @param {number|string} [props.tripChargeCents] — legacy trip charge in cents
 * @param {number|string} [props.distanceMiles]
 */
export default function PricingBlock({ service, sqft, yearBuilt, city, radonAddOn, sewerScope, tripChargeCents, distanceMiles }) {
  // Map service name to type
  const serviceType = service?.toLowerCase().includes('commercial') ? 'commercial'
    : service?.toLowerCase().includes('radon') ? 'radon'
    : service?.toLowerCase().includes('mold') ? 'mold'
    : 'full'

  const { total, breakdown, cityUnknown } = calculatePrice({
    sqft: sqft ? parseInt(sqft, 10) : 0,
    yearBuilt,
    city,
    serviceType,
    radonAddOn,
    sewerScope,
  })

  // If pricing engine returned nothing useful and we have legacy trip charge, show simple view
  if (total === null && !tripChargeCents) return null
  if (breakdown.length === 0 && !tripChargeCents) return null

  // For legacy data without sqft/city, add trip charge if present
  const legacyTrip = tripChargeCents ? Math.round(parseInt(tripChargeCents, 10) / 100) : 0
  const showLegacyTrip = legacyTrip > 0 && cityUnknown

  const displayTotal = total != null
    ? total + (showLegacyTrip ? legacyTrip : 0)
    : null

  return (
    <div className="bg-teal/[0.06] border border-teal/20 rounded-sm p-5">
      <div className="text-xs uppercase tracking-wider text-teal font-semibold mb-3">Estimated Cost</div>
      <div className="space-y-2 text-sm">
        {breakdown.map((item, i) => (
          item.amount !== null && (
            <div key={i} className="flex justify-between">
              <span className="text-charcoal">{item.label}</span>
              <span className={`font-medium ${item.amount < 0 ? 'text-teal' : 'text-ink'}`}>
                {item.amount < 0 ? `-$${Math.abs(item.amount)}` : `$${item.amount}`}
              </span>
            </div>
          )
        ))}
        {showLegacyTrip && (
          <div className="flex justify-between">
            <span className="text-charcoal">Trip charge{distanceMiles ? ` (${distanceMiles} mi)` : ''}</span>
            <span className="text-amber font-medium">+${legacyTrip}</span>
          </div>
        )}
        {cityUnknown && !showLegacyTrip && (
          <div className="flex justify-between">
            <span className="text-charcoal/50 text-xs italic">Location surcharge may apply</span>
          </div>
        )}
        {displayTotal != null && (
          <div className="border-t border-teal/20 pt-2 mt-2 flex justify-between">
            <span className="text-ink font-semibold">Estimated Total</span>
            <span className="text-teal font-serif text-xl font-semibold">${displayTotal}</span>
          </div>
        )}
        {total === null && (
          <div className="text-sm text-charcoal/60 italic">Custom quote — contact us for pricing</div>
        )}
      </div>
    </div>
  )
}
