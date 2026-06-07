/*
 * Content for the system-specific home guides (/guides/<slug>).
 *
 * Each guide is rendered by app/guides/[slug]/page.js through a shared layout,
 * so adding a new topic is just a new entry here. All copy is original and
 * written from an inspector's point of view: what we check, what commonly goes
 * wrong, and what a homeowner can safely maintain — with a licensed-pro
 * disclaimer on every page.
 */

export const SYSTEM_GUIDES = {
  plumbing: {
    title: 'Home Plumbing: An Inspector’s Guide',
    metaDescription:
      'What a home inspector checks in your plumbing, the problems we find most, and the maintenance you can do yourself. From Inspectrum Inspections, Evergreen CO.',
    eyebrow: 'Home Systems',
    heroTitle: 'Plumbing',
    heroLead:
      'Plumbing issues are some of the most common — and most expensive — problems we find. Here’s what we actually look at during an inspection, what tends to go wrong, and what you can stay ahead of yourself.',
    // Temporary keyword-matched placeholder photo (swap for /public/guides/* later)
    imageKeywords: 'plumbing,pipes',
    imageAlt: 'Home plumbing supply lines and fittings',
    proType: 'a licensed plumber',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'A home inspection is a visual, non-invasive review — here’s the plumbing we evaluate and report on.',
        items: [
          { h: 'Supply lines & water pressure', b: 'We run fixtures to check functional flow and pressure, and note the pipe materials we can see (copper, PEX, galvanized, or a mix).' },
          { h: 'Drains, waste & venting', b: 'We watch sinks, tubs, and showers drain and look for slow drainage, leaks at traps, and improper connections.' },
          { h: 'Water heater', b: 'We note the unit’s age, capacity, and type, and check the temperature-pressure relief (TPR) valve and discharge line, connections, and venting.' },
          { h: 'Fixtures & toilets', b: 'We operate faucets and flush toilets, looking for leaks, loose mounting, and fixtures that run or drip.' },
          { h: 'Shutoffs', b: 'We locate and identify the main water shutoff and note visible fixture shutoffs so you know where they are.' },
          { h: 'Signs of leaks', b: 'We look for active drips plus the evidence of past leaks — stains, corrosion, mineral buildup, and water damage under and around plumbing.' },
        ],
        footnote: 'The underground sewer line isn’t visible during a standard inspection — that’s what our sewer-scope add-on is for.',
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Hidden, slow leaks', b: 'Drips under sinks or behind walls that quietly cause rot and mold long before anyone notices.' },
          { h: 'Aging water heaters', b: 'Units past their ~10–12 year lifespan, or a missing/improper TPR discharge line — a real safety concern.' },
          { h: 'Mixed or outdated piping', b: 'Galvanized steel that’s corroding from the inside, or patchwork repairs joining incompatible materials.' },
          { h: 'Poor drainage', b: 'Slow drains, improper slope, or “S-traps” that can siphon and let sewer gas in.' },
          { h: 'Freeze damage', b: 'On the Front Range, pipes in unconditioned spaces can freeze and burst — we look for past repairs and at-risk runs.' },
          { h: 'Pressure problems', b: 'Water pressure that’s too high (no regulator) stresses the whole system; too low points to supply or corrosion issues.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can maintain yourself',
        items: [
          { h: 'Know your main shutoff', b: 'Find it before you need it. In an emergency, shutting the water off fast is the difference between a mop and a remodel.' },
          { h: 'Flush the water heater yearly', b: 'Draining sediment annually extends its life and efficiency. Note its age — if it’s past 10 years, start planning.' },
          { h: 'Winterize before the freeze', b: 'Disconnect and drain hoses, insulate exposed pipes, and let faucets drip during deep cold snaps.' },
          { h: 'Check under sinks', b: 'A quick look for moisture, swelling, or musty smell every few months catches slow leaks early.' },
          { h: 'Be kind to your drains', b: 'Keep grease out, use strainers, and skip the chemical drain cleaners — they damage pipes over time.' },
          { h: 'Watch the water bill', b: 'An unexplained jump is often the first sign of a hidden leak. Trust it and investigate.' },
        ],
      },
    ],
    related: [
      { label: 'Full Home Inspection', href: '/services/full-inspection' },
      { label: 'Radon Testing', href: '/services/radon' },
      { label: 'Seasonal Maintenance Guide', href: '/guides/home-maintenance' },
    ],
  },

  electrical: {
    title: 'Home Electrical: An Inspector’s Guide',
    metaDescription:
      'What a home inspector checks in your electrical system, the safety red flags we find most, and what you can safely keep an eye on. Inspectrum Inspections, Evergreen CO.',
    eyebrow: 'Home Systems',
    heroTitle: 'Electrical',
    heroLead:
      'Electrical problems are among the most safety-critical things we find — and often the least visible. Here’s what we check, the red flags we look for, and what you can safely keep an eye on yourself.',
    imageKeywords: 'electrical,panel',
    imageAlt: 'An electrical service panel with circuit breakers',
    proType: 'a licensed electrician',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'We evaluate the accessible, visible electrical system for safety and function — never opening live components beyond removing the panel cover.',
        items: [
          { h: 'Main panel & breakers', b: 'We check capacity, breaker condition and labeling, and look for double-tapped breakers or signs of overheating.' },
          { h: 'Service & grounding', b: 'We review the visible service entrance and confirm the system appears properly grounded and bonded.' },
          { h: 'Outlets & GFCI/AFCI', b: 'We test a representative sample of outlets and check for GFCI/AFCI protection where it’s required — kitchens, baths, garages, and exterior.' },
          { h: 'Switches & fixtures', b: 'We operate switches and fixtures, noting anything loose, warm, or non-functional.' },
          { h: 'Visible wiring', b: 'Where accessible (panel, attic, basement), we note wiring type and condition, including older aluminum or knob-and-tube.' },
          { h: 'Smoke & CO detectors', b: 'We note the presence and placement of smoke and carbon-monoxide alarms.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Double-tapped breakers', b: 'Two wires under one breaker lug that isn’t rated for it — a frequent and easily corrected hazard.' },
          { h: 'Missing GFCI/AFCI', b: 'No ground-fault protection near water or required areas, a common shock risk in older homes.' },
          { h: 'Aluminum branch wiring', b: 'Common in mid-1960s–70s homes; it needs special connectors and handling to be safe.' },
          { h: 'Open or exposed splices', b: 'Junctions without covers or wiring spliced outside a box — a fire risk.' },
          { h: 'Reversed polarity / ungrounded outlets', b: 'Wiring mistakes that defeat the safety of the outlet.' },
          { h: 'Unpermitted DIY work', b: 'The classic “handyman” panel or addition — often the source of multiple issues at once.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can do safely',
        intro: 'Electrical work itself should be left to a professional — but there’s plenty you can monitor.',
        items: [
          { h: 'Test GFCIs monthly', b: 'Press “test,” confirm power cuts, then “reset.” Replace any that don’t trip.' },
          { h: 'Test alarms monthly', b: 'Smoke and CO alarms save lives — test monthly and replace any unit over 10 years old.' },
          { h: 'Don’t overload circuits', b: 'Avoid daisy-chained power strips, retire frayed cords, and unplug high-draw devices when not in use.' },
          { h: 'Watch for warning signs', b: 'Warm outlets, buzzing, flickering lights, or breakers that trip often all warrant a call.' },
          { h: 'Keep the panel accessible', b: 'Know where it is, keep it labeled and clear, and never block it.' },
          { h: 'Leave panel work to a pro', b: 'Opening or modifying the panel is dangerous — always use a licensed electrician.' },
        ],
      },
    ],
    related: [
      { label: 'Full Home Inspection', href: '/services/full-inspection' },
      { label: 'Plumbing Guide', href: '/guides/plumbing' },
      { label: 'Seasonal Maintenance Guide', href: '/guides/home-maintenance' },
    ],
  },

  'roof-and-gutters': {
    title: 'Roof & Gutters: An Inspector’s Guide',
    metaDescription:
      'What a home inspector checks on your roof and gutters, common Front Range issues like hail and ice dams, and the maintenance that prevents leaks. Inspectrum Inspections.',
    eyebrow: 'Home Systems',
    heroTitle: 'Roof & Gutters',
    heroLead:
      'Your roof and gutters are your home’s first defense against water — and on the Front Range, against hail and snow load too. Here’s what we look at, what commonly fails, and what you can stay ahead of.',
    imageKeywords: 'roof,shingles',
    imageAlt: 'A shingled residential roof with gutters',
    proType: 'a licensed roofer',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'We evaluate the roof from the safest effective vantage point, plus the attic and interior for evidence of leaks.',
        items: [
          { h: 'Roof covering', b: 'We note the material and approximate age and look for missing, curling, cracked, or worn shingles and exposed fasteners.' },
          { h: 'Flashing & penetrations', b: 'We check flashing at chimneys, vents, valleys, and skylights — one of the most common leak sources.' },
          { h: 'Gutters & downspouts', b: 'We check attachment, slope, and whether downspouts carry water well away from the foundation.' },
          { h: 'Structure & decking', b: 'We look for sagging or deflection and note visible decking concerns from the attic.' },
          { h: 'Attic ventilation', b: 'We assess ridge/soffit ventilation and airflow, which affect roof life and ice-dam risk.' },
          { h: 'Leak evidence', b: 'We look for ceiling stains and attic moisture that point to active or past leaks.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Hail & wind damage', b: 'Extremely common on the Front Range — bruising, granule loss, and lifted or missing shingles.' },
          { h: 'End-of-life shingles', b: 'Brittle, curling, or balding shingles on a roof near the end of its service life.' },
          { h: 'Failed flashing', b: 'Cracked, rusted, or missing flashing at penetrations — a top reason roofs leak.' },
          { h: 'Gutter problems', b: 'Clogged, sagging, or disconnected gutters that dump water right at the foundation.' },
          { h: 'Ice dams', b: 'Backed-up meltwater from poor attic insulation/ventilation, forcing water under shingles.' },
          { h: 'Improper repairs', b: 'Patchwork fixes, sealant over real problems, or too many shingle layers.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can maintain yourself',
        items: [
          { h: 'Clean gutters twice a year', b: 'Spring and fall, and confirm downspouts extend 4–6 feet from the foundation.' },
          { h: 'Look after storms', b: 'From the ground, scan for damaged or missing shingles after hail and wind.' },
          { h: 'Trim overhanging branches', b: 'Keep limbs off the roof to reduce abrasion, debris, and pests.' },
          { h: 'Insulate and ventilate the attic', b: 'The best defense against ice dams is a cold, well-ventilated roof deck.' },
          { h: 'Act on stains fast', b: 'A small ceiling stain now is a cheap fix; ignored, it becomes a structural one.' },
          { h: 'Get a pro eval when due', b: 'Have the roof professionally evaluated as it nears ~20 years or after major hail.' },
        ],
      },
    ],
    related: [
      { label: 'Seasonal Maintenance Guide', href: '/guides/home-maintenance' },
      { label: 'Full Home Inspection', href: '/services/full-inspection' },
      { label: 'Energy Efficiency Guide', href: '/guides/energy-efficiency' },
    ],
  },

  hvac: {
    title: 'HVAC & Furnace: An Inspector’s Guide',
    metaDescription:
      'What a home inspector checks in your heating and cooling, common HVAC issues at altitude, and the maintenance that keeps it running. Inspectrum Inspections, Evergreen CO.',
    eyebrow: 'Home Systems',
    heroTitle: 'HVAC & Furnace',
    heroLead:
      'Heating and cooling is the system you notice only when it fails — usually at the worst time, and at altitude it works harder. Here’s what we check, what tends to go wrong, and the upkeep that keeps it running.',
    imageKeywords: 'furnace,hvac',
    imageAlt: 'A residential furnace and HVAC equipment',
    proType: 'a licensed HVAC technician',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'We operate the system using normal controls and evaluate accessible, visible components.',
        items: [
          { h: 'Heating equipment', b: 'We note the furnace or heat source’s type, approximate age, and operation, and visually check what’s accessible.' },
          { h: 'Cooling equipment', b: 'We run the AC or heat pump (in suitable weather), noting age and condenser condition.' },
          { h: 'Ductwork & airflow', b: 'We check visible ducts and registers and note rooms with weak airflow.' },
          { h: 'Filters', b: 'We check filter location and condition — a dirty filter strains the whole system.' },
          { h: 'Venting & combustion', b: 'We visually check flue/exhaust, combustion air, and gas connections for safety.' },
          { h: 'Thermostat', b: 'We confirm the thermostat operates the system through its modes.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Neglected filters', b: 'Clogged filters choke airflow, waste energy, and shorten equipment life.' },
          { h: 'Aging equipment', b: 'Units past ~15–20 years that are nearing the end of their service life.' },
          { h: 'Heat-exchanger concerns', b: 'Cracks or corrosion are a carbon-monoxide risk — we flag suspect units for professional evaluation.' },
          { h: 'Duct problems', b: 'Disconnected, leaky, or undersized ducts leaving rooms hot or cold.' },
          { h: 'No service history', b: 'Systems that haven’t been serviced in years and are overdue for a tune-up.' },
          { h: 'Sizing issues', b: 'Equipment that’s under- or over-sized, often after an addition.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can maintain yourself',
        items: [
          { h: 'Change filters regularly', b: 'Every 1–3 months depending on the filter and household — the single highest-impact habit.' },
          { h: 'Service it annually', b: 'Heating in the fall, cooling in the spring, by a licensed technician.' },
          { h: 'Keep the condenser clear', b: 'Maintain a couple feet of clearance around the outdoor unit and rinse off debris.' },
          { h: 'Don’t block vents', b: 'Keep supply and return registers open and unobstructed, and clear snow from exterior terminations.' },
          { h: 'Test CO detectors', b: 'Essential with any combustion appliance — test monthly and replace aging units.' },
          { h: 'Call early', b: 'Short-cycling or odd noises shouldn’t wait — at altitude these units work hard.' },
        ],
      },
    ],
    related: [
      { label: 'Radon Testing', href: '/services/radon' },
      { label: 'Energy Efficiency Guide', href: '/guides/energy-efficiency' },
      { label: 'Seasonal Maintenance Guide', href: '/guides/home-maintenance' },
    ],
  },

  'outdoor-safety': {
    title: 'Outdoor Safety & Yard: An Inspector’s Guide',
    metaDescription:
      'What a home inspector checks outside — decks, grading, drainage, and defensible space — plus the upkeep that keeps your yard safe. Inspectrum Inspections, Evergreen CO.',
    eyebrow: 'Home Systems',
    heroTitle: 'Outdoor Safety & Yard',
    heroLead:
      'The outside of your home is more than curb appeal — decks, grading, trees, and defensible space are real safety and maintenance concerns, especially in the mountains. Here’s what we look at and what you can manage.',
    imageKeywords: 'deck,patio',
    imageAlt: 'A wood deck and landscaped backyard',
    proType: 'a qualified contractor or arborist',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'We evaluate the accessible exterior elements that affect safety and the home’s relationship with water.',
        items: [
          { h: 'Decks & balconies', b: 'We check ledger attachment, railings, posts, and visible footings for rot, movement, and safe construction.' },
          { h: 'Grading & drainage', b: 'We look at how the soil slopes around the home and whether water is directed away from the foundation.' },
          { h: 'Walks, steps & drives', b: 'We note trip hazards, settling, and significant cracking.' },
          { h: 'Exterior structures', b: 'We visually review sheds and retaining walls for condition and movement.' },
          { h: 'Vegetation near the home', b: 'We flag trees and shrubs in contact with siding or roof.' },
          { h: 'Exterior electrical & lighting', b: 'We check exterior outlets for GFCI protection and note lighting/safety concerns.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Improper deck ledgers', b: 'Poorly attached or unflashed ledgers are a leading cause of deck collapse — a serious safety issue.' },
          { h: 'Unsafe railings', b: 'Loose, low, or wide-spaced railings, especially on older decks and stairs.' },
          { h: 'Negative grading', b: 'Soil sloping toward the house, sending water straight to the foundation.' },
          { h: 'Overgrown vegetation', b: 'Plants against the siding trap moisture, invite pests, and raise fire risk.' },
          { h: 'Trip hazards', b: 'Settled or heaved walkways and steps.' },
          { h: 'Failing retaining walls', b: 'Leaning, bulging, or cracked walls that may be losing their hold.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can maintain yourself',
        items: [
          { h: 'Inspect the deck each spring', b: 'Check boards, railings, and fasteners; reseal wood to fight sun and snow.' },
          { h: 'Keep water moving away', b: 'Maintain grading sloped away from the home and extend downspouts.' },
          { h: 'Trim back vegetation', b: 'Keep plants and branches off the siding and roof.' },
          { h: 'Maintain defensible space', b: 'Clear the first 5 feet of flammables and thin vegetation from 5–30 feet of the home.' },
          { h: 'Fix hazards promptly', b: 'Address trip hazards and keep walks clear of ice in winter.' },
          { h: 'Have big trees assessed', b: 'Get large or dead trees near the house evaluated by an arborist.' },
        ],
      },
    ],
    related: [
      { label: 'Seasonal Maintenance Guide', href: '/guides/home-maintenance' },
      { label: 'Roof & Gutters Guide', href: '/guides/roof-and-gutters' },
      { label: 'Full Home Inspection', href: '/services/full-inspection' },
    ],
  },

  'energy-efficiency': {
    title: 'Energy Efficiency & Summer Heat: An Inspector’s Guide',
    metaDescription:
      'Where homes lose energy, what an inspector notes about insulation and air sealing, and how to beat high-altitude summer heat. Inspectrum Inspections, Evergreen CO.',
    eyebrow: 'Home Systems',
    heroTitle: 'Energy Efficiency & Summer Heat',
    heroLead:
      'A comfortable, efficient home comes down to insulation, air sealing, and keeping the sun’s heat out — and at altitude the sun is intense. Here’s what we note, where homes lose energy, and what you can improve.',
    imageKeywords: 'insulation,attic',
    imageAlt: 'Attic insulation in a home',
    proType: 'a qualified energy auditor or HVAC professional',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we note during an inspection',
        intro: 'A home inspection isn’t a formal energy audit, but we note the conditions that most affect comfort and efficiency.',
        items: [
          { h: 'Attic insulation', b: 'We note insulation type, approximate depth, and coverage where the attic is accessible.' },
          { h: 'Air leakage points', b: 'We look for obvious gaps around penetrations and at the attic hatch.' },
          { h: 'Windows & doors', b: 'We note type and condition, weatherstripping, and failed (fogged) double-pane seals.' },
          { h: 'Duct insulation', b: 'We check visible ducts in unconditioned spaces for insulation and leakage.' },
          { h: 'Ventilation & moisture', b: 'We look for signs of poor ventilation that hurt comfort and air quality.' },
          { h: 'Solar exposure', b: 'We note south- and west-facing exposures most affected by intense high-altitude sun.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Under-insulated attics', b: 'A top source of both energy loss and ice dams in our climate.' },
          { h: 'Air leaks', b: 'Gaps at can lights, plumbing and wiring penetrations, and the attic hatch.' },
          { h: 'Tired windows & seals', b: 'Worn weatherstripping and fogged double panes that have lost their seal.' },
          { h: 'Uninsulated ducts', b: 'Ducts running through hot attics or cold crawlspaces without insulation.' },
          { h: 'Solar overheating', b: 'Rooms on the sun-exposed sides that overheat in summer at altitude.' },
          { h: 'Old single-pane windows', b: 'A significant comfort and efficiency drag in older homes.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can improve yourself',
        items: [
          { h: 'Air-seal, then insulate', b: 'Seal attic air leaks before adding insulation, and top up the attic to recommended levels.' },
          { h: 'Refresh weatherstripping', b: 'Re-caulk and re-strip around windows and doors each year.' },
          { h: 'Block the summer sun', b: 'Use shades or coverings on south/west windows, and consider exterior shading or awnings.' },
          { h: 'Move air', b: 'Run ceiling fans and ventilate in the evening when mountain air cools.' },
          { h: 'Keep HVAC efficient', b: 'Fresh filters and annual service keep the system from overworking.' },
          { h: 'Consider an energy audit', b: 'A blower-door test gives the full picture if comfort or bills are a concern.' },
        ],
      },
    ],
    related: [
      { label: 'HVAC & Furnace Guide', href: '/guides/hvac' },
      { label: 'Seasonal Maintenance Guide', href: '/guides/home-maintenance' },
      { label: 'Roof & Gutters Guide', href: '/guides/roof-and-gutters' },
    ],
  },

  'foundation-and-structure': {
    title: 'Foundation & Structure: An Inspector’s Guide',
    metaDescription:
      'What a home inspector checks in your foundation and structure, the warning signs we look for, and what to monitor — with Front Range expansive-soil notes. Inspectrum Inspections.',
    eyebrow: 'Home Systems',
    heroTitle: 'Foundation & Structure',
    heroLead:
      'The foundation and frame hold everything else up, so structural concerns are among the most consequential we report. Here’s what we check, the warning signs we look for, and what you can monitor between inspections.',
    imageKeywords: 'foundation,concrete',
    imageAlt: 'A home foundation wall',
    proType: 'a structural engineer',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'We evaluate the visible, accessible structure and the conditions that most affect it.',
        items: [
          { h: 'Foundation walls & floor', b: 'We look for cracks, movement, moisture, and signs of prior repair in the visible foundation.' },
          { h: 'Framing & supports', b: 'Where visible (basement/crawlspace), we check posts, beams, and joists for sagging, damage, or modification.' },
          { h: 'Floors & walls', b: 'Out-of-level floors, sticking doors, and drywall cracks can all point to movement.' },
          { h: 'Settlement signs', b: 'We watch for differential settlement — one part of the home moving relative to another.' },
          { h: 'Grading & drainage', b: 'Because soil moisture drives movement, we check how water is managed around the foundation.' },
          { h: 'Prior repairs', b: 'We note piers, carbon-fiber straps, sealed cracks, and other evidence of past structural work.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Foundation cracks', b: 'We distinguish cosmetic hairline cracks from wider, stair-step, or displaced cracks that suggest movement.' },
          { h: 'Differential settlement', b: 'Common with the Front Range’s expansive clay soils, which swell and shrink with moisture.' },
          { h: 'Bowing basement walls', b: 'Lateral soil pressure pushing walls inward over time.' },
          { h: 'Sagging floors', b: 'Undersized, damaged, or modified framing letting floors deflect.' },
          { h: 'Moisture undermining footings', b: 'Poor drainage washing out or softening soil that supports the foundation.' },
          { h: 'DIY structural changes', b: 'Cut or removed framing from past projects done without engineering.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can monitor yourself',
        items: [
          { h: 'Manage water first', b: 'Grading, gutters, and downspouts that move water away are the best foundation insurance.' },
          { h: 'Keep soil moisture steady', b: 'In drought, consistent foundation watering helps prevent expansive-soil shrinkage.' },
          { h: 'Watch for changes', b: 'New or widening cracks, sticking doors, and sloping floors are worth noting and dating.' },
          { h: 'Don’t cut framing', b: 'Never notch or remove structural members without a professional.' },
          { h: 'Address moisture below', b: 'Keep basements and crawlspaces dry to protect the structure.' },
          { h: 'Call an engineer for movement', b: 'Active or accelerating movement warrants a structural engineer’s evaluation.' },
        ],
      },
    ],
    related: [
      { label: 'Crawlspaces & Basements', href: '/guides/crawlspaces-and-basements' },
      { label: 'Full Home Inspection', href: '/services/full-inspection' },
      { label: 'Seasonal Maintenance Guide', href: '/guides/home-maintenance' },
    ],
  },

  'moisture-and-mold': {
    title: 'Moisture, Mold & Air Quality: An Inspector’s Guide',
    metaDescription:
      'Most mold is a moisture problem. What a home inspector looks for, where water gets in, and how to keep indoor air healthy. Inspectrum Inspections, Evergreen CO.',
    eyebrow: 'Home Systems',
    heroTitle: 'Moisture, Mold & Air Quality',
    heroLead:
      'Most mold problems are really moisture problems. Here’s what we look for, where water sneaks in, and how to keep your indoor air healthy.',
    imageKeywords: 'mold,damp',
    imageAlt: 'Moisture and condensation on a window',
    proType: 'a mold or indoor-air-quality professional',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'We look for moisture and its sources throughout the home. (Lab mold testing is a separate specialist service.)',
        items: [
          { h: 'Water staining', b: 'Ceilings, walls, and areas around plumbing for active or past water damage.' },
          { h: 'Leaks & condensation', b: 'Plumbing leaks and the cold surfaces where condensation tends to form.' },
          { h: 'Ventilation', b: 'Whether bath and kitchen exhaust fans actually vent to the exterior.' },
          { h: 'Below-grade humidity', b: 'Basement and crawlspace dampness and the presence of a vapor barrier.' },
          { h: 'Visible growth', b: 'We note suspected mold-like growth; identification/testing is a specialist service.' },
          { h: 'Intrusion sources', b: 'Roof, window, and grading issues that let water in.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Fans venting into the attic', b: 'Bath fans that dump humid air into the attic instead of outside — a frequent mold cause.' },
          { h: 'Chronic below-grade damp', b: 'Basements and crawlspaces that stay humid, often with no vapor barrier.' },
          { h: 'Hidden leaks', b: 'Slow leaks behind walls or under sinks quietly feeding mold growth.' },
          { h: 'High indoor humidity', b: 'Condensation on windows and cold surfaces pointing to too much moisture.' },
          { h: 'Grading sources', b: 'Poor drainage wetting the foundation and migrating inside.' },
          { h: 'Incomplete dry-outs', b: 'Past water damage that was never fully dried.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can maintain yourself',
        items: [
          { h: 'Use your exhaust fans', b: 'Run bath and kitchen fans, and confirm they vent outdoors — not into the attic.' },
          { h: 'Control humidity', b: 'Aim for roughly 30–50% indoor humidity; dehumidify damp basements.' },
          { h: 'Dry spills fast', b: 'Fix leaks immediately and dry wet materials within 24–48 hours.' },
          { h: 'Keep water outside', b: 'Maintain grading and gutters so water stays away from the home.' },
          { h: 'Cover the crawlspace soil', b: 'Add or repair a vapor barrier to cut ground moisture.' },
          { h: 'Call a pro for growth', b: 'Visible mold or a persistent musty smell warrants a remediation or IAQ professional.' },
        ],
      },
    ],
    related: [
      { label: 'Mold Assessment', href: '/services/mold' },
      { label: 'Crawlspaces & Basements', href: '/guides/crawlspaces-and-basements' },
      { label: 'Full Home Inspection', href: '/services/full-inspection' },
    ],
  },

  'crawlspaces-and-basements': {
    title: 'Crawlspaces & Basements: An Inspector’s Guide',
    metaDescription:
      'What a home inspector checks in crawlspaces and basements — moisture, structure, pests, sump pumps — and how to keep them dry. Inspectrum Inspections, Evergreen CO.',
    eyebrow: 'Home Systems',
    heroTitle: 'Crawlspaces & Basements',
    heroLead:
      'What’s under your home tells a big part of its story. Crawlspaces and basements are where we catch moisture, structural, and pest issues early. Here’s what we check and how to keep them dry.',
    imageKeywords: 'basement,crawlspace',
    imageAlt: 'A home basement interior',
    proType: 'a foundation or waterproofing specialist',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'Where it’s safely accessible, we get into these spaces — a lot of a home’s health shows up here first.',
        items: [
          { h: 'Overall condition & access', b: 'We enter where access permits and note general condition.' },
          { h: 'Moisture', b: 'Standing water, dampness, and efflorescence (white mineral staining) on masonry.' },
          { h: 'Vapor barrier', b: 'Whether the crawlspace soil is covered and the barrier is intact.' },
          { h: 'Structure', b: 'Joists, beams, posts, and the sill plate for rot, sagging, or damage.' },
          { h: 'Sump pump', b: 'Presence and operation of a sump pump where one exists.' },
          { h: 'Insulation, ventilation & pests', b: 'Condition of insulation and airflow, plus any signs of pests.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Water & dampness', b: 'Standing water or chronic humidity that threatens structure and air quality.' },
          { h: 'Missing vapor barrier', b: 'Bare or exposed soil pumping moisture into the home.' },
          { h: 'Rot & pest damage', b: 'Wood members compromised by moisture or wood-destroying insects.' },
          { h: 'Sump pump failures', b: 'Pumps that are absent, failed, or improperly discharging.' },
          { h: 'Poor ventilation', b: 'Stagnant, humid air leading to mold.' },
          { h: 'Foundation seepage', b: 'Cracks and water entry along basement walls.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can maintain yourself',
        items: [
          { h: 'Keep water away', b: 'Gutters and grading that direct water away from the home do most of the work.' },
          { h: 'Test the sump pump', b: 'Pour a bucket of water into the pit and confirm it kicks on and drains.' },
          { h: 'Maintain the vapor barrier', b: 'Keep crawlspace soil covered and patch tears.' },
          { h: 'Control humidity', b: 'A dehumidifier in a damp basement makes a big difference.' },
          { h: 'Check periodically', b: 'Look for water, pests, and rot a couple times a year.' },
          { h: 'Protect the pipes', b: 'Insulate exposed pipes in these spaces against freezing.' },
        ],
      },
    ],
    related: [
      { label: 'Foundation & Structure', href: '/guides/foundation-and-structure' },
      { label: 'Moisture, Mold & Air Quality', href: '/guides/moisture-and-mold' },
      { label: 'Seasonal Maintenance Guide', href: '/guides/home-maintenance' },
    ],
  },

  pests: {
    title: 'Pests & Wood-Destroying Organisms: An Inspector’s Guide',
    metaDescription:
      'The pest and wood-destroying-insect evidence a home inspector looks for, common problems, and how to keep critters out. Inspectrum Inspections, Evergreen CO.',
    eyebrow: 'Home Systems',
    heroTitle: 'Pests & Wood-Destroying Organisms',
    heroLead:
      'Pests do more than annoy — wood-destroying insects and rodents can quietly cause real structural and health problems. Here’s the evidence we look for and how to keep critters out.',
    imageKeywords: 'termite,wood',
    imageAlt: 'Wood damage from wood-destroying insects',
    proType: 'a licensed pest control professional',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we check during an inspection',
        intro: 'We note visible evidence and conducive conditions. A full wood-destroying-organism (WDO) report is a specialist service.',
        items: [
          { h: 'Insect evidence', b: 'Signs of termites or carpenter ants — mud tubes, frass, or damaged wood — where visible.' },
          { h: 'Rodent evidence', b: 'Droppings, nests, and gnawing in attics, crawlspaces, and along the structure.' },
          { h: 'Conducive conditions', b: 'Wood-to-soil contact, moisture, and debris that invite pests.' },
          { h: 'Entry points', b: 'Gaps, unscreened vents, and utility penetrations that let pests in.' },
          { h: 'Compromised wood', b: 'Wood that looks damaged or sounds hollow in accessible areas.' },
          { h: 'Moisture overlap', b: 'Because moisture attracts pests, we connect the two where we see them.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Wood-to-soil contact', b: 'Framing, siding, or posts touching soil — an open invitation to termites and rot.' },
          { h: 'Insect damage', b: 'Carpenter ant or termite damage discovered in framing.' },
          { h: 'Rodents above & below', b: 'Activity in attics and crawlspaces that ruins insulation and leaves droppings.' },
          { h: 'Open entry points', b: 'Unsealed penetrations and gaps around the foundation.' },
          { h: 'Debris against the house', b: 'Firewood and mulch piled against the foundation.' },
          { h: 'Moisture magnets', b: 'Damp areas drawing pests in.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What you can maintain yourself',
        items: [
          { h: 'Move wood & mulch away', b: 'Keep firewood and heavy mulch off the foundation.' },
          { h: 'Seal entry points', b: 'Close gaps around pipes, vents, and the foundation, and screen vents.' },
          { h: 'Eliminate moisture', b: 'Fix damp areas — moisture is the number-one pest attractant.' },
          { h: 'Trim vegetation', b: 'Keep plants and branches off the house.' },
          { h: 'Store food & trash securely', b: 'Deny easy meals and watch for droppings.' },
          { h: 'Call a pro for evidence', b: 'Signs of termites or persistent rodents warrant a licensed pest professional or a WDO inspection.' },
        ],
      },
    ],
    related: [
      { label: 'Crawlspaces & Basements', href: '/guides/crawlspaces-and-basements' },
      { label: 'Moisture, Mold & Air Quality', href: '/guides/moisture-and-mold' },
      { label: 'Full Home Inspection', href: '/services/full-inspection' },
    ],
  },

  'older-homes': {
    title: 'Older & Historic Homes: An Inspector’s Guide',
    metaDescription:
      'What a home inspector pays special attention to in older Front Range homes — wiring, plumbing, era-specific materials — and what owners should know. Inspectrum Inspections.',
    eyebrow: 'Home Systems',
    heroTitle: 'Older & Historic Homes',
    heroLead:
      'Older Front Range homes have real charm — and a few era-specific surprises. Here’s what we pay special attention to in mature homes, and what owners should know.',
    imageKeywords: 'historic,house',
    imageAlt: 'An older, character-filled home',
    proType: 'a licensed specialist for the system in question',
    sections: [
      {
        id: 'scope',
        name: 'What we check',
        heading: 'What we look at closely',
        intro: 'Older homes reward a careful eye — here’s where age tends to show up.',
        items: [
          { h: 'Electrical', b: 'Knob-and-tube or aluminum wiring, undersized panels, two-prong outlets, and limited capacity.' },
          { h: 'Plumbing', b: 'Galvanized-steel supply lines, possible lead concerns, and aging fixtures.' },
          { h: 'Era-specific materials', b: 'In pre-1980 homes we note materials that may contain asbestos or lead (testing is separate).' },
          { h: 'Foundation & structure', b: 'Decades of settling and the quirks that come with it.' },
          { h: 'Roof & windows', b: 'Age, single-pane glass, and the quality of past repairs.' },
          { h: 'Updates & permits', b: 'How well previous renovations were done — and whether they were permitted.' },
        ],
      },
      {
        id: 'issues',
        name: 'Common issues',
        heading: 'Common problems we find',
        items: [
          { h: 'Outdated electrical', b: 'Knob-and-tube, aluminum branch wiring, or panels that can’t keep up with modern loads.' },
          { h: 'Corroding plumbing', b: 'Galvanized lines closing up from the inside, causing low pressure and discoloration.' },
          { h: 'Hazardous-era materials', b: 'Possible asbestos or lead paint in older homes — test before disturbing them.' },
          { h: 'Accumulated settling', b: 'Sloped floors and structural quirks built up over many decades.' },
          { h: 'Energy loss', b: 'Single-pane windows and thin insulation driving high bills.' },
          { h: 'Layered renovations', b: 'Successive DIY or unpermitted projects stacked on top of each other.' },
        ],
      },
      {
        id: 'maintain',
        name: 'Maintenance',
        heading: 'What owners should know',
        items: [
          { h: 'Update key systems', b: 'Have older electrical and plumbing evaluated and modernized as needed.' },
          { h: 'Test before you renovate', b: 'Check for asbestos and lead before any work that disturbs old materials.' },
          { h: 'Budget for big systems', b: 'Plan ahead for roof, HVAC, and plumbing nearing end of life.' },
          { h: 'Improve the envelope', b: 'Insulation and air sealing dramatically improve comfort in older homes.' },
          { h: 'Keep records', b: 'Document updates and permits — it pays off at resale.' },
          { h: 'Use specialists', b: 'Older homes reward expert eyes on each major system.' },
        ],
      },
    ],
    related: [
      { label: 'Electrical Guide', href: '/guides/electrical' },
      { label: 'Plumbing Guide', href: '/guides/plumbing' },
      { label: 'Full Home Inspection', href: '/services/full-inspection' },
    ],
  },
}

export const GUIDE_SLUGS = Object.keys(SYSTEM_GUIDES)

/*
 * Registry of all "content" pages, used by the reusable More Reading block to
 * suggest next-up reading. Includes the seasonal guide, every system guide, and
 * the core service pages so the cross-links reinforce each other for SEO.
 */
export const CONTENT_PAGES = [
  { href: '/guides/home-maintenance', eyebrow: 'Seasonal', title: 'Home Maintenance, Season by Season', blurb: 'A spring-through-winter checklist tuned for Front Range homes.' },
  ...GUIDE_SLUGS.map((slug) => ({
    href: `/guides/${slug}`,
    eyebrow: SYSTEM_GUIDES[slug].eyebrow,
    title: SYSTEM_GUIDES[slug].heroTitle,
    blurb: SYSTEM_GUIDES[slug].heroLead,
  })),
  { href: '/services/full-inspection', eyebrow: 'Service', title: 'Full Home Inspection', blurb: 'A thorough, plain-English inspection of the whole home.' },
  { href: '/services/radon', eyebrow: 'Service', title: 'Radon Testing', blurb: 'A 48-hour continuous radon test with same-day results.' },
  { href: '/services/mold', eyebrow: 'Service', title: 'Mold Assessment', blurb: 'Identify moisture and mold concerns before they spread.' },
]
