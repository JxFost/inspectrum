'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

/**
 * Loads the Google Maps JS API with Places library (new API).
 */
let loadPromise = null
function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.google?.maps?.places?.PlaceAutocompleteElement) return Promise.resolve(true)
  if (loadPromise) return loadPromise

  if (!API_KEY) return Promise.resolve(false)

  window.gm_authFailure = () => {
    console.warn('[AddressAutocomplete] Google Maps API key not authorized for this domain — autocomplete disabled')
    window._gmapsAuthFailed = true
  }

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`
    script.async = true
    script.onload = () => {
      setTimeout(() => resolve(!window._gmapsAuthFailed), 300)
    }
    script.onerror = () => { loadPromise = null; resolve(false) }
    document.head.appendChild(script)
  })

  return loadPromise
}

/**
 * Parse address components from a Place object (new API).
 */
function parsePlace(place) {
  const result = { street: '', city: '', state: '', zip: '' }
  const components = place.addressComponents || []

  let streetNumber = ''
  let route = ''

  for (const c of components) {
    const types = c.types || []
    if (types.includes('street_number')) streetNumber = c.longText || c.long_name || ''
    if (types.includes('route')) route = c.longText || c.long_name || ''
    if (types.includes('locality')) result.city = c.longText || c.long_name || ''
    if (types.includes('sublocality_level_1') && !result.city) result.city = c.longText || c.long_name || ''
    if (types.includes('administrative_area_level_1')) result.state = c.shortText || c.short_name || ''
    if (types.includes('postal_code')) result.zip = c.longText || c.long_name || ''
  }

  result.street = [streetNumber, route].filter(Boolean).join(' ')
  return result
}

/**
 * Address input with Google Places Autocomplete (new PlaceAutocompleteElement API).
 * Falls back to a regular text input if the API is not available.
 */
export default function AddressAutocomplete({ value, onChange, onPlaceSelect, placeholder, required, error, className = '' }) {
  const containerRef = useRef(null)
  const fallbackRef = useRef(null)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    loadGoogleMaps().then((loaded) => {
      setApiLoaded(loaded)
      if (!loaded) setUseFallback(true)
    })
  }, [])

  useEffect(() => {
    if (!apiLoaded || !containerRef.current) return
    if (containerRef.current.querySelector('gmp-place-autocomplete')) return

    try {
      const el = new window.google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: 'us' },
        types: ['address'],
      })

      // Style the inner input to match our design
      el.style.cssText = 'width:100%;'
      el.setAttribute('placeholder', placeholder || '123 Main St')

      el.addEventListener('gmp-placeselect', async (e) => {
        const place = e.place
        // Fetch full details including address components
        await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] })

        const parsed = parsePlace(place)
        onPlaceSelect?.(parsed)

        // Update the visible input to show just the street
        const innerInput = el.querySelector('input') || el.shadowRoot?.querySelector('input')
        if (innerInput) {
          setTimeout(() => { innerInput.value = parsed.street }, 50)
        }
      })

      // Relay manual typing to parent
      el.addEventListener('input', (e) => {
        const innerInput = el.querySelector('input') || el.shadowRoot?.querySelector('input')
        if (innerInput) onChange(innerInput.value)
      })

      containerRef.current.appendChild(el)
    } catch (err) {
      console.warn('[AddressAutocomplete] PlaceAutocompleteElement failed, using fallback:', err.message)
      setUseFallback(true)
    }
  }, [apiLoaded, onChange, onPlaceSelect, placeholder])

  const borderClass = error ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-teal'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Street Address</label>

      {useFallback ? (
        <input
          ref={fallbackRef}
          type="text"
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || '123 Main St'}
          required={required}
          className={`bg-cream border ${borderClass} px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]`}
        />
      ) : (
        <div ref={containerRef} />
        <style>{`
          gmp-place-autocomplete {
            width: 100%;
            --gmp-mat-color-surface: var(--color-cream, #FAF7F1);
            --gmp-mat-color-on-surface: var(--color-ink, #1F2426);
            --gmp-mat-color-outline: var(--color-line, #E2DDD5);
            --gmp-mat-color-primary: var(--color-teal, #2B7E8C);
          }
          gmp-place-autocomplete::part(input) {
            background: var(--color-cream, #FAF7F1);
            border: 1px solid ${error ? '#f87171' : 'var(--color-line, #E2DDD5)'};
            border-radius: 2px;
            padding: 12px 16px;
            font-size: 16px;
            color: var(--color-ink, #1F2426);
            outline: none;
            width: 100%;
            box-sizing: border-box;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          gmp-place-autocomplete::part(input):focus {
            border-color: var(--color-teal, #2B7E8C);
            box-shadow: 0 0 0 3px rgba(43,126,140,0.15);
          }
        `}</style>
      )}

      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  )
}
