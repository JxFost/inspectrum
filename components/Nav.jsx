'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandLogo from './BrandLogo'

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <path d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
  </svg>
)

const SERVICE_LINKS = [
  {
    href: '/services/full-inspection',
    label: 'Full Home Inspection',
    description: 'Complete roof-to-foundation inspection with same-day report.',
  },
  {
    href: '/services/radon',
    label: 'Radon Testing',
    description: '48-hour continuous monitor testing for Colorado homes.',
  },
  {
    href: '/services/mold',
    label: 'Mold & Meth Testing',
    description: 'Moisture mapping, mold assessment, and residue testing.',
  },
  {
    href: '/services/full-inspection',
    label: 'Roof & Exterior',
    description: 'Included in a full inspection for exterior risk areas.',
  },
  {
    href: '/services/full-inspection',
    label: 'Plumbing & Electrical',
    description: 'Visible systems, panels, fixtures, and safety concerns.',
  },
  {
    href: '/contact',
    label: 'À La Carte Inspections',
    description: 'Focused inspections, pre-listing, and builder follow-ups.',
  },
]

const COMMERCIAL_SERVICE = {
  href: '/services/commercial',
  label: 'Commercial Inspections',
  description: 'Due diligence inspections for offices, retail, light industrial, and investment properties.',
}

const FEATURED_SERVICE_BACKGROUND = `
  linear-gradient(180deg, rgba(20,60,68,0.56) 0%, rgba(20,60,68,0.94) 100%),
  url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 420' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2384b8c4'/%3E%3Cstop offset='0.55' stop-color='%232b7e8c'/%3E%3Cstop offset='1' stop-color='%23143c44'/%3E%3C/linearGradient%3E%3ClinearGradient id='m1' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%232b7e8c'/%3E%3Cstop offset='1' stop-color='%23143c44'/%3E%3C/linearGradient%3E%3ClinearGradient id='m2' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%23e89a3f' stop-opacity='0.75'/%3E%3Cstop offset='1' stop-color='%231f5c66'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='520' height='420' fill='url(%23sky)'/%3E%3Ccircle cx='405' cy='92' r='42' fill='%23faf7f1' opacity='0.55'/%3E%3Cpath d='M0,295 L70,205 L128,245 L205,160 L268,230 L338,150 L410,235 L520,182 L520,420 L0,420 Z' fill='url(%23m2)' opacity='0.62'/%3E%3Cpath d='M0,338 L72,260 L138,300 L218,220 L292,278 L365,215 L438,292 L520,244 L520,420 L0,420 Z' fill='url(%23m1)' opacity='0.95'/%3E%3Cpath d='M0,380 L70,325 L140,350 L220,305 L300,344 L380,300 L455,344 L520,315 L520,420 L0,420 Z' fill='%23143c44' opacity='0.95'/%3E%3C/svg%3E")
`

function NavItem({ href, label, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        'relative text-sm font-medium transition-colors',
        active ? 'text-teal' : 'text-ink hover:text-teal',
        active && "after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-amber",
      ].filter(Boolean).join(' ')}
    >
      {label}
    </Link>
  )
}

function ServicesDropdown({ active, onClick }) {
  return (
    <div className="group relative w-full lg:w-auto">
      <Link
        href="/services/full-inspection"
        onClick={onClick}
        className={[
          'relative inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
          active ? 'text-teal' : 'text-ink hover:text-teal',
          active && "after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:bg-amber",
        ].filter(Boolean).join(' ')}
      >
        Services
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 transition-transform lg:group-hover:rotate-180 lg:group-focus-within:rotate-180">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </Link>

      <div className="pt-4 lg:absolute lg:left-1/2 lg:top-full lg:hidden lg:w-[760px] lg:-translate-x-1/2 lg:pt-6 lg:group-hover:grid lg:group-focus-within:grid">
        <div className="grid gap-4 rounded-sm border border-line bg-cream p-4 shadow-[0_18px_45px_rgba(20,60,68,0.16)] lg:grid-cols-[0.9fr_1.5fr] lg:p-5">
          <Link
            href="/services/full-inspection"
            onClick={onClick}
            className="relative overflow-hidden rounded-sm bg-teal p-5 text-cream no-underline transition-transform hover:-translate-y-0.5"
            style={{
              background: FEATURED_SERVICE_BACKGROUND,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-amber/10 pointer-events-none" />
            <span className="relative mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-amber">Featured Service</span>
            <span className="relative mb-2 block font-serif text-2xl leading-tight">Full Home Inspection</span>
            <span className="relative block text-sm leading-relaxed text-cream/85">
              The best starting point for buyers, sellers, and homeowners who want the complete picture.
            </span>
          </Link>

          <div className="grid gap-2 sm:grid-cols-2">
            {SERVICE_LINKS.map((service) => (
              <Link
                key={`${service.label}-${service.href}`}
                href={service.href}
                onClick={onClick}
                className="rounded-sm border border-line bg-paper p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-teal hover:bg-white"
              >
                <span className="mb-1 block text-sm font-semibold text-ink">{service.label}</span>
                <span className="block text-xs leading-relaxed text-charcoal/80">{service.description}</span>
              </Link>
            ))}
          </div>

          <Link
            href={COMMERCIAL_SERVICE.href}
            onClick={onClick}
            className="group/commercial flex flex-col gap-3 rounded-sm border border-amber/40 bg-white p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-amber hover:shadow-[0_12px_28px_rgba(20,60,68,0.1)] sm:flex-row sm:items-center sm:justify-between lg:col-span-2"
          >
            <span>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.22em] text-amber">Also Available</span>
              <span className="mb-1 block font-serif text-xl leading-tight text-ink">{COMMERCIAL_SERVICE.label}</span>
              <span className="block text-sm leading-relaxed text-charcoal/80">{COMMERCIAL_SERVICE.description}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-teal transition-colors group-hover/commercial:text-amber">
              View service →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [logoProgress, setLogoProgress] = useState(0)
  const pathname = usePathname()
  const close = () => setOpen(false)

  const isHome = pathname === '/'
  const isServices = pathname.startsWith('/services/')
  const isContact = pathname === '/contact'
  const visibleLogoProgress = open ? 1 : logoProgress
  const logoImageHeight = 52 + (100 - 52) * (1 - visibleLogoProgress)
  const logoPaddingY = 2 + (12 - 2) * (1 - visibleLogoProgress)
  const logoPaddingX = 2 + (16 - 2) * (1 - visibleLogoProgress)
  const logoDrop = 20 * (1 - visibleLogoProgress)
  const logoShadowOpacity = 0.04 + 0.14 * (1 - visibleLogoProgress)
  const logoBackdropOpacity = 2 * (1 - visibleLogoProgress)
  const logoBlur = 24 * (1 - visibleLogoProgress)
  const showTopBorderSweep = visibleLogoProgress === 0

  useEffect(() => {
    let frame = null

    const updateLogoProgress = () => {
      frame = null
      setLogoProgress(Math.min(window.scrollY / 180, 1))
    }

    const onScroll = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(updateLogoProgress)
    }

    updateLogoProgress()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[76px] px-5 lg:px-8 flex justify-between items-center bg-cream/90 backdrop-blur-xl border-b border-line">
      <div className="relative z-10 h-10 w-[170px] sm:w-[230px]">
        <BrandLogo
          className="absolute left-0 top-1/2 rounded-sm"
          imageClassName="max-w-[68vw]"
          style={{
            backgroundColor: `rgba(250, 247, 241, ${logoBackdropOpacity})`,
            padding: `${logoPaddingY}px ${logoPaddingX}px`,
            transform: `translateY(calc(-50% + ${logoDrop}px))`,
            boxShadow: `0 14px 32px rgba(20, 60, 68, ${logoShadowOpacity})`,
            backdropFilter: logoBlur <= 0 ? 'none' : `blur(${logoBlur}px)`,
            WebkitBackdropFilter: logoBlur <= 0 ? 'none' : `blur(${logoBlur}px)`,
          }}
          imageStyle={{
            height: `${logoImageHeight}px`,
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="lg:hidden bg-transparent border-0 text-ink text-2xl cursor-pointer"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <div
        className={[
          'lg:flex items-center gap-8',
          'lg:static lg:bg-transparent lg:p-0 lg:flex-row lg:shadow-none lg:border-0',
          'absolute top-full left-0 right-0',
          'flex-col p-6 gap-5',
          'bg-cream border-b border-line shadow-[0_12px_24px_rgba(0,0,0,0.05)]',
          open ? 'flex' : 'hidden',
        ].join(' ')}
      >
        <NavItem href="/" label="Home" active={isHome} onClick={close} />
        <ServicesDropdown active={isServices} onClick={close} />
        <Link
          href="/#process"
          onClick={close}
          className="text-sm font-medium text-ink hover:text-teal transition-colors"
        >
          Process
        </Link>
        <NavItem href="/contact" label="Contact" active={isContact} onClick={close} />
        <Link
          href="/schedule"
          onClick={close}
          className="bg-amber text-white px-5 py-2.5 rounded-sm font-semibold text-sm transition-colors hover:bg-amber-deep inline-flex items-center gap-2 lg:self-auto self-start no-underline"
        >
          <CalendarIcon />
          Schedule
        </Link>
      </div>
      {showTopBorderSweep && (
        <span
          key={`nav-border-${pathname}`}
          aria-hidden="true"
          className="absolute bottom-[-1px] left-0 h-px w-full bg-amber animate-nav-border-sweep"
        />
      )}
    </nav>
  )
}
