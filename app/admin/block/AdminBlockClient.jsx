'use client'

import { useState } from 'react'
import { calculatePrice } from '@/lib/pricing'
import AddressAutocomplete from '@/components/AddressAutocomplete'

const SERVICES = [
  { id: 'full', name: 'Full Home Inspection', duration: 4 },
  { id: 'radon', name: 'Radon Testing Only', duration: 1 },
  { id: 'mold', name: 'Mold Assessment', duration: 2 },
  { id: 'pre-listing', name: 'Pre-Listing Inspection', duration: 3 },
]

export default function AdminBlockClient() {
  const [form, setForm] = useState({
    service: 'full',
    date: '',
    time: '08:00',
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    radonAddOn: false,
    sewerScope: false,
    skipAvailability: false,
    sendEmail: false,
    // Property details (collapsible)
    sqft: '',
    yearBuilt: '',
    city: '',
    garageType: '',
    outbuilding: '',
    occupied: '',
    waterType: '',
  })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Live pricing estimate
  const serviceType = form.service === 'radon' ? 'radon'
    : form.service === 'mold' ? 'mold'
    : form.service === 'commercial' ? 'commercial'
    : 'full'

  const features = {}
  if (form.garageType === 'Detached') features.detachedGarage = true
  if (form.outbuilding === 'Structure only') features.outbuildingStructure = true
  if (form.outbuilding === 'With electricity') features.outbuildingElecOnly = true
  if (form.outbuilding === 'Full utilities') features.outbuildingFull = true

  const pricing = calculatePrice({
    sqft: form.sqft,
    yearBuilt: form.yearBuilt,
    city: form.city,
    serviceType,
    radonAddOn: form.radonAddOn,
    sewerScope: form.sewerScope,
    features,
  })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.date || !form.time) return

    setStatus('sending')
    setErrorMsg('')

    const [hours, minutes] = form.time.split(':').map(Number)
    const [year, month, day] = form.date.split('-').map(Number)
    const rough = new Date(Date.UTC(year, month - 1, day, hours, minutes))
    const utcStr = rough.toLocaleString('en-US', { timeZone: 'UTC' })
    const localStr = rough.toLocaleString('en-US', { timeZone: 'America/Denver' })
    const offsetMs = new Date(utcStr) - new Date(localStr)
    const startISO = new Date(rough.getTime() + offsetMs).toISOString()

    try {
      const res = await fetch('/api/admin/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: form.service,
          startISO,
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          notes: form.notes,
          radonAddOn: form.radonAddOn,
          sewerScope: form.sewerScope,
          sendEmail: form.sendEmail,
          sqft: form.sqft,
          yearBuilt: form.yearBuilt,
          garageType: form.garageType,
          outbuilding: form.outbuilding,
          occupied: form.occupied,
          waterType: form.waterType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create event.')
        setStatus('error')
        return
      }

      setResult(data)
      setStatus('success')
    } catch {
      setErrorMsg('Network error.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-paper p-8 rounded-sm border border-line text-center">
        <div className="w-14 h-14 rounded-full bg-amber text-white flex items-center justify-center mx-auto mb-6 text-2xl">✓</div>
        <h2 className="text-xl mb-3 text-ink">Event Created</h2>
        <p className="text-sm text-charcoal mb-2">Confirmation: <span className="font-mono font-bold">{result.confirmationCode}</span></p>
        {result.token && (
          <p className="text-xs text-charcoal/60 mb-6">Manage URL: /manage?token={result.token}</p>
        )}
        <button
          type="button"
          onClick={() => { setStatus('idle'); setResult(null); setForm((f) => ({ ...f, name: '', phone: '', email: '', address: '', notes: '', sqft: '', yearBuilt: '', city: '', garageType: '', outbuilding: '', occupied: '', waterType: '' })) }}
          className="text-teal text-sm underline hover:text-amber cursor-pointer bg-transparent border-0"
        >
          Create another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-paper p-8 rounded-sm border border-line space-y-4">
      <Field label="Service">
        <select value={form.service} onChange={(e) => update('service', e.target.value)} className="input-style">
          {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.duration}h)</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date">
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="input-style" required />
        </Field>
        <Field label="Start Time">
          <input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} className="input-style" required />
        </Field>
      </div>

      <Field label="Customer Name (blank for vacation block)">
        <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className="input-style" placeholder="Leave blank for time block" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone">
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-style" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-style" />
        </Field>
      </div>

      <AddressAutocomplete
        onPlaceSelect={(parsed) => {
          const full = [parsed.street, parsed.city, parsed.state, parsed.zip].filter(Boolean).join(', ')
          setForm((prev) => ({
            ...prev,
            address: full,
            city: parsed.city || prev.city,
          }))
        }}
      />
      <Field label="Property Address">
        <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className="input-style" placeholder="Auto-filled from search above, or type manually" />
      </Field>

      <Field label="Notes">
        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input-style" rows={2} />
      </Field>

      {/* Collapsible property details */}
      <div className="border border-line rounded-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-cream/50 text-sm font-semibold text-charcoal/70 cursor-pointer border-0 hover:bg-cream transition-colors"
        >
          <span>Property Details (for pricing estimate)</span>
          <span className="text-teal">{detailsOpen ? '▲' : '▼'}</span>
        </button>
        {detailsOpen && (
          <div className="p-4 space-y-3 border-t border-line">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Square Footage">
                <input type="number" value={form.sqft} onChange={(e) => update('sqft', e.target.value)} className="input-style" placeholder="e.g. 2500" />
              </Field>
              <Field label="Year Built">
                <input type="number" value={form.yearBuilt} onChange={(e) => update('yearBuilt', e.target.value)} className="input-style" placeholder="e.g. 1985" />
              </Field>
            </div>
            <Field label="City">
              <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="input-style" placeholder="e.g. Evergreen" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Garage">
                <select value={form.garageType} onChange={(e) => update('garageType', e.target.value)} className="input-style">
                  <option value="">Not sure</option>
                  <option value="Attached">Attached</option>
                  <option value="Detached">Detached</option>
                  <option value="None">None</option>
                </select>
              </Field>
              <Field label="Outbuilding">
                <select value={form.outbuilding} onChange={(e) => update('outbuilding', e.target.value)} className="input-style">
                  <option value="">None</option>
                  <option value="Structure only">Structure only</option>
                  <option value="With electricity">With electricity</option>
                  <option value="Full utilities">Full utilities</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Occupied">
                <select value={form.occupied} onChange={(e) => update('occupied', e.target.value)} className="input-style">
                  <option value="">Not sure</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No / Vacant</option>
                </select>
              </Field>
              <Field label="Water Type">
                <select value={form.waterType} onChange={(e) => update('waterType', e.target.value)} className="input-style">
                  <option value="">Not sure</option>
                  <option value="Public">Public</option>
                  <option value="Well">Well</option>
                </select>
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Live pricing estimate */}
      {pricing.total != null && (
        <div className="bg-teal/[0.06] border border-teal/20 rounded-sm p-4">
          <div className="text-xs uppercase tracking-wider text-teal font-semibold mb-2">Estimated Price</div>
          <div className="space-y-1.5 text-sm">
            {pricing.breakdown.map((item, i) => (
              item.amount !== null && (
                <div key={i} className="flex justify-between">
                  <span className="text-charcoal">{item.label}</span>
                  <span className={`font-medium ${item.amount < 0 ? 'text-teal' : 'text-ink'}`}>
                    {item.amount < 0 ? `-$${Math.abs(item.amount)}` : `$${item.amount}`}
                  </span>
                </div>
              )
            ))}
            {pricing.cityUnknown && <div className="text-xs text-charcoal/50 italic">Location surcharge may apply</div>}
            <div className="border-t border-teal/20 pt-1.5 mt-1.5 flex justify-between">
              <span className="text-ink font-semibold">Total</span>
              <span className="text-teal font-semibold">${pricing.total}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.radonAddOn} onChange={(e) => update('radonAddOn', e.target.checked)} className="accent-teal" />
          <span className="text-sm text-charcoal">Radon Testing Add-On</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.sewerScope} onChange={(e) => update('sewerScope', e.target.checked)} className="accent-teal" />
          <span className="text-sm text-charcoal">Sewer Scope Add-On</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.sendEmail} onChange={(e) => update('sendEmail', e.target.checked)} disabled={!form.email} className="accent-teal" />
          <span className={`text-sm ${!form.email ? 'text-charcoal/40' : 'text-charcoal'}`}>Send confirmation email</span>
        </label>
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-teal text-white py-3 rounded-sm font-semibold text-sm cursor-pointer border-0 hover:bg-teal-darker transition-colors disabled:opacity-50"
      >
        {status === 'sending' ? 'Creating...' : 'Create Event'}
      </button>

      <style jsx>{`
        .input-style {
          width: 100%;
          background: var(--color-cream, #FAF7F1);
          border: 1px solid var(--color-line, #E2DDD5);
          padding: 10px 14px;
          font-size: 14px;
          color: var(--color-ink, #1F2426);
          border-radius: 2px;
          outline: none;
        }
        .input-style:focus {
          border-color: var(--color-teal, #2B7E8C);
        }
      `}</style>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-charcoal/70 font-semibold mb-1.5">{label}</label>
      {children}
    </div>
  )
}
