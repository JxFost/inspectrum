import Link from 'next/link'
import Button from '@/components/Button'
import CTABanner from '@/components/CTABanner'

// Page-specific metadata extends the defaults from layout.js
export const metadata = {
  title: 'Home Inspections in Evergreen, CO & Denver Metro',
  description:
    'NACHI-certified home inspections by Inspectrum Inspections — owner-operated, 20+ years of construction experience. Same-day reports for buyers in Evergreen, Denver, Boulder, and Colorado mountain communities.',
  alternates: { canonical: '/' },
}

const SERVICES = [
  {
    num: '01',
    href: '/services/full-inspection',
    title: 'Full Home Inspection',
    body: 'Complete walkthrough of every major system: structure, roof, electrical, plumbing, HVAC, exterior, and interior. Verbal walk-through included.',
    linkLabel: 'Learn more',
    iconPath: 'M3 21h18M5 21V8l7-5 7 5v13M9 9h6M9 13h6M9 17h6',
  },
  {
    num: '02',
    href: '/services/full-inspection',
    title: 'Roof & Exterior',
    body: 'Shingles, flashings, chimneys, vents, trim, gutters, drip edges, skylights, downspouts. Siding, windows, doors, and entryways.',
    linkLabel: 'Included in full',
    iconPath: 'M2 12l10-9 10 9M5 12v9h14v-9M9 21V14h6v7',
  },
  {
    num: '03',
    href: '/services/radon',
    title: 'Radon Testing',
    body: 'Continuous monitor radon testing with results processed on-site — protecting what matters most, the air your family breathes.',
    linkLabel: 'Learn more',
    iconElement: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M22 12h-4M6 12H2M19 5l-3 3M8 16l-3 3M19 19l-3-3M8 8L5 5" />
      </>
    ),
  },
  {
    num: '04',
    href: '/services/full-inspection',
    title: 'Plumbing & Electrical',
    body: 'From service panels to fixture leaks. We look for grounding issues, GFCI/AFCI compliance, water pressure, and warning signs of trouble.',
    linkLabel: 'Included in full',
    iconPath: 'M3 6l3-3 3 3v12l-3 3-3-3V6zM12 11h8v8h-8zM12 4h8v4h-8z',
  },
  {
    num: '05',
    href: '/services/mold',
    title: 'Mold & Meth Testing',
    body: 'Visual mold inspection with moisture mapping. Methamphetamine residue testing also available for properties with concerns.',
    linkLabel: 'Learn more',
    iconPath: 'M12 2C8 6 6 10 6 14a6 6 0 0 0 12 0c0-4-2-8-6-12z',
  },
  {
    num: '06',
    href: '/contact',
    title: 'À La Carte',
    body: 'Just need one system checked? Hourly inspections available — pre-listing, new construction warranty walkthroughs, builder follow-ups.',
    linkLabel: 'Get a quote',
    iconPath: 'M12 2v20M2 12h20M5 5l14 14M19 5L5 19',
  },
]

const PROCESS_STEPS = [
  { num: '01', title: 'Schedule online or by phone', body: 'Pick a date and time that works for you. Most appointments confirmed within hours.' },
  { num: '02', title: 'On-site inspection', body: 'Plan on 3–4 hours. Bring questions. Watch what we do — every concern gets photographed.' },
  { num: '03', title: 'Walkthrough together', body: "After the inspection, we walk the property with you so you see every issue with your own eyes." },
  { num: '04', title: 'Same-day digital report', body: 'A photo-rich PDF lands in your inbox the same day. Easy to share with your realtor.' },
  { num: '05', title: 'Free follow-up consult', body: 'Have a question two months later? Two years later? Call any time. The consultation never expires.' },
]

function ServiceCard({ num, href, title, body, linkLabel, iconPath, iconElement }) {
  return (
    <Link
      href={href}
      data-num={num}
      className="group relative bg-teal-darker p-10 rounded-sm flex flex-col text-cream no-underline overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(20,60,68,0.2)]"
    >
      <div
        aria-hidden="true"
        className="absolute top-6 right-6 font-serif italic font-light text-[3.5rem] text-amber/15 leading-none"
      >
        {num}
      </div>
      <div className="w-12 h-12 rounded-full bg-amber/20 text-amber flex items-center justify-center mb-6 relative z-10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          {iconPath ? <path d={iconPath} /> : iconElement}
        </svg>
      </div>
      <h3 className="text-2xl mb-3 text-cream relative z-10">{title}</h3>
      <p className="text-[0.95rem] opacity-78 leading-relaxed relative z-10">{body}</p>
      <span className="mt-5 pt-5 border-t border-cream/10 text-sm font-semibold text-amber transition-colors group-hover:text-cream">
        {linkLabel} →
      </span>
    </Link>
  )
}

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <header
        className="relative pt-36 pb-20 px-5 lg:px-8 min-h-[90vh] flex items-center text-cream overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, rgba(20,60,68,0.92) 0%, rgba(31,92,102,0.85) 100%),
            url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%23143C44'/%3E%3Cstop offset='1' stop-color='%231F5C66'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='900' fill='url(%23sky)'/%3E%3Cpath d='M0,650 L180,420 L320,540 L480,360 L640,500 L800,320 L960,480 L1120,340 L1280,460 L1440,360 L1600,440 L1600,900 L0,900 Z' fill='%231F5C66' opacity='0.6'/%3E%3Cpath d='M0,720 L160,560 L340,640 L500,500 L660,600 L820,460 L980,580 L1140,460 L1300,580 L1460,500 L1600,560 L1600,900 L0,900 Z' fill='%232B7E8C' opacity='0.5'/%3E%3C/svg%3E")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-16 items-center relative z-10">
          <div>
            <div className="hero-eyebrow">Evergreen · Denver Metro · Boulder</div>
            <h1 className="text-[clamp(3rem,7.5vw,6.5rem)] font-medium mb-6 leading-[0.95]">
              A better<br />
              <em className="italic text-amber">inspection.</em>
            </h1>
            <p className="text-xl opacity-90 max-w-xl mb-8 leading-relaxed">
              NACHI-certified, owner-operated home inspections built on 20+ years of Colorado construction experience. Every home, every inch — checked carefully, explained plainly.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-baseline gap-2">
                <strong className="font-serif text-amber text-2xl">20+</strong>
                <span className="opacity-80">years experience</span>
              </div>
              <div className="flex items-baseline gap-2">
                <strong className="font-serif text-amber text-2xl">NACHI</strong>
                <span className="opacity-80">certified</span>
              </div>
              <div className="flex items-baseline gap-2">
                <strong className="font-serif text-amber text-2xl">Same-Day</strong>
                <span className="opacity-80">detailed reports</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:items-stretch">
            <Button variant="primary" href="/schedule" withArrow className="!justify-start">
              Schedule Inspection
            </Button>
            <Button variant="ghost" href="tel:3036970990" external withPhone className="!justify-start">
              (303) 697-0990
            </Button>
          </div>
        </div>
      </header>

      {/* ABOUT */}
      <section id="about" className="bg-cream py-24 px-5 lg:px-8 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
          <div>
            <div className="section-eyebrow">About Inspectrum</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              Built by a <em className="italic text-teal">builder.</em>
            </h2>
          </div>
          <div className="space-y-5">
            <p className="text-[1.1rem] text-charcoal leading-relaxed">
              Inspectrum was founded by Harry Foster after more than two decades in residential construction. He started inspecting homes for one simple reason: too many buyers were getting reports they couldn't understand from inspectors who'd never built a thing.
            </p>
            <p className="text-[1.1rem] text-charcoal leading-relaxed">
              Today we're a small, owner-operated outfit serving the Denver metro, Boulder, Fort Collins, and the mountain communities west of the city. We're NACHI certified, fully insured, and members of the Evergreen Chamber of Commerce — but more importantly, we're people who like houses and like helping people understand them.
            </p>
            <p className="text-[1.1rem] text-charcoal leading-relaxed">
              When you hire us, you get the actual inspector on the phone. No call centers. No subcontractors. Just a careful look at the home you're about to bet your life on.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-paper py-24 px-5 lg:px-8 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="section-eyebrow justify-center">What We Inspect</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              The full <em className="italic text-teal">spectrum.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => <ServiceCard key={s.num} {...s} />)}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="bg-cream py-24 px-5 lg:px-8 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="section-eyebrow justify-center">How It Works</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              Five steps. <em className="italic text-teal">No surprises.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {PROCESS_STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="font-serif italic text-[3rem] text-amber/40 leading-none mb-4 font-medium">
                  {step.num}
                </div>
                <h4 className="text-[1.15rem] mb-3 text-ink">{step.title}</h4>
                <p className="text-[0.95rem] text-charcoal leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="Ready When You Are"
        title={<>Buying soon? <em className="italic text-amber">Let's get you ready.</em></>}
        description="Schedule your inspection today and walk into closing with confidence — and a flashlight's worth of insight into your future home."
        primaryLabel="Book Your Inspection"
        secondaryLabel="Call (303) 697-0990"
      />
    </>
  )
}
