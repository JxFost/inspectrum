import Button from './Button'

export default function CTABanner({
  eyebrow = 'Ready to Schedule',
  title,
  description = "Pick a date, choose a time, and we'll confirm by phone within a few hours.",
  primaryLabel = 'Schedule Online',
  primaryHref = '/schedule',
  secondaryLabel = 'Call (303) 697-0990',
  secondaryHref = 'tel:3036970990',
}) {
  return (
    <section className="relative overflow-hidden bg-charcoal-deep text-cream py-24 px-5 lg:px-8">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 400'%3E%3Cpath d='M0,300 L100,220 L200,260 L320,180 L440,240 L560,160 L680,220 L800,140 L920,200 L1040,160 L1160,220 L1280,160 L1400,220 L1500,180 L1600,240 L1600,400 L0,400 Z' fill='%231f5c66' opacity='0.5'/%3E%3Cpath d='M0,340 L120,280 L240,320 L380,240 L520,300 L660,220 L800,290 L940,230 L1080,290 L1220,240 L1360,300 L1500,260 L1600,300 L1600,400 L0,400 Z' fill='%232b7e8c' opacity='0.4'/%3E%3C/svg%3E") no-repeat bottom center`,
          backgroundSize: 'cover',
        }}
      />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="section-eyebrow justify-center">{eyebrow}</div>
        <h2 className="text-[clamp(2.2rem,4.5vw,3.5rem)] mb-5">{title}</h2>
        <p className="text-lg opacity-85 mb-8 max-w-xl mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button variant="primary" href={primaryHref} withArrow>{primaryLabel}</Button>
          <Button variant="ghost" href={secondaryHref} external>{secondaryLabel}</Button>
        </div>
      </div>
    </section>
  )
}
