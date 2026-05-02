export default function SectionIntro({ eyebrow, title, paragraphs = [], background = 'cream' }) {
  const bg = background === 'paper' ? 'bg-paper' : 'bg-cream'
  return (
    <section className={`${bg} py-24 px-5 lg:px-8`}>
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-20 items-start">
        <div>
          <div className="section-eyebrow">{eyebrow}</div>
          <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-ink">{title}</h2>
        </div>
        <div className="space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[1.05rem] text-charcoal leading-[1.7]">{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
