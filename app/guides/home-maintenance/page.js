import Image from 'next/image'
import ServiceHero from '@/components/ServiceHero'
import CTABanner from '@/components/CTABanner'
import MoreReading from '@/components/MoreReading'
import { breadcrumbJsonLd } from '@/lib/jsonld'

export const metadata = {
  title: 'Seasonal Home Maintenance Guide — Front Range Homeowners',
  description:
    'A season-by-season home maintenance checklist from Inspectrum Inspections, tuned for Colorado Front Range homes — gutters, HVAC, roof, wildfire defensible space, ice dams, radon, and more.',
  alternates: { canonical: '/guides/home-maintenance' },
  openGraph: {
    title: 'Seasonal Home Maintenance Guide — Inspectrum Inspections',
    description: 'The upkeep that actually prevents the problems we find most, organized by season for Front Range homes.',
    url: 'https://evergreeninspections.com/guides/home-maintenance',
  },
}

// All copy original to Inspectrum. Front Range specifics woven into each season:
// wildfire defensible space, freeze-thaw, ice dams, high-altitude HVAC strain, radon.
const SEASONS = [
  {
    id: 'spring',
    name: 'Spring',
    tagline: 'Thaw, water, and what winter left behind',
    intro:
      "Spring is when water shows you every shortcut the house took over winter. Snowmelt finds clogged gutters, tired caulk, and hairline foundation cracks fast — so this is the season to get ahead of water before it gets inside.",
    photo: { src: '/guides/spring-guide-maintenance.png', alt: 'An inspector clearing a gutter of debris as spring snowmelt runs off, Colorado mountains in the background' },
    tasks: [
      { h: 'Clear gutters and downspouts', b: 'Flush out winter debris and confirm downspouts carry water at least 4–6 feet away from the foundation. This is the single best defense against a wet basement.' },
      { h: 'Inspect the roof', b: 'From the ground or with binoculars, look for missing or lifted shingles, damaged flashing, and granules in the gutters — all signs winter took a toll.' },
      { h: 'Service the AC early', b: 'Have cooling serviced before the first hot stretch. At altitude your system works harder, and early service catches small issues before peak-season backlogs.' },
      { h: 'Reseal exterior gaps', b: 'Re-caulk around windows, doors, and trim where freeze-thaw opened gaps. Touch up exterior paint to keep moisture out of the wood.' },
      { h: 'Test the sump pump', b: 'Pour a bucket of water into the pit and confirm the pump kicks on and drains. Spring is the worst time to discover it failed.' },
      { h: 'Start your defensible space', b: 'Front Range: rake pine needles and dead vegetation out of the first 5 feet around the house and deck as soon as the snow clears — the highest-impact wildfire step you can take.' },
    ],
  },
  {
    id: 'summer',
    name: 'Summer',
    tagline: 'Heat, sun, and the great outdoors',
    intro:
      "Summer is the season for the exterior. Intense high-altitude sun is hard on finishes, decks, and roofing, and the long dry stretches make fire safety and a few quiet fire-prevention chores worth your attention.",
    photo: { src: '/guides/summer-guide-maintenance-person.png', alt: 'A homeowner staining and sealing a wood deck on a sunny summer day with the mountains behind' },
    tasks: [
      { h: 'Clean the dryer vent', b: "Lint buildup in the dryer duct is a leading cause of appliance house fires. Disconnect, vacuum the line, and clear the exterior vent flap." },
      { h: 'Inspect and reseal the deck', b: 'Check for loose boards, popped fasteners, and wobbly railings, then reseal. Mountain sun and snow cycles age decks faster than most owners expect.' },
      { h: 'Wash and check siding', b: "Rinse off dust and pollen and look for cracked, warped, or sun-faded sections — especially on south and west exposures that take the most UV." },
      { h: 'Test safety devices', b: 'Press-test every smoke and carbon-monoxide detector and your GFCI outlets. Replace any detector older than 10 years.' },
      { h: 'Trim back vegetation', b: 'Keep branches and shrubs from touching the house and roofline — good for moisture, pests, and fire alike.' },
      { h: 'Tend your defensible zones', b: 'Front Range: keep Zone 1 (0–5 ft) free of anything flammable and thin vegetation through Zone 2 (5–30 ft) to lower fire intensity near the home.' },
    ],
  },
  {
    id: 'fall',
    name: 'Fall',
    tagline: 'Button the house up before the cold',
    intro:
      "Fall is preparation season. A few hours now — on the furnace, the gutters, and the outdoor plumbing — prevents the cold-weather emergencies we get the most frantic calls about.",
    photo: { src: '/guides/fall-guide-maintenance.png', alt: 'A technician servicing a furnace and installing a fresh filter before heating season' },
    tasks: [
      { h: 'Service the heating system', b: 'Have the furnace or heat pump professionally serviced and put in a fresh filter. At altitude these systems run harder all winter — start the season clean.' },
      { h: 'Clean gutters after leaf drop', b: 'A second cleaning once the leaves are down keeps meltwater flowing and is your first line of defense against ice dams.' },
      { h: 'Winterize outdoor plumbing', b: 'Disconnect and drain hoses, shut off and drain exterior spigots, and insulate any exposed pipes before the first hard freeze.' },
      { h: 'Seal the envelope', b: 'Add weatherstripping, seal attic air leaks, and top up attic insulation. It cuts heating bills and helps prevent the warm-roof conditions that cause ice dams.' },
      { h: 'Inspect the fireplace and flue', b: 'If you burn wood, have the chimney inspected and swept, and confirm the damper seals.' },
      { h: 'Schedule a radon retest', b: "Front Range: the EPA recommends retesting every two years, even after a low result. Fall is a natural time to book one. See our radon prep guide." },
    ],
  },
  {
    id: 'winter',
    name: 'Winter',
    tagline: 'Protect against snow, ice, and frozen pipes',
    intro:
      "Winter maintenance is mostly vigilance — watching the roof, the pipes, and the heat. The goal is simply to catch snow load, ice, and freeze risk before any of them turn into damage.",
    photo: { src: '/guides/winter-guide-maintenance.png', alt: 'Clearing snow and ice from a roof edge with a roof rake to prevent ice dams' },
    tasks: [
      { h: 'Watch for ice dams', b: 'After heavy snow, rake the lower roof edge and keep gutters clear. Ice dams back meltwater up under the shingles and into the ceilings below.' },
      { h: 'Guard against frozen pipes', b: 'Keep the house at 55°F or above, open cabinet doors on exterior walls, and let faucets drip during deep cold snaps to keep water moving.' },
      { h: 'Monitor snow load', b: 'Keep an eye on decks, porch roofs, and any flat sections during big storms, and watch for long icicles forming over entries and walkways.' },
      { h: 'Test detectors monthly', b: 'Heating season is when carbon-monoxide risk peaks — test smoke and CO alarms monthly and keep a charged extinguisher handy.' },
      { h: 'Keep vents and exhausts clear', b: 'Make sure furnace intake/exhaust vents, the dryer vent, and any high-efficiency terminations stay clear of drifting snow.' },
      { h: 'Mind the altitude', b: 'Front Range: combustion appliances work harder in thin, cold air. If the furnace short-cycles or struggles, call for service early rather than mid-storm.' },
    ],
  },
]

function SeasonPhoto({ photo }) {
  return (
    <div className="relative w-full aspect-[3/2] rounded-sm overflow-hidden bg-paper">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  )
}

export default function HomeMaintenanceGuide() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: '/' },
              { name: 'Guides', url: '/guides' },
              { name: 'Home Maintenance', url: '/guides/home-maintenance' },
            ]),
          ),
        }}
      />

      <ServiceHero
        variant="teal"
        eyebrow="Homeowner Guide"
        title={<>Your home, <em className="italic text-amber">season by season.</em></>}
        description="We inspect hundreds of Front Range homes a year. This is the upkeep that actually prevents the problems we find most — organized by season, with the mountain-specific tasks the national checklists skip."
        primaryCTA={{ label: 'Book an Inspection', href: '/schedule' }}
      />

      {/* Sticky season sub-nav */}
      <nav className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line">
        <div className="max-w-[1100px] mx-auto px-5 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <span className="hidden sm:block text-[0.7rem] uppercase tracking-[0.2em] text-charcoal/40 font-semibold py-4 pr-3">Jump to</span>
          {SEASONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="whitespace-nowrap py-4 px-3 text-sm font-medium text-charcoal/70 hover:text-teal border-b-2 border-transparent hover:border-teal transition-colors no-underline"
            >
              {s.name}
            </a>
          ))}
        </div>
      </nav>

      {/* Intro / personal note */}
      <section className="bg-cream py-16 px-5 lg:px-8">
        <div className="max-w-[760px] mx-auto">
          <p className="text-[1.15rem] text-charcoal leading-[1.8]">
            A home is the biggest thing most of us will ever own, and the difference between a small fix and an expensive one is almost always a little attention at the right time. You don&apos;t need to do everything at once — just the right things each season. Keep this guide handy, and reach out anytime if you&apos;d like a second set of eyes.
          </p>
          <p className="text-[1.05rem] text-ink font-serif italic mt-6">— Harry Foster, Inspectrum Inspections</p>
        </div>
      </section>

      {/* Seasonal sections */}
      {SEASONS.map((season, idx) => (
        <section
          key={season.id}
          id={season.id}
          className={`${idx % 2 === 0 ? 'bg-paper' : 'bg-cream'} py-20 px-5 lg:px-8 border-t border-line scroll-mt-20`}
        >
          <div className="max-w-[1100px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <div className="section-eyebrow">{season.name}</div>
                <h2 className="text-[clamp(2rem,4vw,3.2rem)] text-ink mb-4">{season.tagline}</h2>
                <p className="text-[0.98rem] text-charcoal leading-[1.75] mb-6">{season.intro}</p>
                <SeasonPhoto photo={season.photo} />
              </div>
              <div className="grid grid-cols-1 gap-px bg-line border border-line rounded-sm overflow-hidden">
                {season.tasks.map((t) => (
                  <div key={t.h} className="bg-paper p-6">
                    <h3 className="text-[1.05rem] text-ink font-semibold mb-1.5 flex items-start gap-2">
                      <span className="text-teal mt-0.5">✓</span> {t.h}
                    </h3>
                    <p className="text-[0.9rem] text-charcoal/80 leading-relaxed pl-6">
                      {t.b}
                      {season.id === 'fall' && t.h === 'Schedule a radon retest' && (
                        <> <a href="/services/radon#prepare" className="text-teal font-medium hover:text-amber">Radon prep guide →</a></>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      <MoreReading currentHref="/guides/home-maintenance" />

      <CTABanner
        eyebrow="A Second Set of Eyes"
        title={<>Want a professional once-over?</>}
        description="Whether you're buying, selling, or just want peace of mind on the home you're in, we'll give it a thorough, plain-English inspection."
        primaryLabel="Schedule an Inspection"
      />
    </>
  )
}
