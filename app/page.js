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

// ---- Service strip (marquee) ----
const MARQUEE_ITEMS = [
  'Radon Testing',
  'Roof Inspection',
  'Mold Detection',
  'Plumbing',
  'Electrical',
  'Pre-Listing',
  'New Construction',
]

// ---- Trust bar (4 columns under hero) ----
const TRUST_ITEMS = [
  {
    title: 'NACHI Certified',
    body: 'Licensed local inspector',
    iconPath: 'M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z',
  },
  {
    title: 'Same-Day Reports',
    body: 'Detailed PDF delivered',
    iconElement: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
  },
  {
    title: 'Free Consultation',
    body: 'Phone follow-up included',
    iconPath: 'M3 12l2-2 4 4 8-8 4 4-12 12-6-6z',
  },
  {
    title: 'Local to Evergreen',
    body: 'Serving Denver Metro',
    iconElement: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
]

// ---- Services grid ----
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

// ---- Process timeline (4 steps) ----
const PROCESS_STEPS = [
  { num: '01', title: 'Schedule', body: "Call or fill out the form. We'll find a time that works — often within 24-48 hours." },
  { num: '02', title: 'Inspect', body: 'We perform a complete analysis on-site. Plan on 1 hour per 1,000 sq ft, 3 hour minimum.' },
  { num: '03', title: 'Walk Through', body: 'You join us at the end so you can see every concern with your own eyes — not just on paper.' },
  { num: '04', title: 'Report & Consult', body: 'Same-day written report delivered, with a free phone consultation whenever you need it.' },
]

// ---- Testimonials ----
const TESTIMONIALS = [
  {
    quote:
      "Thorough doesn't begin to describe it. Harry caught issues two other inspectors had missed. The walk-through afterward was the most educational hour of my home-buying process.",
    author: 'Sarah K.',
    role: 'First-time buyer · Evergreen, CO',
  },
  {
    quote:
      'Twenty years of construction experience and it shows. He explained things in a way I actually understood — and the report was clear, photo-rich, and delivered same day.',
    author: 'Marcus B.',
    role: 'Investor · Lakewood, CO',
  },
  {
    quote:
      "We've used Inspectrum for three properties now. Always professional, always honest about what's a real problem versus what's normal wear. We won't go to anyone else.",
    author: 'Jennifer & Tom W.',
    role: 'Repeat clients · Golden, CO',
  },
]

// ---- Trust bar item subcomponent ----
function TrustItem({ title, body, iconPath, iconElement, isLast }) {
  return (
    <div className={`flex items-center gap-4 pr-8 ${!isLast ? 'border-r border-line' : ''}`}>
      <div className="w-12 h-12 shrink-0 bg-teal text-amber rounded-full flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[22px] h-[22px]">
          {iconPath ? <path d={iconPath} /> : iconElement}
        </svg>
      </div>
      <div>
        <h4 className="text-base text-ink font-semibold mb-0.5 font-sans">{title}</h4>
        <p className="text-[0.8rem] text-charcoal opacity-80">{body}</p>
      </div>
    </div>
  )
}

// ---- Service card subcomponent ----
function ServiceCard({ num, href, title, body, linkLabel, iconPath, iconElement }) {
  return (
    <Link
      href={href}
      className="group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-amber p-10 rounded-sm flex flex-col text-cream no-underline overflow-hidden transition-all hover:-translate-y-1"
    >
      {/* Tiny number tag in top-right (matches v2's :before) */}
      <span
        aria-hidden="true"
        className="absolute top-4 right-6 font-serif italic text-[0.85rem] text-amber/70"
      >
        {num}
      </span>
      <div className="w-14 h-14 rounded-full bg-amber text-white flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[26px] h-[26px]">
          {iconPath ? <path d={iconPath} /> : iconElement}
        </svg>
      </div>
      <h3 className="text-2xl mb-3 text-cream">{title}</h3>
      <p className="text-[0.95rem] opacity-78 leading-relaxed">{body}</p>
      <span className="mt-5 pt-5 border-t border-cream/10 text-[0.85rem] font-semibold text-amber transition-colors group-hover:text-cream">
        {linkLabel} →
      </span>
    </Link>
  )
}

export default function HomePage() {
  // Marquee track is doubled for seamless looping (matches v2)
  const marqueeTrack = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <>
      {/* ============ HERO ============ */}
      <header
        className="relative min-h-screen flex items-end pt-32 pb-16 px-5 lg:px-8 text-cream overflow-hidden"
        style={{
          background: `
            linear-gradient(180deg, rgba(20,60,68,0.45) 0%, rgba(20,60,68,0.85) 100%),
            url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2384b8c4'/%3E%3Cstop offset='0.4' stop-color='%23a8b8b6'/%3E%3Cstop offset='1' stop-color='%23e89a3f' stop-opacity='0.4'/%3E%3C/linearGradient%3E%3ClinearGradient id='m1' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%231f5c66'/%3E%3Cstop offset='1' stop-color='%23143c44'/%3E%3C/linearGradient%3E%3ClinearGradient id='m2' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%232b7e8c'/%3E%3Cstop offset='1' stop-color='%231f5c66'/%3E%3C/linearGradient%3E%3ClinearGradient id='m3' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%239da0a2' stop-opacity='0.6'/%3E%3Cstop offset='1' stop-color='%232b7e8c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='900' fill='url(%23sky)'/%3E%3Ccircle cx='1280' cy='180' r='70' fill='%23faf7f1' opacity='0.7'/%3E%3Cpath d='M0,650 L180,420 L320,520 L480,360 L620,480 L780,300 L920,460 L1080,340 L1240,500 L1400,380 L1600,520 L1600,900 L0,900 Z' fill='url(%23m3)' opacity='0.6'/%3E%3Cpath d='M0,720 L160,540 L300,620 L460,480 L620,580 L800,440 L960,560 L1120,460 L1280,580 L1440,500 L1600,600 L1600,900 L0,900 Z' fill='url(%23m2)' opacity='0.95'/%3E%3Cpath d='M0,800 L140,680 L280,720 L440,640 L600,700 L780,620 L940,680 L1100,620 L1260,700 L1420,640 L1600,700 L1600,900 L0,900 Z' fill='url(%23m1)'/%3E%3Cg opacity='0.5'%3E%3Cpath d='M150,800 L160,750 L170,800 Z M180,800 L195,740 L210,800 Z M220,800 L232,760 L244,800 Z' fill='%23143c44'/%3E%3Cpath d='M450,820 L462,770 L474,820 Z M490,820 L505,760 L520,820 Z M540,820 L552,780 L564,820 Z' fill='%23143c44'/%3E%3Cpath d='M850,840 L862,790 L874,840 Z M890,840 L905,780 L920,840 Z M940,840 L952,800 L964,840 Z' fill='%23143c44'/%3E%3Cpath d='M1250,830 L1262,780 L1274,830 Z M1290,830 L1305,770 L1320,830 Z M1340,830 L1352,790 L1364,830 Z' fill='%23143c44'/%3E%3C/g%3E%3C/svg%3E")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Grain overlay (matches v2's hero-grain) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.3'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-[1400px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-end">
          <div>
            <div className="hero-reveal hero-reveal-1 hero-eyebrow">Evergreen · Denver Metro · Since 2003</div>
            <h1 className="hero-reveal hero-reveal-2 text-[clamp(3rem,9vw,8.5rem)] font-medium mb-8 leading-[1.05] tracking-tight">
              A <em className="italic font-normal text-amber">better</em><br />
              inspection.<br />
              Top to bottom.
            </h1>
            <div className="hero-reveal hero-reveal-3 flex gap-10 items-center flex-wrap pt-8 border-t border-cream/[0.18]">
              <div className="text-sm opacity-85">
                <strong className="block font-serif text-[1.6rem] text-amber mb-1 font-medium">20+ yrs</strong>
                local experience
              </div>
              <div className="text-sm opacity-85">
                <strong className="block font-serif text-[1.6rem] text-amber mb-1 font-medium">NACHI</strong>
                certified inspector
              </div>
              <div className="text-sm opacity-85">
                <strong className="block font-serif text-[1.6rem] text-amber mb-1 font-medium">Same-Day</strong>
                detailed reports
              </div>
            </div>
          </div>

          <div className="hero-reveal hero-reveal-4 flex flex-col gap-3">
            <Button variant="primary" href="/schedule" withArrow>
              Schedule Inspection
            </Button>
            <Button variant="ghost" href="tel:3036970990" external withPhone>
              (303) 697-0990
            </Button>
          </div>
        </div>
      </header>

      {/* ============ MARQUEE ============ */}
      <div className="bg-teal-darker text-cream py-4 overflow-hidden border-y border-cream/10">
        <div className="flex gap-12 whitespace-nowrap font-serif italic text-[1.2rem] text-amber animate-marquee">
          {marqueeTrack.map((item, i) => (
            <span key={i} className="flex items-center gap-12">
              {item}
              <span className="text-cream/50 not-italic">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ TRUST BAR ============ */}
      <section className="bg-cream py-12 px-5 lg:px-8 border-b border-line">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 items-center">
          {TRUST_ITEMS.map((item, i) => (
            <TrustItem key={i} {...item} isLast={i === TRUST_ITEMS.length - 1} />
          ))}
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="bg-cream py-28 px-5 lg:px-8 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-12 lg:gap-24 items-start">
          <div>
            <div className="section-eyebrow">About Inspectrum</div>
            <h2 className="text-[clamp(2.4rem,5vw,4.2rem)] mb-8 text-ink">
              Two decades<br />of <em className="italic text-teal">welcoming<br />you home.</em>
            </h2>
            <div className="space-y-5 mb-10">
              <p className="text-[1.05rem] text-charcoal leading-[1.7]">
                Inspectrum was founded by Harry, a builder of 28 years before he ever picked up an inspection clipboard. That construction background means we don't just check boxes — we understand <em className="italic">why</em> a flashing fails, <em className="italic">how</em> a foundation settles, and <em className="italic">what</em> Colorado's climate does to a roof over time.
              </p>
              <p className="text-[1.05rem] text-charcoal leading-[1.7]">
                Every inspection is a complete and thorough analysis of every major system in the home. You'll walk through with us at the end, see what we saw, and get a free phone consultation any time after.
              </p>
            </div>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { num: '20', em: '+', label: 'Years Inspecting' },
                { num: '5,000', em: '+', label: 'Homes Inspected' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden bg-teal text-cream p-8 px-6 rounded-sm"
                >
                  {/* Amber circle accent (matches v2's stat-card::before) */}
                  <span
                    aria-hidden="true"
                    className="absolute top-0 right-0 w-20 h-20 bg-amber/15 rounded-full translate-x-[30%] -translate-y-[30%]"
                  />
                  <div className="font-serif text-[3rem] font-medium text-amber leading-none mb-2">
                    {stat.num}<em className="italic">{stat.em}</em>
                  </div>
                  <div className="text-[0.85rem] opacity-95 tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* About image card with quote */}
          <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
            <div
              className="absolute inset-0 flex flex-col justify-end p-8 text-cream"
              style={{
                background: `linear-gradient(180deg,rgba(20,60,68,0.1) 40%,rgba(20,60,68,0.95) 100%), url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Cdefs%3E%3ClinearGradient id='s' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2384b8c4'/%3E%3Cstop offset='0.5' stop-color='%23a8b8b6'/%3E%3Cstop offset='1' stop-color='%23e89a3f' stop-opacity='0.5'/%3E%3C/linearGradient%3E%3ClinearGradient id='t' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%232b7e8c'/%3E%3Cstop offset='1' stop-color='%23143c44'/%3E%3C/linearGradient%3E%3ClinearGradient id='t2' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%239da0a2'/%3E%3Cstop offset='1' stop-color='%232b7e8c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='500' fill='url(%23s)'/%3E%3Cpath d='M0,260 L60,180 L120,230 L180,160 L240,210 L300,140 L360,200 L400,180 L400,500 L0,500 Z' fill='url(%23t2)' opacity='0.7'/%3E%3Cpath d='M0,320 L60,220 L120,280 L180,200 L240,260 L300,180 L360,240 L400,220 L400,500 L0,500 Z' fill='url(%23t)' opacity='0.95'/%3E%3Cg opacity='0.7'%3E%3Cpath d='M40,400 L48,360 L56,400 Z' fill='%23143c44'/%3E%3Cpath d='M80,420 L92,370 L104,420 Z' fill='%23143c44'/%3E%3Cpath d='M180,440 L192,390 L204,440 Z' fill='%23143c44'/%3E%3Cpath d='M260,420 L272,370 L284,420 Z' fill='%23143c44'/%3E%3Cpath d='M320,440 L332,400 L344,440 Z' fill='%23143c44'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="font-serif italic text-[1.4rem] leading-[1.4] mb-4">
                "Knowledge is power. The more you know about your home, the more prepared you are."
              </div>
              <div className="font-semibold text-[0.95rem]">— Harry Foster, Founder &amp; Lead Inspector</div>
              <div className="text-[0.85rem] opacity-75">NACHI Certified · Denver Metro</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICES (dark teal background) ============ */}
      <section id="services" className="relative bg-teal-darker text-cream py-28 px-5 lg:px-8 overflow-hidden scroll-mt-24">
        {/* Soft amber glow in corner (matches v2's services::before) */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-[400px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(232,154,63,0.18), transparent 70%)' }}
        />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 items-end">
            <div>
              <div className="section-eyebrow">What We Inspect</div>
              <h2 className="text-[clamp(2.4rem,5vw,4.2rem)] text-cream">
                Thorough. Honest.<br /><em className="italic text-amber">Top to bottom.</em>
              </h2>
            </div>
            <p className="text-[1.1rem] opacity-85 leading-[1.7] max-w-md">
              Plan on roughly one hour per 1,000 sq ft, with a three-hour minimum. We don't rush. We don't skim. Need just one system checked? We offer à la carte hourly inspections too.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => <ServiceCard key={s.num} {...s} />)}
          </div>
        </div>
      </section>

      {/* ============ PROCESS (paper background, 4 connected cells) ============ */}
      <section id="process" className="bg-paper py-28 px-5 lg:px-8 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-[680px] mx-auto mb-16">
            <div className="section-eyebrow justify-center">How It Works</div>
            <h2 className="text-[clamp(2.4rem,5vw,4.2rem)] mb-4 text-ink">
              Four steps. <em className="italic text-teal">No surprises.</em>
            </h2>
            <p className="text-[1.1rem] text-charcoal leading-relaxed">
              From the call to the report, you'll always know exactly what's next.
            </p>
          </div>
          {/* Connected timeline grid (1px gap creates the divider lines) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.num}
                className="bg-paper hover:bg-cream p-10 transition-colors"
              >
                <div className="font-serif italic text-[0.85rem] text-amber mb-6 tracking-wider font-medium">
                  — Step {step.num}
                </div>
                <h4 className="text-[1.4rem] mb-3 text-ink">{step.title}</h4>
                <p className="text-[0.9rem] text-charcoal leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-cream py-28 px-5 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
            <div>
              <div className="section-eyebrow">Voices from the Front Range</div>
              <h2 className="text-[clamp(2.4rem,5vw,4.2rem)] text-ink max-w-[600px]">
                Trusted across<br /><em className="italic text-teal">Denver Metro.</em>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="relative bg-paper p-10 rounded-sm border-l-[3px] border-amber"
              >
                <div className="text-amber text-base mb-4 tracking-[0.15em]">★★★★★</div>
                <div className="font-serif italic text-[1.15rem] text-ink leading-[1.5] mb-6">
                  "{t.quote}"
                </div>
                <div className="font-semibold text-[0.95rem] text-ink">{t.author}</div>
                <div className="text-[0.85rem] text-charcoal opacity-80">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
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
