import { NextResponse } from 'next/server'

const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'phone']

function normalize(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY

  if (!accessKey) {
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
    firstName: normalize(body.firstName),
    lastName: normalize(body.lastName),
    email: normalize(body.email),
    phone: normalize(body.phone),
    address: normalize(body.address),
    serviceType: normalize(body.serviceType),
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

  let response
  try {
    response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: 'New inspection request from Inspectrum website',
        from_name: `${formData.firstName} ${formData.lastName}`,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        property_address: formData.address,
        service_needed: formData.serviceType,
        referral_source: formData.referral,
        message: formData.message || 'No message provided.',
      }),
    })
  } catch {
    return NextResponse.json(
      { message: 'We could not reach the contact form service. Please call or email us directly.' },
      { status: 502 },
    )
  }

  const result = await response.json().catch(() => ({}))

  if (!response.ok || result.success === false) {
    return NextResponse.json(
      { message: result.message || 'We could not send your message. Please call or email us directly.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ message: 'Thanks for your message.' })
}
