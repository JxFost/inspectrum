'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

let loadPromise = null
function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.google?.maps?.places) return Promise.resolve(true)
  if (loadPromise) return loadPromise
  if (!API_KEY) return Promise.resolve(false)

  window.gm_authFailure = () => {
    console.warn('[AddressAutocomplete] API key not authorized for this domain')
    window._gmapsAuthFailed = true
  }

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
    script.async = true
    script.onload = () => setTimeout(() => resolve(!window._gmapsAuthFailed), 200)
    script.onerror = () => { loadPromise = null; resolve(false) }
    document.head.appendChild(script)
  })

  return loadPromise
}

function parsePlaceComponents(place) {
  const result = { street: '', city: '', state: '', zip: '' }
  const components = place.address_components || []
  let streetNumber = ''
  let route = ''

  for (const c of components) {
    const types = c.types
    if (types.includes('street_number')) streetNumber = c.long_name
    if (types.includes('route')) route = c.long_name
    if (types.includes('locality')) result.city = c.long_name
    if (types.includes('sublocality_level_1') && !result.city) result.city = c.long_name
    if (types.includes('administrative_area_level_1')) result.state = c.short_name
    if (types.includes('postal_code')) result.zip = c.long_name
  }

  result.street = [streetNumber, route].filter(Boolean).join(' ')
  return result
}

/**
 * Address autocomplete using the legacy Autocomplete class.
 * Fully uncontrolled input — React never sets the value, only reads via ref.
 */
export default function AddressAutocomplete({ value, onChange, onPlaceSelect, placeholder, required, error, className = '' }) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const placeSelectedRef = useRef(false)
  const [apiLoaded, setApiLoaded] = useState(false)

  useEffect(() => {
    loadGoogleMaps().then(setApiLoaded)
  }, [])

  // Set initial value once on mount
  useEffect(() => {
    if (inputRef.current && value && !inputRef.current.value) {
      inputRef.current.value = value
    }
  }, [value])

  useEffect(() => {
    if (!apiLoaded || !inputRef.current || autocompleteRef.current) return
    if (!window.google?.maps?.places?.Autocomplete) return

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components'],
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place?.address_components) return

      const parsed = parsePlaceComponents(place)
      placeSelectedRef.current = true

      // Update parent state with parsed fields
      onPlaceSelect?.(parsed)

      // Override Google's full-address input with just the street
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.value = parsed.street
        }
        placeSelectedRef.current = false
      })
    })

    autocompleteRef.current = ac
    return () => window.google.maps.event.clearInstanceListeners(ac)
  }, [apiLoaded, onPlaceSelect])

  const borderClass = error ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-teal'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Street Address</label>
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onInput={(e) => {
          if (!placeSelectedRef.current) {
            onChange(e.target.value)
          }
        }}
        placeholder={placeholder || '123 Main St'}
        required={required}
        autoComplete="off"
        className={`bg-cream border ${borderClass} px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)]`}
      />
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  )
}
