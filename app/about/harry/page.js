import CTABanner from '@/components/CTABanner'

export const metadata = {
  title: 'Meet Harry Foster — Inspectrum Inspections',
  description:
    'Harry Foster is the founder and lead inspector at Inspectrum Inspections. With 28 years of construction experience and 20+ years of home inspections, he brings unmatched knowledge to every inspection along the Front Range.',
  alternates: { canonical: '/about/harry' },
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://evergreeninspections.com/about/harry#person',
  name: 'Harry Foster',
  givenName: 'Harry',
  familyName: 'Foster',
  jobTitle: 'Lead Inspector & Founder',
  url: 'https://evergreeninspections.com/about/harry',
  image: 'https://evergreeninspections.com/harry-foster.jpg',
  description:
    'Founder and lead inspector at Inspectrum Inspections with 28+ years of construction experience and 20+ years conducting home inspections across Colorado\'s Front Range.',
  worksFor: {
    '@type': 'HomeAndConstructionBusiness',
    '@id': 'https://evergreeninspections.com#business',
    name: 'Inspectrum Inspections',
  },
  knowsAbout: [
    'Home Inspection', 'Construction', 'Radon Testing', 'Mold Assessment',
    'Colorado Real Estate', 'Mountain Home Construction', 'Foundation Assessment', 'Roof Inspection',
  ],
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Professional Certification',
      name: 'NACHI Certified Professional Inspector (CPI)',
      recognizedBy: { '@type': 'Organization', name: 'International Association of Certified Home Inspectors', url: 'https://www.nachi.org' },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Professional Certification',
      name: 'EPA-Certified Radon Measurement Provider',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'State License',
      name: 'Colorado Certified Home Inspector',
    },
  ],
  sameAs: [
    'https://www.linkedin.com/company/inspectrum-evergreen-co',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Evergreen',
    addressRegion: 'CO',
    addressCountry: 'US',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://evergreeninspections.com/' },
    { '@type': 'ListItem', position: 2, name: 'Meet Harry Foster', item: 'https://evergreeninspections.com/about/harry' },
  ],
}

const CERTIFICATIONS = [
  'NACHI Certified Professional Inspector (CPI)',
  'InterNACHI Member',
  'Colorado Certified Home Inspector',
  'EPA-Certified Radon Measurement Provider',
  'Evergreen Chamber of Commerce Member',
]

const STATS = [
  { num: '28', suffix: '+', label: 'Years in Construction' },
  { num: '20', suffix: '+', label: 'Years Inspecting' },
  { num: '5,000', suffix: '+', label: 'Homes Inspected' },
]

const SPECIALTIES = [
  'Mountain & Foothills Properties',
  'Historic & Older Homes',
  'New Construction',
  'Multi-Family & Investment Properties',
  'Radon Testing',
  'Mold Assessment',
  'Pre-Listing Inspections',
  'Sewer Scope Coordination',
]

export default function HarryBioPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Hero */}
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-16 px-5 lg:px-8">
        <div className="max-w-[900px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16 items-center">
          {/* Photo placeholder — replace src with real photo */}
          <div className="mx-auto lg:mx-0 w-56 h-56 lg:w-72 lg:h-72 rounded-full overflow-hidden border-4 border-teal-darker relative">
            <img src="/harry-foster.jpg" alt="Harry Foster — Founder & Lead Inspector at Inspectrum Inspections" className="w-full h-full object-cover grayscale-[60%]" loading="lazy" />
            <div className="absolute inset-0 bg-teal/20 mix-blend-overlay rounded-full" />
          </div>
          <div>
            <div className="hero-eyebrow justify-start">Meet Your Inspector</div>
            <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] mb-4">Harry <em className="italic text-amber">Foster</em></h1>
            <p className="text-lg opacity-90 mb-2">Founder & Lead Inspector</p>
            <p className="text-base opacity-70 mb-6">Inspectrum Inspections · Evergreen, CO</p>
            <div className="flex items-center gap-4">
              <a href="https://www.linkedin.com/company/inspectrum-evergreen-co" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-cream/60 hover:text-amber transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.google.com/maps/place/?q=place_id:ChIJXa9tHz2ea4cRMNSWwUIwbLk" target="_blank" rel="noopener noreferrer" aria-label="Google Business" className="text-cream/60 hover:text-amber transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              </a>
              <a href="tel:3036970990" className="text-cream/60 hover:text-amber transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
              </a>
              <a href="mailto:harry@evergreeninspections.com" className="text-cream/60 hover:text-amber transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Bio content */}
      <section className="bg-cream py-20 px-5 lg:px-8">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] text-ink mb-8">
            A builder first, <em className="italic text-teal">inspector always.</em>
          </h2>
          <div className="space-y-5 text-[1.05rem] text-charcoal leading-[1.7] mb-12">
            <p>
              Before Harry ever became an inspector, he spent 28 years immersed in every aspect of construction—framing homes, running crews, and gaining a firsthand understanding of how houses are built, lived in, and where things can go wrong. When he moved to Colorado, he brought this deep-rooted building expertise with him to the foothills, working on and around homes throughout mountain communities. Eventually, he channeled his experience into inspections full time, combining his builder’s eye with a passion for helping people make informed decisions.

            </p>
            <p>
              That hands-on building experience is what sets an Inspectrum inspection apart. Harry doesn't just identify problems — he understands <em className="italic">why</em> a flashing fails, <em className="italic">how</em> a foundation settles in Colorado's expansive clay soils, and <em className="italic">what</em> our freeze-thaw cycles do to a roof over time.
            </p>
            <p>
              Based in Evergreen, Harry serves the entire Front Range — from mountain communities like Conifer, Bailey, and Idaho Springs to Denver, Golden, Lakewood, and Boulder. He's inspected everything from 100-year-old mountain cabins to brand-new custom builds, and he treats every inspection with the same thoroughness.
            </p>
            <p>
              Every inspection ends with a walkthrough where Harry shows you exactly what he found, explains what matters and what doesn't, and makes sure you leave with the knowledge to make a confident decision. His same-day reports are detailed, photo-rich, and written in plain language — no jargon, no guesswork.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="relative overflow-hidden bg-teal text-cream p-8 rounded-sm text-center">
                <span aria-hidden="true" className="absolute top-0 right-0 w-20 h-20 bg-amber/15 rounded-full translate-x-[30%] -translate-y-[30%]" />
                <div className="font-serif text-[2.8rem] font-medium text-amber leading-none mb-2">
                  {stat.num}<em className="italic">{stat.suffix}</em>
                </div>
                <div className="text-[0.85rem] opacity-95 tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Two columns: Certifications + Specialties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            <div>
              <h3 className="text-lg font-serif text-ink mb-4 pb-2 border-b border-line">Certifications</h3>
              <ul className="space-y-3">
                {CERTIFICATIONS.map((cert) => (
                  <li key={cert} className="flex items-start gap-3 text-[0.95rem] text-charcoal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber shrink-0 mt-0.5"><path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" /><path d="M9 12l2 2 4-4" /></svg>
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-serif text-ink mb-4 pb-2 border-b border-line">Specialties</h3>
              <ul className="space-y-3">
                {SPECIALTIES.map((spec) => (
                  <li key={spec} className="flex items-start gap-3 text-[0.95rem] text-charcoal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-teal shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12" /></svg>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quote */}
          <div className="bg-paper border-l-[3px] border-amber p-8 rounded-sm mb-8">
            <div className="font-serif italic text-[1.2rem] text-ink leading-[1.5] mb-4">
              &ldquo;Knowledge is power. The more you know about your home, the more prepared you are. My job is to give you that knowledge — honestly, thoroughly, and in a way you can actually understand.&rdquo;
            </div>
            <div className="font-semibold text-[0.95rem] text-ink">— Harry Foster</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        eyebrow="Ready to Book?"
        title={<>Let Harry inspect <em className="italic text-amber">your next home.</em></>}
        description="Schedule online in minutes — or call to talk through your inspection needs."
        primaryLabel="Book Your Inspection"
        secondaryLabel="Call (303) 697-0990"
      />
    </>
  )
}
