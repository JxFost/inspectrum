import Link from 'next/link'
import ServiceHero from '@/components/ServiceHero'
import SectionIntro from '@/components/SectionIntro'
import Deliverables from '@/components/Deliverables'
import FAQ from '@/components/FAQ'
import CTABanner from '@/components/CTABanner'
import { serviceJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'

export const metadata = {
  title: 'Commercial Property Inspections in Colorado',
  description:
    'Commercial property inspections for offices, retail spaces, light industrial buildings, and investment properties in Evergreen, Denver Metro, Boulder, and Colorado mountain communities.',
  alternates: { canonical: '/services/commercial' },
  openGraph: {
    title: 'Commercial Property Inspections — Inspectrum Inspections',
    description: 'Clear due diligence for commercial buyers, owners, tenants, and investors.',
    url: 'https://evergreeninspections.com/services/commercial',
  },
}

const SCOPE_ITEMS = [
  {
    iconPath: 'M3 21h18M5 21V7h14v14M9 21v-6h6v6M9 10h1M14 10h1M9 14h1M14 14h1',
    title: 'Building Envelope',
    items: ['Roofing and drainage', 'Exterior walls and cladding', 'Windows, doors, and entries', 'Site grading and water control'],
  },
  {
    iconPath: 'M13 2L4 14h7l-1 8 10-13h-7l1-7z',
    title: 'Electrical Systems',
    items: ['Service equipment', 'Panels and visible wiring', 'Grounding and safety concerns', 'Representative outlets and fixtures'],
  },
  {
    iconElement: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
    title: 'HVAC & Mechanical',
    items: ['Heating and cooling equipment', 'Visible ductwork and distribution', 'Operational observations', 'Age and maintenance indicators'],
  },
  {
    iconPath: 'M4 4v16M20 4v16M4 12h16M8 8h8M8 16h8',
    title: 'Interior & Life Safety',
    items: ['Interior finishes', 'Stairs, rails, and exits', 'Moisture indicators', 'Safety and maintenance flags'],
  },
]

const FAQ_ITEMS = [
  {
    q: 'What types of commercial properties do you inspect?',
    a: 'We inspect small to mid-size commercial properties including offices, retail suites, mixed-use buildings, light industrial spaces, warehouses, and investment properties. For highly specialized facilities, we can help define the right scope and specialist support.',
  },
  {
    q: 'Is this the same as a residential inspection?',
    a: 'The fundamentals are similar, but the scope, reporting, and risk profile are different. Commercial inspections focus on building systems, deferred maintenance, safety concerns, and items that affect ownership, leasing, or investment decisions.',
  },
  {
    q: 'Can radon or mold assessment be added?',
    a: (<p>Yes. <Link href="/services/radon">Radon testing</Link> and <Link href="/services/mold">mold assessment</Link> can be added when they make sense for the property type, location, and transaction timeline.</p>),
  },
  {
    q: 'How long does a commercial inspection take?',
    a: 'It depends on square footage, building age, access, and system complexity. Smaller commercial spaces may take a few hours; larger or multi-system buildings may require additional time. We quote the scope up front.',
  },
  {
    q: 'Do you inspect code compliance?',
    a: 'A commercial inspection is not a municipal code inspection or engineering study. We identify visible defects, safety concerns, maintenance issues, and conditions that may warrant evaluation by a licensed specialist.',
  },
]

function ScopeCard({ iconPath, iconElement, title, items }) {
  return (
    <div className="bg-cream border border-line p-7 rounded-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(20,60,68,0.08)] hover:border-teal">
      <div className="w-11 h-11 rounded-full bg-teal text-amber flex items-center justify-center mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          {iconPath ? <path d={iconPath} /> : iconElement}
        </svg>
      </div>
      <h3 className="text-[1.15rem] mb-3 text-ink">{title}</h3>
      <ul className="list-none space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-[0.88rem] text-charcoal pl-4 relative leading-snug before:content-[''] before:absolute before:left-0 before:top-2 before:w-[5px] before:h-[5px] before:rounded-full before:bg-amber">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CommercialInspectionsPage() {
  const schemas = [
    serviceJsonLd({ name: 'Commercial Property Inspection', description: metadata.description, url: '/services/commercial' }),
    faqJsonLd(FAQ_ITEMS),
    breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Services', url: '/#services' }, { name: 'Commercial', url: '/services/commercial' }]),
  ].filter(Boolean)

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ServiceHero
        variant="dark"
        eyebrow="Service · Commercial"
        title={<>Commercial <em className="italic text-amber">Property Inspections.</em></>}
        description="Clear, practical due diligence for offices, retail spaces, light industrial buildings, and investment properties. We help you understand condition, risk, and next steps before you commit."
        primaryCTA={{ label: 'Request a Commercial Quote', href: '/contact' }}
        secondaryCTA={{ label: '(303) 697-0990', href: 'tel:3036970990' }}
        stats={[
          { num: 'Custom', em: 'scope', label: 'Quoted to property type' },
          { num: 'Photo', em: 'rich', label: 'Clear digital report' },
          { num: 'Due', em: 'diligence', label: 'Buyer, owner, and investor support' },
        ]}
      />

      <SectionIntro
        eyebrow="Commercial Due Diligence"
        title={<>Know the building before <em className="italic text-teal">the building owns you.</em></>}
        paragraphs={[
          'Commercial properties carry different risks than homes: larger systems, heavier use, lease obligations, deferred maintenance, and transaction deadlines. The inspection gives you a grounded view of visible conditions before you negotiate, buy, lease, or plan repairs.',
          'We focus on practical findings: what is working, what needs attention, what may require a specialist, and what could affect budget or timeline. You get clear documentation without alarmism or vague boilerplate.',
        ]}
      />

      <section className="bg-paper py-24 px-5 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="section-eyebrow justify-center">Inspection Scope</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              Commercial systems, <em className="italic text-teal">reviewed with context.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SCOPE_ITEMS.map((item) => <ScopeCard key={item.title} {...item} />)}
          </div>
        </div>
      </section>

      <Deliverables
        title={<>A report built for <em className="italic text-amber">decision-making.</em></>}
        intro="Commercial inspection reports should help you act, not just archive observations. We organize findings so you can prioritize next steps."
        items={[
          { title: 'Property-specific scope', body: 'We define the inspection around the property type, accessible systems, transaction needs, and known concerns.' },
          { title: 'Clear condition summary', body: 'Major findings are documented with photos, plain-language notes, and recommended follow-up when needed.' },
          { title: 'Specialist guidance', body: 'When a condition needs deeper evaluation, we identify the right next professional: roofer, electrician, HVAC contractor, engineer, or environmental specialist.' },
          { title: 'Consultation after delivery', body: 'We walk through the report with you so the findings translate into negotiation, budgeting, or maintenance planning.' },
        ]}
      />

      <FAQ
        title={<>Commercial inspection <em className="italic text-teal">questions.</em></>}
        items={FAQ_ITEMS}
      />

      <CTABanner
        eyebrow="Commercial Quote"
        title={<>Planning a commercial purchase, lease, or investment?</>}
        description="Tell us about the property type, square footage, location, and timeline. We'll confirm scope and pricing before you schedule."
        primaryLabel="Request a Quote"
        primaryHref="/contact"
      />
    </>
  )
}
