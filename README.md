# Inspectrum Inspections — Website (Next.js)

Server-rendered marketing site for Inspectrum Inspections, built with Next.js 16 App Router, Tailwind CSS v4, and React 19.

## Why Next.js (vs the previous Vite version)

This is a local home-inspection business — its livelihood depends on Google rankings for searches like *"home inspector evergreen co"* and *"radon testing denver."* That makes server-rendered HTML and structured data important enough to justify the extra setup over a pure SPA.

What you get out of the box now:

- **Server-rendered pages** — Google sees the full HTML on every page, not an empty `<div id="root">`
- **Per-page metadata** — each page has its own `<title>`, `<meta description>`, OpenGraph tags, and canonical URL
- **JSON-LD structured data** — `LocalBusiness` schema in the root layout (helps with "near me" results and Google Knowledge Panel) and `FAQPage` schema auto-generated from each FAQ
- **Auto-generated `/sitemap.xml`** at `app/sitemap.js`
- **Auto-generated `/robots.txt`** at `app/robots.js`
- **Optimized fonts** via `next/font/google` (no FOUT, no extra requests)
- **Static generation** — pages are pre-rendered at build time, so they serve as fast static HTML and *also* hydrate into a React app

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build for production

```bash
npm run build
npm start   # serves the production build on :3000
```

## Project structure

```
app/
  layout.js               # Root layout: Nav, Footer, fonts, default metadata, LocalBusiness JSON-LD
  page.js                 # / homepage (server component)
  globals.css             # Tailwind v4 import + brand theme tokens
  sitemap.js              # auto-generates /sitemap.xml
  robots.js               # auto-generates /robots.txt

  services/
    full-inspection/page.js
    radon/page.js
    mold/page.js
    commercial/page.js    # Each: server component with metadata export

  contact/
    page.js               # server: metadata
    ContactClient.jsx     # client: form state

  schedule/
    page.js               # server: metadata
    SchedulerClient.jsx   # client: multi-step booking flow

components/                # All shared components
  BrandLogo.jsx           # Logo SVG image lockup (server)
  Nav.jsx                 # Top nav (client — uses usePathname/useState)
  Footer.jsx              # Footer (server)
  Button.jsx              # Universal button (server)
  ServiceHero.jsx         # Hero variants for service pages (server)
  SectionIntro.jsx        # 2-col intro pattern (server)
  Deliverables.jsx        # Numbered list on dark teal (server)
  FAQ.jsx                 # Accordion + auto-generated FAQPage JSON-LD (server)
  CTABanner.jsx           # Closing CTA band (server)

public/
  InspectrumLogo.svg      # Primary Inspectrum logo asset
```

Server vs client components: anything that doesn't need browser-only APIs or interactivity is a server component (no `'use client'` directive). This keeps the JavaScript bundle small — only the Nav (because of mobile menu state) and the form pages ship interactive code.

## Animation patterns

Hero content uses the shared `hero-reveal` utility in `app/globals.css` to fade in and move up slightly on page load. Add `hero-reveal-1` through `hero-reveal-5` to create a stepped reveal for eyebrow, headline, body/stats, CTAs, and secondary panels.

The homepage service strip uses `animate-marquee` with a duplicated item track for a seamless horizontal slide. Site animations respect `prefers-reduced-motion`.

## Routing

| Path | Page | Title |
|------|------|-------|
| `/` | Home | Home Inspections in Evergreen, CO & Denver Metro |
| `/services/full-inspection` | Full Inspection | Full Home Inspection — Same-Day Reports |
| `/services/radon` | Radon | Radon Testing in Colorado — 48-Hour Continuous Monitor |
| `/services/mold` | Mold | Mold Assessment & Moisture Mapping in Denver Metro |
| `/services/commercial` | Commercial | Commercial Property Inspections in Colorado |
| `/contact` | Contact | Contact Inspectrum Inspections |
| `/schedule` | Scheduler | Schedule a Home Inspection Online |

Each page exports its own `metadata` object — Next.js merges it with the defaults from `app/layout.js`.

## Navigation

`components/Nav.jsx` includes a responsive Services dropdown. Desktop users get a hover/focus mega menu, while mobile users see the service links inside the expanded nav. The menu links to the available service pages plus included/quote-based service categories:

- Full Home Inspection: `/services/full-inspection`
- Radon Testing: `/services/radon`
- Mold & Meth Testing: `/services/mold`
- Commercial Inspections: `/services/commercial`
- Roof & Exterior and Plumbing & Electrical: `/services/full-inspection`
- À La Carte Inspections: `/contact`

The nav logo renders larger in a badge at the top of the page, extending below the fixed nav. As the user scrolls, `components/Nav.jsx` interpolates the logo badge down until it fits within the nav height. The nav keeps its standard gray border after scrolling, with an amber left-to-right sweep animation only when the page is at the top.

## SEO checklist (already done)

- [x] Server-rendered HTML on every page
- [x] Unique `<title>` and `<meta description>` per page
- [x] Canonical URLs
- [x] OpenGraph + Twitter card tags
- [x] LocalBusiness JSON-LD with hours, geo, service area
- [x] FAQPage JSON-LD on every page with FAQs (rich results in Google)
- [x] sitemap.xml
- [x] robots.txt
- [x] Optimized Google Fonts via `next/font`
- [x] `lang="en"` on `<html>`
- [x] Semantic landmarks (`<header>`, `<main>`, `<footer>`, `<nav>`)

## Still TODO when going live

1. **Update `metadataBase`** in `app/layout.js` if your domain isn't `evergreeninspections.com`
2. **Add Google Search Console** — verify the site, submit the sitemap
3. **Add Google Business Profile** — local SEO for "near me" searches lives here, not on the site
4. **Get reviews** — embed review snippets and add `aggregateRating` to the LocalBusiness JSON-LD once you have them
5. **Add real OG images** — drop a 1200x630px `og-image.png` in `public/` and reference it in the metadata
6. **Wire up the contact form** — replace `handleSubmit` in `ContactClient.jsx` with a fetch to your form endpoint (Formspree, Resend, your backend, etc.)
7. **Wire up the scheduler** — replace the mock `getAvailableSlots` in `SchedulerClient.jsx` with a real availability API

## Deployment

Best fit is **Vercel** (made by the Next.js team, zero config):

```bash
npx vercel
```

Other options that work:
- **Netlify** — supports Next.js with their Next.js Runtime
- **Cloudflare Pages** — supports Next.js via `@cloudflare/next-on-pages`
- Self-hosted Node — `npm run build && npm start`

## Theming

Brand tokens live in `app/globals.css` under `@theme`. Edit once, everything updates:

```css
@theme {
  --color-teal: #2B7E8C;
  --color-amber: #E89A3F;
  ...
}
```

These auto-generate `bg-teal`, `text-amber`, `border-teal-deep`, etc. throughout the project.

Fraunces is loaded in `app/layout.js` with the `opsz`, `SOFT`, and `WONK` variable axes enabled through `next/font/google`.
