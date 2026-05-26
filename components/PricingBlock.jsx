'use client'

import { SERVICES } from '@/lib/services'

/**
 * Reusable pricing breakdown block.
 * Used on manage page, admin detail, and agreement page.
 *
 * @param {object} props
 * @param {string} props.service — service name
 * @param {boolean} props.radonAddOn
 * @param {boolean} props.sewerScope
 * @param {number|string} [props.tripChargeCents] — in cents
 * @param {number|string} [props.distanceMiles]
 */
export default function PricingBlock({ service, radonAddOn, sewerScope, tripChargeCents, distanceMiles }) {
  const svc = SERVICES.find((s) => s.name === service)
  const basePrice = svc?.basePrice || null
  const radonPrice = radonAddOn ? 150 : 0
  const sewerPrice = sewerScope ? 225 : 0
  const tripDollars = tripChargeCents ? Math.round(parseInt(tripChargeCents, 10) / 100) : 0
  const total = basePrice != null ? basePrice + radonPrice + sewerPrice + tripDollars : null

  if (!basePrice && !radonAddOn && !sewerScope && !tripDollars) return null

  return (
    <div className="bg-teal/[0.06] border border-teal/20 rounded-sm p-5">
      <div className="text-xs uppercase tracking-wider text-teal font-semibold mb-3">Estimated Cost</div>
      <div className="space-y-2 text-sm">
        {basePrice != null && (
          <div className="flex justify-between">
            <span className="text-charcoal">{service}</span>
            <span className="text-ink font-medium">${basePrice}</span>
          </div>
        )}
        {radonAddOn && (
          <div className="flex justify-between">
            <span className="text-charcoal">Radon Testing Add-On</span>
            <span className="text-ink font-medium">$150</span>
          </div>
        )}
        {sewerScope && (
          <div className="flex justify-between">
            <span className="text-charcoal">Sewer Scope Add-On</span>
            <span className="text-ink font-medium">$225</span>
          </div>
        )}
        {tripDollars > 0 && (
          <div className="flex justify-between">
            <span className="text-charcoal">Trip Charge{distanceMiles ? ` (${distanceMiles} mi)` : ''}</span>
            <span className="text-amber font-medium">+${tripDollars}</span>
          </div>
        )}
        {total != null && (
          <div className="border-t border-teal/20 pt-2 mt-2 flex justify-between">
            <span className="text-ink font-semibold">Estimated Total</span>
            <span className="text-teal font-serif text-xl font-semibold">${total}</span>
          </div>
        )}
      </div>
    </div>
  )
}
