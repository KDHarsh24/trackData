# trackData — Tracker server

This repository contains a simple Express tracker server (`server.js`) that accepts a client payload, enriches it (UA parsing, optional IP geolocation), and optionally forwards it to another service.

Key environment variables (see `.env.example`):

- `TRACK_PORT` — port the server listens on locally (default `5000`). Note: serverless platforms may ignore this.
- `TRUST_PROXY` — `true`/`false`. When `true`, `X-Forwarded-For` is used to determine client IP.
- `USE_IPAPI` — `true`/`false`. When `true`, the server will perform a lookup against `IPAPI_URL`.
- `IPAPI_URL` — template URL for IP lookup; `{ip}` will be replaced with the client IP. Default: `https://ipapi.co/{ip}/json/`.
- `FORWARD_URL` — optional. If set, the server will POST the enriched payload to this URL.
- `NODE_ENV` — `development` or `production`.

Postgres environment variables (optional):

- `DATABASE_URL` — recommended for hosted DBs (ex: `postgres://user:pass@host:5432/dbname`). If present it's used by the server.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — alternative to `DATABASE_URL` for local/postgres connections.
- `DB_SSL` — `true`/`false` to enable SSL (useful for managed providers).

Notes on alternate env names / Supabase

- This project also understands common Supabase / Prisma env names. If you use Supabase or other providers that expose alternate names, the server will prefer any full connection string present in one of these variables (in order):
	- `DATABASE_URL` (highest priority)
	- `POSTGRES_URL`
	- `POSTGRES_PRISMA_URL`
	- `POSTGRES_URL_NON_POOLING`

- If no full URL is present, it will fallback to pieces provided as `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` or their `POSTGRES_*` aliases.

- Example `.env` entries for Supabase (you can copy these to Vercel env variables):

```
POSTGRES_HOST=db.nbtusoplzdeezorfahxf.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=postgres
POSTGRES_URL=postgres://postgres:your-password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
DB_SSL=true
```

Running locally

1. Copy `.env.example` to `.env` and edit values as needed.

```powershell
cd 'c:\Users\Harsh\Desktop\Tracker'
copy .env.example .env
npm install
npm start
```

Development with auto-reload (requires `nodemon`):

```powershell
npm run dev
```

Deploying to Vercel

- Note: Vercel is primarily serverless. Running a long-lived Express server like `server.js` on the Vercel platform may require converting the server into Serverless Functions (API routes) instead of starting a persistent `listen` server. If you prefer to run this as-is you should deploy to a traditional node host (Render, Heroku, Fly, Railway) or wrap the functionality as serverless functions.

If you still want to deploy to Vercel as a serverless function, set the environment variables in the Vercel project settings:

1. Go to your Vercel project dashboard -> Settings -> Environment Variables.
2. Add the keys and values from `.env.example` (`TRUST_PROXY`, `USE_IPAPI`, `IPAPI_URL`, `FORWARD_URL`, etc.).
3. Make sure to add them for the correct environment (Preview / Production / Development).

Local testing with curl

```powershell
curl -X POST "http://localhost:5000/track" -H "Content-Type: application/json" -d '{"userAgent":"test","url":"http://example.com","meta":{"userId":"123"}}'
```

Next steps I can help with

- Convert `server.js` into Vercel serverless function(s) if you want to host on Vercel.
- Add persistent storage (Mongo/Postgres) or forwarding to an event queue.
- Add Health checks, logging, or Dockerfile for container deployments.

What I changed in this repo

- Added Postgres support: `pg` dependency, automatic `tracks` table creation (if DB reachable), and persisting each `/track` payload to the `tracks` table as JSONB.

Local tips

- If you're testing locally with Postgres installed, set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`.
- Or set `DATABASE_URL` for a single connection string.
