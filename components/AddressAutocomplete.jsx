'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

let loadPromise = null
function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.google?.maps?.places?.PlaceAutocompleteElement) return Promise.resolve(true)
  if (loadPromise) return loadPromise
  if (!API_KEY) return Promise.resolve(false)

  window.gm_authFailure = () => {
    console.warn('[AddressAutocomplete] API key not authorized for this domain')
    window._gmapsAuthFailed = true
  }

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`
    script.async = true
    script.onload = () => setTimeout(() => resolve(!window._gmapsAuthFailed), 300)
    script.onerror = () => { loadPromise = null; resolve(false) }
    document.head.appendChild(script)
  })

  return loadPromise
}

function parsePlace(place) {
  const result = { street: '', city: '', state: '', zip: '' }
  const components = place.addressComponents || []
  let streetNumber = ''
  let route = ''

  for (const c of components) {
    const types = c.types || []
    if (types.includes('street_number')) streetNumber = c.longText || ''
    if (types.includes('route')) route = c.longText || ''
    if (types.includes('locality')) result.city = c.longText || ''
    if (types.includes('sublocality_level_1') && !result.city) result.city = c.longText || ''
    if (types.includes('administrative_area_level_1')) result.state = c.shortText || ''
    if (types.includes('postal_code')) result.zip = c.longText || ''
  }

  result.street = [streetNumber, route].filter(Boolean).join(' ')
  return result
}

export default function AddressAutocomplete({ value, onChange, onPlaceSelect, placeholder, required, error, className = '' }) {
  const containerRef = useRef(null)
  const elementRef = useRef(null)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    loadGoogleMaps().then((loaded) => {
      setApiLoaded(loaded)
      if (!loaded) setUseFallback(true)
    })
  }, [])

  useEffect(() => {
    if (!apiLoaded || !containerRef.current || elementRef.current) return

    try {
      const el = new window.google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: 'us' },
        types: ['address'],
      })

      el.addEventListener('gmp-placeselect', async (e) => {
        const place = e.place
        await place.fetchFields({ fields: ['addressComponents'] })
        const parsed = parsePlace(place)
        onPlaceSelect?.(parsed)

        // Reset input to street only after Google finishes
        requestAnimationFrame(() => {
          const inner = el.querySelector('input')
          if (inner && parsed.street) inner.value = parsed.street
        })
      })

      el.addEventListener('input', () => {
        const inner = el.querySelector('input')
        if (inner) onChange(inner.value)
      })

      containerRef.current.appendChild(el)
      elementRef.current = el
    } catch (err) {
      console.warn('[AddressAutocomplete] PlaceAutocompleteElement failed:', err.message)
      setUseFallback(true)
    }
  }, [apiLoaded, onChange, onPlaceSelect])

  const borderClass = error ? 'border-red-400' : 'border-line'

  if (useFallback) {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Street Address</label>
        <input
          type="text"
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || '123 Main St'}
          required={required}
          className={`bg-cream border ${borderClass} focus:border-teal px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]`}
        />
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Street Address</label>
      <div ref={containerRef} className="address-autocomplete-container" />
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  )
}
