'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'

const CONTACT_METHODS = [
  {
    label: 'Phone', value: '(303) 697-0990', href: 'tel:3036970990',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>),
  },
  {
    label: 'Email', value: 'office@evergreeninspections.com', href: 'mailto:office@evergreeninspections.com',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>),
  },
  {
    label: 'Hours', value: <>Mon–Fri · 8am–6pm<br />Sat · 8am–12pm</>,
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
  },
  {
    label: 'Location', value: 'Evergreen, CO 80439',
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>),
  },
]

const SERVICE_AREAS = ['Evergreen', 'Denver', 'Boulder', 'Fort Collins', 'Lakewood', 'Golden', 'Conifer', 'Morrison', 'Bailey', 'Idaho Springs', 'Genesee', 'Aurora', 'Centennial', 'Littleton', 'Wheat Ridge', 'Arvada']

function FormField({ label, id, type = 'text', required, placeholder, children, as = 'input' }) {
  const inputClass = 'bg-cream border border-line px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:border-teal focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)] font-sans w-full'
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label htmlFor={id} className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea id={id} name={id} placeholder={placeholder} className={`${inputClass} resize-y min-h-[120px]`} />
      ) : as === 'select' ? (
        <select id={id} name={id} className={inputClass}>{children}</select>
      ) : (
        <input id={id} name={id} type={type} placeholder={placeholder} required={required} className={inputClass} />
      )}
    </div>
  )
}

export default function ContactClient() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      e.target.reset()
      setSubmitted(false)
    }, 4000)
  }

  return (
    <>
      <header
        className="min-h-[50vh] text-cream flex items-center pt-36 pb-16 px-5 lg:px-8 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20,60,68,0.55) 0%, rgba(20,60,68,0.95) 100%), url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 600'%3E%3Cdefs%3E%3ClinearGradient id='cs' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2384b8c4'/%3E%3Cstop offset='1' stop-color='%23e89a3f' stop-opacity='0.4'/%3E%3C/linearGradient%3E%3ClinearGradient id='cm' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%231f5c66'/%3E%3Cstop offset='1' stop-color='%23143c44'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='600' fill='url(%23cs)'/%3E%3Cpath d='M0,400 L200,280 L380,360 L560,240 L740,340 L920,260 L1100,360 L1280,280 L1440,360 L1600,300 L1600,600 L0,600 Z' fill='url(%23cm)'/%3E%3C/svg%3E")`,
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="hero-eyebrow">Get In Touch</div>
          <h1 className="text-[clamp(3rem,7vw,6rem)] mb-4">
            Let's get you<br /><em className="italic text-amber">scheduled.</em>
          </h1>
          <p className="text-xl max-w-xl opacity-90 leading-snug">
            Buying, selling, or just checking on the home you've owned for years — fill out the form below or call us directly. We typically respond within a few hours.
          </p>
        </div>
      </header>

      <section className="bg-cream py-24 px-5 lg:px-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20">
          <div>
            <div className="section-eyebrow">Reach Inspectrum</div>
            <h2 className="text-[2.5rem] mb-6 text-ink">Three ways to <em className="italic text-teal">connect.</em></h2>
            <p className="text-[1.05rem] text-charcoal mb-10 leading-relaxed">
              Whichever's easiest. We're a small, local operation — so when you call, you'll likely talk to the person doing your inspection.
            </p>

            {CONTACT_METHODS.map((m, i) => (
              <div key={i} className={`flex gap-5 items-start py-6 border-t border-line ${i === CONTACT_METHODS.length - 1 ? 'border-b' : ''}`}>
                <div className="w-11 h-11 shrink-0 bg-teal text-amber flex items-center justify-center rounded-full">
                  {m.icon}
                </div>
                <div>
                  <h4 className="text-[0.7rem] uppercase tracking-[0.25em] text-charcoal mb-1.5 font-semibold opacity-70">
                    {m.label}
                  </h4>
                  {m.href ? (
                    <a href={m.href} className="font-serif text-[1.3rem] text-ink no-underline font-medium hover:text-teal">
                      {m.value}
                    </a>
                  ) : (
                    <p className="font-serif text-[1.3rem] text-ink font-medium">{m.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-paper p-8 sm:p-12 rounded-sm relative">
            <div className="absolute -top-5 -left-5 w-20 h-20 bg-amber -z-10 rounded-sm" />
            <div className="text-xs uppercase tracking-[0.28em] text-amber font-semibold mb-3">Send Us a Note</div>
            <h3 className="text-[2rem] mb-8 text-ink">Tell us about <em className="italic text-teal">your home.</em></h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <FormField label="First Name" id="firstName" required />
                <FormField label="Last Name" id="lastName" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <FormField label="Email" id="email" type="email" required />
                <FormField label="Phone" id="phone" type="tel" required />
              </div>
              <FormField label="Property Address" id="address" placeholder="Street, City, ZIP" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <FormField label="Service Needed" id="serviceType" as="select">
                  <option>Full Home Inspection</option>
                  <option>Pre-Listing Inspection</option>
                  <option>New Construction</option>
                  <option>Radon Testing Only</option>
                  <option>Mold Assessment</option>
                  <option>À la carte / Other</option>
                </FormField>
                <FormField label="How did you hear about us?" id="referral" as="select">
                  <option>Online search</option>
                  <option>My realtor</option>
                  <option>Friend</option>
                  <option>Repeat client</option>
                  <option>Other</option>
                </FormField>
              </div>
              <FormField label="Anything we should know?" id="message" as="textarea" placeholder="Square footage, age of home, specific concerns…" />

              <Button type="submit" variant="teal" fullWidth withArrow={!submitted} className={submitted ? '!bg-amber' : ''}>
                {submitted ? '✓ Request Sent — We\'ll be in touch soon' : 'Send Request'}
              </Button>

              <p className="text-xs text-charcoal/70 mt-4 text-center">
                We'll get back to you within a few hours during business days. Want to skip ahead?{' '}
                <Link href="/schedule" className="text-teal font-semibold no-underline hover:text-amber">
                  Book online instead.
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-teal-darker text-cream py-20 px-5 lg:px-8 text-center">
        <div className="section-eyebrow justify-center">Coverage</div>
        <h3 className="text-[2rem] mb-4 text-cream">Local in <em className="italic text-amber">every direction.</em></h3>
        <p className="opacity-85 max-w-xl mx-auto mb-8 text-[1.05rem]">
          Based in Evergreen, serving the entire Denver Metro area, Boulder, Fort Collins, and surrounding mountain communities.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
          {SERVICE_AREAS.map((area) => (
            <div key={area} className="border border-cream/30 px-5 py-2 rounded-full text-sm transition-colors hover:bg-amber hover:text-white hover:border-amber cursor-default">
              {area}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
