'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

/**
 * Loads the Google Maps JS API script once globally.
 */
let loadPromise = null
function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.google?.maps?.places) return Promise.resolve(true)
  if (loadPromise) return loadPromise

  if (!API_KEY) return Promise.resolve(false)

  // Suppress Google Maps auth errors (local dev with restricted key)
  window.gm_authFailure = () => {
    console.warn('[AddressAutocomplete] Google Maps API key not authorized for this domain — autocomplete disabled')
    window._gmapsAuthFailed = true
  }

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
    script.async = true
    script.onload = () => {
      setTimeout(() => resolve(!window._gmapsAuthFailed), 200)
    }
    script.onerror = () => { loadPromise = null; resolve(false) }
    document.head.appendChild(script)
  })

  return loadPromise
}

/**
 * Parse a Google Place result into structured address fields.
 */
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
 * Address input with Google Places Autocomplete.
 * Uses an uncontrolled input to avoid conflicts with Google's DOM manipulation.
 * Falls back to a regular controlled input if the API is not available.
 */
export default function AddressAutocomplete({ value, onChange, onPlaceSelect, placeholder, required, error, className = '' }) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const selectingRef = useRef(false)
  const [apiLoaded, setApiLoaded] = useState(false)

  useEffect(() => {
    loadGoogleMaps().then(setApiLoaded)
  }, [])

  // Sync the input value from parent when it changes externally (e.g., reset)
  useEffect(() => {
    if (inputRef.current && inputRef.current !== document.activeElement) {
      inputRef.current.value = value || ''
    }
  }, [value])

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()
    if (!place?.address_components) return

    const parsed = parsePlaceComponents(place)

    // Block onChange during selection so Google's DOM writes don't reset React state
    selectingRef.current = true

    // Call onPlaceSelect so React state updates for street, city, zip
    onPlaceSelect?.(parsed)

    // Delay the input reset — Google overwrites the input after place_changed
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = parsed.street
      }
      selectingRef.current = false
    }, 50)
  }, [onPlaceSelect])

  useEffect(() => {
    if (!apiLoaded || !inputRef.current || autocompleteRef.current) return

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components'],
    })

    ac.addListener('place_changed', handlePlaceChanged)
    autocompleteRef.current = ac

    return () => {
      window.google.maps.event.clearInstanceListeners(ac)
    }
  }, [apiLoaded, handlePlaceChanged])

  const borderClass = error ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-teal'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Street Address</label>
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={(e) => {
          // Don't fire onChange during place selection — Google triggers input events when it sets the value
          if (!selectingRef.current) onChange(e.target.value)
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
