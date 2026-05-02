'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandLogo from './BrandLogo'

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <path d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
  </svg>
)

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

export default function Nav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const close = () => setOpen(false)

  const isHome = pathname === '/'
  const isServices = pathname.startsWith('/services/')
  const isContact = pathname === '/contact'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 lg:px-8 py-4 flex justify-between items-center bg-cream/90 backdrop-blur-xl border-b border-line">
      <BrandLogo />

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
        <NavItem href="/services/full-inspection" label="Services" active={isServices} onClick={close} />
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
    </nav>
  )
}
