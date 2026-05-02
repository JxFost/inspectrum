# Scheduler Setup Guide

This guide walks through connecting the online booking system to Google Calendar via a service account.

## 1. Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Click the project dropdown at the top and select **New Project**
3. Name it something like `inspectrum-booking` and create it
4. Make sure the new project is selected in the dropdown

## 2. Enable the Google Calendar API

1. In the Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Calendar API"
3. Click it, then click **Enable**

## 3. Create a service account

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Name it `inspectrum-scheduler` (the email will look like `inspectrum-scheduler@your-project.iam.gserviceaccount.com`)
4. Skip the optional role/access steps and click **Done**
5. Click the newly created service account in the list
6. Go to the **Keys** tab
7. Click **Add Key > Create new key > JSON**
8. A `.json` file downloads — keep it safe, you'll need two values from it

## 4. Extract the env vars from the JSON key

Open the downloaded JSON file. You need:

- `client_email` → this is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → this is your `GOOGLE_PRIVATE_KEY`

The private key in the JSON file contains literal `\n` characters (backslash + n). When you set the env var:

- **Locally in `.env.local`**: paste it exactly as-is from the JSON, wrapped in double quotes. The app converts `\n` to real newlines at runtime.
- **On Vercel**: paste the raw PEM text with real newlines (Vercel's UI handles multiline values). Or paste the JSON-escaped version — the code handles both.

## 5. Share your calendar with the service account

This is the step most people miss.

1. Open [Google Calendar](https://calendar.google.com/) in a browser
2. Find the calendar you want to use for bookings in the left sidebar
3. Click the three dots next to it → **Settings and sharing**
4. Scroll to **Share with specific people or groups**
5. Click **Add people and groups**
6. Paste the service account email (e.g. `inspectrum-scheduler@your-project.iam.gserviceaccount.com`)
7. Set permission to **Make changes to events**
8. Click **Send**

Without this step, the API calls will return 404 errors.

## 6. Get your Calendar ID

On the same settings page from step 5:

1. Scroll down to **Integrate calendar**
2. Copy the **Calendar ID** — it looks like `abc123@group.calendar.google.com` (or your email address if using a primary calendar)
3. This is your `GOOGLE_CALENDAR_ID`

## 7. Set environment variables

### Locally

Create a `.env.local` file (already in `.gitignore`):

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=inspectrum-scheduler@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=abc123@group.calendar.google.com
```

### On Vercel

1. Go to your project on [vercel.com](https://vercel.com/)
2. **Settings > Environment Variables**
3. Add all three variables for the Production (and Preview if you want) environments
4. For `GOOGLE_PRIVATE_KEY`, you can paste the multiline PEM directly — Vercel handles it

## 8. Test it

1. Run `npm run dev` locally
2. Go to `/schedule`, pick a service and date
3. You should see real availability based on your calendar
4. Book a test appointment — it should appear on your Google Calendar immediately

If something's wrong, check the terminal for error logs from the API routes.
