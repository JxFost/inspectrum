// Generates /sitemap.xml automatically at build time.
// Add new routes here when you add new pages.

import { GUIDE_SLUGS } from '@/lib/guides'

const BASE = 'https://evergreeninspections.com'

export default function sitemap() {
  const lastModified = new Date()

  // Homeowner guides hub + seasonal guide + every system guide (auto-included)
  const guidePages = [
    `${BASE}/guides`,
    `${BASE}/guides/home-maintenance`,
    ...GUIDE_SLUGS.map((slug) => `${BASE}/guides/${slug}`),
  ].map((url) => ({ url, lastModified, changeFrequency: 'monthly', priority: 0.7 }))

  return [
    ...guidePages,
    {
      url: `${BASE}/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE}/services/full-inspection`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/services/radon`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/services/mold`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/services/commercial`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/about/harry`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/contact`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${BASE}/schedule`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
