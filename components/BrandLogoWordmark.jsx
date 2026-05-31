import Link from 'next/link'

export default function BrandLogoWordMark({
  href = '/',
  className = '',
  imageClassName = '',
  style,
  imageStyle,
}) {
  return (
    <Link href={href} className={`inline-flex items-center no-underline ${className}`} style={style}>
      <img
        src="/InspectrumLogoWordmark.svg"
        alt="Inspectrum Inspections"
        className={`h-14 w-auto shrink-0 object-contain ${imageClassName}`}
        style={imageStyle}
      />
    </Link>
  )
}
