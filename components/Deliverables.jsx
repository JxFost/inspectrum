export default function Deliverables({
  eyebrow = 'What You Get',
  title,
  intro,
  items = [],
}) {
  return (
    <section className="relative overflow-hidden bg-teal-darker text-cream py-24 px-5 lg:px-8">
      <div
        className="absolute -top-36 -right-36 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(232,154,63,0.18), transparent 70%)',
        }}
      />
      <div className="max-w-[1400px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20 items-start">
        <div>
          <div className="section-eyebrow !text-amber">{eyebrow}</div>
          <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] text-cream mb-6">{title}</h2>
          {intro && <p className="text-lg opacity-85 leading-relaxed">{intro}</p>}
        </div>

        <div className="flex flex-col gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex gap-6 items-start py-6 ${i < items.length - 1 ? 'border-b border-cream/10' : ''}`}
            >
              <div className="font-serif italic text-[1.4rem] text-amber shrink-0 leading-none font-medium">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h4 className="text-[1.3rem] text-cream mb-2">{item.title}</h4>
                <p className="text-[0.95rem] opacity-80 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
