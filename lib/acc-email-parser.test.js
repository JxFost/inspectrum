/*
 * Tests for ACC email parser using Node's built-in test runner.
 * Run with: node --test lib/acc-email-parser.test.js
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { classifyEmail, parseACCDateTime, parseACCEmail, isValidACCSender } from './acc-email-parser.js'

// ---- classifyEmail ----

describe('classifyEmail', () => {
  it('classifies appointment subjects', () => {
    const result = classifyEmail('Appointment:5/22/26 8:30 AM - Evergreen, CO - 4642 Plettner Ln')
    assert.equal(result.type, 'appointment')
    assert.equal(result.dateTimeStr, '5/22/26 8:30 AM')
    assert.equal(result.city, 'Evergreen')
    assert.equal(result.state, 'CO')
    assert.equal(result.address, '4642 Plettner Ln')
  })

  it('classifies reschedule subjects', () => {
    const result = classifyEmail('Reschedule:5/22/26 2:00 PM - Evergreen, CO - 4642 Plettner Ln')
    assert.equal(result.type, 'reschedule')
    assert.equal(result.dateTimeStr, '5/22/26 2:00 PM')
    assert.equal(result.city, 'Evergreen')
  })

  it('classifies cancelled subjects', () => {
    const result = classifyEmail('Cancelled:5/20/26 2:00 PM - Morrison, CO - 9659 S Turkey Creek Rd')
    assert.equal(result.type, 'cancelled')
    assert.equal(result.dateTimeStr, '5/20/26 2:00 PM')
    assert.equal(result.city, 'Morrison')
    assert.equal(result.address, '9659 S Turkey Creek Rd')
  })

  it('classifies end of day schedule', () => {
    const result = classifyEmail('End of Day Schedule')
    assert.equal(result.type, 'end_of_day')
  })

  it('returns unknown for unrecognized subjects', () => {
    const result = classifyEmail('Re: Some random email')
    assert.equal(result.type, 'unknown')
  })

  it('handles null subject', () => {
    assert.equal(classifyEmail(null).type, 'unknown')
    assert.equal(classifyEmail('').type, 'unknown')
  })
})

// ---- parseACCDateTime ----

describe('parseACCDateTime', () => {
  it('parses AM time', () => {
    const iso = parseACCDateTime('5/22/26 8:30 AM')
    assert.ok(iso)
    // Should produce a date in 2026 in Denver time
    const d = new Date(iso)
    assert.equal(d.getUTCFullYear(), 2026)
    // 8:30 AM Denver (MDT = UTC-6) = 14:30 UTC
    assert.equal(d.getUTCHours(), 14)
    assert.equal(d.getUTCMinutes(), 30)
  })

  it('parses PM time', () => {
    const iso = parseACCDateTime('5/22/26 2:00 PM')
    assert.ok(iso)
    const d = new Date(iso)
    // 2:00 PM Denver (MDT = UTC-6) = 20:00 UTC
    assert.equal(d.getUTCHours(), 20)
    assert.equal(d.getUTCMinutes(), 0)
  })

  it('handles 12:00 PM (noon)', () => {
    const iso = parseACCDateTime('5/22/26 12:00 PM')
    assert.ok(iso)
    const d = new Date(iso)
    // 12:00 PM Denver (MDT = UTC-6) = 18:00 UTC
    assert.equal(d.getUTCHours(), 18)
  })

  it('handles 12:00 AM (midnight)', () => {
    const iso = parseACCDateTime('5/22/26 12:00 AM')
    assert.ok(iso)
    const d = new Date(iso)
    // 12:00 AM Denver (MDT = UTC-6) = 06:00 UTC
    assert.equal(d.getUTCHours(), 6)
  })

  it('returns null for invalid input', () => {
    assert.equal(parseACCDateTime(null), null)
    assert.equal(parseACCDateTime(''), null)
    assert.equal(parseACCDateTime('garbage'), null)
  })
})

// ---- isValidACCSender ----

describe('isValidACCSender', () => {
  it('accepts valid ACC sender', () => {
    assert.ok(isValidACCSender('office+evergreeninspections@theinspectorsoffice.com'))
    assert.ok(isValidACCSender('Inspectrum <office+evergreeninspections@theinspectorsoffice.com>'))
  })

  it('rejects non-ACC senders', () => {
    assert.ok(!isValidACCSender('someone@gmail.com'))
    assert.ok(!isValidACCSender(''))
    assert.ok(!isValidACCSender(null))
  })
})

// ---- Full email parsing with real sample subjects ----

describe('parseACCEmail with sample subjects', () => {
  it('parses appointment subject correctly', () => {
    const result = parseACCEmail({
      subject: 'Appointment:5/22/26 8:30 AM - Evergreen, CO - 4642 Plettner Ln',
      from: 'Inspectrum <office+evergreeninspections@theinspectorsoffice.com>',
      html: '',
      plainText: '',
    })
    assert.equal(result.type, 'appointment')
    assert.ok(result.startISO)
    const d = new Date(result.startISO)
    assert.equal(d.getUTCFullYear(), 2026)
    assert.equal(d.getUTCMonth(), 4) // May = 4
    assert.equal(d.getUTCDate(), 22)
    assert.equal(d.getUTCHours(), 14) // 8:30 AM MDT = 14:30 UTC
    assert.equal(d.getUTCMinutes(), 30)
  })

  it('parses reschedule subject correctly', () => {
    const result = parseACCEmail({
      subject: 'Reschedule:5/22/26 2:00 PM - Evergreen, CO - 4642 Plettner Ln',
      from: 'Inspectrum <office+evergreeninspections@theinspectorsoffice.com>',
      html: '',
      plainText: '',
    })
    assert.equal(result.type, 'reschedule')
    assert.ok(result.startISO)
    const d = new Date(result.startISO)
    assert.equal(d.getUTCHours(), 20) // 2:00 PM MDT = 20:00 UTC
  })

  it('parses cancelled subject correctly', () => {
    const result = parseACCEmail({
      subject: 'Cancelled:5/20/26 2:00 PM - Morrison, CO - 9659 S Turkey Creek Rd',
      from: 'Inspectrum <office+evergreeninspections@theinspectorsoffice.com>',
      html: '',
      plainText: '',
    })
    assert.equal(result.type, 'cancelled')
    assert.ok(result.startISO)
    assert.equal(result.parsed.address, '9659 S Turkey Creek Rd')
    assert.equal(result.parsed.city, 'Morrison')
  })

  it('ignores end of day schedule', () => {
    const result = parseACCEmail({
      subject: 'End of Day Schedule',
      from: 'Inspectrum <office+evergreeninspections@theinspectorsoffice.com>',
      html: '',
      plainText: '',
    })
    assert.equal(result.type, 'end_of_day')
    assert.ok(!result.parsed) // no parsed body for ignored emails
  })
})

// ---- HTML body parsing with sample data ----

describe('parseACCEmail with sample HTML body', () => {
  // Simplified HTML fragment matching the structure of the real appointment email
  const sampleAppointmentHTML = `
    <th><u>Client's Name:</u></th><th width="50%">Brennan Pogliano</th>
    <td>Cell Phone:</td><td width="50%">317-517-9582</td>
    <td>Email:</td><td colspan="3" width="50%">pogliano.brennan@gmail.com</td>
    <th><u>Property Address:</u></th><th width="75%">
        4642 Plettner Ln<br />
                                Evergreen, CO 80439
    </th>
    <td>Occupied:</td><td width="75%">Yes</td>
    <td>Utilities On:</td><td width="75%">Yes</td>
    <td>Type of Inspection</td><td>Multi-Family</td>
    <td>Square Feet</td><td>1900</td>
    <td>Year Built</td><td>1913</td>
    <td>Radon</td><td>Yes</td>
    <td>Radon Drop Date</td><td>5/22</td>
    <td>Radon Pickup Date</td><td>5/24</td>
    <td>Sewer Scope</td><td>Yes</td>
    <td>Provided By:</td><td width="50%">Seller's Agent will let you in</td>
    <td>Buyer's Agent:</td><td width="50%">Dave Hanna</td>
    <td>Company:</td><td width="50%">Coldwell Banker Evergreen</td>
    <td>Seller's Agent:</td><td width="50%">Kristi Blanshan</td>
    <th>Status:</th><th width="50%">Appointment</th>
    <th>Taken By:</th><th width="50%">Lisa Drennon</th>
    <th>Ordered By:</th><th width="50%">Seller's Agent</th>
    <th>Date of Inspection:</th><th width="50%">Fri, 5/22/26</th>
    <th>Time of Inspection:</th><th width="50%">08:30 am</th>
    <th>Total</th><th>$1,005</th>
    <td colspan="4">Comments:</td></tr><tr><td colspan="4"><p>LA confirmed she or the sellers will let you in</p></td>
    <td>Contract Deadline Date</td><td>Pre-list</td>
    <td>Client Attending:</td><td width="100%">No</td>
    <td>Referred By:</td><td colspan="3">Seller's Agent</td>
  `

  it('extracts client info from HTML', () => {
    const result = parseACCEmail({
      subject: 'Appointment:5/22/26 8:30 AM - Evergreen, CO - 4642 Plettner Ln',
      from: 'office+evergreeninspections@theinspectorsoffice.com',
      html: sampleAppointmentHTML,
      plainText: '',
    })

    assert.equal(result.type, 'appointment')
    assert.equal(result.parsed.clientName, 'Brennan Pogliano')
    assert.equal(result.parsed.clientPhone, '317-517-9582')
    assert.equal(result.parsed.clientEmail, 'pogliano.brennan@gmail.com')
  })

  it('extracts property details from HTML', () => {
    const result = parseACCEmail({
      subject: 'Appointment:5/22/26 8:30 AM - Evergreen, CO - 4642 Plettner Ln',
      from: 'office+evergreeninspections@theinspectorsoffice.com',
      html: sampleAppointmentHTML,
      plainText: '',
    })

    assert.equal(result.parsed.address, '4642 Plettner Ln')
    assert.equal(result.parsed.city, 'Evergreen')
    assert.equal(result.parsed.state, 'CO')
    assert.equal(result.parsed.zip, '80439')
    assert.equal(result.parsed.occupied, 'Yes')
    assert.equal(result.parsed.utilitiesOn, 'Yes')
  })

  it('extracts inspection details from HTML', () => {
    const result = parseACCEmail({
      subject: 'Appointment:5/22/26 8:30 AM - Evergreen, CO - 4642 Plettner Ln',
      from: 'office+evergreeninspections@theinspectorsoffice.com',
      html: sampleAppointmentHTML,
      plainText: '',
    })

    assert.equal(result.parsed.inspectionType, 'Multi-Family')
    assert.equal(result.parsed.squareFeet, '1900')
    assert.equal(result.parsed.yearBuilt, '1913')
    assert.equal(result.parsed.radon, 'Yes')
    assert.equal(result.parsed.sewerScope, 'Yes')
    assert.equal(result.parsed.radonDropDate, '5/22')
    assert.equal(result.parsed.radonPickupDate, '5/24')
  })

  it('extracts agent and meta info from HTML', () => {
    const result = parseACCEmail({
      subject: 'Appointment:5/22/26 8:30 AM - Evergreen, CO - 4642 Plettner Ln',
      from: 'office+evergreeninspections@theinspectorsoffice.com',
      html: sampleAppointmentHTML,
      plainText: '',
    })

    assert.equal(result.parsed.orderedBy, "Seller's Agent")
    assert.equal(result.parsed.takenBy, 'Lisa Drennon')
    assert.equal(result.parsed.status, 'Appointment')
    assert.equal(result.parsed.accessProvidedBy, "Seller's Agent will let you in")
    assert.ok(result.parsed.comments?.includes('LA confirmed'))
    assert.equal(result.parsed.referredBy, "Seller's Agent")
  })

  // Cancelled email sample
  const sampleCancelledHTML = `
    <th>Status:</th><th width="50%">Cancelled</th>
    <th>Ordered By:</th><th width="50%">Buyer's Agent</th>
    <th>Reason:</th><th width="50%">The buyer called to cancel because the contract fell trough Orig 5/20 @2:00 pm</th>
    <th>Taken By:</th><th width="50%">Yulissa Zamora Escobar</th>
    <th><u>Client's Name:</u></th><th width="50%">Micheal Penner </th>
    <td>Cell Phone:</td><td width="50%">7207519541</td>
    <td>Email:</td><td colspan="3" width="50%">mike@finalphaseinc.com</td>
    <th><u>Property Address:</u></th><th width="75%">
        9659 S Turkey Creek Rd<br />
                                Morrison, CO 80465
    </th>
    <td>Type of Inspection</td><td>Whole House - total sf incl bsmt</td>
    <td>Square Feet</td><td>5042</td>
    <td>Radon</td><td>Yes</td>
    <td>Sewer Scope</td><td>No</td>
    <td>Referred By:</td><td colspan="3">Repeat Client</td>
  `

  it('parses cancelled email correctly', () => {
    const result = parseACCEmail({
      subject: 'Cancelled:5/20/26 2:00 PM - Morrison, CO - 9659 S Turkey Creek Rd',
      from: 'office+evergreeninspections@theinspectorsoffice.com',
      html: sampleCancelledHTML,
      plainText: '',
    })

    assert.equal(result.type, 'cancelled')
    assert.equal(result.parsed.clientName, 'Micheal Penner')
    assert.equal(result.parsed.clientPhone, '7207519541')
    assert.equal(result.parsed.clientEmail, 'mike@finalphaseinc.com')
    assert.equal(result.parsed.address, '9659 S Turkey Creek Rd')
    assert.equal(result.parsed.city, 'Morrison')
    assert.equal(result.parsed.zip, '80465')
    assert.equal(result.parsed.status, 'Cancelled')
    assert.ok(result.parsed.cancelReason?.includes('contract fell trough'))
    assert.equal(result.parsed.inspectionType, 'Whole House - total sf incl bsmt')
    assert.equal(result.parsed.squareFeet, '5042')
  })
})
