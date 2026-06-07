import ServiceHero from '@/components/ServiceHero'
import CTABanner from '@/components/CTABanner'
import FAQ from '@/components/FAQ'

export const metadata = {
  title: 'Home Inspection FAQ — Inspectrum Inspections, Evergreen CO',
  description:
    'Answers to common home-inspection questions: cost, how long it takes, what’s included, attending, radon, sewer scope, pre-listing, and service area across the Front Range.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Home Inspection FAQ — Inspectrum Inspections',
    description: 'Cost, timing, what’s included, and how it works — answered plainly.',
    url: 'https://evergreeninspections.com/faq',
  },
}

const FAQ_ITEMS = [
  { q: 'How much does a home inspection cost?', a: 'A full home inspection starts at $450. The exact price depends on square footage, the age of the home, and location, since larger and older homes take longer to inspect thoroughly. You’ll see a clear estimate when you book online, and add-ons like radon testing or a sewer scope are priced up front — no surprises.' },
  { q: 'How long does an inspection take?', a: 'Plan on roughly one hour per 1,000 square feet, with a three-hour minimum. A typical 2,500 sq ft home takes about three hours, plus a 20–30 minute walkthrough at the end to go over what we found.' },
  { q: 'When will I get my report?', a: 'Same day in nearly every case. You’ll get a detailed PDF with photos, clear observations, and prioritized recommendations — written in plain English, not inspector jargon.' },
  { q: 'What does a home inspection include?', a: 'We examine all the major accessible systems: structure and foundation, roof, exterior, electrical, plumbing, heating and cooling, insulation and ventilation, and the interior. It’s a visual, non-invasive inspection of what we can safely access.' },
  { q: 'What isn’t included in a standard inspection?', a: 'A home inspection doesn’t open walls or move belongings, isn’t a code-compliance review, and doesn’t cover specialty systems that need their own inspection — like a sewer line (we offer a sewer scope add-on), a private well’s water quality, or a detailed chimney/flue evaluation. We’ll always tell you when something is beyond the scope and worth a specialist.' },
  { q: 'Should I attend the inspection?', a: 'Absolutely — we encourage it. You don’t need to be there the whole time, but joining for the final walkthrough is the best way to understand the home. We’ll show you what we found in person and answer every question.' },
  { q: 'Do you test for radon?', a: 'Yes. We use a 48-hour continuous monitor and deliver same-day results, starting at $150. About half of Colorado homes test above the EPA action level, so it’s well worth doing — and it can be added right onto a full inspection.' },
  { q: 'Do you offer a sewer scope?', a: 'Yes, as an add-on. We run a camera down the main sewer line to check for blockages, root intrusion, bellies, and damage — issues that are invisible during a standard inspection but expensive to fix.' },
  { q: 'Are home inspectors licensed in Colorado?', a: 'Colorado doesn’t currently license home inspectors, which makes credentials and experience especially important. Inspectrum is NACHI-certified and brings decades of hands-on construction experience to every inspection.' },
  { q: 'Do you offer pre-listing inspections for sellers?', a: 'Yes. A pre-listing inspection lets you find and address issues before buyers do, so there are fewer surprises in negotiation. It’s the same thorough inspection a buyer would get.' },
  { q: 'What if the inspection finds problems?', a: 'Most inspections turn up something — that’s normal and usually not a deal-breaker. Our job is to report what we find objectively and explain what matters most, so you can make an informed decision or negotiate from a position of knowledge.' },
  { q: 'How do I prepare my home for an inspection?', a: 'Make sure all utilities are on, and provide clear access to the attic, crawlspace, electrical panel, furnace, water heater, and any access points. Secure pets, and if the home is occupied, plan to be away during the inspection itself.' },
  { q: 'What areas do you serve?', a: 'We serve Evergreen, the Denver metro, and the surrounding Front Range and foothills — including Conifer, Morrison, Bailey, Golden, Idaho Springs, Lakewood, Littleton, Arvada, and nearby communities.' },
  { q: 'How do I schedule?', a: 'Book online at evergreeninspections.com/schedule or call (303) 697-0990. You’ll usually get a confirmation within a few hours.' },
]

export default function FAQPage() {
  return (
    <>
      <ServiceHero
        variant="teal"
        eyebrow="Common Questions"
        title={<>Home inspection, <em className="italic text-amber">answered.</em></>}
        description="Straight answers about cost, timing, what’s covered, and how the whole thing works — no jargon."
        primaryCTA={{ label: 'Schedule an Inspection', href: '/schedule' }}
      />

      <FAQ title={<>Frequently asked <em className="italic text-teal">questions.</em></>} items={FAQ_ITEMS} />

      <CTABanner
        eyebrow="Still Have Questions?"
        title={<>We’re happy to help.</>}
        description="Call us, send a message, or just book — every inspection includes a free phone consultation."
        primaryLabel="Schedule Online"
      />
    </>
  )
}
