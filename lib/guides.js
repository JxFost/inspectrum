/*
 * Content for the system-specific home guides (/guides/<slug>).
 *
 * Each guide is rendered by app/guides/[slug]/page.js through a shared layout,
 * so adding a new topic is just a new entry here. All copy is original and
 * written from an inspector's point of view: what we check, what commonly goes
 * wrong, and what a homeowner can safely maintain — with a licensed-pro
 * disclaimer on every page.
 */

export const SYSTEM_GUIDES = {
  plumbing: {
    title: 'Home Plumbing: An Inspector’s Guide',
    metaDescription:
      'What a home inspector checks in your plumbing, the problems we find most, and the maintenance you can do yourself. From Inspectrum Inspections, Evergreen CO.',
    eyebrow: 'Home Systems',
    heroTitle: 'Plumbing',
    heroLead:
      'Plumbing issues are some of the most common — and most expensive — problems we find. Here’s what we actually look at during an inspection, what tends to go wrong, and what you can stay ahead of yourself.',
    // Temporary keyword-matched placeholder photo (swap for /public/guides/* later)
    imageKeywords: 'plumbing,pipes',
    imageAlt: 'Home plumbing supply lines and fittings',
    proType: 'a licensed plumber',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'A home inspection is a visual, non-invasive review — here’s the plumbing we evaluate and report on.',
        items: [
          { h: 'Supply lines & water pressure', b: 'We run fixtures to check functional flow and pressure, and note the pipe materials we can see (copper, PEX, galvanized, or a mix).' },
          { h: 'Drains, waste & venting', b: 'We watch sinks, tubs, and showers drain and look for slow drainage, leaks at traps, and improper connections.' },
          { h: 'Water heater', b: 'We note the unit’s age, capacity, and type, and check the temperature-pressure relief (TPR) valve and discharge line, connections, and venting.' },
          { h: 'Fixtures & toilets', b: 'We operate faucets and flush toilets, looking for leaks, loose mounting, and fixtures that run or drip.' },
          { h: 'Shutoffs', b: 'We locate and identify the main water shutoff and note visible fixture shutoffs so you know where they are.' },
          { h: 'Signs of leaks', b: 'We look for active drips plus the evidence of past leaks — stains, corrosion, mineral buildup, and water damage under and around plumbing.' },
        ],
        footnote: 'The underground sewer line isn’t visible during a standard inspection — that’s what our sewer-scope add-on is for.',
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Hidden, slow leaks', b: 'Drips under sinks or behind walls that quietly cause rot and mold long before anyone notices.' },
          { h: 'Aging water heaters', b: 'Units past their ~10–12 year lifespan, or a missing/improper TPR discharge line — a real safety concern.' },
          { h: 'Mixed or outdated piping', b: 'Galvanized steel that’s corroding from the inside, or patchwork repairs joining incompatible materials.' },
          { h: 'Poor drainage', b: 'Slow drains, improper slope, or “S-traps” that can siphon and let sewer gas in.' },
          { h: 'Freeze damage', b: 'On the Front Range, pipes in unconditioned spaces can freeze and burst — we look for past repairs and at-risk runs.' },
          { h: 'Pressure problems', b: 'Water pressure that’s too high (no regulator) stresses the whole system; too low points to supply or corrosion issues.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can maintain yourself',
        items: [
          { h: 'Know your main shutoff', b: 'Find it before you need it. In an emergency, shutting the water off fast is the difference between a mop and a remodel.' },
          { h: 'Flush the water heater yearly', b: 'Draining sediment annually extends its life and efficiency. Note its age — if it’s past 10 years, start planning.' },
          { h: 'Winterize before the freeze', b: 'Disconnect and drain hoses, insulate exposed pipes, and let faucets drip during deep cold snaps.' },
          { h: 'Check under sinks', b: 'A quick look for moisture, swelling, or musty smell every few months catches slow leaks early.' },
          { h: 'Be kind to your drains', b: 'Keep grease out, use strainers, and skip the chemical drain cleaners — they damage pipes over time.' },
          { h: 'Watch the water bill', b: 'An unexplained jump is often the first sign of a hidden leak. Trust it and investigate.' },
        ],
      },
    ],
    related: [
      { label: 'Full Home Inspection', href: '/services/full-inspection' },
      { label: 'Radon Testing', href: '/services/radon' },
      { label: 'Seasonal Maintenance Guide', href: '/guides/home-maintenance' },
    ],
  },
}

export const GUIDE_SLUGS = Object.keys(SYSTEM_GUIDES)

/*
 * Registry of all "content" pages, used by the reusable More Reading block to
 * suggest next-up reading. Includes the seasonal guide, every system guide, and
 * the core service pages so the cross-links reinforce each other for SEO.
 */
export const CONTENT_PAGES = [
  { href: '/guides/home-maintenance', eyebrow: 'Seasonal', title: 'Home Maintenance, Season by Season', blurb: 'A spring-through-winter checklist tuned for Front Range homes.' },
  ...GUIDE_SLUGS.map((slug) => ({
    href: `/guides/${slug}`,
    eyebrow: SYSTEM_GUIDES[slug].eyebrow,
    title: SYSTEM_GUIDES[slug].heroTitle,
    blurb: SYSTEM_GUIDES[slug].heroLead,
  })),
  { href: '/services/full-inspection', eyebrow: 'Service', title: 'Full Home Inspection', blurb: 'A thorough, plain-English inspection of the whole home.' },
  { href: '/services/radon', eyebrow: 'Service', title: 'Radon Testing', blurb: 'A 48-hour continuous radon test with same-day results.' },
  { href: '/services/mold', eyebrow: 'Service', title: 'Mold Assessment', blurb: 'Identify moisture and mold concerns before they spread.' },
]
