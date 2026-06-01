# Medallion Fence SEO Dashboard

A password-protected, client-facing SEO and website activity dashboard built with Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI components, Recharts, and server-side Google Analytics fetching.

## Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `SITE_PASSWORD`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GA4_PROPERTY_ID`

`GOOGLE_PRIVATE_KEY` can be pasted with escaped newlines (`\n`). No Google credentials are exposed to the browser.

For Vercel, the recommended option is to set `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` instead of `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY`. Encode the complete downloaded service-account JSON file as base64 and paste the single-line output into Vercel.

PowerShell:

```powershell
$json = Get-Content 'C:\path\to\service-account.json' -Raw
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))
```

Treat the base64 value as a secret. Add it to the Production environment and redeploy.

Example Vercel value:

```env
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n...\n-----END PRIVATE KEY-----\n
```

Use the `private_key` field from the Google service account JSON. Do not use the JSON file path, `private_key_id`, or an abbreviated key. After editing Vercel environment variables, redeploy the project.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Google Analytics Access

The Overview and SEO pages use the GA4 Data API from server-side Next.js route handlers only. Add the service account to the GA4 property before deploying.
