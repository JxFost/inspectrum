'use client'

import { useState, useRef } from 'react'
import PricingBlock from '@/components/PricingBlock'

const PHONE = '(303) 697-0990'
const TIMEZONE = 'America/Denver'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeRange(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const hour = d.toLocaleTimeString('en-US', { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' })
  return `Starting between ${hour}`
}

function Section({ number, title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-ink mb-2">{number}. {title}</h3>
      <div className="text-[0.8rem] text-charcoal leading-[1.7]">{children}</div>
    </div>
  )
}

function InitialBox({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-3 bg-amber/[0.08] border border-amber/30 rounded-sm p-3 my-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 5))}
        placeholder="___"
        className="w-16 text-center border-b-2 border-ink bg-transparent text-ink font-bold text-sm outline-none"
      />
      <span className="text-xs text-charcoal/70">{label}</span>
    </div>
  )
}

export default function AgreementClient({ data }) {
  const [initials11, setInitials11] = useState('')
  const [signatureName, setSignatureName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [radonAgreed, setRadonAgreed] = useState(false)
  const [state, setState] = useState('idle') // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!initials11) {
      setErrorMsg('Please initial Section 1.1.')
      return
    }
    if (!signatureName) {
      setErrorMsg('Please type your full name as your signature.')
      return
    }
    if (!agreed) {
      setErrorMsg('Please confirm you have read and agree to the terms.')
      return
    }
    if (data.hasRadon && !radonAgreed) {
      setErrorMsg('Please agree to the Radon Testing Addendum.')
      return
    }

    setState('submitting')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/agreement/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: data.token,
          initials: initials11,
          signatureName,
          radonAgreed: data.hasRadon ? radonAgreed : false,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        setErrorMsg(d.error || 'Failed to submit. Please try again.')
        setState('idle')
        return
      }

      setState('done')
    } catch {
      setErrorMsg(`Network error. Please try again or call ${PHONE}.`)
      setState('idle')
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-cream pt-32 pb-20 px-5 min-h-screen">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
          <h1 className="text-2xl font-serif text-ink mb-4">Agreement <em className="italic text-teal">signed.</em></h1>
          <p className="text-charcoal mb-2">Thank you, {data.customerName.split(' ')[0]}. We have your signed agreement on file.</p>
          <p className="text-sm text-charcoal/60">We look forward to your inspection on {formatDate(data.inspectionDate)}.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream pt-32 pb-20 px-5 min-h-screen">
      <div className="max-w-[700px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-serif text-ink mb-2">Inspection Service Agreement</h1>
          <p className="text-sm text-charcoal/60">Please review, initial, and sign below</p>
        </div>

        {/* Pre-filled info */}
        <div className="bg-paper border border-line rounded-sm p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[0.65rem] uppercase tracking-wider text-charcoal/50 font-semibold mb-1">Customer</div>
              <div className="text-ink font-medium">{data.customerName}</div>
            </div>
            <div>
              <div className="text-[0.65rem] uppercase tracking-wider text-charcoal/50 font-semibold mb-1">Property</div>
              <div className="text-ink font-medium">{data.propertyAddress}</div>
            </div>
            <div>
              <div className="text-[0.65rem] uppercase tracking-wider text-charcoal/50 font-semibold mb-1">Inspection Date</div>
              <div className="text-ink font-medium">{formatDate(data.inspectionDate)}</div>
            </div>
            <div>
              <div className="text-[0.65rem] uppercase tracking-wider text-charcoal/50 font-semibold mb-1">Service</div>
              <div className="text-ink font-medium">{data.service}</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <PricingBlock
            service={data.service}
            radonAddOn={data.hasRadon}
            sewerScope={data.hasSewer}
            tripChargeCents={data.tripChargeCents}
            distanceMiles={data.distanceMiles}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Agreement body */}
          <div className="bg-paper border border-line rounded-sm p-6 sm:p-8 mb-6">
            <p className="text-[0.7rem] uppercase tracking-wider text-amber font-semibold mb-4">Scope, Limitations, Terms, and Conditions</p>
            <p className="text-xs text-charcoal/60 mb-6 italic">This is a legally binding document consisting of the following sections. It contains limitations on the scope of inspection, remedies and liability. Please read it carefully.</p>

            <Section number="1" title="AUTHORIZATION; PRESENCE OF CUSTOMER; BINDING EFFECT">
              <p>Customer hereby authorizes and contracts for INSPECTRUM INSPECTIONS, INC. (the "Inspection Company") to perform an inspection at the referenced property in accordance with the terms and conditions of this Agreement, and agrees to pay Company the Inspection Fee at the time of the inspection. Inspection Company has the right to not release its Inspection Report without payment in full. Customer's signature below acknowledges he/she has read, understands and agrees to be bound by the terms and conditions below and intends to bind his/her spouse, heirs and successors as his/her/their authorized agent.</p>

              <div className="bg-cream border border-line rounded-sm p-4 my-4">
                <p className="text-xs font-bold text-ink mb-2">1.1 INSPECTION:</p>
                <p className="text-xs text-charcoal leading-relaxed mb-3">I have received, had the opportunity to read, and have read all sections of the Contract for this Limited Visual Inspection and report. In approximately 3-4 hours, for an average house, Inspection Company will provide the Customer with specified limited information on the condition of the major components of the house at the time of the inspection. <span className="font-bold">INSPECTION COMPANY'S LIABILITY FOR ANY AND ALL CLAIMS IS LIMITED TO A MAXIMUM OF THE INSPECTION FEE PAID</span> as provided in paragraph 7.5.</p>
                <InitialBox value={initials11} onChange={setInitials11} label="Customer's initials — confirms you have read Section 1.1" />
              </div>
            </Section>

            <Section number="2" title="STANDARDS">
              <p>The inspection will be conducted with reasonable care and will be performed in accordance with the Standards of Practice and Code of Ethics as promulgated by the International Association of Certified Home Inspectors (InterNACHI) where applicable and conditions allow, except as modified by this Agreement.</p>
            </Section>

            <Section number="3" title="SCOPE OF INSPECTION">
              <p className="mb-2">The scope of this inspection is to examine <strong>visually</strong> the following areas, systems, and components of the building, where applicable, that are safely and readily accessible:</p>
              <p className="mb-2"><strong>ROOF:</strong> Surface, skylights, chimneys, flashings, penetrations, gutters & downspouts. <strong>SITE & BUILDING EXTERIOR:</strong> Grading, drainage, retaining walls, walkways, stairs, porches, driveways, exterior finishes. <strong>STRUCTURAL:</strong> Foundation, basement, crawlspace, structural components. <strong>ELECTRICAL:</strong> Main panel, sub panels, branch circuits, GFCI, AFCI, visible wiring. <strong>HEATING:</strong> Furnace, heat pump, ductwork, chimney, flue. <strong>COOLING:</strong> Central air conditioning, heat pump. <strong>PLUMBING:</strong> Water supply, drain/waste/vent systems, water heater, fixtures. <strong>INTERIOR:</strong> Walls, ceilings, floors, windows, doors, stairs, railings. <strong>INSULATION & VENTILATION:</strong> Attic, walls (where visible), vapor barriers. <strong>GARAGE:</strong> Doors, openers, fire separation.</p>
              <p className="text-xs text-charcoal/60 mt-2">Items NOT included: swimming pools, spas, sprinkler systems, fencing, landscaping, security systems, telecommunications, outbuildings, environmental hazards (asbestos, lead, mold, radon — unless tested separately), elevators, free-standing appliances, pest inspection.</p>
            </Section>

            <Section number="4" title="LIMITATIONS">
              <p className="mb-2"><strong>4.1 UTILITIES & EQUIPMENT:</strong> Inspectors will not turn on gas/water mains, activate electrical power, or move items to gain access. Systems that are inoperable or disabled cannot be tested.</p>
              <p className="mb-2"><strong>4.2 ACCESSIBILITY:</strong> It is the Customer's responsibility to make the property accessible. The inspector will not move furnishings, stored belongings, soil, snow, or vegetation. Concealed or inaccessible conditions cannot be judged and customer assumes risk for any such conditions.</p>
              <p className="mb-2"><strong>4.3 PURPOSE & SCOPE:</strong> This is a limited visual inspection. It is not an engineering evaluation. No examinations are made to determine building code compliance. The inspection is not intended to identify cosmetic conditions.</p>
              <p><strong>4.4 LIMITED WARRANTY:</strong> This is a limited and nontransferable warranty. All other warranties including warranties of merchantability and fitness for a particular purpose are expressly excluded. Customer waives any claim for consequential, exemplary or incidental damages.</p>
            </Section>

            <Section number="5" title="INSPECTION REPORT">
              <p>Inspection Company agrees to prepare a written report as documentation of the inspector's observations. The report is not an express or implied warranty as to the performance, adequacy, or remaining life of any system or component. Report and its contents are intended for the exclusive use of, and are the nontransferable property of, the customer.</p>
            </Section>

            <Section number="6" title="INSPECTION FEES & PAYMENT TERMS">
              <p>Fees are based on the reported size of the building and a single visit to the property. Additional charges may apply for additional square footage, multiple systems, or additional travel. Fees are due at the end of the inspection. A late charge of $25 will be assessed to balances not paid within 30 days.</p>
            </Section>

            <Section number="7" title="STANDARD TERMS AND CONDITIONS">
              <p className="mb-2"><strong>7.1 REINSPECTION RIGHT:</strong> Customer shall provide the Inspection Company with three (3) working days to re-inspect before repair or replacement of any component.</p>
              <p className="mb-2"><strong>7.2 DISPUTE RESOLUTION:</strong> Parties shall attempt in good faith to settle disputes. Unresolved disputes may be submitted to binding arbitration in Jefferson County, Colorado.</p>
              <p className="mb-2"><strong>7.3 TIME LIMIT:</strong> No action shall be brought beyond six months following the date of the report or 120 days after discovery of the condition.</p>
              <p className="mb-2"><strong>7.5 LIMITATION OF LIABILITY:</strong> Inspector's liability for alleged mistakes or omissions is limited to a refund of the fee paid for the inspection and report.</p>
              <p><strong>7.7 THIRD PARTY:</strong> The report is not intended for use by anyone other than the Customer. No third party shall have any right arising from this Contract.</p>
            </Section>
          </div>

          {/* Radon addendum */}
          {data.hasRadon && (
            <div className="bg-paper border border-line rounded-sm p-6 sm:p-8 mb-6">
              <p className="text-[0.7rem] uppercase tracking-wider text-amber font-semibold mb-4">Addendum: Radon Testing</p>
              <div className="text-[0.8rem] text-charcoal leading-[1.7]">
                <p className="mb-3">Customer agrees and authorizes Inspectrum Inspections, Inc. to perform a test for Radon gas at the referenced property. Testing will be performed using a continuous monitor for a minimum of 48 hours in accordance with US EPA Testing Protocols.</p>
                <p className="mb-3">Short-term testing is a screening for Radon gas at the time of testing only. The EPA's health risk assessments are based upon the "Annual Average Exposure," which may not always be measured with accuracy through a short-term test.</p>
                <p className="mb-3"><strong>Closed-House Conditions</strong> must be maintained during the entire testing period — all windows closed and exterior doors closed except for entry and exit. Failure to maintain these conditions may produce artificially low test readings.</p>
              </div>
              <label className="flex items-center gap-3 bg-amber/[0.08] border border-amber/30 rounded-sm p-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={radonAgreed}
                  onChange={(e) => setRadonAgreed(e.target.checked)}
                  className="accent-teal w-5 h-5"
                />
                <span className="text-xs text-ink font-medium">I agree to the Radon Testing Addendum</span>
              </label>
            </div>
          )}

          {/* Sewer scope note */}
          {data.hasSewer && (
            <div className="bg-paper border border-line rounded-sm p-6 mb-6">
              <p className="text-[0.7rem] uppercase tracking-wider text-amber font-semibold mb-2">Sewer Scope Included</p>
              <p className="text-[0.8rem] text-charcoal leading-[1.7]">A camera inspection of the main sewer line is included with this inspection. The sewer scope will identify blockages, root intrusion, bellies, and damage to the sewer line.</p>
            </div>
          )}

          {/* Signature block */}
          <div className="bg-paper border border-line rounded-sm p-6 sm:p-8 mb-6">
            <p className="text-[0.7rem] uppercase tracking-wider text-amber font-semibold mb-4">Signature</p>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="accent-teal w-5 h-5 mt-0.5"
              />
              <span className="text-sm text-ink leading-relaxed">
                I acknowledge that I have read, understand, and accept the terms, conditions, and limitations as outlined in this Inspection Service Agreement.
              </span>
            </label>

            <div className="mb-4">
              <label className="block text-[0.65rem] uppercase tracking-wider text-charcoal/50 font-semibold mb-2">Customer Signature (type your full legal name)</label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder={data.customerName}
                className="w-full px-4 py-3 border border-line rounded-sm bg-cream text-ink font-serif text-xl italic outline-none focus:border-teal"
              />
            </div>

            <p className="text-xs text-charcoal/50">
              Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-amber/10 border border-amber text-ink rounded-sm p-4 mb-6 text-sm">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={state === 'submitting'}
            className="w-full py-4 bg-teal text-white rounded-sm font-semibold text-base cursor-pointer border-0 hover:bg-teal-deep transition-colors disabled:opacity-50"
          >
            {state === 'submitting' ? 'Submitting...' : 'Sign Agreement'}
          </button>

          <p className="text-xs text-charcoal/40 text-center mt-4">
            Questions? Call <a href="tel:3036970990" className="text-teal">{PHONE}</a>
          </p>
        </form>
      </div>
    </div>
  )
}
