import Link from 'next/link'
import ServiceHero from '@/components/ServiceHero'
import SectionIntro from '@/components/SectionIntro'
import Deliverables from '@/components/Deliverables'
import FAQ from '@/components/FAQ'
import CTABanner from '@/components/CTABanner'
import { serviceJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'

export const metadata = {
  title: 'Full Home Inspection — Same-Day Reports',
  description:
    'Comprehensive home inspections covering structure, roof, electrical, plumbing, HVAC, and more. NACHI certified, same-day digital report, free phone consultation. Serving Evergreen, Denver Metro, and Boulder, CO.',
  alternates: { canonical: '/services/full-inspection' },
  openGraph: {
    title: 'Full Home Inspection — Inspectrum Inspections',
    description: 'Top-to-bottom inspection of every major system. Same-day report. Walkthrough included.',
    url: 'https://evergreeninspections.com/services/full-inspection',
  },
}

const CHECKLIST = [
  {
    iconPath: 'M3 21h18M5 21V8l7-5 7 5v13',
    title: 'Structure & Foundation',
    items: ['Foundation walls and floor', 'Settlement, cracking, movement', 'Framing visible at attic and crawlspace', 'Crawlspace moisture and ventilation'],
  },
  {
    iconPath: 'M2 12l10-9 10 9M5 12v9h14v-9',
    title: 'Roof & Exterior',
    items: ['Shingles, flashings, vents', 'Chimneys, skylights, drip edges', 'Gutters and downspouts', 'Siding, trim, windows, doors'],
  },
  {
    iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    title: 'Electrical',
    items: ['Service panel and grounding', 'Visible wiring condition', 'GFCI / AFCI compliance', 'Outlets, switches, fixtures'],
  },
  {
    iconPath: 'M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6',
    title: 'Plumbing',
    items: ['Water heater age and condition', 'Visible supply and drain lines', 'Fixtures, faucets, toilets', 'Water pressure and flow'],
  },
  {
    iconElement: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
    title: 'HVAC',
    items: ['Furnace and AC operation', 'Ductwork, registers, returns', 'Filters and visible wear', 'Estimated remaining service life'],
  },
  {
    iconElement: (<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6v6H9z" /></>),
    title: 'Interior',
    items: ['Walls, ceilings, floors', 'Doors and windows operation', 'Stairs and railings', 'Smoke and CO detectors'],
  },
  {
    iconPath: 'M12 2L4 7v10l8 5 8-5V7l-8-5z',
    title: 'Attic & Insulation',
    items: ['Insulation depth and type', 'Ventilation adequacy', 'Visible roof framing', 'Signs of leaks or pests'],
  },
  {
    iconPath: 'M3 12h2l3-9 6 18 3-9h4',
    title: 'Built-in Appliances',
    items: ['Range, oven, dishwasher', 'Garbage disposal, microwave', 'Washer/dryer hookups', 'Operational testing where safe'],
  },
]

const FAQ_ITEMS = [
  { q: 'How long does a full inspection take?', a: 'Plan on about one hour per 1,000 square feet, with a three-hour minimum. A typical 2,500 sq ft home takes about 3 hours — but we never rush, even on smaller properties. The walkthrough at the end usually adds another 20–30 minutes.' },
  { q: 'Do I need to attend the inspection?', a: "You don't have to, but we strongly recommend it — especially the walkthrough at the end. Seeing the issues in person gives you context the report can't fully capture, and it's your chance to ask questions and learn how the systems in the home work." },
  { q: 'When will I get the report?', a: "Same day, in nearly every case. You'll receive a detailed PDF with photos, observations, and prioritized recommendations. If we need an extra day for a particularly complex property, we'll let you know up front." },
  { q: 'Do you also do radon and mold testing?', a: (<p>Yes. <Link href="/services/radon">Radon testing</Link> and <Link href="/services/mold">mold assessments</Link> can be added to a full inspection or scheduled separately. We recommend radon testing for most Colorado homes given the elevated levels statewide.</p>) },
  { q: 'What if I have a question after I get the report?', a: "Call us. The free phone consultation that comes with every inspection doesn't expire. We've taken calls from clients years after the inspection — that's just part of the service." },
  { q: 'How much does it cost?', a: "Pricing starts at $450 and varies based on square footage, age of the home, and any add-ons (radon, mold, etc.). When you schedule, we'll give you an exact quote up front — no surprises." },
]

function CheckCard({ iconPath, iconElement, title, items }) {
  return (
    <div className="bg-cream border border-line p-7 rounded-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(20,60,68,0.08)] hover:border-teal">
      <div className="w-11 h-11 rounded-full bg-teal text-amber flex items-center justify-center mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          {iconPath ? <path d={iconPath} /> : iconElement}
        </svg>
      </div>
      <h3 className="text-[1.15rem] mb-3 text-ink">{title}</h3>
      <ul className="list-none space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-[0.88rem] text-charcoal pl-4 relative leading-snug before:content-[''] before:absolute before:left-0 before:top-2 before:w-[5px] before:h-[5px] before:rounded-full before:bg-amber">
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FullInspectionPage() {
  const schemas = [
    serviceJsonLd({ name: 'Full Home Inspection', description: metadata.description, url: '/services/full-inspection', price: '450' }),
    faqJsonLd(FAQ_ITEMS),
    breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Services', url: '/#services' }, { name: 'Full Inspection', url: '/services/full-inspection' }]),
  ].filter(Boolean)

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ServiceHero
        variant="teal"
        eyebrow="Service · Most Popular"
        title={<>The Full <em className="italic text-amber">Home Inspection.</em></>}
        description="A complete, top-to-bottom analysis of every major system in the home. Plan on roughly one hour per 1,000 square feet, with a three-hour minimum. We don't rush. We don't skim."
        primaryCTA={{ label: 'Schedule This Inspection', href: '/schedule' }}
        secondaryCTA={{ label: '(303) 697-0990', href: 'tel:3036970990' }}
        stats={[
          { num: '3–4', em: 'hrs', label: 'Average inspection' },
          { num: 'From', em: '$450', label: 'Pricing varies by sq ft' },
          { num: 'Same', em: 'day', label: 'Detailed PDF report' },
          { num: 'Free', em: 'consult', label: 'Phone follow-up included' },
        ]}
      />

      <SectionIntro
        eyebrow="What's Included"
        title={<>Every <em className="italic text-teal">major system,</em><br />checked carefully.</>}
        paragraphs={[
          "Our full inspection covers the structure, exterior, roof, electrical, plumbing, HVAC, and interior — plus the attic, basement, and crawlspace where accessible. We follow the InterNACHI Standards of Practice and document everything with photos.",
          "You're invited to walk through the property with us at the end. That walkthrough is often the most valuable hour of the home-buying process — you'll see exactly what we saw, ask questions in real time, and leave with a clear picture of the home's condition.",
        ]}
      />

      <section className="bg-paper py-24 px-5 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="section-eyebrow justify-center">The Full Checklist</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              Top to bottom, <em className="italic text-teal">inside and out.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHECKLIST.map((card, i) => <CheckCard key={i} {...card} />)}
          </div>
        </div>
      </section>

      <Deliverables
        title={<>More than just a <em className="italic text-amber">report.</em></>}
        intro="When the inspection is over, you don't just walk away with a stack of paper. You walk away knowing your home."
        items={[
          { title: 'Live walkthrough', body: 'Join us at the end of the inspection so you can see every concern with your own eyes — not just on paper.' },
          { title: 'Same-day digital report', body: 'A detailed, photo-rich PDF delivered the same day. Easy to share with your realtor or contractor.' },
          { title: 'Free phone consultation', body: 'Have a question two weeks later? Two months later? Call any time — that consultation never expires.' },
          { title: 'Repair priority guidance', body: 'We help you separate the urgent from the cosmetic, so you know what needs attention now and what can wait.' },
        ]}
      />

      <FAQ
        title={<>Things buyers <em className="italic text-teal">often ask.</em></>}
        items={FAQ_ITEMS}
      />

      <CTABanner
        title={<>Book your inspection <em className="italic text-amber">online,</em> any time.</>}
      />
    </>
  )
}
