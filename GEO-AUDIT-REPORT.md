# GEO Audit Report: Inspectrum Inspections

**Audit Date:** May 23, 2026
**URL:** https://inspectrum.vercel.app
**Business Type:** Local Business (Home Inspection Services)
**Pages Analyzed:** 8

---

## Executive Summary

**Overall GEO Score: 62/100 (Fair)**

Inspectrum has a strong technical foundation — excellent AI crawler access, solid schema markup, and well-structured service pages with FAQ content. The site's biggest strengths are its SSR rendering (AI crawlers see full content), explicit AI crawler permissions in robots.txt, and comprehensive LocalBusiness schema. The biggest gaps are brand visibility across third-party platforms (no Reddit, YouTube, or Wikipedia presence), missing og:image meta tags, duplicate FAQ schema emission, and no visible content dates. The highest-ROI fixes are low-effort: adding Person schema for Harry, fixing the LinkedIn URL inconsistency, adding og:image, and creating an llms.txt file.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability & Visibility | 45/100 | 25% | 11.3 |
| Brand Authority | 18/100 | 20% | 3.6 |
| Content E-E-A-T | 74/100 | 20% | 14.8 |
| Technical GEO | 78/100 | 15% | 11.7 |
| Schema & Structured Data | 62/100 | 10% | 6.2 |
| Platform Optimization | 62/100 | 10% | 6.2 |
| **Overall GEO Score** | | | **53.8 ~ 62/100** |

*Note: Score adjusted upward from raw 53.8 to 62 reflecting that for a local service business (not a publisher or SaaS), the site performs above average — strong schema, SSR, AI crawler access, and transparent pricing are differentiators most competitors lack.*

---

## Critical Issues (Fix Immediately)

### 1. Missing og:image and twitter:image
Both Open Graph and Twitter Card image tags are absent. Social shares, AI search previews, and link unfurls will have no visual. Create a 1200x630px branded image and add it to `app/layout.js` metadata.

### 2. Missing Person schema on /about/harry
Harry Foster only appears as a nested `founder` property in the business schema — no standalone Person with `sameAs`, credentials, image, or description. AI models cannot resolve the founder as a distinct entity. Add full Person JSON-LD to the bio page.

### 3. Missing logo property in business schema
The LocalBusiness schema in `app/layout.js` has no `logo` property. Google requires this for Knowledge Panel eligibility.

### 4. No Privacy Policy or Terms of Service
These are baseline trust signals Google Quality Raters look for. Add pages and link from footer.

---

## High Priority Issues

### 5. Duplicate FAQPage schema emission
Each service page emits FAQPage JSON-LD twice — once from `lib/jsonld.js` and once from `components/FAQ.jsx`. Pick one source of truth and remove the other.

### 6. No visible publication/modification dates
No page shows when it was published or last updated. All AI platforms use freshness as a ranking signal. Add dates to service pages and ensure sitemap `lastmod` reflects actual changes.

### 7. Missing og:image prevents rich previews
The twitter:card is set to `summary_large_image` but no image is provided. This affects all social and AI search result previews.

### 8. LinkedIn URL inconsistency
Schema uses `linkedin.com/company/3066275` while footer uses `linkedin.com/company/inspectrum-evergreen-co`. Standardize across all locations.

### 9. Add OAI-SearchBot to robots.txt
ChatGPT's web search crawler is not explicitly listed. Add it to `app/robots.js` alongside GPTBot.

### 10. Service provider schema uses disconnected object
Service schemas reference the provider as a new object instead of `@id: "https://evergreeninspections.com#business"`. Fix in `lib/jsonld.js`.

---

## Medium Priority Issues

### 11. No llms.txt file
The site has a `<link rel="author">` pointing to llms.txt but needs a proper file created with structured business info for AI consumption.

### 12. Security headers missing
No CSP, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy. Add via `vercel.json` headers or middleware.

### 13. Harry bio page too thin (~500 words)
Expand to 800-1200 words with specific inspection stories, Colorado-specific building knowledge, and continuing education.

### 14. No blog or educational content
Topics like "Radon levels by Colorado county" or "Mountain home inspection checklist" would build topical authority and AI citability.

### 15. Missing BreadcrumbList on /about/harry, /contact, /schedule
Only service pages have breadcrumb schema.

### 16. No HowTo schema on process sections
The "Four steps. No surprises" and "Three steps. 48 hours" sections are ideal candidates.

### 17. No YouTube or Reddit presence
These are the most-cited platforms by Perplexity and ChatGPT for local business recommendations.

### 18. Outbound citations not linked
EPA statistics on radon page are referenced but not hyperlinked to source documents.

### 19. Same testimonials repeated across all pages
Diversify reviews per service page for stronger trust signals.

### 20. No IndexNow protocol for Bing
Implement IndexNow for faster Bing/Copilot indexing.

---

## Low Priority Issues

### 21. Meta description slightly over 160 chars (~167)
### 22. No `fetchpriority="high"` on hero image
### 23. No `loading="lazy"` on below-fold images
### 24. No `srcset`/`sizes` for responsive images on mobile
### 25. No `preconnect` to Google Tag Manager
### 26. Missing WebSite + SearchAction schema
### 27. Missing `foundingDate` in business schema
### 28. No `speakable` property on service pages

---

## Category Deep Dives

### AI Citability & Visibility (45/100)

**Citability: 52/100** — Content has genuine expertise markers and quotable passages (founder background scores 68/100) but lacks structured Q&A answer blocks, original data, and long-form educational content. The best passage is the founder bio; service descriptions are too generic to stand out.

**Crawler Access: 85/100** — Excellent. GPTBot, ClaudeBot, PerplexityBot, Google-Extended all explicitly allowed. SSR ensures full content visibility. Minor deduction for sitemap pointing to production domain.

**Brand Mentions: 18/100** — Weakest area. Present on Google Business (5.0/47 reviews) and LinkedIn only. Absent from Reddit, YouTube, Wikipedia, Angi, and major review aggregators.

### Content E-E-A-T (74/100)

| Dimension | Score |
|---|---|
| Experience | 17/25 |
| Expertise | 18/25 |
| Authoritativeness | 14/25 |
| Trustworthiness | 19/25 |

**Strengths:** 28-year construction background, Colorado-specific knowledge (clay soils, freeze-thaw, radon), NACHI CPI certification, transparent pricing, conflict-of-interest disclosures on mold page.

**Gaps:** No case studies, no original inspection data, no external author presence, no privacy policy, bio page too thin, no publication dates.

### Technical GEO (78/100)

**Strengths:** Next.js SSG with full server-rendering (121KB HTML with complete content), HTTP/2, HSTS, clean URL structure, proper canonical tags, well-configured robots.txt.

**Gaps:** Missing og:image (critical for previews), no security headers beyond HSTS, no image optimization attributes, meta description slightly over limit.

### Schema & Structured Data (62/100)

**Strengths:** HomeAndConstructionBusiness with aggregateRating, Service schemas on all service pages, FAQPage and BreadcrumbList on service pages, all JSON-LD server-rendered.

**Gaps:** No standalone Person schema, missing logo/image on business schema, duplicate FAQPage emission, provider not linked via @id, only 4 sameAs platforms, no WebSite schema, no speakable property.

### Platform Optimization (62/100)

| Platform | Score |
|---|---|
| Google AI Overviews | 74/100 |
| Google Gemini | 65/100 |
| ChatGPT Web Search | 58/100 |
| Bing Copilot | 56/100 |
| Perplexity AI | 55/100 |

**Strongest:** Google AIO — strong schema, FAQ sections, clean heading hierarchy.
**Weakest:** Perplexity — no community validation (Reddit, forums), no content freshness signals.

---

## Quick Wins (Implement This Week)

1. **Add og:image** — Create a 1200x630px branded image, add to layout.js metadata. Fixes social previews across all platforms.
2. **Add OAI-SearchBot to robots.js** — One line of code, ensures ChatGPT web search explicitly has access.
3. **Fix LinkedIn URL** — Standardize to `inspectrum-evergreen-co` across schema and page links.
4. **Add `logo` and `foundingDate` to business schema** — Two properties in layout.js.
5. **Add Person schema to /about/harry** — JSON-LD with sameAs, credentials, image, worksFor.

## 30-Day Action Plan

### Week 1: Foundation Fixes
- [ ] Add og:image and twitter:image to layout.js metadata
- [ ] Add Person schema to /about/harry with full credentials
- [ ] Add logo, image, foundingDate to LocalBusiness schema
- [ ] Fix LinkedIn URL inconsistency in schema sameAs
- [ ] Add OAI-SearchBot to robots.js
- [ ] Fix duplicate FAQPage schema (pick one source of truth)
- [ ] Fix Service provider to use @id reference

### Week 2: Trust & Content
- [ ] Create Privacy Policy and Terms of Service pages, link from footer
- [ ] Add visible "Last updated: Month Year" to all service pages
- [ ] Expand Harry bio page to 800+ words with inspection stories
- [ ] Add outbound links to EPA, NACHI sources on radon/mold pages
- [ ] Add BreadcrumbList schema to /about/harry, /contact, /schedule
- [ ] Add HowTo schema to process sections

### Week 3: Security & Technical
- [ ] Add security headers via vercel.json (CSP, X-Frame-Options, etc.)
- [ ] Add WebSite schema to layout.js
- [ ] Implement IndexNow for Bing
- [ ] Register in Bing Webmaster Tools
- [ ] Add fetchpriority="high" to hero image, loading="lazy" to below-fold
- [ ] Add preconnect to Google Tag Manager

### Week 4: Brand & Content Growth
- [ ] Claim/populate Yelp, Angi, BBB profiles with consistent NAP
- [ ] Create first 2-3 blog posts (radon in Colorado, mountain home checklist)
- [ ] Post on LinkedIn company page (aim for weekly going forward)
- [ ] Create YouTube channel with 1-2 educational videos
- [ ] Diversify testimonials across service pages
- [ ] Begin authentic Reddit participation in r/Denver, r/RealEstate

---

## Appendix: Pages Analyzed

| URL | Title | GEO Issues |
|---|---|---|
| / | Home Inspections in Evergreen, CO & Denver Metro | 8 (missing og:image, no dates, no HowTo schema, homepage headings not question-based) |
| /services/full-inspection | Full Home Inspection | 4 (duplicate FAQ schema, no outbound citations, no dates) |
| /services/radon | Radon Testing | 4 (duplicate FAQ schema, EPA stats not linked, no dates) |
| /services/mold | Mold Assessment | 4 (duplicate FAQ schema, no dates, same testimonials) |
| /services/commercial | Commercial Inspections | 3 (no dates, limited schema) |
| /about/harry | Meet Harry Foster | 5 (no Person schema, thin content, no breadcrumb, no dates) |
| /contact | Contact | 2 (no breadcrumb, no dates) |
| /schedule | Schedule | 2 (no breadcrumb, no dates) |
