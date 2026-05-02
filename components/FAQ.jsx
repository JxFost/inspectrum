// Renders an accordion FAQ section AND emits FAQPage JSON-LD so Google can
// show questions as a rich result in search. The structured data is generated
// from the same `items` array — single source of truth.

function stripJsx(node) {
  // Convert React node to plain string for JSON-LD `text` field
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(stripJsx).join('')
  if (node?.props?.children) return stripJsx(node.props.children)
  return ''
}

export default function FAQ({ eyebrow = 'Common Questions', title, items = [] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripJsx(it.a),
      },
    })),
  }

  return (
    <section className="bg-cream py-24 px-5 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-eyebrow justify-center">{eyebrow}</div>
          <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">
            {title}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {items.map((item, i) => (
            <details key={i} className="border-b border-line py-6 group">
              <summary className="font-serif text-[1.2rem] font-medium text-ink cursor-pointer flex justify-between items-center gap-4">
                <span>{item.q}</span>
                <span className="text-2xl text-amber font-light shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-4 text-charcoal leading-relaxed [&_a]:text-teal [&_a]:font-semibold [&_a]:no-underline hover:[&_a]:text-amber">
                {typeof item.a === 'string' ? <p>{item.a}</p> : item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
