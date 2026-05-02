import Link from 'next/link'

export default function BrandLogo({ tone = 'default', href = '/', className = '' }) {
  const wordClass = tone === 'light' ? 'text-cream' : 'text-teal'

  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 no-underline ${className}`}>
      <svg className="w-[46px] h-9 shrink-0">
        <use href="#inspectrum-mark" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={`font-serif font-semibold text-[1.35rem] tracking-tight ${wordClass}`}>
          <span className="text-gray-cool">Ins</span>pectrum
        </span>
        <span className="text-[0.6rem] tracking-[0.4em] text-amber mt-0.5 font-semibold">
          INSPECTIONS
        </span>
      </span>
    </Link>
  )
}
