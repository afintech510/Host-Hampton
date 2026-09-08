# Host Hampton

Booking and storefront platform for a Hamptons events business — studio rentals,
at-home mobile parties, and party add-ons. Customers browse packages, configure a
party, and book; staff manage inventory, pricing, and reservations behind an
authenticated admin area.

## Stack

React + TypeScript · Vite · Radix UI primitives with Tailwind · Express server
· Drizzle ORM against PostgreSQL (Neon serverless) · Google Maps JS API for
service-area and delivery logic · React Hook Form + Zod for validation

## Layout

```
client/     React front end
server/     Express API and session handling
shared/     types and Drizzle schema shared across both
```

Sharing the schema definition between client and server through `shared/` keeps
form validation, API contracts, and database columns from drifting apart — a single
source of truth rather than three parallel ones.

## Development

```bash
npm install
npm run db:push     # apply the Drizzle schema
npm run dev
```

`npm run check` type-checks the whole workspace.

## Notes

This is a working commercial application (≈600 commits), not a demo. Business
records that previously lived in `attached_assets/` have been removed from the
repository and its history.
