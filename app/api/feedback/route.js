/*
 * GET /api/feedback?rating=5&name=Jeff&service=Full+Home+Inspection&token=abc-123
 *
 * Logs the private star rating, stores it in the calendar event, and redirects:
 * - 4-5 stars → Google review page (warm handoff)
 * - 1-3 stars → thank you page with contact info (capture private feedback)
 */

import { NextResponse } from 'next/server'
import { findEventByToken, updateEventDescription } from '@/lib/google-calendar'
import { updateFeedbackByToken } from '@/lib/db-inspections'

const GOOGLE_REVIEW_URL = 'https://g.page/Inspectrum/review'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rating = parseInt(searchParams.get('rating'), 10)
  const name = searchParams.get('name') || 'Customer'
  const service = searchParams.get('service') || 'Inspection'
  const token = searchParams.get('token') || ''
  const firstName = name.split(' ')[0]

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  console.log(`[feedback] ${firstName} rated ${rating}/5 for ${service}`)

  // Store the rating in the calendar event description
  if (token) {
    try {
      const event = await findEventByToken(token)
      if (event) {
        let desc = event.description || ''
        // Don't overwrite if already rated
        if (!desc.includes('feedback_rating:')) {
          const ratingBlock = `feedback_rating: ${rating}\nfeedback_at: ${new Date().toISOString()}`
          desc = desc.includes('\n---\n')
            ? desc.replace('\n---\n', `\n${ratingBlock}\n\n---\n`)
            : `${desc}\n${ratingBlock}`
          await updateEventDescription(event.id, desc)
          console.log(`[feedback] stored rating ${rating}/5 on event ${event.id}`)
        }
      }
    } catch (err) {
      console.error('[feedback] failed to store rating:', err.message)
    }

    updateFeedbackByToken(token, rating)
      .catch((err) => console.error('[db] feedback update failed:', err.message))
  }

  // 4-5 stars: redirect to Google review
  if (rating >= 4) {
    return NextResponse.redirect(GOOGLE_REVIEW_URL)
  }

  // 1-3 stars: show a thank you page with contact info
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://evergreeninspections.com'
  const officePhone = process.env.OFFICE_PHONE || '(303) 697-0990'
  const officeEmail = process.env.OFFICE_EMAIL || 'office@evergreeninspections.com'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Thank You — Inspectrum</title></head>
<body style="margin:0;padding:40px 20px;background:#FAF7F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2426;">
  <div style="max-width:500px;margin:0 auto;text-align:center;">
    <img src="${siteUrl}/InspectrumLogo_440.png" alt="Inspectrum" style="height:60px;margin-bottom:24px;" />
    <h1 style="font-size:24px;margin:0 0 12px;color:#2B7E8C;">Thank you for your feedback, ${firstName}.</h1>
    <p style="font-size:15px;color:#3D3F40;line-height:1.6;margin:0 0 24px;">
      We're sorry your experience wasn't perfect. Your feedback helps us improve, and we'd love the chance to make it right.
    </p>
    <p style="font-size:15px;color:#3D3F40;line-height:1.6;margin:0 0 8px;">
      Please reach out directly — Harry would like to hear from you:
    </p>
    <p style="font-size:15px;margin:0 0 32px;">
      <a href="tel:${officePhone.replace(/\D/g, '')}" style="color:#2B7E8C;font-weight:600;">${officePhone}</a>
      &nbsp;·&nbsp;
      <a href="mailto:${officeEmail}" style="color:#2B7E8C;font-weight:600;">${officeEmail}</a>
    </p>
    <a href="${siteUrl}" style="font-size:13px;color:#9DA0A2;">Return to website</a>
  </div>
</body>
</html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}
