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
  other: {
    'geo.region': 'US-CO',
    'geo.placename': 'Evergreen, Colorado',
    'geo.position': '39.6333;-105.3172',
    ICBM: '39.6333, -105.3172',
  },
  category: 'Home Inspection',
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
  currenciesAccepted: 'USD',
  paymentAccepted: 'Cash, Credit Card, Check, Venmo, Zelle',
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
  founder: {
    '@type': 'Person',
    name: 'Harry Foster',
    jobTitle: 'Lead Inspector & Founder',
    knowsAbout: ['Home Inspection', 'Construction', 'Radon Testing', 'Mold Assessment', 'Colorado Real Estate'],
  },
  // Add Google Business Profile, Yelp, BBB URLs here when available.
  sameAs: [
    'https://www.facebook.com/evergreeninspections',
    'https://www.yelp.com/biz/inspectrum-evergreen',
    'https://www.linkedin.com/company/3066275',
    'https://www.google.com/maps/place/Inspectrum+Inspections/data=!4m2!3m1!1s0x0:0xb96c3042c196d430',
  ],
  memberOf: [
    { '@type': 'Organization', name: 'International Association of Certified Home Inspectors', alternateName: 'NACHI', url: 'https://www.nachi.org' },
    { '@type': 'Organization', name: 'Evergreen Area Chamber of Commerce', url: 'https://www.evergreenchamber.org' },
  ],
  knowsAbout: [
    'Home Inspection', 'Pre-Purchase Inspection', 'Pre-Listing Inspection',
    'Radon Testing Colorado', 'Mold Assessment', 'New Construction Inspection',
    'Colorado Real Estate', 'Mountain Home Inspection', 'Buyer Inspection',
    'Commercial Property Inspection',
  ],
  areaServed: [
    { '@type': 'City', name: 'Evergreen' },
    { '@type': 'City', name: 'Denver' },
    { '@type': 'City', name: 'Boulder' },
    { '@type': 'City', name: 'Fort Collins' },
    { '@type': 'City', name: 'Lakewood' },
    { '@type': 'City', name: 'Golden' },
    { '@type': 'City', name: 'Conifer' },
    { '@type': 'City', name: 'Morrison' },
    { '@type': 'City', name: 'Bailey' },
    { '@type': 'City', name: 'Idaho Springs' },
    { '@type': 'City', name: 'Genesee' },
    { '@type': 'City', name: 'Aurora' },
    { '@type': 'City', name: 'Centennial' },
    { '@type': 'City', name: 'Littleton' },
    { '@type': 'City', name: 'Wheat Ridge' },
    { '@type': 'City', name: 'Arvada' },
    { '@type': 'State', name: 'Colorado' },
  ],
  potentialAction: {
    '@type': 'ReserveAction',
    target: 'https://evergreeninspections.com/schedule',
    name: 'Book a Home Inspection',
  },
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
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '47',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Sarah K.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5' },
      reviewBody: 'Thorough doesn\'t begin to describe it. Harry caught issues two other inspectors had missed. The walk-through afterward was the most educational hour of my home-buying process.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Marcus B.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5' },
      reviewBody: 'Twenty years of construction experience and it shows. He explained things in a way I actually understood — and the report was clear, photo-rich, and delivered same day.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Jennifer W.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5' },
      reviewBody: 'We\'ve used Inspectrum for three properties now. Always professional, always honest about what\'s a real problem versus what\'s normal wear. We won\'t go to anyone else.',
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${interTight.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <link rel="author" href="https://evergreeninspections.com/llms.txt" type="text/plain" />
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
