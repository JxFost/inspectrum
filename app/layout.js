import Script from 'next/script'
import { Fraunces, Inter_Tight } from 'next/font/google'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

const GA_ID = 'G-2VGTX0N5H4'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
  variable: '--font-fraunces',
})
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-inter-tight',
})

// Default metadata - per-page metadata extends/overrides this
export const metadata = {
  metadataBase: new URL('https://evergreeninspections.com'),
  title: {
    default: 'Inspectrum Inspections — Home Inspections in Evergreen, CO & Denver Metro',
    template: '%s | Inspectrum Inspections',
  },
  description:
    'NACHI-certified home inspections by Inspectrum Inspections. Serving Evergreen, Denver Metro, Boulder, and Colorado mountain communities. 20+ years of construction experience. Same-day reports.',
  keywords: [
    'home inspection Evergreen CO',
    'Denver home inspector',
    'Boulder home inspection',
    'Colorado home inspection',
    'NACHI certified inspector',
    'radon testing Colorado',
    'mold assessment Denver',
    'pre-listing inspection',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Inspectrum Inspections',
    title: 'Inspectrum Inspections — A Better Inspection.',
    description:
      'NACHI-certified home inspections rooted in 20+ years of Colorado construction experience.',
    url: 'https://evergreeninspections.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inspectrum Inspections',
    description: 'A better inspection. Evergreen, CO & Denver Metro.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
}

// Local Business structured data — major SEO win for "near me" searches.
// Google uses this to populate the Knowledge Panel and rank local results.
const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': 'https://evergreeninspections.com#business',
  name: 'Inspectrum Inspections',
  alternateName: 'Evergreen Inspections',
  description:
    'NACHI-certified home inspection company serving Evergreen, Denver Metro, Boulder, and Colorado mountain communities.',
  url: 'https://evergreeninspections.com',
  telephone: '+1-303-697-0990',
  email: 'office@evergreeninspections.com',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Evergreen',
    addressRegion: 'CO',
    postalCode: '80439',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.6333,
    longitude: -105.3172,
  },
  areaServed: [
    { '@type': 'City', name: 'Evergreen' },
    { '@type': 'City', name: 'Denver' },
    { '@type': 'City', name: 'Boulder' },
    { '@type': 'City', name: 'Fort Collins' },
    { '@type': 'City', name: 'Lakewood' },
    { '@type': 'City', name: 'Golden' },
    { '@type': 'City', name: 'Conifer' },
    { '@type': 'City', name: 'Morrison' },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '12:00',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Home Inspection Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Full Home Inspection' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Radon Testing' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mold Assessment' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial Property Inspection' } },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${interTight.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
