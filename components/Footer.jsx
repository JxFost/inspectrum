import Link from 'next/link'
import BrandLogo from './BrandLogo'

function FooterLink({ href, external, children }) {
  const className =
    'block text-cream/75 hover:text-amber hover:opacity-100 text-[0.95rem] mb-2.5 no-underline transition-colors'
  if (external) {
    return <a href={href} className={className}>{children}</a>
  }
  return <Link href={href} className={className}>{children}</Link>
}

export default function Footer() {
  return (
    <footer className="bg-charcoal-deep text-cream pt-20 pb-8 px-5 lg:px-8 border-t-[3px] border-teal">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:gap-12 mb-16">
          <div className="md:col-span-2 lg:col-span-1 max-w-[340px]">
            <div className="mb-6">
              <BrandLogo />
            </div>
            <p className="text-[0.95rem] opacity-75 leading-relaxed">
              NACHI-certified home inspections rooted in 20+ years of Colorado construction
              experience. Acting member of the Evergreen Chamber of Commerce.
            </p>
          </div>

          <div>
            <h5 className="text-[0.7rem] uppercase tracking-[0.25em] text-amber mb-5 font-semibold">
              Services
            </h5>
            <FooterLink href="/services/full-inspection">Full Inspection</FooterLink>
            <FooterLink href="/services/radon">Radon Testing</FooterLink>
            <FooterLink href="/services/mold">Mold Assessment</FooterLink>
            <FooterLink href="/contact">Pre-Listing</FooterLink>
          </div>

          <div>
            <h5 className="text-[0.7rem] uppercase tracking-[0.25em] text-amber mb-5 font-semibold">
              Company
            </h5>
            <FooterLink href="/#about">About</FooterLink>
            <FooterLink href="/#process">Process</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/schedule">Schedule</FooterLink>
          </div>

          <div>
            <h5 className="text-[0.7rem] uppercase tracking-[0.25em] text-amber mb-5 font-semibold">
              Reach Us
            </h5>
            <FooterLink href="tel:3036970990" external>(303) 697-0990</FooterLink>
            <FooterLink href="mailto:office@evergreeninspections.com" external>
              office@evergreeninspections.com
            </FooterLink>
            <FooterLink href="#" external>Evergreen, CO 80439</FooterLink>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-[0.85rem] opacity-60 gap-4 text-center sm:text-left">
          <div>© 2026 Inspectrum Inspections · NACHI Certified</div>
          <div>A better inspection.</div>
        </div>
      </div>
    </footer>
  )
}
