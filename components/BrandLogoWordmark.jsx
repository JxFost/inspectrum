import Link from 'next/link'

export default function BrandLogoWordMark({
  href = '/',
  className = '',
  imageClassName = '',
  style,
  imageStyle,
  variant = '', // allows: '', 'wordmark-white'
}) {
  // Determine SVG filename based on variant
  const imgSrc = variant === 'wordmark-white'
    ? '/InspectrumLogoWordmark-white.svg'
    : '/InspectrumLogoWordmark.svg'
  return (
    <Link href={href} className={`inline-flex items-center no-underline ${className}`} style={style}>
      <img
        src={imgSrc}
        alt="Inspectrum Inspections"
        className={`h-14 w-auto shrink-0 object-contain ${imageClassName}`}
        style={imageStyle}
      />
    </Link>
  )
}
