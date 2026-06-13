# Host Hampton (Legacy / Replit)

Booking and management platform for "Host Hampton," a children's party planning service: marketing site, unified booking with real-time pricing, Kids Party Designer, customer portal, and admin dashboard.

> ## LEGACY - REPLIT VERSION. NOT THE LIVE SITE.
> This is the **older, original** Host Hampton app. It runs on **Replit** with a **Neon serverless Postgres** database.
> It appears to be **SUPERSEDED** by the separate repo **`host-hampton-ops`**, which runs the live **www.hosthampton.com** on the **Hetzner VPS** with **Supabase**.
>
> **This repo is NOT the Hetzner VPS and NOT Supabase.** Before changing or deploying anything, confirm you are in the correct repo. For the live production site, use `host-hampton-ops`.

## What this is

A full-stack TypeScript app combining a customer-facing tool and a business management solution: marketing landing page, multi-step booking system, Party Designer, quote management, Stripe checkout, customer portal (`/my-events`), and an admin dashboard (bookings, quotes, payments, inventory). Per `replit.md`, the schema covers Event Types, Customers, Packages, Addons, Events, Invoices, Time Slots, Staff, Communications, Campaigns, Leads, Payments, Inventory, and more.

## Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, Radix UI / shadcn/ui, TanStack Query, Wouter (routing), React Hook Form + Zod, Framer Motion.
- **Backend**: Node.js 20 + Express (TypeScript, ES modules), bundled with esbuild.
- **ORM / DB**: Drizzle ORM + Drizzle Kit against PostgreSQL.
- **Database provider**: Neon (serverless Postgres) via `@neondatabase/serverless`.
- **Payments**: Stripe.
- **Email**: Resend / SendGrid via Replit connectors.
- **Auth**: session-based (`express-session`), email OTP, CSRF protection.

## Where it runs

- **Platform**: Replit (`modules = nodejs-20, web, postgresql-16`).
- **Database**: Neon serverless Postgres, reached through `DATABASE_URL`.
- **Single port**: app serves API + client on **port 5000** (mapped to external 80 in `.replit`).
- **NOT** the Hetzner VPS. **NOT** Supabase. Domain `hosthampton.com` is served from Replit in this version.

## Run locally

Requires Node.js 20 and a reachable Postgres (`DATABASE_URL`). From the repo root:

```bash
npm install
npm run dev        # NODE_ENV=development tsx server/index.ts  -> http://localhost:5000
```

`npm run dev` runs the Express server and the Vite client together on port 5000. On Replit, the "Project" / "Start application" workflow runs `npm run dev` and waits for port 5000.

Other scripts:

```bash
npm run check      # tsc typecheck
npm run db:push    # drizzle-kit push (sync schema -> database)
```

## Deploy (Replit)

Deployment is configured in `.replit` as **Replit autoscale**:

- `deploymentTarget = "autoscale"`
- **build**: `npm run build` — `vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
- **run**: `npm run start` — `NODE_ENV=production node dist/index.js`

Deploy by publishing/redeploying the Repl (typically on git push to the Replit-connected repo). There is no Docker, no VPS, and no separate CI in this repo.

## Database (Neon)

- Provider: Neon serverless Postgres. Client: `@neondatabase/serverless` (`server/db.ts`).
- Connection string: **`DATABASE_URL`** (required — `drizzle.config.ts` and `server/db.ts` throw if it is missing).
- ORM: Drizzle. Schema lives in **`shared/schema.ts`** (`drizzle.config.ts` -> `schema: "./shared/schema.ts"`, `out: "./migrations"`, dialect `postgresql`).
- Apply schema changes with `npm run db:push` (Drizzle Kit push). No hand-written migration step is wired into the build.

## Environment & secrets

Set these as Replit Secrets (names only — never commit or print values). Verified by use in the repo:

Server (`process.env`):
- `DATABASE_URL` — Neon Postgres connection string (required).
- `SESSION_SECRET` — express-session secret.
- `STRIPE_SECRET_KEY` — Stripe server key.
- `NODE_ENV` — set by scripts (`development` / `production`).
- `REPLIT_DOMAINS` — Replit-provided domain(s), used in `server/routes.ts`.
- `REPL_ID` — Replit-provided, referenced in `vite.config.ts`.

Email via Replit connectors (`server/email-service.ts`) — Replit-injected, not user API keys:
- `REPLIT_CONNECTORS_HOSTNAME`
- `REPL_IDENTITY`
- `WEB_REPL_RENEWAL`

Client (Vite `import.meta.env`, must be prefixed `VITE_`):
- `VITE_STRIPE_PUBLIC_KEY` — Stripe publishable key.
- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps key.

> Treat all of the above as secrets where applicable. Do not echo, log, or paste their values.

## Cron / scheduled jobs

None defined in this repo. There are no cron entries in `.replit` and no scheduler in the codebase. Any scheduling would be handled by Replit's platform, not by app code.

## Day-to-day cheat sheet

```bash
npm install        # install deps
npm run dev        # local dev, API + client on :5000
npm run check      # typecheck (tsc)
npm run db:push    # push schema changes to Neon
npm run build      # production build (vite + esbuild -> dist/)
npm run start      # run production build
```

- Edit DB schema in `shared/schema.ts`, then `npm run db:push`.
- Deploy = Replit autoscale (build `npm run build`, run `npm run start`).
- Before deploying, double-check you are NOT meant to be working in `host-hampton-ops` instead.

## Key files

- `.replit` — Replit config: modules, run command, autoscale deployment (build/run), port 5000 -> 80, workflows, connector integrations.
- `replit.md` — architecture and feature overview (source of truth for what the app does).
- `package.json` — scripts (`dev`, `build`, `start`, `check`, `db:push`) and dependencies.
- `drizzle.config.ts` — Drizzle Kit config (schema, output, dialect, `DATABASE_URL`).
- `shared/schema.ts` — Drizzle schema (database tables and types).
- `server/index.ts` — Express entry point; session setup.
- `server/db.ts` — Neon client + Drizzle connection.
- `server/routes.ts` — REST API routes (Stripe, Replit domains).
- `server/email-service.ts` — email via Replit connectors.
- `vite.config.ts` — Vite/client build config.

## Gotchas

- **Which repo is authoritative?** For the **live** www.hosthampton.com, the authoritative repo is **`host-hampton-ops`** (Hetzner VPS + Supabase). **This** repo is the legacy Replit + Neon version. Do not deploy this one expecting it to update the live VPS site, and do not assume changes here reach production.
- **Two different databases.** This app uses **Neon** via `DATABASE_URL`. The ops repo uses **Supabase**. They are not the same database — schema changes here do not affect production.
- **Single port.** API and client both serve on **5000**; no separate client dev port to manage.
- **Email needs Replit connectors.** Email (`REPLIT_CONNECTORS_HOSTNAME`, `REPL_IDENTITY`, `WEB_REPL_RENEWAL`) is wired to Replit's connector environment and may not work outside Replit.
- **`db:push`, not migrations.** Schema is synced with `drizzle-kit push`; the build does not run migration files in `migrations/`.
