/*
 * POST /api/agreement/sign
 *
 * Records a signed inspection service agreement.
 * Body: { token, initials, signatureName, radonAgreed }
 */

import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { token, initials, signatureName, radonAgreed } = body

  if (!token || !initials || !signatureName) {
    return NextResponse.json({ error: 'Token, initials, and signature are required.' }, { status: 400 })
  }

  const db = sql()

  // Find the agreement
  const agreements = await db`
    SELECT id, signed_at FROM signed_agreements WHERE token = ${token}
  `

  if (!agreements[0]) {
    return NextResponse.json({ error: 'Agreement not found.' }, { status: 404 })
  }

  if (agreements[0].signed_at) {
    return NextResponse.json({ error: 'Agreement already signed.' }, { status: 409 })
  }

  // Record the signature
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
  const ua = request.headers.get('user-agent') || ''

  await db`
    UPDATE signed_agreements
    SET
      initials = ${initials},
      signature_name = ${signatureName},
      radon_addendum = ${radonAgreed || false},
      signed_at = now(),
      ip_address = ${ip},
      user_agent = ${ua}
    WHERE id = ${agreements[0].id}
  `

  console.log(`[agreement] signed by ${signatureName} for token ${token.slice(0, 8)}...`)

  return NextResponse.json({ ok: true })
}
