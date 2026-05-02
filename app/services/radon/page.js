import Link from 'next/link'
import ServiceHero from '@/components/ServiceHero'
import SectionIntro from '@/components/SectionIntro'
import Deliverables from '@/components/Deliverables'
import FAQ from '@/components/FAQ'
import CTABanner from '@/components/CTABanner'

export const metadata = {
  title: 'Radon Testing in Colorado — 48-Hour Continuous Monitor',
  description:
    'EPA-certified radon testing for Colorado homes. 48-hour continuous monitor with hourly readings and same-day results. Half of Colorado homes test above the action level. Serving Evergreen, Denver, Boulder.',
  alternates: { canonical: '/services/radon' },
  openGraph: {
    title: 'Radon Testing — Inspectrum Inspections',
    description: 'Half of Colorado homes test above the EPA action level. Find out where yours stands.',
    url: 'https://evergreeninspections.com/services/radon',
  },
}

const FAQ_ITEMS = [
  { q: 'How dangerous is radon, really?', a: "The EPA estimates radon causes about 21,000 lung cancer deaths per year in the U.S. — second only to smoking. Long-term exposure to elevated levels is the concern; brief exposure isn't an emergency. The good news is that it's highly testable and treatable." },
  { q: "What's the EPA action level?", a: "4.0 picocuries per liter (pCi/L). At or above that, the EPA recommends mitigation. Between 2.0 and 4.0 pCi/L, mitigation is encouraged but optional. Below 2.0 is considered low. Colorado's average is around 6.0 pCi/L — well above the action level." },
  { q: 'Can I add radon testing to a full inspection?', a: (<p>Absolutely — and most buyers do. We deploy the monitor at the start of the <Link href="/services/full-inspection">full home inspection</Link> and pick it up 48 hours later. It saves a trip and you get all the data together.</p>) },
  { q: 'What if my home tests high?', a: "Don't panic. Radon mitigation systems are well-established, reliable, and typically cost $1,500–$2,500 to install. Most reduce levels to well below the action threshold within days. We'll point you to qualified, licensed mitigators — and re-test after installation if you'd like." },
  { q: "Should I test even if I'm not buying or selling?", a: "Yes — the EPA recommends every home be tested every two years, even if previously tested low. Radon levels can change over time as soil settles, foundations crack, or HVAC patterns shift. It's cheap insurance for your family's health." },
  { q: 'Do you also test for mold?', a: (<p>Yes — see our <Link href="/services/mold">mold assessment service</Link>. Radon and mold are different concerns, but both are common in Colorado homes and both are worth checking.</p>) },
]

const STATS = [
  { num: '50%', label: 'of Colorado homes test above the EPA action level of 4 pCi/L' },
  { num: '2nd', label: 'leading cause of lung cancer in the United States, after smoking' },
  { num: 'Every 2 yrs', label: 'recommended testing frequency, even with a mitigation system' },
]

const STEPS = [
  { num: '01', title: 'Place the monitor', body: 'We deploy an EPA-certified continuous radon monitor in the lowest livable area of the home, following EPA protocols for placement and closed-house conditions.' },
  { num: '02', title: 'Wait 48 hours', body: 'The monitor records hourly readings around the clock. During that time, the home should remain under "closed house" conditions for accuracy. We handle the timing.' },
  { num: '03', title: 'Get your results', body: "We retrieve the monitor and produce a detailed report with hourly readings, average, and recommendations. If levels are elevated, we'll explain mitigation options." },
]

function RadonDiagram() {
  return (
    <svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[340px]">
      <rect width="760" height="180" fill="#e8eef0" />
      <rect x="0" y="180" width="760" height="160" fill="#8a6f4e" />
      <rect x="0" y="180" width="760" height="20" fill="#5a4a35" />
      <rect x="240" y="100" width="280" height="80" fill="#FAF7F1" stroke="#2B7E8C" strokeWidth="2" />
      <path d="M220 100 L380 30 L540 100 Z" fill="#2B7E8C" />
      <rect x="350" y="130" width="40" height="50" fill="#E89A3F" />
      <rect x="270" y="120" width="40" height="35" fill="#84b8c4" stroke="#2B7E8C" strokeWidth="1.5" />
      <rect x="450" y="120" width="40" height="35" fill="#84b8c4" stroke="#2B7E8C" strokeWidth="1.5" />
      <rect x="240" y="180" width="280" height="40" fill="#3D3F40" opacity="0.3" />
      <text x="380" y="205" textAnchor="middle" fontFamily="Fraunces" fontSize="13" fill="#1F2426" fontStyle="italic">Basement / Foundation</text>
      <path d="M280 190 L290 215 M340 195 L335 215 M420 188 L428 215 M480 195 L475 215" stroke="#E89A3F" strokeWidth="2" opacity="0.6" />
      <defs>
        <marker id="radonArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#E89A3F" />
        </marker>
      </defs>
      <g stroke="#E89A3F" strokeWidth="2" fill="none" opacity="0.85">
        <path d="M290 280 Q290 250 290 220" markerEnd="url(#radonArrow)" />
        <path d="M340 290 Q340 255 340 225" markerEnd="url(#radonArrow)" />
        <path d="M380 295 Q380 260 380 225" markerEnd="url(#radonArrow)" />
        <path d="M420 290 Q420 255 420 225" markerEnd="url(#radonArrow)" />
        <path d="M480 280 Q480 250 480 220" markerEnd="url(#radonArrow)" />
      </g>
      <text x="100" y="320" fontFamily="Inter Tight" fontSize="11" fill="#FAF7F1" fontWeight="600" letterSpacing="0.1em">SOIL · BEDROCK · UNDERGROUND WATER</text>
      <text x="380" y="70" textAnchor="middle" fontFamily="Fraunces" fontSize="14" fill="#143C44" fontStyle="italic">Radon accumulates inside</text>
      <g fill="#E89A3F" opacity="0.5">
        <circle cx="100" cy="240" r="2" />
        <circle cx="150" cy="270" r="2" />
        <circle cx="200" cy="250" r="2" />
        <circle cx="600" cy="245" r="2" />
        <circle cx="650" cy="270" r="2" />
        <circle cx="710" cy="255" r="2" />
        <circle cx="60" cy="280" r="2" />
        <circle cx="700" cy="295" r="2" />
      </g>
    </svg>
  )
}

export default function RadonPage() {
  return (
    <>
      <ServiceHero
        variant="dark"
        eyebrow="Service · Health & Safety"
        title={<>Radon <em className="italic text-amber">Testing.</em></>}
        description="Colorado has some of the highest radon levels in the country. It's odorless, colorless, and the second leading cause of lung cancer. Testing is the only way to know — and we make it simple."
        primaryCTA={{ label: 'Schedule Radon Test', href: '/schedule' }}
        secondaryCTA={{ label: '(303) 697-0990', href: 'tel:3036970990' }}
        stats={[
          { num: '48', em: 'hrs', label: 'Continuous monitor period' },
          { num: 'From', em: '$150', label: 'Add-on or standalone' },
          { num: 'EPA', em: 'certified', label: 'Calibrated equipment' },
          { num: 'On-site', em: 'results', label: 'Hourly readings included' },
        ]}
      />

      <section className="bg-paper py-16 px-5 lg:px-8 border-b border-line">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="font-serif text-[clamp(3rem,6vw,5rem)] font-medium text-teal leading-none mb-2">
                <em className="italic text-amber not-italic">{s.num}</em>
              </div>
              <div className="text-[0.95rem] text-charcoal max-w-[240px] mx-auto leading-snug">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionIntro
        eyebrow="What Is Radon?"
        title={<>Invisible. <em className="italic text-teal">Odorless.</em><br />Underfoot.</>}
        paragraphs={[
          "Radon is a naturally occurring radioactive gas that comes from the breakdown of uranium in soil, rock, and water. In Colorado's geology, it's everywhere — and it seeps up through foundations into homes, where it gets trapped and concentrates.",
          "You can't see it, smell it, or taste it. The only way to know your home's radon level is to test. The good news: testing is fast and inexpensive, and if elevated levels are found, mitigation systems are highly effective and reasonably priced.",
        ]}
      />

      <section className="bg-paper py-24 px-5 lg:px-8 text-center">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="section-eyebrow justify-center">How Radon Enters</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              It comes in <em className="italic text-teal">from below.</em>
            </h2>
          </div>
          <div className="max-w-[760px] mx-auto bg-cream p-8 rounded-sm border border-line">
            <RadonDiagram />
          </div>
        </div>
      </section>

      <section className="bg-cream py-24 px-5 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="section-eyebrow justify-center">How Testing Works</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              Three steps. <em className="italic text-teal">48 hours.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line mt-12">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-cream p-10">
                <div className="font-serif italic text-sm text-amber mb-5 font-medium tracking-wider">
                  — Step {step.num}
                </div>
                <h4 className="text-[1.4rem] mb-3 text-ink">{step.title}</h4>
                <p className="text-[0.95rem] text-charcoal leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Deliverables
        title={<>Real data. <em className="italic text-amber">Plain English.</em></>}
        intro="Radon results don't have to be cryptic. We give you the readings, what they mean, and what to do next — in language anyone can understand."
        items={[
          { title: 'Hourly readings, charted', body: 'See the radon level at every hour of the test period — not just an average. Patterns over time tell a more complete story.' },
          { title: 'Clear pass/action recommendation', body: "If your average is below 4.0 pCi/L, you're below the EPA action level. If it's above, we'll explain exactly what that means and what to do." },
          { title: 'Mitigation guidance, no upselling', body: "We don't sell mitigation systems, so our advice is unbiased. We'll point you to qualified, licensed mitigators in your area." },
          { title: 'Reusable for your records', body: "The report is yours to share with buyers, sellers, agents, or future inspectors. Keep it for your home's history." },
        ]}
      />

      <FAQ
        title={<>Radon, <em className="italic text-teal">explained.</em></>}
        items={FAQ_ITEMS}
      />

      <CTABanner
        eyebrow="Test With Confidence"
        title={<>Two days. <em className="italic text-amber">One healthier home.</em></>}
        description="Schedule a radon test on its own or as an add-on to your full inspection."
        primaryLabel="Schedule Radon Test"
      />
    </>
  )
}
