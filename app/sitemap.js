// Generates /sitemap.xml automatically at build time.
// Add new routes here when you add new pages.

const BASE = 'https://evergreeninspections.com'

export default function sitemap() {
  const lastModified = new Date()
  return [
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
  ]
}
