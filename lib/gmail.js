/*
 * Gmail API helper — reads emails from Shirley's inbox via service account
 * with domain-wide delegation.
 *
 * Environment:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL — service account email
 *   GOOGLE_PRIVATE_KEY — PEM private key
 *   ACC_GMAIL_ADDRESS — Shirley's email (e.g. shirley@evergreeninspections.com)
 */

import { google } from 'googleapis'

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY
  const delegateEmail = process.env.ACC_GMAIL_ADDRESS

  if (!email || !rawKey || !delegateEmail) {
    throw new Error('Missing Gmail env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, ACC_GMAIL_ADDRESS')
  }

  const key = rawKey.replace(/\\n/g, '\n')

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    subject: delegateEmail, // impersonate Shirley's account
  })
}

/**
 * Search Shirley's inbox for ACC emails.
 * @param {string} query — Gmail search query (e.g. 'from:theinspectorsoffice.com after:2026/01/01')
 * @param {number} maxResults — max emails to fetch
 * @returns {Array<{ id, subject, from, html, plain, date }>}
 */
export async function searchEmails(query, maxResults = 100) {
  const auth = getAuth()
  await auth.authorize()
  const gmail = google.gmail({ version: 'v1', auth })

  const allMessages = []
  let pageToken

  do {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: Math.min(maxResults - allMessages.length, 100),
      pageToken,
    })

    const messages = res.data.messages || []
    allMessages.push(...messages)
    pageToken = res.data.nextPageToken

    if (allMessages.length >= maxResults) break
  } while (pageToken)

  // Fetch full message content for each
  const results = []
  for (const msg of allMessages) {
    try {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      })

      const headers = full.data.payload?.headers || []
      const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || ''
      const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || ''
      const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || ''

      // Extract body parts
      const parts = full.data.payload?.parts || []
      let html = ''
      let plain = ''

      // Handle multipart messages
      function extractParts(partsList) {
        for (const part of partsList) {
          if (part.parts) {
            extractParts(part.parts)
          } else if (part.mimeType === 'text/html' && part.body?.data) {
            html = Buffer.from(part.body.data, 'base64').toString('utf-8')
          } else if (part.mimeType === 'text/plain' && part.body?.data) {
            plain = Buffer.from(part.body.data, 'base64').toString('utf-8')
          }
        }
      }

      if (parts.length > 0) {
        extractParts(parts)
      } else if (full.data.payload?.body?.data) {
        // Single-part message
        const body = Buffer.from(full.data.payload.body.data, 'base64').toString('utf-8')
        if (full.data.payload.mimeType === 'text/html') html = body
        else plain = body
      }

      results.push({ id: msg.id, subject, from, html, plain, date })
    } catch (err) {
      console.error(`[gmail] failed to fetch message ${msg.id}:`, err.message)
    }
  }

  return results
}
