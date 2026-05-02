import Link from 'next/link'

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const VARIANTS = {
  primary: 'bg-amber text-white hover:bg-amber-deep hover:-translate-y-0.5',
  ghost: 'bg-transparent text-cream border border-white/40 hover:bg-white/10 hover:border-cream',
  teal: 'bg-teal text-white hover:bg-teal-deep hover:-translate-y-0.5',
}

export default function Button({
  children,
  variant = 'primary',
  href,
  external,
  withArrow = false,
  withPhone = false,
  className = '',
  fullWidth = false,
  // Pass through for client-component overrides (when used inside 'use client' files)
  onClick,
  type,
}) {
  const base = 'inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-sm font-semibold text-[0.95rem] transition-all duration-200 cursor-pointer border-0 no-underline'
  const widthCls = fullWidth ? 'w-full' : ''
  const finalCls = `${base} ${VARIANTS[variant]} ${widthCls} ${className}`

  const content = (
    <>
      {withPhone && <PhoneIcon />}
      <span>{children}</span>
      {withArrow && <ArrowRight />}
    </>
  )

  // External link (tel:, mailto:, http://)
  if (external || (href && (href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('http')))) {
    return <a href={href} className={finalCls} onClick={onClick}>{content}</a>
  }
  // Internal route
  if (href) {
    return <Link href={href} className={finalCls} onClick={onClick}>{content}</Link>
  }
  // Plain button (e.g., scheduler step controls)
  return (
    <button type={type || 'button'} onClick={onClick} className={finalCls}>
      {content}
    </button>
  )
}
