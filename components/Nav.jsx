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
        'relative flex min-h-11 w-full items-center justify-start rounded-sm px-3 text-left text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber lg:min-h-0 lg:w-auto lg:px-0 lg:text-sm lg:font-medium',
        active ? 'bg-amber/10 text-teal lg:bg-transparent' : 'text-ink hover:bg-white/70 hover:text-teal lg:hover:bg-transparent',
        active && "lg:after:content-[''] lg:after:absolute lg:after:-bottom-1.5 lg:after:left-0 lg:after:right-0 lg:after:h-0.5 lg:after:bg-amber",
      ].filter(Boolean).join(' ')}
    >
      {label}
    </Link>
  )
}

function ServicesDropdown({ active, expanded, onToggle, onClick }) {
  return (
    <div className="group relative w-full lg:w-auto">
      <button
        type="button"
        onClick={onToggle}
        className={[
          'relative inline-flex min-h-11 w-full items-center justify-between rounded-sm border-0 px-3 text-left text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber lg:hidden',
          active || expanded ? 'bg-amber/10 text-teal' : 'bg-transparent text-ink hover:bg-white/70 hover:text-teal',
        ].filter(Boolean).join(' ')}
        aria-controls="services-navigation"
        aria-expanded={expanded}
      >
        Services
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={[
            'w-3.5 h-3.5 transition-transform duration-200',
            expanded ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" />
        </svg>
      </button>

      <Link
        href="/services/full-inspection"
        onClick={onClick}
        className={[
          'relative hidden transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber lg:inline-flex lg:min-h-0 lg:w-auto lg:items-center lg:justify-start lg:gap-1.5 lg:px-0 lg:text-sm lg:font-medium',
          active ? 'text-teal' : 'text-ink hover:text-teal',
          active && "lg:after:content-[''] lg:after:absolute lg:after:-bottom-1.5 lg:after:left-0 lg:after:right-0 lg:after:h-0.5 lg:after:bg-amber",
        ].filter(Boolean).join(' ')}
      >
        Services
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 transition-transform lg:group-hover:rotate-180 lg:group-focus-within:rotate-180">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </Link>

      <div
        id="services-navigation"
        className={[
          expanded ? 'max-lg:block' : 'max-lg:hidden',
          'pt-3 lg:invisible lg:absolute lg:left-1/2 lg:top-full lg:grid lg:w-[760px] lg:-translate-x-1/2 lg:pt-6 lg:opacity-0 lg:pointer-events-none lg:transition-opacity lg:duration-150 lg:group-hover:visible lg:group-hover:opacity-100 lg:group-hover:pointer-events-auto lg:group-focus-within:visible lg:group-focus-within:opacity-100 lg:group-focus-within:pointer-events-auto',
        ].join(' ')}
      >
        <div className="grid max-h-[48vh] gap-3 overflow-y-auto rounded-sm border border-line bg-white/75 p-3 shadow-[0_18px_45px_rgba(20,60,68,0.12)] backdrop-blur-xl lg:max-h-none lg:grid-cols-[0.9fr_1.5fr] lg:gap-4 lg:overflow-visible lg:bg-cream lg:p-5 lg:shadow-[0_18px_45px_rgba(20,60,68,0.16)]">
          <Link
            href="/services/full-inspection"
            onClick={onClick}
            className="relative block w-full overflow-hidden rounded-sm bg-teal p-4 text-left text-cream no-underline transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber lg:p-5"
            style={{
              background: FEATURED_SERVICE_BACKGROUND,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-amber/10 pointer-events-none" />
            <span className="relative mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-amber lg:mb-3">Featured Service</span>
            <span className="relative mb-2 block font-serif text-xl leading-tight lg:text-2xl">Full Home Inspection</span>
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
                className="block w-full rounded-sm border border-line bg-paper/90 p-3 text-left no-underline transition-all hover:-translate-y-0.5 hover:border-teal hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber lg:p-4"
              >
                <span className="mb-1 block text-sm font-semibold text-ink">{service.label}</span>
                <span className="block text-xs leading-relaxed text-charcoal/80">{service.description}</span>
              </Link>
            ))}
          </div>

          <Link
            href={COMMERCIAL_SERVICE.href}
            onClick={onClick}
            className="group/commercial flex w-full flex-col gap-3 rounded-sm border border-amber/40 bg-white p-3 text-left no-underline transition-all hover:-translate-y-0.5 hover:border-amber hover:shadow-[0_12px_28px_rgba(20,60,68,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber sm:flex-row sm:items-center sm:justify-between lg:col-span-2 lg:p-4"
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
  const [servicesOpen, setServicesOpen] = useState(false)
  const [logoProgress, setLogoProgress] = useState(0)
  const [animateLogo, setAnimateLogo] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isServices = pathname.startsWith('/services/')
  const isContact = pathname === '/contact'

  const close = () => {
    setOpen(false)
    setServicesOpen(false)
  }

  const toggleMenu = () => {
    setOpen((current) => {
      const next = !current
      setServicesOpen(next && isServices)
      return next
    })
  }

  const visibleLogoProgress = animateLogo && !open ? logoProgress : 1
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const syncLogoMode = () => setAnimateLogo(mediaQuery.matches)

    syncLogoMode()
    mediaQuery.addEventListener('change', syncLogoMode)

    return () => {
      mediaQuery.removeEventListener('change', syncLogoMode)
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const originalOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') close()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[76px] px-5 lg:px-8 flex justify-between items-center bg-cream/90 backdrop-blur-xl border-b border-line lg:bg-cream lg:backdrop-blur-none">
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
        onClick={toggleMenu}
        className="relative z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/70 text-ink shadow-[0_10px_24px_rgba(20,60,68,0.08)] backdrop-blur-md transition-colors hover:border-teal hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber lg:hidden"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-controls="primary-navigation"
        aria-expanded={open}
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <span aria-hidden="true" className="relative h-4 w-5">
          <span className={[
            'absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-200',
            open ? 'translate-y-[7px] rotate-45' : '',
          ].join(' ')} />
          <span className={[
            'absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity duration-200',
            open ? 'opacity-0' : 'opacity-100',
          ].join(' ')} />
          <span className={[
            'absolute bottom-0 left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-200',
            open ? '-translate-y-[7px] -rotate-45' : '',
          ].join(' ')} />
        </span>
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="fixed inset-x-0 bottom-0 top-[76px] z-10 cursor-default border-0 bg-ink/25 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <div
        id="primary-navigation"
        className={[
          'z-20 lg:flex items-center gap-8',
          'lg:static lg:max-h-none lg:overflow-visible lg:bg-transparent lg:p-0 lg:flex-row lg:shadow-none lg:border-0',
          'absolute left-3 right-3 top-[calc(100%+0.75rem)]',
          'max-h-[calc(100vh-96px)] flex-col gap-2 overflow-y-auto p-3',
          'rounded-sm border border-line bg-cream/95 shadow-[0_24px_70px_rgba(20,60,68,0.22)] backdrop-blur-xl',
          open ? 'flex' : 'hidden',
        ].join(' ')}
      >
        <NavItem href="/" label="Home" active={isHome} onClick={close} />
        <ServicesDropdown
          active={isServices}
          expanded={servicesOpen}
          onToggle={() => setServicesOpen(current => !current)}
          onClick={close}
        />
        <Link
          href="/#process"
          onClick={close}
          className="flex min-h-11 w-full items-center justify-start rounded-sm px-3 text-left text-base font-semibold text-ink transition-colors hover:bg-white/70 hover:text-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber lg:min-h-0 lg:w-auto lg:px-0 lg:text-sm lg:font-medium lg:hover:bg-transparent"
        >
          Process
        </Link>
        <NavItem href="/contact" label="Contact" active={isContact} onClick={close} />
        <Link
          href="/schedule"
          onClick={close}
          className="mt-2 inline-flex min-h-12 w-full items-center justify-start gap-2 rounded-sm bg-amber px-5 py-2.5 text-left text-sm font-semibold text-white no-underline shadow-[0_12px_24px_rgba(232,154,63,0.24)] transition-colors hover:bg-amber-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber lg:mt-0 lg:min-h-0 lg:w-auto lg:justify-center lg:self-auto lg:shadow-none"
        >
          <CalendarIcon />
          Schedule
        </Link>
      </div>
      {showTopBorderSweep && (
        <span key={`nav-border-${pathname}`} aria-hidden="true" className="absolute bottom-[-1px] left-0 h-px w-full">
          <span className="block h-px w-full bg-amber animate-nav-border-sweep" />
          <span className="absolute left-0 top-[3px] h-1 w-1 -translate-y-1/2 rounded-full bg-amber animate-nav-border-dot" />
        </span>
      )}
    </nav>
  )
}
