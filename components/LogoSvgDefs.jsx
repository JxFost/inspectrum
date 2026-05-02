// Server component (no "use client") — pure markup, can be SSR'd
export default function LogoSvgDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <symbol id="inspectrum-mark" viewBox="0 0 120 90">
          <path d="M28 50 L46 18 L62 36 L74 22 L92 50 Z" fill="#9DA0A2" />
          <path d="M48 50 L66 14 L84 32 L96 22 L110 50 Z" fill="#9DA0A2" opacity="0.85" />
          <path d="M5 78 L36 42 L60 70 L60 85 L5 85 Z" fill="#2B7E8C" />
          <circle cx="30" cy="64" r="3.5" fill="#FAF7F1" />
          <path d="M58 70 L82 42 L115 78 L115 85 L58 85 Z" fill="#E89A3F" />
          <circle cx="86" cy="64" r="3.5" fill="#FAF7F1" />
        </symbol>
      </defs>
    </svg>
  )
}
