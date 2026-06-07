import Link from 'next/link'
import ServiceHero from '@/components/ServiceHero'
import CTABanner from '@/components/CTABanner'
import { SYSTEM_GUIDES, GUIDE_SLUGS } from '@/lib/guides'

export const metadata = {
  title: 'Homeowner Guides — Inspectrum Inspections',
  description:
    'Plain-English home guides from a Front Range inspector: seasonal maintenance plus what we check in your plumbing, electrical, roof, HVAC, and more.',
  alternates: { canonical: '/guides' },
}

// The seasonal guide is a standalone page; system guides come from lib/guides.js.
const FEATURED = {
  href: '/guides/home-maintenance',
  eyebrow: 'Seasonal',
  title: 'Home Maintenance, Season by Season',
  lead: 'A spring-through-winter checklist tuned for Front Range homes — gutters, HVAC, wildfire defensible space, ice dams, and radon.',
}

export default function GuidesHub() {
  const systemGuides = GUIDE_SLUGS.map((slug) => ({ slug, ...SYSTEM_GUIDES[slug] }))

  return (
    <>
      <ServiceHero
        variant="teal"
        eyebrow="Homeowner Guides"
        title={<>Know your home, <em className="italic text-amber">inside and out.</em></>}
        description="Practical, plain-English guides from a working inspector — what we check, what commonly goes wrong, and what you can stay ahead of yourself."
        primaryCTA={{ label: 'Book an Inspection', href: '/schedule' }}
      />

      {/* Featured: seasonal guide */}
      <section className="bg-paper py-16 px-5 lg:px-8">
        <div className="max-w-[1100px] mx-auto">
          <Link href={FEATURED.href} className="group block rounded-sm border border-line bg-cream p-8 sm:p-10 no-underline hover:border-teal transition-colors">
            <div className="section-eyebrow">{FEATURED.eyebrow}</div>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-ink mb-3 group-hover:text-teal transition-colors">{FEATURED.title}</h2>
            <p className="text-[0.98rem] text-charcoal leading-[1.7] max-w-2xl mb-4">{FEATURED.lead}</p>
            <span className="text-sm font-semibold text-teal">Read the seasonal guide →</span>
          </Link>
        </div>
      </section>

      {/* System guides */}
      <section className="bg-cream py-16 px-5 lg:px-8 border-t border-line">
        <div className="max-w-[1100px] mx-auto">
          <div className="section-eyebrow">By System</div>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-ink mb-8">Home systems, explained</h2>
          {systemGuides.length === 0 ? (
            <p className="text-charcoal/60">More guides coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {systemGuides.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="group block rounded-sm border border-line bg-paper p-6 no-underline hover:border-teal hover:-translate-y-0.5 transition-all">
                  <div className="text-[0.7rem] uppercase tracking-[0.2em] text-amber font-semibold mb-2">{g.eyebrow}</div>
                  <h3 className="text-[1.3rem] text-ink mb-2 group-hover:text-teal transition-colors">{g.heroTitle}</h3>
                  <p className="text-sm text-charcoal/75 leading-relaxed line-clamp-3">{g.heroLead}</p>
                  <span className="inline-block text-sm font-semibold text-teal mt-3">Read guide →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTABanner
        eyebrow="Ready When You Are"
        title={<>Questions about your home?</>}
        description="Whether you're buying, selling, or just staying ahead of upkeep, we'll give it a thorough, plain-English inspection."
        primaryLabel="Schedule an Inspection"
      />
    </>
  )
}
