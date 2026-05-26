import { Suspense } from 'react'
import PortalLogin from './PortalLogin'

export const metadata = {
  title: 'Customer Portal — Inspectrum Inspections',
  description: 'Sign in to view your inspections, download reports, and manage your appointments.',
  robots: 'noindex, nofollow',
}

export default function PortalPage() {
  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-32 pb-12 px-5 lg:px-8">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="hero-eyebrow justify-center">Customer Portal</div>
          <h1 className="text-[clamp(2rem,4vw,3.5rem)] mb-4">
            View your <em className="italic text-amber">inspections.</em>
          </h1>
        </div>
      </header>

      <section className="bg-cream py-16 px-5 lg:px-8 min-h-[50vh]">
        <div className="max-w-[420px] mx-auto">
          <Suspense><PortalLogin /></Suspense>
        </div>
      </section>
    </>
  )
}
