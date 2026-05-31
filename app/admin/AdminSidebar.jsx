'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Tooltip, { TooltipProvider } from '@/components/Tooltip'
import BrandLogoWordmark from '@/components/BrandLogoWordmark'

const NAV_ITEMS = [
  { href: '/admin/today', label: 'Today', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2' },
  { href: '/admin/inspections', label: 'Inspections', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { href: '/admin/block', label: 'New Booking', icon: 'M12 4v16m8-8H4' },
  { href: '/admin/invoices', label: 'Invoices', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8' },
  { href: '/admin/customers', label: 'Customers', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { href: '/admin/pricing', label: 'Pricing', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { href: '/admin/emails', label: 'Emails', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
]

const BOTTOM_ITEMS = [
  { href: '/', label: 'View Site', icon: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3' },
]

function SidebarIcon({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
      <path d={d} />
    </svg>
  )
}

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname()
  const [uninvoicedCount, setUninvoicedCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/uninvoiced-count')
      .then((r) => r.json())
      .then((d) => setUninvoicedCount(d.count || 0))
      .catch(() => {})
  }, [pathname])

  // Don't render sidebar on login page
  if (pathname === '/admin/login') return null

  const isActive = (href) => {
    if (href === '/admin/inspections') return pathname.startsWith('/admin/inspections')
    return pathname === href
  }

  const sidebar = (
    <TooltipProvider>
      <div className={`flex flex-col h-full bg-ink text-cream ${collapsed ? 'w-16' : 'w-56'} transition-all duration-200`}>
        {/* Logo / brand */}
        <div className={`border-b border-white/10 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? (
            <Link href="/admin/inspections" className="no-underline px-4 py-2 flex items-center justify-center">
              <img src="/favicon/favicon-32x32.png" alt="" className="w-10 h-8" />
            </Link>
          ) : (
            <div className="flex items-center px-4">
              <BrandLogoWordmark className="w-[120px] mt-1" variant="wordmark-white" href="/admin/inspections" />
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm no-underline transition-colors ${
                  active
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-cream/60 hover:bg-white/10 hover:text-cream'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <SidebarIcon d={item.icon} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.href === '/admin/invoices' && uninvoicedCount > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-[0.6rem] font-bold w-5 h-5 rounded-full flex items-center justify-center">{uninvoicedCount}</span>
                )}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href} content={item.label} side="right">
                  {link}
                </Tooltip>
              )
            }
            return link
          })}
        </nav>

        {/* Bottom items */}
        <div className="py-4 px-2 border-t border-white/10 space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm no-underline text-cream/40 hover:text-cream hover:bg-white/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
            >
              <SidebarIcon d={item.icon} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
          <a
            href="/api/admin/logout"
            className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm no-underline text-cream/40 hover:text-red-400 hover:bg-white/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <SidebarIcon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            {!collapsed && <span>Logout</span>}
          </a>

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-sm text-sm text-cream/30 hover:text-cream hover:bg-white/10 transition-colors cursor-pointer bg-transparent border-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-5 h-5 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`}>
              <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
            </svg>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </TooltipProvider>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        {sidebar}
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-ink text-cream flex items-center justify-between px-4 shadow-lg">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-transparent text-cream p-1 border-0 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
        <div onClick={() => setMobileOpen(false)} className="flex items-center justify-center mt-1">
          <BrandLogoWordmark className="w-[120px]" variant="wordmark-white" />
        </div>
        <div className="w-6" /> {/* spacer for centering */}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed left-0 top-0 h-screen z-50">
            {sidebar}
          </div>
        </>
      )}
    </>
  )
}
