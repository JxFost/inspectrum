/*
 * Gmail API helper — reads emails via service account with domain-wide delegation.
 *
 * Supports reading any user's mailbox in the domain.
 *
 * Environment:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL — service account email
 *   GOOGLE_PRIVATE_KEY — PEM private key
 *   ACC_GMAIL_ADDRESS — Shirley's email (for ACC backfill)
 *   INSPECTOR_GMAIL_ADDRESS — Harry's email (for report scanning)
 */

import { google } from 'googleapis'

function getAuth(delegateEmail) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY

  if (!email || !rawKey || !delegateEmail) {
    throw new Error(`Missing Gmail env vars: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, delegate=${delegateEmail}`)
  }

  const key = rawKey.replace(/\\n/g, '\n')

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    subject: delegateEmail,
  })
}

/**
 * Search a user's mailbox.
 * @param {string} query — Gmail search query
 * @param {number} maxResults
 * @param {string} [delegateEmail] — which mailbox to read (defaults to ACC_GMAIL_ADDRESS)
 * @returns {Array<{ id, subject, from, to, html, plain, date, attachments }>}
 */
export async function searchEmails(query, maxResults = 100, delegateEmail) {
  const delegate = delegateEmail || process.env.ACC_GMAIL_ADDRESS
  const auth = getAuth(delegate)
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
      const to = headers.find((h) => h.name.toLowerCase() === 'to')?.value || ''
      const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || ''

      // Extract body parts and attachments
      const parts = full.data.payload?.parts || []
      let html = ''
      let plain = ''
      const attachments = []

      function extractParts(partsList) {
        for (const part of partsList) {
          if (part.parts) {
            extractParts(part.parts)
          } else if (part.mimeType === 'text/html' && part.body?.data) {
            html = Buffer.from(part.body.data, 'base64').toString('utf-8')
          } else if (part.mimeType === 'text/plain' && part.body?.data) {
            plain = Buffer.from(part.body.data, 'base64').toString('utf-8')
          } else if (part.filename && part.body?.attachmentId) {
            attachments.push({
              filename: part.filename,
              mimeType: part.mimeType,
              size: part.body.size || 0,
              attachmentId: part.body.attachmentId,
            })
          }
        }
      }

      if (parts.length > 0) {
        extractParts(parts)
      } else if (full.data.payload?.body?.data) {
        const body = Buffer.from(full.data.payload.body.data, 'base64').toString('utf-8')
        if (full.data.payload.mimeType === 'text/html') html = body
        else plain = body
      }

      results.push({ id: msg.id, subject, from, to, html, plain, date, attachments })
    } catch (err) {
      console.error(`[gmail] failed to fetch message ${msg.id}:`, err.message)
    }
  }

  return results
}

/**
 * Download an attachment by message ID and attachment ID.
 * Returns a Buffer of the attachment data.
 */
export async function downloadAttachment(messageId, attachmentId, delegateEmail) {
  const delegate = delegateEmail || process.env.INSPECTOR_GMAIL_ADDRESS
  const auth = getAuth(delegate)
  await auth.authorize()
  const gmail = google.gmail({ version: 'v1', auth })

  const res = await gmail.users.messages.attachments.get({
    userId: 'me',
    messageId,
    id: attachmentId,
  })

  // Gmail returns base64url-encoded data
  const data = res.data.data
  return Buffer.from(data, 'base64url')
}
