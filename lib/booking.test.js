/*
 * Tests for booking helpers using Node's built-in test runner.
 * Run with: node --test lib/booking.test.js
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mergeEventDescriptions, buildEventDescription, parseEventDescription } from './booking.js'

describe('buildEventDescription notes', () => {
  it('round-trips a notes field through build and parse', () => {
    const { description } = buildEventDescription({
      serviceName: 'Full Home Inspection',
      customerName: 'Jane Smith',
      phone: '303-555-0000',
      email: 'jane@example.com',
      address: '4642 Plettner Ln, Evergreen, CO',
      notes: 'Gate code 1234, dog in backyard',
      source: 'website',
    })
    assert.ok(description.includes('Notes: Gate code 1234, dog in backyard'))
    assert.equal(parseEventDescription(description).notes, 'Gate code 1234, dog in backyard')
  })

  it('omits the notes line when empty', () => {
    const { description } = buildEventDescription({
      serviceName: 'Full Home Inspection',
      customerName: 'Jane Smith',
      phone: '',
      email: '',
      address: '',
      notes: '',
      source: 'website',
    })
    assert.ok(!description.includes('Notes:'))
  })
})

describe('mergeEventDescriptions', () => {
  it('returns the other description when one is empty', () => {
    assert.equal(mergeEventDescriptions('', 'new'), 'new')
    assert.equal(mergeEventDescriptions('old', ''), 'old')
    assert.equal(mergeEventDescriptions(null, 'new'), 'new')
  })

  it('keeps new values for shared labels', () => {
    const oldDesc = 'Phone: 303-555-0000\nSquare Footage: 1800'
    const newDesc = 'Phone: 303-555-1111\nSquare Footage: 2400'
    assert.equal(mergeEventDescriptions(oldDesc, newDesc), newDesc)
  })

  it('carries over labeled lines missing from the new description', () => {
    const oldDesc = [
      'Service: Full Home Inspection',
      'Year Built: 1985',
      'payment_status: paid',
      'reminder_sent: true',
    ].join('\n')
    const newDesc = [
      'Service: Full Home Inspection',
      'Square Footage: 2400',
      '',
      'Booked via ACC (call center)',
    ].join('\n')

    const merged = mergeEventDescriptions(oldDesc, newDesc)
    const lines = merged.split('\n')

    assert.ok(lines.includes('Year Built: 1985'))
    assert.ok(lines.includes('payment_status: paid'))
    assert.ok(lines.includes('reminder_sent: true'))
    // Carried lines land before the footer
    assert.ok(lines.indexOf('Year Built: 1985') < lines.indexOf('Booked via ACC (call center)'))
  })

  it('restores a value the new description dropped', () => {
    const oldDesc = 'Email: jane@example.com\nPhone: 303-555-0000'
    const newDesc = 'Email: \nPhone: 303-555-0000'
    const merged = mergeEventDescriptions(oldDesc, newDesc)
    assert.ok(merged.includes('Email: jane@example.com'))
  })

  it('keeps only new comments when they contain the old text', () => {
    const oldDesc = 'Comments: Gate code 1234'
    const newDesc = 'Comments: Gate code 1234. Dog in backyard.'
    const merged = mergeEventDescriptions(oldDesc, newDesc)
    assert.ok(merged.includes('Comments: Gate code 1234. Dog in backyard.'))
    assert.ok(!merged.includes('Prior Comments'))
  })

  it('preserves old comments when the new text replaces them', () => {
    const oldDesc = 'Comments: Gate code 1234'
    const newDesc = 'Comments: Dog in backyard.\n\nBooked via ACC (call center)'
    const merged = mergeEventDescriptions(oldDesc, newDesc)
    assert.ok(merged.includes('Comments: Dog in backyard.'))
    assert.ok(merged.includes('Prior Comments: Gate code 1234'))
  })

  it('does not carry footer or token-divider lines', () => {
    const oldDesc = 'Service: Full Home Inspection\n\nBooked via ACC (call center)\n---\nbooking_token: abc-123'
    const newDesc = 'Service: Full Home Inspection\n\nBooked via ACC (call center)\n---\nbooking_token: abc-123'
    assert.equal(mergeEventDescriptions(oldDesc, newDesc), newDesc)
  })

  it('preserves token and inspection number across a rebuilt description', () => {
    const { description: oldDesc, token } = buildEventDescription({
      inspectionNumber: '2026-045',
      serviceName: 'Full Home Inspection',
      customerName: 'Jane Smith',
      phone: '303-555-0000',
      email: 'jane@example.com',
      address: '4642 Plettner Ln, Evergreen, CO',
      source: 'acc',
      accSubject: 'Appointment:5/22/26 8:30 AM - Evergreen, CO - 4642 Plettner Ln',
    })
    // Markers added after booking
    const withMarkers = `${oldDesc}\npayment_status: paid\n`

    const { description: newDesc } = buildEventDescription({
      inspectionNumber: '2026-045',
      token,
      serviceName: 'Full Home Inspection',
      customerName: 'Jane Smith',
      phone: '303-555-2222',
      email: 'jane@example.com',
      address: '4642 Plettner Ln, Evergreen, CO',
      sqft: '2400',
      source: 'acc',
      accSubject: 'Appointment:5/22/26 8:30 AM - Evergreen, CO - 4642 Plettner Ln',
      extra: 'Comments: Lockbox on side door',
    })

    const merged = mergeEventDescriptions(withMarkers, newDesc)
    const parsed = parseEventDescription(merged)

    assert.equal(parsed.token, token)
    assert.equal(parsed.inspectionNumber, '2026-045')
    assert.equal(parsed.phone, '303-555-2222')
    assert.equal(parsed.sqft, '2400')
    assert.equal(parsed.paymentStatus, 'paid')
    assert.ok(merged.includes('Comments: Lockbox on side door'))
  })
})
