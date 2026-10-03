# Notrio
Arabic/English notebook store. Frontend: React + Vite + Tailwind. Backend: `server/` (Express, PostgreSQL or a local JSON file).

## Run
    npm install && (cd server && npm install && cp .env.example .env)   # edit server/.env
    (cd server && npm start)      # API on :4000
    npm run dev                   # site on :5173 (proxies /api)

## Database
The server uses **PostgreSQL** automatically if `DATABASE_URL` is set in `server/.env` — get this connection string from your host (Railway, Render, Supabase, Neon all give you one from their dashboard, usually under "Connect" or "Connection string"). Paste it in as-is:

    DATABASE_URL=postgres://user:password@host:5432/dbname

Tables are created automatically on first run — no migration step needed. If `DATABASE_URL` is left empty, the server keeps using a local `server/db.json` file instead, which is enough for development but **not for production** (it isn't safe for concurrent writes and isn't backed up).

## Google Sign-In
Optional — the "Sign in with Google" button only appears once configured:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create Credentials → OAuth client ID → Web application.
2. Add your site's URL (e.g. `https://yourdomain.com` and `http://localhost:5173` for local testing) under "Authorized JavaScript origins".
3. Copy the generated Client ID into **two** places:
   - `.env` (frontend root): `VITE_GOOGLE_CLIENT_ID=...`
   - `server/.env`: `GOOGLE_CLIENT_ID=...` (same value)

## Product photos
Drop `public/products/<id>.jpg` (3:4), ids: classic, lined, journal, meeting, interview, todo, daily, weekly, monthly, project, sketch, grid, creative, idea.

## Payment methods
Cash on delivery, plus manual InstaPay / Vodafone Cash transfer. Set the numbers shown at checkout in `.env`:

    VITE_INSTAPAY_NUMBER=01xxxxxxxxx
    VITE_VODAFONE_CASH_NUMBER=01xxxxxxxxx

When a customer pays by transfer, review their reference in `/admin` and click "Mark as paid" once you've confirmed the money arrived.

## Order management & stock
Visit `/admin` in the site and enter your `ADMIN_KEY` (from server/.env). Two tabs: **Orders** (search, filter, change status, mark paid) and **Stock** (edit quantity per product — decrements automatically on each order, restores automatically if an order is cancelled).

## SEO
`public/sitemap.xml` and `public/robots.txt` are generated from the product catalog — replace `YOUR-DOMAIN.example` in both with your real domain once you have one.

## Deploying: frontend on Vercel, backend on Render

Vercel is great for the frontend but isn't built for a long-running server like `server/index.js`, so the two parts deploy separately. The database (Supabase or anywhere else) doesn't move — both the local dev server and the deployed one just need `DATABASE_URL`.

**1. Backend → Render (or Railway)**
- New Web Service → connect your repo → root directory `server` → build command `npm install` → start command `npm start`.
- Add environment variables: `JWT_SECRET`, `ADMIN_KEY`, `DATABASE_URL` (your Supabase connection string), and `ALLOWED_ORIGIN` — set this to your Vercel URL once you have it, e.g. `https://notrio.vercel.app`, so the browser is allowed to call your API. Leave it unset while testing and it'll accept requests from anywhere (fine for development, not for production).
- Deploy. You'll get a URL like `https://notrio-api.onrender.com` — copy it.

**2. Frontend → Vercel**
- New Project → import your repo → root directory is the project root (not `server`) → Vercel auto-detects Vite, or the included `vercel.json` sets it explicitly.
- Add environment variables (all start with `VITE_`): `VITE_API_URL` = the Render URL from step 1 (no trailing slash), plus `VITE_INSTAPAY_NUMBER`, `VITE_VODAFONE_CASH_NUMBER`, and `VITE_GOOGLE_CLIENT_ID` if you use it.
- Deploy. You'll get a URL like `https://notrio.vercel.app`.

**3. Close the loop**
Go back to Render and set `ALLOWED_ORIGIN` to your actual Vercel URL from step 2, then redeploy the backend so it only accepts requests from your real site.

Local development is unaffected by any of this — `npm run dev` still proxies `/api` straight to `localhost:4000` as before.

## Before production
- Set a real random `JWT_SECRET` and `ADMIN_KEY` in `server/.env` — the placeholder values must not ship.
- Set `DATABASE_URL` so orders/users/stock persist reliably (see above).
- Serve everything over HTTPS.
- Keep `server/catalog.json` in sync with `src/data/products.ts` if you add/remove products.
- Build the frontend (`npm run build`) and serve the `dist/` folder from your host, with `/api` proxied to the Node server (or on its own subdomain with CORS enabled).
