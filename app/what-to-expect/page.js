import ServiceHero from '@/components/ServiceHero'
import CTABanner from '@/components/CTABanner'
import { breadcrumbJsonLd } from '@/lib/jsonld'

export const metadata = {
  title: 'What to Expect From Your Home Inspection — Inspectrum Inspections',
  description:
    'A step-by-step look at the home inspection process — before, during, and after — so you know exactly what to expect from your Inspectrum inspection in Evergreen and the Denver metro.',
  alternates: { canonical: '/what-to-expect' },
  openGraph: {
    title: 'What to Expect From Your Home Inspection — Inspectrum Inspections',
    description: 'Before, during, and after — exactly how a home inspection works.',
    url: 'https://evergreeninspections.com/what-to-expect',
  },
}

const STAGES = [
  {
    id: 'before',
    label: 'Before',
    heading: 'Before the inspection',
    intro: 'Booking takes a couple of minutes, and a little prep makes the day go smoothly.',
    steps: [
      { h: 'Book and get your estimate', b: 'Schedule online and you’ll see a clear price up front based on the home’s size, age, and location, plus any add-ons like radon or a sewer scope.' },
      { h: 'Sign your agreement', b: 'You’ll get a simple digital inspection agreement to review and sign before the appointment — it only takes a minute.' },
      { h: 'Make sure there’s access', b: 'Utilities should be on, and the attic, crawlspace, electrical panel, furnace, and water heater should be reachable. Secure any pets.' },
      { h: 'Plan to join the end', b: 'You’re welcome the whole time, but the final walkthrough is the part you won’t want to miss.' },
    ],
  },
  {
    id: 'during',
    label: 'During',
    heading: 'During the inspection',
    intro: 'We work methodically through the home’s major systems — a visual, non-invasive evaluation of everything we can safely access.',
    steps: [
      { h: 'A top-to-bottom review', b: 'Structure and foundation, roof, exterior, electrical, plumbing, heating and cooling, insulation, and the interior — we check it all and document with photos.' },
      { h: 'How long it takes', b: 'Roughly an hour per 1,000 square feet, with a three-hour minimum. A typical home runs about three hours.' },
      { h: 'We note the context, not just the defect', b: 'Where something needs attention, we explain what it means and how urgent it is — not just that it exists.' },
      { h: 'Add-ons run alongside', b: 'If you added radon, the monitor is placed during the visit; a sewer scope is performed while we’re on site.' },
    ],
  },
  {
    id: 'after',
    label: 'After',
    heading: 'After the inspection',
    intro: 'You won’t wait days wondering — we wrap up in person and get your report to you fast.',
    steps: [
      { h: 'Walkthrough together', b: 'We finish by walking you through the key findings in plain English and answering every question on the spot.' },
      { h: 'Same-day report', b: 'In nearly every case you’ll have a detailed PDF the same day — photos, clear observations, and prioritized recommendations.' },
      { h: 'A consultation that doesn’t expire', b: 'Questions come up later, too. Your inspection includes a free phone consultation with no expiration — call anytime.' },
      { h: 'Make your decision with confidence', b: 'Whether you’re buying, selling, or maintaining, you’ll have the clear, unbiased picture you need to act.' },
    ],
  },
]

export default function WhatToExpectPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: '/' },
              { name: 'What to Expect', url: '/what-to-expect' },
            ]),
          ),
        }}
      />

      <ServiceHero
        variant="teal"
        eyebrow="The Process"
        title={<>What to expect, <em className="italic text-amber">start to finish.</em></>}
        description="A home inspection shouldn’t be a mystery. Here’s exactly how ours works — before, during, and after — so you know what you’re getting."
        primaryCTA={{ label: 'Schedule an Inspection', href: '/schedule' }}
      />

      <nav className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line">
        <div className="max-w-[1100px] mx-auto px-5 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <span className="hidden sm:block text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/40 font-semibold py-4 pr-3">Jump to</span>
          {STAGES.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="whitespace-nowrap py-4 px-3 text-sm font-medium text-charcoal/70 hover:text-teal border-b-2 border-transparent hover:border-teal transition-colors no-underline">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {STAGES.map((stage, idx) => (
        <section
          key={stage.id}
          id={stage.id}
          className={`${idx % 2 === 0 ? 'bg-paper' : 'bg-cream'} py-20 px-5 lg:px-8 border-t border-line scroll-mt-20`}
        >
          <div className="max-w-[1100px] mx-auto">
            <div className="section-eyebrow">{stage.label}</div>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-ink mb-3">{stage.heading}</h2>
            <p className="text-[0.98rem] text-charcoal leading-[1.75] mb-8 max-w-2xl">{stage.intro}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line rounded-sm overflow-hidden">
              {stage.steps.map((s) => (
                <div key={s.h} className="bg-paper p-6">
                  <h3 className="text-[1.05rem] text-ink font-semibold mb-1.5 flex items-start gap-2">
                    <span className="text-teal mt-0.5">✓</span> {s.h}
                  </h3>
                  <p className="text-[0.9rem] text-charcoal/80 leading-relaxed pl-6">{s.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <CTABanner
        eyebrow="Ready When You Are"
        title={<>Know exactly what you’re buying.</>}
        description="Book online in a couple of minutes and we’ll confirm by phone within a few hours."
        primaryLabel="Schedule an Inspection"
      />
    </>
  )
}
