import ServiceHero from '@/components/ServiceHero'
import CTABanner from '@/components/CTABanner'
import Button from '@/components/Button'

export const metadata = {
  title: 'See a Sample Inspection Report — Inspectrum Inspections',
  description:
    'A look at what you get from an Inspectrum inspection report: a plain-English summary, system-by-system findings with photos, and prioritized recommendations — delivered the same day.',
  alternates: { canonical: '/sample-report' },
  openGraph: {
    title: 'See a Sample Inspection Report — Inspectrum Inspections',
    description: 'Photos, plain-English findings, and prioritized recommendations — same day.',
    url: 'https://evergreeninspections.com/sample-report',
  },
}

// Drop a real sample PDF in /public (e.g. /public/sample-report.pdf) and set
// this to its path to enable the download button. Null = show a request CTA
// instead of a dead link.
const SAMPLE_REPORT_PATH = null

const CONTENTS = [
  { h: 'Plain-English summary', b: 'The headline first: the most important findings and safety items, summarized so you know where things stand at a glance.' },
  { h: 'System-by-system detail', b: 'Structure, roof, exterior, electrical, plumbing, HVAC, insulation, and interior — each documented with clear observations.' },
  { h: 'Photos throughout', b: 'Annotated photos of what we found, so you can see exactly what we’re describing — no guesswork.' },
  { h: 'Prioritized recommendations', b: 'Findings are ranked by importance — safety issues and major repairs first, minor maintenance items noted but kept in perspective.' },
  { h: 'Add-on results', b: 'Radon readings, sewer-scope findings, and any other add-ons are included in the same report.' },
  { h: 'Yours to keep and share', b: 'A clean PDF you can share with your agent, lender, or a contractor — and reference for years.' },
]

export default function SampleReportPage() {
  return (
    <>
      <ServiceHero
        variant="teal"
        eyebrow="The Report"
        title={<>See exactly what <em className="italic text-amber">you get.</em></>}
        description="No cryptic checklists. Our reports are clear, photo-rich, and prioritized — delivered the same day so you can act fast."
        primaryCTA={{ label: 'Schedule an Inspection', href: '/schedule' }}
      />

      <section className="bg-paper py-20 px-5 lg:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="section-eyebrow">What’s Inside</div>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-ink mb-8">What’s in your report</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line rounded-sm overflow-hidden">
            {CONTENTS.map((c) => (
              <div key={c.h} className="bg-paper p-6">
                <h3 className="text-[1.05rem] text-ink font-semibold mb-1.5 flex items-start gap-2">
                  <span className="text-teal mt-0.5">✓</span> {c.h}
                </h3>
                <p className="text-[0.9rem] text-charcoal/80 leading-relaxed pl-6">{c.b}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            {SAMPLE_REPORT_PATH ? (
              <Button href={SAMPLE_REPORT_PATH} variant="teal" external withArrow>
                Download a Sample Report (PDF)
              </Button>
            ) : (
              <div className="inline-block bg-cream border border-line rounded-sm p-6">
                <p className="text-charcoal mb-4">Want to see a full sample report?</p>
                <Button href="/contact" variant="teal" withArrow>Request a Sample</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <CTABanner
        eyebrow="Ready When You Are"
        title={<>A report you’ll actually understand.</>}
        description="Book online and get a thorough, plain-English inspection with a same-day report."
        primaryLabel="Schedule an Inspection"
      />
    </>
  )
}
