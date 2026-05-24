# Square Payment Integration Setup

## 1. Create a Square Developer Application

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Click **Create Application**
3. Name it "Inspectrum" or similar
4. You'll get both **Sandbox** and **Production** credentials — start with Sandbox

## 2. Get Your Credentials

In the Square Developer Dashboard for your app:

- **Access Token**: Applications → your app → Credentials → Access Token (Sandbox or Production)
- **Location ID**: Applications → your app → Locations → copy the Location ID

Add to your `.env.local` (and Vercel env vars for production):

```
SQUARE_ACCESS_TOKEN=your-sandbox-access-token
SQUARE_LOCATION_ID=your-sandbox-location-id
SQUARE_ENVIRONMENT=sandbox
```

## 3. Subscribe to Webhooks

1. In the Square Developer Dashboard, go to your app → **Webhooks**
2. Click **Add endpoint**
3. Set the URL to: `https://evergreeninspections.com/api/square/webhook`
   (or `https://inspectrum.vercel.app/api/square/webhook` for staging)
4. Enable these event types:
   - `invoice.payment_made`
   - `invoice.canceled`
   - `invoice.refunded`
5. Save — Square will show you a **Webhook Signature Key**
6. Copy that key and set it as `SQUARE_WEBHOOK_SECRET` in your env vars

## 4. Environment Variables Summary

| Variable | Where to find it | Notes |
|---|---|---|
| `SQUARE_ACCESS_TOKEN` | Developer Dashboard → Credentials | Different for sandbox vs production |
| `SQUARE_LOCATION_ID` | Developer Dashboard → Locations | Different for sandbox vs production |
| `SQUARE_WEBHOOK_SECRET` | Developer Dashboard → Webhooks → your endpoint | The signing key, not the URL |
| `SQUARE_ENVIRONMENT` | Set manually | `sandbox` or `production` |

## 5. Testing in Sandbox

Square's sandbox lets you test the full flow without real charges:

1. Set `SQUARE_ENVIRONMENT=sandbox` and use sandbox credentials
2. Create a test booking, then go to `/admin/inspections` and click Send Invoice
3. The invoice will be created in Square's sandbox — visible at [Sandbox Dashboard](https://squareupsandbox.com/dashboard/invoices)
4. To simulate payment: open the invoice in the sandbox dashboard, click "Record Payment"
5. The webhook will fire to your endpoint, updating the calendar event to "Paid"

**Sandbox test card**: `4532 7598 8710 0040` (Visa, any expiry, any CVV)

## 6. Going Live

When you're ready for real payments:

1. In Square Developer Dashboard, switch to **Production** credentials
2. Update env vars:
   ```
   SQUARE_ACCESS_TOKEN=production-token
   SQUARE_LOCATION_ID=production-location-id
   SQUARE_ENVIRONMENT=production
   ```
3. Add a **new webhook endpoint** in Production (separate from sandbox)
4. Set `SQUARE_WEBHOOK_SECRET` to the production webhook signing key
5. Redeploy

## 7. How the Flow Works

```
Admin clicks "Send Invoice" on dashboard
  → enters final price on /admin/inspections/[eventId]/invoice
  → POST /api/inspection/finalize
    → creates Square customer (or finds existing by email)
    → creates Square order with line item
    → creates + publishes Square invoice
    → Square emails customer a payment link
    → calendar event updated: payment_status: pending

Customer pays on Square's hosted page
  → Square webhook → POST /api/square/webhook
    → verifies HMAC signature
    → updates calendar event: payment_status: paid

Dashboard and manage page reflect current status automatically.
```
