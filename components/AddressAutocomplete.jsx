'use client'

import { useEffect, useRef, useState } from 'react'
import { parseAddressComponents } from '@/lib/address-parser'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

let loadPromise = null
function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.google?.maps?.importLibrary) return Promise.resolve(true)
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
 * Google Places search field — matches Google's official address form sample.
 * Uses gmp-select event + placePrediction.toPlace() + fetchFields().
 */
export default function AddressAutocomplete({ onPlaceSelect, className = '' }) {
  const containerRef = useRef(null)
  const autocompleteElRef = useRef(null)
  const onPlaceSelectRef = useRef(onPlaceSelect)
  const [apiReady, setApiReady] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(true)

  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect }, [onPlaceSelect])

  useEffect(() => {
    loadGoogleMaps().then(async (loaded) => {
      if (!loaded) { setApiAvailable(false); return }
      // Ensure Places library is fully loaded
      await window.google.maps.importLibrary('places')
      setApiReady(true)
    })
  }, [])

  useEffect(() => {
    if (!apiReady || !containerRef.current || autocompleteElRef.current) return

    try {
      const el = new window.google.maps.places.PlaceAutocompleteElement({
        types: ['address'],
        componentRestrictions: { country: 'us' },
      })

      try {
        el.locationBias = {
          center: { lat: 39.7392, lng: -104.9903 },
          radius: 50000,
        }
      } catch { /* ignore */ }

      // Google's official pattern: gmp-select with placePrediction
      el.addEventListener('gmp-select', async ({ placePrediction }) => {
        if (!placePrediction) return

        const place = placePrediction.toPlace()
        await place.fetchFields({ fields: ['addressComponents', 'location'] })

        if (!place.addressComponents) return

        const parsed = parseAddressComponents(place.addressComponents)

        // Include lat/lng for trip charge calculation
        const loc = place.location
        if (loc) {
          parsed.lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat
          parsed.lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng
        }

        onPlaceSelectRef.current?.(parsed)
      })

      containerRef.current.appendChild(el)
      autocompleteElRef.current = el
    } catch (err) {
      console.warn('[AddressAutocomplete] failed:', err.message)
      setApiAvailable(false)
    }
  }, [apiReady])

  if (!apiAvailable) return null

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Search Address</label>
      <div ref={containerRef} className="address-autocomplete-search" />
      <p className="text-[0.65rem] text-charcoal/50 -mt-0.5">Search to auto-fill the fields below, or type manually.</p>
    </div>
  )
}
