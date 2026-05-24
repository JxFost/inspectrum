/*
 * Square API helper — Invoice creation and management.
 *
 * Uses the Square Node SDK (Invoices API, Customers API, Orders API).
 * All monetary amounts are in cents (Square's Money type).
 *
 * Environment variables:
 *   SQUARE_ACCESS_TOKEN   — from Square Developer dashboard
 *   SQUARE_LOCATION_ID    — the location these payments belong to
 *   SQUARE_ENVIRONMENT    — 'sandbox' or 'production'
 */

import { Client, Environment } from 'square'
import { randomUUID } from 'crypto'

function getClient() {
  const env = process.env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox

  return new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: env,
  })
}

function locationId() {
  return process.env.SQUARE_LOCATION_ID
}

/**
 * Find or create a Square customer by email.
 * Returns the customer ID, or null if no email provided.
 */
export async function findOrCreateCustomer({ name, email, phone }) {
  if (!email) return null

  const client = getClient()

  // Search by email first
  try {
    const { result } = await client.customersApi.searchCustomers({
      query: {
        filter: {
          emailAddress: { exact: email },
        },
      },
    })

    if (result.customers?.length > 0) {
      return result.customers[0].id
    }
  } catch (err) {
    console.warn('[square] customer search failed:', err.message)
  }

  // Create new customer
  try {
    const nameParts = (name || '').split(' ')
    const { result } = await client.customersApi.createCustomer({
      idempotencyKey: randomUUID(),
      givenName: nameParts[0] || '',
      familyName: nameParts.slice(1).join(' ') || '',
      emailAddress: email,
      ...(phone && { phoneNumber: phone }),
    })

    console.log(`[square] created customer ${result.customer.id} for ${nameParts[0]}`)
    return result.customer.id
  } catch (err) {
    console.error('[square] customer creation failed:', err.message)
    return null
  }
}

/**
 * Create a Square invoice for a completed inspection.
 *
 * @param {object} opts
 * @param {string} opts.customerName
 * @param {string} opts.customerEmail
 * @param {string} opts.customerPhone
 * @param {string} opts.serviceName — display name for the line item
 * @param {number} opts.priceCents — total price in cents
 * @param {string} opts.inspectionDate — ISO date string for the invoice title
 * @param {string} [opts.notes] — optional internal notes
 * @returns {{ invoiceId, invoiceUrl, customerId, invoiceVersion }}
 */
export async function createInvoice({
  customerName,
  customerEmail,
  customerPhone,
  serviceName,
  priceCents,
  inspectionDate,
  notes,
}) {
  const client = getClient()
  const locId = locationId()

  // 1. Find or create customer
  const customerId = await findOrCreateCustomer({
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
  })

  // 2. Create order
  const { result: orderResult } = await client.ordersApi.createOrder({
    idempotencyKey: randomUUID(),
    order: {
      locationId: locId,
      lineItems: [
        {
          name: serviceName || 'Home Inspection',
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(priceCents),
            currency: 'USD',
          },
        },
      ],
      ...(notes && { note: notes }),
    },
  })

  const orderId = orderResult.order.id
  console.log(`[square] created order ${orderId}, $${(priceCents / 100).toFixed(2)}`)

  // 3. Create invoice (DRAFT)
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const dateLabel = inspectionDate
    ? new Date(inspectionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Inspection'

  const invoiceBody = {
    idempotencyKey: randomUUID(),
    invoice: {
      locationId: locId,
      orderId,
      deliveryMethod: 'EMAIL',
      paymentRequests: [
        {
          requestType: 'BALANCE',
          dueDate,
          automaticPaymentSource: 'NONE',
        },
      ],
      acceptedPaymentMethods: {
        card: true,
        bankAccount: false,
      },
      title: `Inspectrum Inspection — ${dateLabel}`,
      ...(customerId && {
        primaryRecipient: { customerId },
      }),
    },
  }

  const { result: invoiceResult } = await client.invoicesApi.createInvoice(invoiceBody)
  const invoice = invoiceResult.invoice

  console.log(`[square] created invoice ${invoice.id} (draft)`)

  // 4. Publish the invoice (sends email to customer)
  const { result: publishResult } = await client.invoicesApi.publishInvoice(
    invoice.id,
    { version: invoice.version, idempotencyKey: randomUUID() },
  )

  const published = publishResult.invoice
  console.log(`[square] published invoice ${published.id}, url: ${published.publicUrl}`)

  return {
    invoiceId: published.id,
    invoiceUrl: published.publicUrl,
    customerId: customerId || null,
    invoiceVersion: published.version,
  }
}

/**
 * Retrieve a Square invoice by ID.
 */
export async function getInvoice(invoiceId) {
  const client = getClient()
  const { result } = await client.invoicesApi.getInvoice(invoiceId)
  return result.invoice
}
