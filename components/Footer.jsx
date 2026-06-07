'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandLogo from './BrandLogo'
import { OFFICE_PHONE, OFFICE_EMAIL, OFFICE_ADDRESS } from '@/lib/constants'

function FooterLink({ href, external, children }) {
  const className =
    'block text-cream/75 hover:text-amber hover:opacity-100 text-[0.95rem] mb-2.5 no-underline transition-colors'
  if (external) {
    return <a href={href} className={className}>{children}</a>
  }
  return <Link href={href} className={className}>{children}</Link>
}

export default function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') return null

  return (
    <footer className="bg-charcoal-deep text-cream pt-20 pb-8 px-5 lg:px-8 border-t-[3px] border-teal">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:gap-12 mb-16">
          <div className="md:col-span-2 lg:col-span-1 max-w-[340px]">
            <div className="mb-6">
              <BrandLogo />
            </div>
            <p className="text-[0.95rem] opacity-75 leading-relaxed mb-5">
              NACHI-certified home inspections rooted in 40+ years of Colorado & construction
              experience. Acting member of the Evergreen Chamber of Commerce.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.google.com/maps/place/?q=place_id:ChIJXa9tHz2ea4cRMNSWwUIwbLk" target="_blank" rel="noopener noreferrer" aria-label="Google Business" className="text-cream/50 hover:text-amber transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/inspectrum-evergreen-co" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-cream/50 hover:text-amber transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
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
            <FooterLink href="/about/harry">Meet Harry</FooterLink>
            <FooterLink href="/#process">Process</FooterLink>
            <FooterLink href="/guides/home-maintenance">Maintenance Guide</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/schedule">Schedule</FooterLink>
          </div>

          <div>
            <h5 className="text-[0.7rem] uppercase tracking-[0.25em] text-amber mb-5 font-semibold">
              Reach Us
            </h5>
            <FooterLink href={`tel:${OFFICE_PHONE.replace(/\D/g, '')}`} external>{OFFICE_PHONE}</FooterLink>
            <FooterLink href={`mailto:${OFFICE_EMAIL}`} external>
              {OFFICE_EMAIL}
            </FooterLink>
            <FooterLink href="#" external>{OFFICE_ADDRESS}</FooterLink>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-[0.85rem] opacity-60 gap-4 text-center sm:text-left">
          <div>© {new Date().getFullYear()} Inspectrum Inspections · NACHI Certified</div>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="text-cream/60 hover:text-amber no-underline transition-colors">Privacy</Link>
            <span className="text-cream/30">·</span>
            <Link href="/terms" className="text-cream/60 hover:text-amber no-underline transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
