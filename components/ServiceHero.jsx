import Button from './Button'

const HERO_BG = {
  teal: 'bg-gradient-to-br from-teal-darker to-teal-deep',
  amber: 'bg-gradient-to-br from-[#6b4424] to-[#8a5a2e]',
  dark: 'bg-gradient-to-br from-charcoal-deep to-teal-darker',
}

export default function ServiceHero({
  variant = 'teal',
  eyebrow,
  title,
  description,
  primaryCTA,
  secondaryCTA,
  stats = [],
}) {
  return (
    <header className={`relative overflow-hidden text-cream pt-36 pb-20 px-5 lg:px-8 ${HERO_BG[variant]}`}>
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.3'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="max-w-[1400px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-center">
        <div>
          {eyebrow && <div className="hero-reveal hero-reveal-1 hero-eyebrow">{eyebrow}</div>}
          <h1 className="hero-reveal hero-reveal-2 text-[clamp(2.5rem,6.5vw,5.5rem)] font-medium leading-[1.05] tracking-tight mb-6">
            {title}
          </h1>
          <p className="hero-reveal hero-reveal-3 text-lg opacity-90 max-w-xl leading-relaxed mb-8">
            {description}
          </p>
          <div className="hero-reveal hero-reveal-4 flex flex-col sm:flex-row gap-3 flex-wrap">
            {primaryCTA && (
              <Button variant="primary" href={primaryCTA.href} withArrow>
                {primaryCTA.label}
              </Button>
            )}
            {secondaryCTA && (
              <Button variant="ghost" href={secondaryCTA.href} external withPhone>
                {secondaryCTA.label}
              </Button>
            )}
          </div>
        </div>

        {stats.length > 0 && (
          <div className="hero-reveal hero-reveal-5 bg-white/[0.06] border border-white/[0.18] rounded-sm p-8 backdrop-blur-md">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={[
                  'py-5',
                  i === 0 && 'pt-0',
                  i === stats.length - 1 ? 'pb-0' : 'border-b border-white/15',
                ].filter(Boolean).join(' ')}
              >
                <div className="font-serif text-[1.8rem] font-medium text-cream leading-none mb-1.5">
                  {stat.num}{stat.em && <em className="not-italic font-normal text-amber italic"> {stat.em}</em>}
                </div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
