import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const REQUIRED_FIELDS = ['name', 'email', 'phone']
const MAX_FIELD_LENGTH = 500

function normalize(value) {
  return typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : ''
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

export async function POST(request) {
  const apiKey = process.env.RESEND_API_KEY
  const contactEmail = process.env.CONTACT_EMAIL

  if (!apiKey || !contactEmail) {
    return NextResponse.json(
      { message: 'Contact form is not configured yet.' },
      { status: 500 },
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: 'Invalid contact form submission.' },
      { status: 400 },
    )
  }

  if (normalize(body.botcheck)) {
    return NextResponse.json({ message: 'Thanks for your message.' })
  }

  const formData = {
    name: normalize(body.name),
    email: normalize(body.email),
    phone: normalize(body.phone),
    address: normalize(body.address),
    serviceType: normalize(body.serviceType),
    timeline: normalize(body.timeline),
    referral: normalize(body.referral),
    message: normalize(body.message),
  }

  const missingField = REQUIRED_FIELDS.find((field) => !formData[field])
  if (missingField) {
    return NextResponse.json(
      { message: 'Please fill out all required fields.' },
      { status: 400 },
    )
  }

  if (!isValidEmail(formData.email)) {
    return NextResponse.json(
      { message: 'Please enter a valid email address.' },
      { status: 400 },
    )
  }

  if (!isValidPhone(formData.phone)) {
    return NextResponse.json(
      { message: 'Please enter a valid phone number (at least 10 digits).' },
      { status: 400 },
    )
  }

  const resend = new Resend(apiKey)

  const { data, error: sendError } = await resend.emails.send({
    from: 'Inspectrum Website <onboarding@resend.dev>',
    to: ['jeff@evergreeninspections.com'],
    replyTo: formData.email,
    subject: `New inspection request from ${formData.name}`,
    html: `
      <h2>New Inspection Request</h2>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Phone:</strong> ${formData.phone}</p>
      <p><strong>Property Address:</strong> ${formData.address || 'Not provided'}</p>
      <p><strong>Service Needed:</strong> ${formData.serviceType || 'Not specified'}</p>
      <p><strong>Timeline:</strong> ${formData.timeline || 'Not specified'}</p>
      <p><strong>Referral Source:</strong> ${formData.referral || 'Not specified'}</p>
      <p><strong>Message:</strong> ${formData.message || 'No message provided.'}</p>
    `,
  })

  if (sendError) {
    console.error('Resend error:', sendError)
    return NextResponse.json(
      { message: sendError.message || 'We could not send your message. Please call or email us directly.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ message: 'Thanks for your message.' })
}
