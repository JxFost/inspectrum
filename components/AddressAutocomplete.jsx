'use client'

import { useEffect, useRef, useState } from 'react'
import { parseAddressComponents } from '@/lib/address-parser'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// ---- Script loader (singleton) ----

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

// ---- Component ----

/**
 * Street address input with Google Places Autocomplete (new PlaceAutocompleteElement API).
 *
 * Props:
 * - value: current street value (used for initial/fallback render only)
 * - onChange(streetStr): called on manual typing
 * - onPlaceSelect({ street, city, state, zip }): called when user picks from dropdown
 * - placeholder, required, error, className: standard form field props
 */
export default function AddressAutocomplete({ value, onChange, onPlaceSelect, placeholder, required, error, className = '' }) {
  const containerRef = useRef(null)
  const autocompleteElRef = useRef(null)
  const onPlaceSelectRef = useRef(onPlaceSelect)
  const onChangeRef = useRef(onChange)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  // Keep refs current so event listener always calls latest callbacks
  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect }, [onPlaceSelect])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  // Load the Google Maps script
  useEffect(() => {
    loadGoogleMaps().then((loaded) => {
      setApiLoaded(loaded)
      if (!loaded) setUseFallback(true)
    })
  }, [])

  // Create and mount the PlaceAutocompleteElement once the API is ready
  useEffect(() => {
    if (!apiLoaded || !containerRef.current || autocompleteElRef.current) return

    try {
      const el = new window.google.maps.places.PlaceAutocompleteElement({
        types: ['address'],
        componentRestrictions: { country: 'us' },
      })

      // Bias results toward the Colorado Front Range
      try {
        el.locationBias = {
          center: { lat: 39.7392, lng: -104.9903 },
          radius: 100000,
        }
      } catch { /* locationBias may not be supported in all versions */ }

      // Place selected from dropdown
      const handlePlaceSelect = async (event) => {
        const place = event.place
        await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] })

        if (!place.addressComponents) return

        const parsed = parseAddressComponents(place.addressComponents)

        // Update parent form state with parsed components
        onPlaceSelectRef.current?.(parsed)

        // Override the input to show just the street (Google sets it to the full address)
        requestAnimationFrame(() => {
          const inner = el.querySelector('input')
          if (inner && parsed.street) {
            inner.value = parsed.street
          }
        })
      }

      // Manual typing — relay to parent so form validation works
      const handleInput = () => {
        const inner = el.querySelector('input')
        if (inner) onChangeRef.current?.(inner.value)
      }

      el.addEventListener('gmp-placeselect', handlePlaceSelect)
      el.addEventListener('input', handleInput)

      containerRef.current.appendChild(el)
      autocompleteElRef.current = el

      return () => {
        el.removeEventListener('gmp-placeselect', handlePlaceSelect)
        el.removeEventListener('input', handleInput)
      }
    } catch (err) {
      console.warn('[AddressAutocomplete] PlaceAutocompleteElement failed:', err.message)
      setUseFallback(true)
    }
  }, [apiLoaded])

  const borderClass = error ? 'border-red-400' : 'border-line'

  // Fallback: plain text input when API is unavailable
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
