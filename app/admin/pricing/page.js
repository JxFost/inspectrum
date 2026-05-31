import { SQFT_TIERS, CITY_SURCHARGES, FEATURE_PRICES, SERVICE_PRICES, DISCOUNTS } from '@/lib/pricing'
import { SERVICES, ADD_ONS } from '@/lib/services'
import { BASE_RADIUS_MILES, SURCHARGE_PER_MILE, MAX_SERVICE_RADIUS, DRIVING_FACTOR, HOME_ADDRESS } from '@/lib/mileage'

export const metadata = {
  title: 'Pricing Table — Admin',
  robots: 'noindex, nofollow',
}

const TIMEZONE = 'America/Denver'
const currentYear = new Date().getFullYear()

const AGE_TIERS = [
  { label: '0–20 years', surcharge: 0 },
  { label: '21–40 years', surcharge: 30 },
  { label: '41–60 years', surcharge: 55 },
  { label: '61+ years', surcharge: 80 },
]

function Section({ title, children }) {
  return (
    <div className="bg-paper border border-line rounded-sm p-6 mb-6">
      <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-4">{title}</div>
      {children}
    </div>
  )
}

function TableRow({ label, value, highlight }) {
  return (
    <div className={`flex justify-between py-2 border-b border-line last:border-0 ${highlight ? 'bg-amber/[0.05]' : ''}`}>
      <span className="text-sm text-charcoal">{label}</span>
      <span className="text-sm text-ink font-medium">{value}</span>
    </div>
  )
}

export default function PricingPage() {
  // Sort cities alphabetically
  const sortedCities = Object.entries(CITY_SURCHARGES)
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="min-h-screen bg-cream pt-8 pb-12 px-5">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-ink mb-1">Current Pricing Table</h1>
          <p className="text-sm text-charcoal/60">Reference only — not visible to customers. Prices baked into <code className="text-xs bg-cream border border-line px-1 py-0.5 rounded">lib/pricing.js</code></p>
        </div>

        {/* Base price by sqft */}
        <Section title="Base Inspection Fee (by square footage)">
          <p className="text-xs text-charcoal/50 mb-3">Includes standard kitchen ($25). Total SF including basement.</p>
          {SQFT_TIERS.map((tier, i) => (
            <TableRow
              key={i}
              label={`${tier.min.toLocaleString()} – ${tier.max.toLocaleString()} sq ft`}
              value={`$${tier.price}`}
            />
          ))}
          <TableRow label="4,500+ sq ft" value="$655 + $50 per 500 sq ft" highlight />
        </Section>

        {/* Age surcharge */}
        <Section title="Age Surcharge (by year built)">
          {AGE_TIERS.map((tier, i) => (
            <TableRow
              key={i}
              label={`${tier.label} (built ${currentYear - parseInt(tier.label)}+)`}
              value={tier.surcharge === 0 ? 'No surcharge' : `+$${tier.surcharge}`}
            />
          ))}
        </Section>

        {/* City surcharges */}
        <Section title="City / Location Surcharge">
          <p className="text-xs text-charcoal/50 mb-3">{sortedCities.length} cities mapped. Unknown cities may need manual trip charge.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6">
            {sortedCities.map(([city, charge]) => (
              <div key={city} className="flex justify-between py-1.5 border-b border-line/50 text-sm">
                <span className="text-charcoal capitalize">{city}</span>
                <span className={`font-medium ${charge === 0 ? 'text-teal' : 'text-ink'}`}>
                  {charge === 0 ? 'Free' : `+$${charge}`}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Feature add-ons (rolled into base) */}
        <Section title="Feature Surcharges (rolled into inspection fee)">
          <TableRow label="Additional kitchen" value={`+$${FEATURE_PRICES.additionalKitchen}`} />
          <TableRow label="Additional furnace (closet/basement)" value={`+$${FEATURE_PRICES.additionalFurnaceCloset}`} />
          <TableRow label="Additional furnace (attic/crawlspace)" value={`+$${FEATURE_PRICES.additionalFurnaceAttic}`} />
          <TableRow label="Detached garage" value={`+$${FEATURE_PRICES.detachedGarage}`} />
          <TableRow label="Pool" value={`+$${FEATURE_PRICES.pool}`} />
          <TableRow label="Lawn sprinklers" value={`+$${FEATURE_PRICES.lawnSprinklers}`} />
          <TableRow label="Outbuilding (structure only)" value={`+$${FEATURE_PRICES.outbuildingStructure}`} />
          <TableRow label="Outbuilding (electricity only)" value={`+$${FEATURE_PRICES.outbuildingElecOnly}`} />
          <TableRow label="Outbuilding (full utilities)" value={`+$${FEATURE_PRICES.outbuildingFull}`} />
        </Section>

        {/* Service add-ons (separate line items) */}
        <Section title="Service Add-Ons (separate line items)">
          <TableRow label="Radon testing" value={`$${SERVICE_PRICES.radon}`} />
          <TableRow label="Radon testing (with trip charge)" value={`$${SERVICE_PRICES.radonWithTrip}`} />
          <TableRow label="Sewer scope" value={`$${SERVICE_PRICES.sewerScope}`} />
        </Section>

        {/* Standalone services */}
        <Section title="Standalone Services">
          {SERVICES.map((s) => (
            <TableRow key={s.id} label={`${s.name} (${s.durationHours}h)`} value={s.price} />
          ))}
        </Section>

        {/* Mileage */}
        <Section title="Mileage / Trip Charge">
          <p className="text-xs text-charcoal/50 mb-3">Home base: {HOME_ADDRESS}</p>
          <TableRow label="Base radius (no surcharge)" value={`${BASE_RADIUS_MILES} miles`} />
          <TableRow label="Surcharge per mile beyond base" value={`$${SURCHARGE_PER_MILE.toFixed(2)}/mile`} />
          <TableRow label="Maximum service radius" value={`${MAX_SERVICE_RADIUS} miles`} />
          <TableRow label="Driving factor (straight-line multiplier)" value={`${DRIVING_FACTOR}x`} />
          <div className="mt-3 pt-3 border-t border-line">
            <p className="text-xs text-charcoal/50 mb-2">Example trip charges:</p>
            <TableRow label={`${BASE_RADIUS_MILES + 10} miles`} value={`+$${(10 * SURCHARGE_PER_MILE).toFixed(0)}`} />
            <TableRow label={`${BASE_RADIUS_MILES + 25} miles`} value={`+$${(25 * SURCHARGE_PER_MILE).toFixed(0)}`} />
            <TableRow label={`${BASE_RADIUS_MILES + 50} miles`} value={`+$${(50 * SURCHARGE_PER_MILE).toFixed(0)}`} />
          </div>
          <p className="text-xs text-charcoal/40 mt-3 italic">Note: City-based surcharges (above) override mileage for known cities.</p>
        </Section>

        {/* Discounts */}
        <Section title="Discounts">
          <TableRow label="Repeat client" value={`-$${Math.abs(DISCOUNTS.repeatClient)}`} />
          <TableRow label="Save inspection" value={`-$${Math.abs(DISCOUNTS.saveInspection)}`} />
        </Section>

        <p className="text-xs text-charcoal/40 text-center mt-8">
          To update pricing, edit <code className="bg-cream border border-line px-1 py-0.5 rounded">lib/pricing.js</code> and <code className="bg-cream border border-line px-1 py-0.5 rounded">lib/services.js</code>
        </p>
      </div>
    </div>
  )
}
