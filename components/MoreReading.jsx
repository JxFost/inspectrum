'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CONTENT_PAGES } from '@/lib/guides'

/*
 * Reusable "More Reading" block for the bottom of content pages.
 * Shows 3 other content pages, reshuffled on each load so the page never
 * looks quite the same. Renders a stable first-3 on the server, then shuffles
 * on the client after mount (avoids hydration mismatch).
 */
export default function MoreReading({ currentHref }) {
  const pool = CONTENT_PAGES.filter((p) => p.href !== currentHref)
  const [items, setItems] = useState(() => pool.slice(0, 3))

  useEffect(() => {
    // Fisher–Yates shuffle, then take 3
    const a = [...pool]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    setItems(a.slice(0, 3))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHref])

  if (items.length === 0) return null

  return (
    <section className="bg-paper py-16 px-5 lg:px-8 border-t border-line">
      <div className="max-w-[1100px] mx-auto">
        <div className="section-eyebrow">Keep Reading</div>
        <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] text-ink mb-8">More from our guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {items.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group block rounded-sm border border-line bg-cream p-6 no-underline hover:border-teal hover:-translate-y-0.5 transition-all"
            >
              <div className="text-[0.7rem] uppercase tracking-[0.2em] text-amber font-semibold mb-2">{p.eyebrow}</div>
              <h3 className="text-[1.2rem] text-ink mb-2 group-hover:text-teal transition-colors">{p.title}</h3>
              <p className="text-sm text-charcoal/75 leading-relaxed line-clamp-3">{p.blurb}</p>
              <span className="inline-block text-sm font-semibold text-teal mt-3">Read →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
