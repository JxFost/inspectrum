'use client'

import { useEffect, useRef, useState } from 'react'
import { parseAddressComponents } from '@/lib/address-parser'

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

export default function AddressAutocomplete({ value, onChange, onPlaceSelect, placeholder, required, error, className = '' }) {
  const containerRef = useRef(null)
  const visibleInputRef = useRef(null)
  const autocompleteElRef = useRef(null)
  const onPlaceSelectRef = useRef(onPlaceSelect)
  const onChangeRef = useRef(onChange)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [street, setStreet] = useState(value || '')

  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect }, [onPlaceSelect])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    loadGoogleMaps().then(setApiLoaded)
  }, [])

  // Mount the invisible autocomplete element
  useEffect(() => {
    if (!apiLoaded || !containerRef.current || autocompleteElRef.current) return

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

      el.addEventListener('gmp-placeselect', async (event) => {
        const place = event.place
        if (!place) return
        await place.fetchFields({ fields: ['addressComponents', 'formattedAddress'] })
        if (!place.addressComponents) return

        const parsed = parseAddressComponents(place.addressComponents)

        // Update the visible input with just the street
        setStreet(parsed.street)
        if (visibleInputRef.current) visibleInputRef.current.value = parsed.street

        // Populate all form fields
        onPlaceSelectRef.current?.(parsed)
      })

      containerRef.current.appendChild(el)
      autocompleteElRef.current = el
    } catch (err) {
      console.warn('[AddressAutocomplete] failed:', err.message)
    }
  }, [apiLoaded])

  // Sync typing from visible input → hidden autocomplete
  const handleInput = (e) => {
    const val = e.target.value
    setStreet(val)
    onChangeRef.current?.(val)

    // Mirror to the autocomplete's inner input so suggestions appear
    const el = autocompleteElRef.current
    if (!el) return
    const inner = el.querySelector('input') || el.shadowRoot?.querySelector('input')
    if (inner && inner.value !== val) {
      // Set value and dispatch input event so Google picks it up
      const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      if (nativeSet) {
        nativeSet.call(inner, val)
        inner.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  }

  const borderClass = error ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-teal'

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold opacity-70">Street Address</label>
      <div className="address-autocomplete-wrapper">
        {/* Visible styled input — user types here */}
        <input
          ref={visibleInputRef}
          type="text"
          defaultValue={value}
          onInput={handleInput}
          placeholder={placeholder || '123 Main St'}
          required={required}
          autoComplete="off"
          className={`bg-cream border ${borderClass} relative z-[100] px-4 py-3 text-base text-ink rounded-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(43,126,140,0.15)] w-full`}
        />
        {/* Hidden autocomplete element — its input is invisible but dropdown is visible */}
        <div ref={containerRef} className="address-autocomplete-overlay" />
      </div>
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  )
}
