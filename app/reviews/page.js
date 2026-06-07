import ServiceHero from '@/components/ServiceHero'
import CTABanner from '@/components/CTABanner'
import { TESTIMONIALS, GOOGLE_REVIEWS_URL } from '@/lib/testimonials'

export const metadata = {
  title: 'Reviews — Inspectrum Inspections, Evergreen CO',
  description:
    'What homeowners and real estate agents across the Front Range say about Inspectrum Inspections — thorough, knowledgeable, and professional home inspections.',
  alternates: { canonical: '/reviews' },
  openGraph: {
    title: 'Reviews — Inspectrum Inspections',
    description: 'Voices from the Front Range on Inspectrum Inspections.',
    url: 'https://evergreeninspections.com/reviews',
  },
}

export default function ReviewsPage() {
  return (
    <>
      <ServiceHero
        variant="teal"
        eyebrow="Voices from the Front Range"
        title={<>What our clients <em className="italic text-amber">say.</em></>}
        description="Homeowners, buyers, and agents across Evergreen and the Denver metro trust Inspectrum for thorough, plain-English inspections. Here’s what they have to say."
        primaryCTA={{ label: 'Schedule an Inspection', href: '/schedule' }}
      />

      <section className="bg-cream py-20 px-5 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-end mb-8">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal font-semibold text-[0.95rem] hover:underline"
            >
              See all reviews on Google
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <a
                key={i}
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative bg-paper p-10 rounded-sm border-l-[3px] border-amber no-underline hover:-translate-y-1 transition-transform"
              >
                <div className="text-amber text-base mb-4 tracking-[0.15em]">
                  {'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}
                </div>
                <div className="font-serif italic text-[1.15rem] text-ink leading-[1.5] mb-6">
                  &ldquo;{t.quote}&rdquo;
                </div>
                <div className="font-semibold text-[0.95rem] text-ink">{t.author}</div>
                <div className="text-[0.85rem] text-charcoal opacity-80">via Google Reviews</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="Join Them"
        title={<>Ready for a better inspection?</>}
        description="Book online in a couple of minutes and see why Front Range homeowners and agents keep coming back."
        primaryLabel="Schedule an Inspection"
      />
    </>
  )
}
