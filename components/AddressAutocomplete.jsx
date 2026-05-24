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

/**
 * Try to find the inner <input> inside the web component.
 * Tries direct query first, then shadow root.
 */
function findInnerInput(el) {
  return el.querySelector('input')
    || el.shadowRoot?.querySelector('input')
    || null
}

// ---- Component ----

export default function AddressAutocomplete({ value, onChange, onPlaceSelect, placeholder, required, error, className = '' }) {
  const containerRef = useRef(null)
  const autocompleteElRef = useRef(null)
  const onPlaceSelectRef = useRef(onPlaceSelect)
  const onChangeRef = useRef(onChange)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  // After selection, show a plain input with the parsed street so user can edit
  const [selectedStreet, setSelectedStreet] = useState(null)

  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect }, [onPlaceSelect])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    loadGoogleMaps().then((loaded) => {
      setApiLoaded(loaded)
      if (!loaded) setUseFallback(true)
    })
  }, [])

  // Create and mount the PlaceAutocompleteElement
  useEffect(() => {
    if (!apiLoaded || !containerRef.current || autocompleteElRef.current) return
    // Don't create if we've already selected (showing the plain input)
    if (selectedStreet !== null) return

    try {
      const el = new window.google.maps.places.PlaceAutocompleteElement({
        types: ['address'],
        componentRestrictions: { country: 'us' },
      })

      // Bias toward Colorado Front Range
      try {
        el.locationBias = {
          center: { lat: 39.7392, lng: -104.9903 },
          radius: 50000,
        }
      } catch { /* ignore if not supported */ }

      // Place selected from dropdown
      const handlePlaceSelect = async (event) => {
        const place = event.place
        if (!place) return

        await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] })
        if (!place.addressComponents) return

        const parsed = parseAddressComponents(place.addressComponents)

        // Update parent form state with all parsed components
        onPlaceSelectRef.current?.(parsed)

        // Switch to a plain editable input showing just the street
        // This avoids fighting the web component's display value
        setSelectedStreet(parsed.street)
      }

      // Manual typing relay
      const handleInput = () => {
        const inner = findInnerInput(el)
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
  }, [apiLoaded, selectedStreet])

  // Reset back to autocomplete mode
  const handleClear = () => {
    setSelectedStreet(null)
    autocompleteElRef.current = null
    // Clear the container so the element can be re-created
    if (containerRef.current) containerRef.current.innerHTML = ''
  }

  const borderClass = error ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-teal'
  const inputClasses = `bg-cream border ${borderClass} px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)] w-full`

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
          className={inputClasses}
        />
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      </div>
    )
  }

  // After a place is selected: show a regular input with the parsed street
  if (selectedStreet !== null) {
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Street Address</label>
        <div className="relative">
          <input
            type="text"
            defaultValue={selectedStreet}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className={inputClasses}
          />
          <button
            type="button"
            onClick={handleClear}
            title="Search for a different address"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-teal transition-colors bg-transparent border-0 cursor-pointer p-1"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
      </div>
    )
  }

  // Default: show the autocomplete web component
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Street Address</label>
      <div ref={containerRef} className="address-autocomplete-container" />
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  )
}
