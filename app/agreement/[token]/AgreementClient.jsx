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

        {/* What to Expect */}
        <div className="bg-paper border border-line rounded-sm p-6 sm:p-8 mb-6">
          <p className="text-[0.7rem] uppercase tracking-wider text-amber font-semibold mb-4">What to Expect</p>
          <p className="text-sm text-charcoal leading-relaxed mb-4">
            Thank you for choosing Inspectrum Inspections. Here are a few things to know before your appointment:
          </p>
          <ul className="text-sm text-charcoal leading-relaxed space-y-2 list-none pl-0">
            <li className="flex gap-2"><span className="text-teal font-bold shrink-0">1.</span> <span><strong>Start times are approximate</strong> — we may be delayed slightly due to traffic or a previous inspection.</span></li>
            <li className="flex gap-2"><span className="text-teal font-bold shrink-0">2.</span> <span><strong>The inspection takes 3–4 hours</strong> for a standard home. The inspector will need to focus with minimal interruption during this time.</span></li>
            <li className="flex gap-2"><span className="text-teal font-bold shrink-0">3.</span> <span><strong>Planning to attend?</strong> You may want to arrive toward the end to avoid waiting. We'll do a full walk-through, explain our findings, and answer all your questions.</span></li>
            <li className="flex gap-2"><span className="text-teal font-bold shrink-0">4.</span> <span><strong>Your report will be delivered same day</strong> — a comprehensive, photo-rich report sent directly to your email.</span></li>
            <li className="flex gap-2"><span className="text-teal font-bold shrink-0">5.</span> <span><strong>Payment is due at completion.</strong> We accept credit cards, checks, cash, Venmo, and Zelle.</span></li>
          </ul>
          <p className="text-sm text-charcoal/60 mt-4">
            Questions before your inspection? Call Harry at <a href="tel:3036970990" className="text-teal hover:text-amber no-underline font-medium">(303) 697-0990</a>.
          </p>
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
            <p className="text-[0.7rem] uppercase tracking-wider text-amber font-semibold mb-4">
              Scope, Limitations, Terms, and Conditions
            </p>

            <p className="text-xs text-charcoal/60 mb-6 italic">
              This is a legally binding document consisting of the following sections.
              It contains limitations on the scope of inspection, remedies, and
              liability. Please read it carefully.
            </p>

            <Section
              number="1"
              title="AUTHORIZATION; PRESENCE OF CUSTOMER; BINDING EFFECT"
            >
              <p>
                Customer hereby authorizes and contracts for INSPECTRUM INSPECTIONS,
                INC. (the "Inspection Company") to perform an inspection at the
                referenced property in accordance with the terms and conditions of this
                Agreement, and agrees to pay Company the Inspection Fee at the time of
                the inspection. Inspection Company has the right to withhold release of
                the Inspection Report until payment is received in full. Customer's
                signature below acknowledges he/she has read, understands, and agrees
                to be bound by the terms and conditions below and intends to bind
                his/her spouse, heirs, successors, and assigns as his/her/their
                authorized agent. Any acceptance, delivery, or use of the Inspection
                Report shall constitute acceptance of all terms and conditions contained
                herein.
              </p>

              <div className="bg-cream border border-line rounded-sm p-4 my-4">
                <p className="text-xs font-bold text-ink mb-2">1.1 INSPECTION:</p>

                <p className="text-xs text-charcoal leading-relaxed mb-3">
                  I have received, had the opportunity to read, and have read all
                  sections of this Contract for Limited Visual Inspection and report.
                  In approximately 3-4 hours, for an average house, Inspection Company
                  will provide Customer with limited visual observations regarding the
                  condition of the major components of the property at the time of
                  inspection.
                  <span className="font-bold">
                    {" "}
                    INSPECTION COMPANY'S LIABILITY FOR ANY AND ALL CLAIMS IS LIMITED TO
                    A MAXIMUM OF THE INSPECTION FEE PAID
                  </span>{" "}
                  as provided in Section 7.5.
                </p>

                <InitialBox
                  value={initials11}
                  onChange={setInitials11}
                  label="Customer's initials — confirms you have read Section 1.1"
                />
              </div>
            </Section>

            <Section number="2" title="STANDARDS">
              <p>
                The inspection will be conducted with reasonable care and performed in
                accordance with the Standards of Practice and Code of Ethics
                promulgated by the International Association of Certified Home
                Inspectors (InterNACHI), where applicable and conditions allow, except
                as modified by this Agreement. A copy of the Standards of Practice is
                available upon request.
              </p>
            </Section>

            <Section number="3" title="SCOPE OF INSPECTION">
              <p className="mb-3">
                <strong>3.1 INSPECTION SCOPE:</strong> The scope of this inspection is
                to visually examine the following areas, systems, and components of the
                building, where applicable, that are safely and readily accessible.
              </p>

              <p className="mb-3 text-sm leading-relaxed">
                <strong>ROOF:</strong> Roof coverings, skylights, chimneys, flashings,
                penetrations, gutters, and downspouts.
                <strong> SITE & EXTERIOR:</strong> Grading, drainage, retaining walls,
                walkways, stairs, railings, decks, patios, porches, siding, trim,
                doors, windows, flashing, and exterior finishes.
                <strong> GARAGE:</strong> Primary garage doors, openers, safety
                controls, firewall separation, visible structure, and representative
                receptacles.
                <strong> STRUCTURAL:</strong> Visible foundation, framing,
                crawlspaces, basements, and structural components.
                <strong> PLUMBING:</strong> Accessible supply, drain, waste, and vent
                systems, fixtures, and water heater components.
                <strong> ELECTRICAL:</strong> Service entrance, panels, grounding,
                bonding, visible wiring, branch circuitry, switches, lights, and a
                representative sampling of receptacles.
                <strong> HEATING & COOLING:</strong> Furnaces, boilers, heat pumps,
                ductwork, flues, chimneys, condensers, refrigerant lines, and normal
                operating controls.
                <strong> ATTIC, INSULATION & VENTILATION:</strong> Representative attic
                areas, insulation, ventilation, vapor barriers, and visible mechanical
                systems.
                <strong> INTERIOR:</strong> Walls, ceilings, floors, windows, doors,
                stairs, railings, fireplaces, and representative built-in appliances.
              </p>

              <p className="mb-3 text-sm">
                Inspection is not intended to determine compliance with building codes,
                manufacturer specifications, governmental regulations, or warranty
                requirements.
              </p>

              <p className="mb-3">
                <strong>3.2 EXCLUSIONS:</strong> The following items are specifically
                excluded from the inspection unless otherwise agreed to in writing:
                swimming pools, spas, hot tubs, sprinkler systems, wells, septic
                systems, cisterns, fencing, landscaping, trees, security systems,
                telecommunications equipment, elevators, environmental hazards
                including asbestos, lead paint, mold, fungi, indoor air quality, radon
                (unless separately tested), pest inspections, outbuildings, solar
                systems, water quality testing, and free-standing appliances.
              </p>

              <p className="text-xs text-charcoal/70 italic">
                Any information regarding excluded items that may appear in the report
                is provided strictly as a courtesy and shall not be construed as
                expanding the scope of the inspection or creating any responsibility or
                liability for those items.
              </p>
            </Section>

            <Section number="4" title="LIMITATIONS">
              <p className="mb-3">
                <strong>4.1 UTILITIES & EQUIPMENT:</strong> Inspectors are not required
                to activate utilities, pilot lights, shutoff valves, breakers, or
                equipment that is shut down, unsafe, inaccessible, or disabled.
                Inspectors will not move furniture, storage, personal property, snow,
                soil, debris, or vegetation to gain access. No dismantling or
                destructive testing will be performed.
              </p>

              <p className="mb-3">
                <strong>4.2 ACCESSIBILITY:</strong> Conditions that are concealed,
                inaccessible, latent, or otherwise not visible at the time of
                inspection cannot be evaluated. Customer acknowledges and assumes all
                risk for concealed or inaccessible defects, including conditions hidden
                by finishes, furnishings, storage, weather, occupants, or seller
                concealment.
              </p>

              <p className="mb-3">
                Inspection Company shall not be responsible for limitations caused by
                weather, snow, ice, occupancy, storage conditions, locked areas, pets,
                or other conditions beyond its control.
              </p>

              <p className="mb-3">
                <strong>4.3 PURPOSE & SCOPE:</strong> This inspection is a limited,
                non-invasive visual inspection and is not technically exhaustive. It is
                not an engineering evaluation, code compliance inspection,
                environmental assessment, or guarantee of future condition or
                performance. Cosmetic and aesthetic conditions are excluded.
              </p>

              <p className="mb-3">
                <strong>4.4 DISCLAIMER OF WARRANTIES:</strong> The inspection and
                report are not a warranty, guarantee, insurance policy, or
                certification of any kind. Inspection Company makes no express or
                implied warranties, including warranties of merchantability or fitness
                for a particular purpose. Customer waives any claim for consequential,
                incidental, punitive, or exemplary damages.
              </p>

              <p className="mb-3">
                <strong>4.5 SEVERABILITY:</strong> If any provision of this Agreement
                is held invalid or unenforceable, the remaining provisions shall remain
                in full force and effect.
              </p>

              <p>
                <strong>4.6 ELECTRONIC SIGNATURES:</strong> Electronic signatures and
                electronically transmitted copies of this Agreement shall be deemed
                originals and fully enforceable.
              </p>
            </Section>

            <Section number="5" title="INSPECTION REPORT">
              <p className="mb-3">
                Inspection Company agrees to prepare a written report as documentation
                of the inspector's observations based on conditions present during the
                inspection. The report is not an express or implied warranty as to the
                performance, adequacy, efficiency, suitability, or remaining life of
                any system or component.
              </p>

              <p className="mb-3">
                The report reflects conditions observed only at the time of inspection.
                Future conditions may change.
              </p>

              <p className="mb-3">
                Customer agrees to promptly read the entire report and notify
                Inspection Company of any questions or concerns regarding the report or
                findings.
              </p>

              <p className="mb-3">
                Inspection Company reserves the right to amend, clarify, or supplement
                the report within forty-eight (48) hours of delivery.
              </p>

              <p>
                Report and its contents are intended solely for the exclusive use of,
                and are the nontransferable property of, the Customer.
              </p>
            </Section>

            <Section number="6" title="INSPECTION FEES & PAYMENT TERMS">
              <p>
                Fees are based on the reported size of the building and a single visit
                to the property. Additional charges may apply for additional square
                footage, multiple systems, additional buildings, additional travel,
                re-inspections, inaccessible systems, inactive utilities, or return
                visits required due to conditions beyond Inspection Company's control.
                Fees are due at the completion of the inspection. Inspection Company
                may withhold the report until payment is received in full. Balances
                unpaid after 30 days may incur a $25 late fee and interest at 1.5% per
                month, in addition to any collection costs and attorney fees.
              </p>
            </Section>

            <Section number="7" title="STANDARD TERMS AND CONDITIONS">
              <p className="mb-3">
                <strong>7.1 REINSPECTION RIGHT:</strong> Customer shall provide
                Inspection Company with three (3) business days to re-inspect any
                claimed defect before repair, replacement, or alteration. Failure to
                provide such opportunity shall constitute a waiver of any claim
                relating to that item.
              </p>

              <p className="mb-3">
                <strong>7.2 DISPUTE RESOLUTION:</strong> The parties agree to attempt
                in good faith to resolve disputes informally. If disputes cannot be
                resolved informally, the parties agree to participate in non-binding
                mediation prior to arbitration or litigation.
              </p>

              <p className="mb-3">
                Any dispute arising out of this Agreement, the inspection, or the
                report shall thereafter be resolved exclusively by binding arbitration
                in Jefferson County, Colorado, in accordance with the Construction
                Industry Rules of the American Arbitration Association.
              </p>

              <p className="mb-3">
                <strong>7.3 TIME LIMIT FOR ACTION:</strong> Any legal action arising
                out of this Agreement, inspection, or report must be commenced within
                one (1) year from the date of the inspection report.
              </p>

              <p className="mb-3">
                <strong>7.4 ATTORNEY FEES:</strong> The prevailing party in any action
                arising from this Agreement shall be entitled to recover reasonable
                attorney fees, mediation costs, arbitration costs, and expenses.
              </p>

              <p className="mb-3">
                <strong>7.5 LIMITATION OF LIABILITY:</strong> The maximum liability of
                Inspection Company, its employees, agents, and inspectors, for any and
                all claims, damages, costs, expenses, negligence, errors, or omissions
                arising out of or relating to the inspection, report, or this
                Agreement shall be limited to the amount of the inspection fee actually
                paid by Customer.
              </p>

              <p className="mb-3">
                <strong>7.6 INSPECTOR LIABILITY:</strong> Customer agrees that any
                claim arising from the inspection shall be brought solely against
                Inspection Company and not against individual inspectors, employees,
                officers, directors, or agents personally.
              </p>

              <p>
                <strong>7.7 THIRD PARTY USE:</strong> The inspection report is prepared
                exclusively for the Customer and no third party may rely upon it.
                Customer shall not distribute the report to third parties without
                written permission from Inspection Company. Customer agrees to
                indemnify and hold harmless Inspection Company and its inspectors from
                any third-party claims arising from unauthorized use or distribution of
                the report.
              </p>
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
