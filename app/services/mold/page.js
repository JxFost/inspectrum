import Link from 'next/link'
import ServiceHero from '@/components/ServiceHero'
import SectionIntro from '@/components/SectionIntro'
import Deliverables from '@/components/Deliverables'
import FAQ from '@/components/FAQ'
import CTABanner from '@/components/CTABanner'
import { serviceJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'

export const metadata = {
  title: 'Mold Assessment & Moisture Mapping in Denver Metro',
  description:
    'Visual mold assessment with moisture mapping and thermal imaging. Same-day photo-rich report. Honest scope: we assess and refer — we never sell remediation. Serving Evergreen, Denver, Boulder.',
  alternates: { canonical: '/services/mold' },
  openGraph: {
    title: 'Mold Assessment — Inspectrum Inspections',
    description: 'Visual mold inspection plus moisture mapping. We assess; we don\'t sell remediation.',
    url: 'https://evergreeninspections.com/services/mold',
  },
}

const SIGNS = [
  { iconElement: (<><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>), title: 'Musty smell', body: 'If a room smells damp or earthy — especially basements, bathrooms, or closets — it often means hidden mold growth somewhere nearby.' },
  { iconElement: (<><path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" /><circle cx="12" cy="12" r="3" /></>), title: 'Visible discoloration', body: 'Black, green, or white spots on walls, ceilings, or grout. Even small visible patches can indicate larger growth behind the surface.' },
  { iconPath: 'M3 6l3-3 3 3v12l-3 3-3-3V6zM12 11h8v8h-8z', title: 'Past water damage', body: "Old leaks, flooding, or pipe bursts that weren't fully dried out can host mold for months or years before any visible signs appear." },
  { iconElement: (<><path d="M20 12H4M12 20V4" /><circle cx="12" cy="12" r="10" /></>), title: 'Health symptoms', body: 'Persistent allergies, sinus issues, or respiratory symptoms that improve when you leave the house can point to indoor air quality problems.' },
  { iconPath: 'M2 12s3-7 10-7 10 7 10 7M12 17v5', title: 'Buying an older home', body: 'Decades of small leaks and condensation events add up. A pre-purchase assessment is cheap insurance compared to surprise remediation later.' },
  { iconPath: 'M12 2L2 7v10l10 5 10-5V7l-10-5z', title: 'High humidity / poor ventilation', body: 'Crawlspaces with no vapor barriers, attics with poor airflow, or basements without dehumidifiers all create perfect conditions for growth.' },
]

const FAQ_ITEMS = [
  { q: 'Is all mold dangerous?', a: 'No — mold spores are everywhere, indoors and out, and most are harmless. The concern is when mold is actively growing inside the home, especially in concentrated amounts, and especially for people with allergies, asthma, or compromised immune systems. Active growth always indicates a moisture problem worth fixing regardless of species.' },
  { q: 'Do I need lab testing?', a: "Often, no. The EPA itself states that if mold is visible, lab testing usually isn't necessary — you already know it needs to be addressed. We focus on visual assessment and moisture mapping. If lab analysis is needed (e.g., for legal disputes or specific health concerns), we'll refer you to a certified testing lab." },
  { q: 'Can I add mold assessment to a full inspection?', a: (<p>Yes — and we recommend it for homes with basements, crawlspaces, or signs of past water damage. It pairs well with our <Link href="/services/full-inspection">full inspection</Link>, and we'll be on-site anyway. You save time and get all the findings together.</p>) },
  { q: 'What if you find mold?', a: "It depends on the extent. Small, localized growth on a hard surface (like grout) can often be cleaned with simple methods. Larger or hidden growth — especially on porous materials like drywall — typically requires professional remediation. Either way, we'll explain your options and refer you to qualified professionals." },
  { q: 'How is this different from radon testing?', a: (<p>They address completely different concerns. <Link href="/services/radon">Radon</Link> is an invisible gas detected only by 48-hour monitoring. Mold is visible (usually) and detected through inspection and moisture readings. Many homes benefit from both — they're complementary, not competing.</p>) },
  { q: 'Do you also test for meth residue?', a: (<p>Yes — meth residue testing is available as a specialized service for properties with concerns. Call us at <a href="tel:3036970990">(303) 697-0990</a> to discuss.</p>) },
]

const ZONE_KEYS = [
  '1. Attic insulation & sheathing',
  '2. Bathroom walls & ceilings',
  '3. Under sinks & behind appliances',
  '4. Basement walls & floors',
  '5. Crawlspace framing',
  '6. Window frames & sills',
]

function SignCard({ iconPath, iconElement, title, body }) {
  return (
    <div className="flex gap-6 items-start p-8 bg-paper rounded-sm border border-line">
      <div className="w-12 h-12 shrink-0 bg-amber text-white rounded-full flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          {iconPath ? <path d={iconPath} /> : iconElement}
        </svg>
      </div>
      <div>
        <h4 className="text-[1.2rem] mb-2 text-ink">{title}</h4>
        <p className="text-[0.95rem] text-charcoal leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function MoldHotZonesDiagram() {
  return (
    <svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[400px]">
      <rect x="0" y="350" width="760" height="50" fill="#8a6f4e" />
      <rect x="160" y="180" width="440" height="170" fill="#FAF7F1" stroke="#2B7E8C" strokeWidth="2.5" />
      <path d="M140 180 L380 60 L620 180 Z" fill="#2B7E8C" />
      <line x1="160" y1="240" x2="600" y2="240" stroke="#2B7E8C" strokeWidth="1.5" opacity="0.4" />
      <line x1="160" y1="295" x2="600" y2="295" stroke="#2B7E8C" strokeWidth="1.5" opacity="0.4" />
      <rect x="200" y="200" width="35" height="28" fill="#84b8c4" stroke="#2B7E8C" strokeWidth="1" />
      <rect x="525" y="200" width="35" height="28" fill="#84b8c4" stroke="#2B7E8C" strokeWidth="1" />
      <rect x="365" y="305" width="30" height="45" fill="#E89A3F" />
      <circle cx="380" cy="120" r="14" fill="#E89A3F" opacity="0.85" />
      <text x="380" y="125" textAnchor="middle" fontFamily="Fraunces" fontSize="13" fill="#fff" fontWeight="600">1</text>
      <text x="380" y="100" textAnchor="middle" fontFamily="Inter Tight" fontSize="11" fill="#143C44" fontWeight="600">ATTIC</text>
      <circle cx="240" cy="265" r="14" fill="#E89A3F" opacity="0.85" />
      <text x="240" y="270" textAnchor="middle" fontFamily="Fraunces" fontSize="13" fill="#fff" fontWeight="600">2</text>
      <text x="240" y="252" textAnchor="middle" fontFamily="Inter Tight" fontSize="10" fill="#143C44" fontWeight="600">BATH</text>
      <circle cx="500" cy="265" r="14" fill="#E89A3F" opacity="0.85" />
      <text x="500" y="270" textAnchor="middle" fontFamily="Fraunces" fontSize="13" fill="#fff" fontWeight="600">3</text>
      <text x="500" y="252" textAnchor="middle" fontFamily="Inter Tight" fontSize="10" fill="#143C44" fontWeight="600">KITCHEN</text>
      <circle cx="290" cy="325" r="14" fill="#E89A3F" opacity="0.85" />
      <text x="290" y="330" textAnchor="middle" fontFamily="Fraunces" fontSize="13" fill="#fff" fontWeight="600">4</text>
      <circle cx="470" cy="325" r="14" fill="#E89A3F" opacity="0.85" />
      <text x="470" y="330" textAnchor="middle" fontFamily="Fraunces" fontSize="13" fill="#fff" fontWeight="600">5</text>
      <text x="380" y="345" textAnchor="middle" fontFamily="Inter Tight" fontSize="10" fill="#143C44" fontWeight="600">BASEMENT / CRAWLSPACE</text>
      <circle cx="218" cy="215" r="10" fill="#E89A3F" opacity="0.6" />
      <circle cx="542" cy="215" r="10" fill="#E89A3F" opacity="0.6" />
      <text x="218" y="219" textAnchor="middle" fontFamily="Fraunces" fontSize="10" fill="#fff" fontWeight="600">6</text>
      <text x="542" y="219" textAnchor="middle" fontFamily="Fraunces" fontSize="10" fill="#fff" fontWeight="600">6</text>
    </svg>
  )
}

export default function MoldPage() {
  const schemas = [
    serviceJsonLd({ name: 'Mold Assessment', description: metadata.description, url: '/services/mold', price: '250' }),
    faqJsonLd(FAQ_ITEMS),
    breadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Services', url: '/#services' }, { name: 'Mold Assessment', url: '/services/mold' }]),
  ].filter(Boolean)

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ServiceHero
        variant="amber"
        eyebrow="Service · Health & Safety"
        title={<>Mold <em className="italic text-amber">Assessment.</em></>}
        description="Mold thrives wherever moisture lingers — and Colorado homes have plenty of hidden spots where it can take hold. We do thorough visual assessments with moisture mapping, so you know what's there before it spreads."
        primaryCTA={{ label: 'Schedule Mold Assessment', href: '/schedule' }}
        secondaryCTA={{ label: '(303) 697-0990', href: 'tel:3036970990' }}
        stats={[
          { num: '1–2', em: 'hrs', label: 'Typical assessment time' },
          { num: 'From', em: '$250', label: 'Add-on or standalone' },
          { num: 'Moisture', em: 'mapping', label: 'Thermal & meter readings' },
          { num: 'Same', em: 'day', label: 'Photo-documented report' },
        ]}
      />

      <SectionIntro
        eyebrow="Why Assess for Mold?"
        title={<>Where there's <em className="italic text-teal">moisture,</em><br />there's risk.</>}
        paragraphs={[
          "Mold is part of the natural environment, but inside your home it's a different story. Active mold growth signals a moisture problem — and where there's moisture in a home, there's often a structural or air-quality issue worth investigating.",
          'Our assessment combines visual inspection with moisture mapping to identify both visible mold and the conditions that allow it to grow. We document everything with photos and meter readings, so you know exactly where to focus.',
        ]}
      />

      <section className="bg-cream py-24 px-5 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="section-eyebrow justify-center">Warning Signs</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              When to <em className="italic text-teal">get assessed.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {SIGNS.map((s, i) => <SignCard key={i} {...s} />)}
          </div>
        </div>
      </section>

      <section className="bg-paper py-24 px-5 lg:px-8 text-center">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="section-eyebrow justify-center">Where We Look</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              Mold's <em className="italic text-teal">favorite hiding spots.</em>
            </h2>
          </div>
          <div className="max-w-[760px] mx-auto bg-cream p-8 rounded-sm border border-line">
            <MoldHotZonesDiagram />
          </div>
          <div className="flex justify-center gap-6 mt-6 flex-wrap">
            {ZONE_KEYS.map((k, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-charcoal">
                <div className="w-3.5 h-3.5 rounded-full bg-amber" />
                {k}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-24 px-5 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="section-eyebrow justify-center">Our Scope</div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
              Honest about <em className="italic text-teal">what we do.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-10 rounded-sm border border-line bg-paper">
              <h3 className="text-[1.5rem] mb-1.5 flex items-center gap-2.5 text-teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                What we do
              </h3>
              <p className="text-sm text-charcoal/70 italic mb-6">Visual assessment + moisture mapping</p>
              <ul className="list-none">
                {[
                  'Comprehensive visual inspection of all accessible areas',
                  'Moisture meter readings on suspect surfaces',
                  'Thermal imaging where moisture is suspected behind walls',
                  'Photo documentation of every finding',
                  'Identification of conditions favorable to mold growth',
                  'Plain-language report with prioritized recommendations',
                  'Referrals to qualified remediators if needed',
                ].map((it, i, arr) => (
                  <li key={i} className={`pl-6 py-2.5 relative text-[0.95rem] text-ink leading-snug ${i < arr.length - 1 ? 'border-b border-line' : ''} before:content-['✓'] before:absolute before:left-0 before:top-2 before:text-teal before:font-semibold`}>
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 rounded-sm border border-line border-dashed bg-cream">
              <h3 className="text-[1.5rem] mb-1.5 flex items-center gap-2.5 text-charcoal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M4.93 4.93l14.14 14.14" />
                </svg>
                What we don't do
              </h3>
              <p className="text-sm text-charcoal/70 italic mb-6">We refer out for these — your call</p>
              <ul className="list-none">
                {[
                  'Lab analysis of mold species (we refer to certified labs)',
                  'Air quality / spore count testing (specialty service)',
                  'Mold remediation or removal (conflict of interest)',
                  'Destructive testing (cutting into walls)',
                  'Selling you products to fix what we find',
                  "Inspecting areas that aren't safely accessible",
                ].map((it, i, arr) => (
                  <li key={i} className={`pl-6 py-2.5 relative text-[0.95rem] text-ink leading-snug ${i < arr.length - 1 ? 'border-b border-line' : ''} before:content-['—'] before:absolute before:left-0 before:top-2 before:text-charcoal before:opacity-50`}>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Deliverables
        title={<>Documentation. <em className="italic text-amber">Direction.</em></>}
        intro="A mold assessment isn't useful if you can't act on it. We focus on giving you everything you need to make informed decisions."
        items={[
          { title: 'Photo-rich written report', body: 'Every concern documented with photos, location notes, and moisture readings. Easy to share with remediators or buyers.' },
          { title: 'Source-of-moisture analysis', body: 'Mold is a symptom — moisture is the cause. We help you identify where the water is coming from so it can be fixed properly.' },
          { title: 'Severity-tiered recommendations', body: 'What needs immediate professional attention vs. what you can address with cleaning and ventilation. No fear-mongering, no upselling.' },
          { title: 'Independent referrals', body: "If remediation is needed, we'll point you to qualified, licensed companies — but we don't take referral fees, so the choice is yours." },
        ]}
      />

      <FAQ
        title={<>Mold, <em className="italic text-teal">without the panic.</em></>}
        items={FAQ_ITEMS}
      />

      <CTABanner
        eyebrow="Schedule Today"
        title={<>Find it before <em className="italic text-amber">it spreads.</em></>}
        description="Add a mold assessment to your full inspection or schedule one on its own."
        primaryLabel="Schedule Assessment"
      />
    </>
  )
}
