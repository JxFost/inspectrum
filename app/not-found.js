import Link from 'next/link'
import Button from '@/components/Button'

export const metadata = {
  title: 'Page Not Found',
  description: 'The page you requested could not be found. Return to Inspectrum Inspections.',
  robots: { index: false, follow: false },
}

const QUICK_LINKS = [
  { href: '/', label: 'Home', description: 'Back to the main site' },
  { href: '/schedule', label: 'Schedule', description: 'Book an inspection online' },
  { href: '/services/full-inspection', label: 'Services', description: 'What we inspect' },
  { href: '/contact', label: 'Contact', description: 'Call or send a message' },
]

export default function NotFound() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-20 px-5 lg:px-8">
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.3'/%3E%3C/svg%3E")`,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none opacity-60"
          style={{
            background: `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 200'%3E%3Cpath d='M0,140 L120,80 L240,110 L380,50 L520,100 L660,40 L800,90 L940,55 L1080,100 L1220,60 L1360,110 L1500,75 L1600,120 L1600,200 L0,200 Z' fill='%23143C44' opacity='0.6'/%3E%3Cpath d='M0,165 L100,120 L220,150 L360,95 L500,140 L640,100 L800,145 L960,105 L1100,145 L1240,110 L1400,150 L1600,130 L1600,200 L0,200 Z' fill='%232b7e8c' opacity='0.5'/%3E%3C/svg%3E") no-repeat bottom center`,
            backgroundSize: 'cover',
          }}
        />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="font-serif text-[clamp(4.5rem,14vw,7rem)] font-medium leading-none text-amber mb-4">
            404
          </p>
          <p className="hero-eyebrow justify-center mb-5">Page not found</p>
          <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-medium leading-tight tracking-tight mb-5">
            Nothing to inspect here.
          </h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto leading-relaxed mb-8">
            The link may be outdated, or the page may have moved. Let&apos;s get you back on solid ground.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Button variant="primary" href="/" withArrow>
              Back to Home
            </Button>
            <Button variant="ghost" href="tel:3036970990" external withPhone>
              Call (303) 697-0990
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-5 lg:px-8 bg-cream">
        <div className="max-w-3xl mx-auto">
          <div className="section-eyebrow justify-center">Try one of these</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group block rounded-sm border border-line bg-white p-6 no-underline transition-all duration-200 hover:border-teal/30 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(31,36,38,0.06)]"
                >
                  <span className="block font-serif text-xl text-ink mb-1 group-hover:text-teal transition-colors">
                    {link.label}
                  </span>
                  <span className="block text-sm text-charcoal/80">{link.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
