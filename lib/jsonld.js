/*
 * JSON-LD structured data helpers for SEO.
 *
 * Used by service pages, layout, and anywhere we need schema.org markup.
 */

const BASE_URL = 'https://evergreeninspections.com'
const BUSINESS = {
  '@type': 'HomeAndConstructionBusiness',
  '@id': `${BASE_URL}#business`,
  name: 'Inspectrum Inspections',
  url: BASE_URL,
  telephone: '+1-303-697-0990',
}

/**
 * Service schema for a service page.
 */
export function serviceJsonLd({ name, description, url, price, areaServed }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: `${BASE_URL}${url}`,
    provider: BUSINESS,
    areaServed: (areaServed || ['Evergreen', 'Denver', 'Boulder', 'Fort Collins', 'Lakewood', 'Golden']).map(
      (city) => ({ '@type': 'City', name: city })
    ),
    ...(price && { offers: { '@type': 'Offer', price, priceCurrency: 'USD' } }),
  }
}

/**
 * FAQPage schema from an array of {q, a} objects.
 * Only includes items where `a` is a plain string (not JSX).
 */
export function faqJsonLd(items) {
  const filtered = items.filter((item) => typeof item.a === 'string')
  if (filtered.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: filtered.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

/**
 * BreadcrumbList schema.
 * @param {Array<{name: string, url: string}>} items
 */
export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }
}
