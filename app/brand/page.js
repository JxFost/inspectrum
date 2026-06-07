/*
 * Brand kit — a shareable reference + asset download page.
 *
 * Public (so it can be sent to vendors/partners) but noindex. Not linked from
 * site navigation; reached directly at /brand. Colors and fonts mirror the
 * tokens in app/globals.css — keep them in sync if the theme changes.
 */

export const metadata = {
  title: 'Brand Kit — Inspectrum Inspections',
  description: 'Logos, colors, typography, and voice guidelines for Inspectrum Inspections.',
  robots: { index: false, follow: false },
}

const BRAND_COLORS = [
  { name: 'Teal', token: 'teal', hex: '#2B7E8C', note: 'Primary' },
  { name: 'Teal Deep', token: 'teal-deep', hex: '#1F5C66', note: 'Hover / depth' },
  { name: 'Teal Darker', token: 'teal-darker', hex: '#143C44', note: 'Headers' },
  { name: 'Amber', token: 'amber', hex: '#E89A3F', note: 'Accent / CTA' },
  { name: 'Amber Deep', token: 'amber-deep', hex: '#C47B25', note: 'Accent hover' },
]

const NEUTRALS = [
  { name: 'Ink', token: 'ink', hex: '#1F2426', note: 'Body text', dark: true },
  { name: 'Charcoal', token: 'charcoal', hex: '#3D3F40', note: 'Secondary text', dark: true },
  { name: 'Charcoal Deep', token: 'charcoal-deep', hex: '#2A2C2D', note: 'Dark surfaces', dark: true },
  { name: 'Gray Cool', token: 'gray-cool', hex: '#9DA0A2', note: 'Muted' },
  { name: 'Paper', token: 'paper', hex: '#F5F1EA', note: 'Surface' },
  { name: 'Cream', token: 'cream', hex: '#FAF7F1', note: 'Background' },
]

const LOGOS = [
  { label: 'Primary Logo (SVG)', file: '/InspectrumLogo.svg', bg: 'light', img: '/InspectrumLogo.svg', h: 'h-24' },
  { label: 'Wordmark — Dark (SVG)', file: '/InspectrumLogoWordmark.svg', bg: 'light', img: '/InspectrumLogoWordmark.svg', h: 'h-12' },
  { label: 'Wordmark — White (SVG)', file: '/InspectrumLogoWordmark-white.svg', bg: 'dark', img: '/InspectrumLogoWordmark-white.svg', h: 'h-12' },
  { label: 'Mark / Favicon (SVG)', file: '/favicon/favicon.svg', bg: 'light', img: '/favicon/favicon.svg', h: 'h-16' },
]

const VOICE = [
  { h: 'Plain-English, never jargony', b: 'Explain findings the way you would to a friend buying their first home. If a term needs defining, define it.' },
  { h: 'Warm and local', b: "We're a small Evergreen business, not a faceless chain. Friendly, personal, and grounded in the Front Range." },
  { h: 'Honest and unhurried', b: 'No pressure, no upsells, no scare tactics. State what we found and what it means — good or bad.' },
  { h: 'Reassuring, not alarmist', b: 'Even serious findings are framed with a clear next step, so the reader feels informed rather than panicked.' },
]

const SAY = ['"Here\'s what we found, in plain English."', '"No pressure — we\'re happy to answer questions."', '"A small fix now beats an expensive one later."']
const AVOID = ['"Act now or risk catastrophic failure!"', 'Dense technical jargon with no explanation', 'Generic corporate filler']

const DOWNLOADS = [
  { label: 'Primary logo', file: '/InspectrumLogo.svg', type: 'SVG' },
  { label: 'Primary logo', file: '/InspectrumLogo_440.png', type: 'PNG' },
  { label: 'Wordmark (dark)', file: '/InspectrumLogoWordmark.svg', type: 'SVG' },
  { label: 'Wordmark (white)', file: '/InspectrumLogoWordmark-white.svg', type: 'SVG' },
  { label: 'Mark / favicon', file: '/favicon/favicon.svg', type: 'SVG' },
  { label: 'App icon (192px)', file: '/favicon/icon-192.png', type: 'PNG' },
  { label: 'Social share image', file: '/inspectrum-og.png', type: 'PNG' },
]

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="py-16 px-5 lg:px-8 border-t border-line scroll-mt-20">
      <div className="max-w-[1100px] mx-auto">
        <div className="section-eyebrow">{eyebrow}</div>
        <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] text-ink mb-8">{title}</h2>
        {children}
      </div>
    </section>
  )
}

function Swatch({ c }) {
  return (
    <div className="rounded-sm border border-line overflow-hidden bg-paper">
      <div className="h-24" style={{ backgroundColor: c.hex }} />
      <div className="p-3">
        <div className="text-sm font-semibold text-ink">{c.name}</div>
        <div className="text-xs text-charcoal/70 font-mono mt-0.5">{c.hex}</div>
        <div className="text-[0.7rem] text-charcoal/50 mt-0.5">{c.note} · <span className="font-mono">{c.token}</span></div>
      </div>
    </div>
  )
}

export default function BrandPage() {
  return (
    <>
      <header className="bg-gradient-to-br from-teal-darker to-teal-deep text-cream pt-36 pb-16 px-5 lg:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="hero-eyebrow">Brand Kit</div>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.05] mb-4">
            Inspectrum <em className="italic text-amber">brand assets.</em>
          </h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Logos, colors, type, and voice — everything you need to represent Inspectrum Inspections consistently. Download what you need below.
          </p>
          <div className="flex flex-wrap gap-2 mt-6 text-sm">
            {[['Logos', 'logos'], ['Colors', 'colors'], ['Type', 'type'], ['Voice', 'voice'], ['Downloads', 'downloads']].map(([l, id]) => (
              <a key={id} href={`#${id}`} className="px-3 py-1.5 rounded-sm bg-white/10 border border-white/20 text-cream no-underline hover:bg-white/20 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </header>

      {/* Logos */}
      <Section id="logos" eyebrow="Logos" title="Logo variants">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {LOGOS.map((logo) => (
            <div key={logo.file} className="rounded-sm border border-line overflow-hidden">
              <div className={`flex items-center justify-center p-10 ${logo.bg === 'dark' ? 'bg-teal-darker' : 'bg-paper'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.img} alt={logo.label} className={`${logo.h} w-auto`} />
              </div>
              <div className="flex items-center justify-between p-4 bg-cream border-t border-line">
                <span className="text-sm font-medium text-ink">{logo.label}</span>
                <a href={logo.file} download className="text-xs font-semibold text-white bg-teal px-3 py-1.5 rounded-sm no-underline hover:bg-teal-deep transition-colors">Download</a>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-charcoal/60 mt-5">Keep clear space around the logo and don&apos;t recolor, stretch, or add effects. Use the white wordmark on dark backgrounds only.</p>
      </Section>

      {/* Colors */}
      <Section id="colors" eyebrow="Colors" title="Color palette">
        <h3 className="text-sm font-semibold text-charcoal/60 uppercase tracking-wider mb-3">Brand</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {BRAND_COLORS.map((c) => <Swatch key={c.token} c={c} />)}
        </div>
        <h3 className="text-sm font-semibold text-charcoal/60 uppercase tracking-wider mb-3">Neutrals</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {NEUTRALS.map((c) => <Swatch key={c.token} c={c} />)}
        </div>
      </Section>

      {/* Typography */}
      <Section id="type" eyebrow="Typography" title="Type system">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-sm border border-line p-8 bg-paper">
            <div className="text-xs uppercase tracking-wider text-teal font-semibold mb-2">Display · Headings</div>
            <div className="font-serif text-5xl text-ink mb-3" style={{ fontVariationSettings: '"SOFT" 70, "WONK" 1' }}>Fraunces</div>
            <p className="font-serif text-2xl text-ink mb-1">Aa Bb Cc Dd Ee</p>
            <p className="text-sm text-charcoal/60 mt-3">Warm, characterful serif. Used for headings and emphasis (often italic in amber).</p>
          </div>
          <div className="rounded-sm border border-line p-8 bg-paper">
            <div className="text-xs uppercase tracking-wider text-teal font-semibold mb-2">Body · UI</div>
            <div className="text-5xl font-medium text-ink mb-3">Inter Tight</div>
            <p className="text-2xl text-ink mb-1">Aa Bb Cc Dd Ee</p>
            <p className="text-sm text-charcoal/60 mt-3">Clean, legible sans for body copy, buttons, and interface text.</p>
          </div>
        </div>
      </Section>

      {/* Voice */}
      <Section id="voice" eyebrow="Voice & Language" title="How we sound">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line rounded-sm overflow-hidden mb-8">
          {VOICE.map((v) => (
            <div key={v.h} className="bg-paper p-6">
              <h3 className="text-[1.05rem] text-ink font-semibold mb-1.5">{v.h}</h3>
              <p className="text-sm text-charcoal/80 leading-relaxed">{v.b}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-sm border border-teal/30 bg-teal/[0.06] p-6">
            <div className="text-xs uppercase tracking-wider text-teal font-semibold mb-3">Sounds like us</div>
            <ul className="space-y-2 text-sm text-charcoal/80">{SAY.map((s) => <li key={s} className="flex gap-2"><span className="text-teal">✓</span>{s}</li>)}</ul>
          </div>
          <div className="rounded-sm border border-amber/30 bg-amber/[0.06] p-6">
            <div className="text-xs uppercase tracking-wider text-amber-deep font-semibold mb-3">Avoid</div>
            <ul className="space-y-2 text-sm text-charcoal/80">{AVOID.map((s) => <li key={s} className="flex gap-2"><span className="text-amber-deep">✕</span>{s}</li>)}</ul>
          </div>
        </div>
      </Section>

      {/* Downloads */}
      <Section id="downloads" eyebrow="Downloads" title="Asset downloads">
        <div className="rounded-sm border border-line overflow-hidden divide-y divide-line">
          {DOWNLOADS.map((d) => (
            <div key={d.file} className="flex items-center justify-between p-4 bg-paper">
              <div>
                <span className="text-sm font-medium text-ink">{d.label}</span>
                <span className="ml-2 text-[0.65rem] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-charcoal/10 text-charcoal/60">{d.type}</span>
              </div>
              <a href={d.file} download className="text-xs font-semibold text-white bg-teal px-4 py-1.5 rounded-sm no-underline hover:bg-teal-deep transition-colors">Download</a>
            </div>
          ))}
        </div>
        <p className="text-sm text-charcoal/60 mt-5">Need something not listed here — a specific format, the brand guide as a PDF, or print files? Just ask and we&apos;ll add it.</p>
      </Section>

      <footer className="py-12 px-5 lg:px-8 bg-cream border-t border-line text-center">
        <p className="text-sm text-charcoal/60">Inspectrum Inspections · Evergreen, CO · Questions about brand usage? <a href="/contact" className="text-teal font-semibold no-underline hover:text-amber">Get in touch</a>.</p>
      </footer>
    </>
  )
}
