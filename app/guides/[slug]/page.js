import { notFound } from 'next/navigation'
import ServiceHero from '@/components/ServiceHero'
import CTABanner from '@/components/CTABanner'
import MoreReading from '@/components/MoreReading'
import { SYSTEM_GUIDES, GUIDE_SLUGS } from '@/lib/guides'
import { breadcrumbJsonLd } from '@/lib/jsonld'

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const guide = SYSTEM_GUIDES[slug]
  if (!guide) return {}
  return {
    title: `${guide.title} — Inspectrum Inspections`,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: `${guide.title} — Inspectrum Inspections`,
      description: guide.metaDescription,
      url: `https://evergreeninspections.com/guides/${slug}`,
    },
  }
}

function PhotoPlaceholder({ caption }) {
  return (
    <div className="relative w-full aspect-[16/10] rounded-sm border border-line bg-gradient-to-br from-cream to-paper overflow-hidden flex flex-col items-center justify-center text-center px-6">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-9 h-9 text-charcoal/25 mb-3">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M8 5l1.5-2h5L16 5" />
      </svg>
      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-charcoal/40 font-semibold">{caption}</span>
    </div>
  )
}

export default async function GuidePage({ params }) {
  const { slug } = await params
  const guide = SYSTEM_GUIDES[slug]
  if (!guide) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: '/' },
              { name: 'Guides', url: '/guides' },
              { name: guide.heroTitle, url: `/guides/${slug}` },
            ]),
          ),
        }}
      />

      <ServiceHero
        variant="teal"
        eyebrow={guide.eyebrow}
        title={<>{guide.heroTitle}<em className="italic text-amber">.</em></>}
        description={guide.heroLead}
        primaryCTA={{ label: 'Book an Inspection', href: '/schedule' }}
      />

      {/* Sticky section sub-nav */}
      <nav className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line">
        <div className="max-w-[1100px] mx-auto px-5 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <span className="hidden sm:block text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/40 font-semibold py-4 pr-3">Jump to</span>
          {guide.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="whitespace-nowrap py-4 px-3 text-sm font-medium text-charcoal/70 hover:text-teal border-b-2 border-transparent hover:border-teal transition-colors no-underline">
              {s.name}
            </a>
          ))}
        </div>
      </nav>

      {guide.sections.map((section, idx) => (
        <section
          key={section.id}
          id={section.id}
          className={`${idx % 2 === 0 ? 'bg-paper' : 'bg-cream'} py-20 px-5 lg:px-8 border-t border-line scroll-mt-20`}
        >
          <div className="max-w-[1100px] mx-auto">
            <div className="section-eyebrow">{section.name}</div>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-ink mb-3">{section.heading}</h2>
            {section.intro && <p className="text-[0.98rem] text-charcoal leading-[1.75] mb-8 max-w-2xl">{section.intro}</p>}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-14 items-start">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line rounded-sm overflow-hidden">
                {section.items.map((it) => (
                  <div key={it.h} className="bg-paper p-6">
                    <h3 className="text-[1.05rem] text-ink font-semibold mb-1.5 flex items-start gap-2">
                      <span className="text-teal mt-0.5">✓</span> {it.h}
                    </h3>
                    <p className="text-[0.9rem] text-charcoal/80 leading-relaxed pl-6">{it.b}</p>
                  </div>
                ))}
              </div>
              {idx === 0 && (
                <div className="w-full lg:w-80 shrink-0">
                  {guide.imageKeywords ? (
                    <div className="relative w-full aspect-[16/10] rounded-sm border border-line overflow-hidden bg-paper">
                      {/* Temporary keyword-matched placeholder photo; swap for /public/guides/* later. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://loremflickr.com/800/500/${encodeURIComponent(guide.imageKeywords)}`}
                        alt={guide.imageAlt || `${guide.heroTitle} inspection`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <PhotoPlaceholder caption={`Photo: ${guide.heroTitle.toLowerCase()} inspection`} />
                  )}
                </div>
              )}
            </div>

            {section.footnote && (
              <p className="text-sm text-charcoal/60 mt-6 italic">{section.footnote}</p>
            )}
          </div>
        </section>
      ))}

      {/* Licensed-pro disclaimer */}
      <section className="bg-cream py-12 px-5 lg:px-8 border-t border-line">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-start gap-3 bg-amber/[0.08] border border-amber/30 rounded-sm p-5">
            <span className="text-amber-deep text-lg leading-none mt-0.5">⚠</span>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              <strong className="text-ink">This guide is for general education.</strong> It reflects what we look for during a home inspection, not a substitute for a licensed professional. If you have a specific concern, please contact {guide.proType} — and of course, we’re always happy to take a look during an inspection.
            </p>
          </div>

          {guide.related?.length > 0 && (
            <div className="mt-8">
              <div className="text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/50 font-semibold mb-3">Keep reading</div>
              <div className="flex flex-wrap gap-2">
                {guide.related.map((r) => (
                  <a key={r.href} href={r.href} className="px-4 py-2 rounded-sm border border-line bg-paper text-sm text-ink no-underline hover:border-teal hover:text-teal transition-colors">
                    {r.label} →
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <MoreReading currentHref={`/guides/${slug}`} />

      <CTABanner
        eyebrow="A Second Set of Eyes"
        title={<>Concerned about your {guide.heroTitle.toLowerCase()}?</>}
        description="We’ll give your home a thorough, plain-English inspection and flag anything worth a closer look."
        primaryLabel="Schedule an Inspection"
      />
    </>
  )
}
