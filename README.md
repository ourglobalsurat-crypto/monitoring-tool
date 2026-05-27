# Medallion Fence SEO Dashboard

A password-protected, client-facing SEO and website activity dashboard built with Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI components, Recharts, and server-side Google Analytics fetching.

## Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `SITE_PASSWORD`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GA4_PROPERTY_ID`

`GOOGLE_PRIVATE_KEY` can be pasted with escaped newlines (`\n`). No Google credentials are exposed to the browser.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Google Analytics Access

The Overview and SEO pages use the GA4 Data API from server-side Next.js route handlers only. Add the service account to the GA4 property before deploying.
