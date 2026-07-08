# JET — Architecture

JET is a technology company building AI-powered tools to launch and run a digital
business — one unified ecosystem replacing the dozens of services an entrepreneur
normally needs (store, payments, CRM, SEO, ads, content, support).

This document covers the whole platform at a high level and then **JET Commerce**,
the foundation product, in detail.

## Product tree

```
JET
├── Commerce   ← launch online stores in minutes   (PHASE 1 — this repo starts here)
├── Studio     ← visual no-code builder             (PHASE 2)
├── AI         ← content generation + owner assistant (PHASE 3)
├── Agents     ← Sales/Support/Marketing/SEO/Inventory/Accounting (PHASE 4)
├── Cloud      ← one-click deploy: domain, SSL, DB, CDN (PHASE 5)
├── CRM        ← customers, orders, leads, staff in one place
├── CMS
├── Analytics  ← profit, conversion, LTV, CAC, forecast
├── Deploy
└── Payments
```

**Phased roadmap** — deliberately not everything at once:
1. **Commerce** — foundation for launching stores
2. **Studio** — builder & project generator
3. **AI** — content generation + store-owner assistant
4. **Agents** — marketing / support / sales automation
5. **Cloud** — own deployment infrastructure

Solve one real problem first (fast launch of quality stores), then grow into a full
platform where products reinforce each other.

**Where ML lives:** JET's core technology is ML — recommendations, personalization,
demand forecasting, dynamic pricing, intelligent search, AI agents. These arrive as a
separate Python/FastAPI service (phase 3+) that talks to the core over HTTP, so the
commerce core stays TypeScript while ML grows independently.

---

## JET Commerce

### MVP scope

```
Owner:  create store → pick theme → add products → publish
Buyer:  visit store.jet.app → browse → buy → pay
```

The architectural priority is a clean **multi-tenant data model** and **render-store-by-domain**.
Get those right and Studio / AI / Agents / Cloud attach without a rewrite.

### High-level architecture

```
                         ┌─────────────────────────────┐
                         │      Next.js application     │
                         │        (single deploy)       │
                         ├──────────────┬──────────────┤
   admin.jet.app  ─────► │   Dashboard  │   Storefront  │ ◄── store.jet.app
   (owner)               │   (owner)    │   (public)    │     (buyer)
                         └──────┬───────┴───────┬───────┘
                                │  Server Actions / API
                                ▼
                  ┌──────────────────────────────┐
                  │   Domain logic (services)     │  stores, products,
                  │   + Prisma ORM                │  orders, payments
                  └──────┬─────────┬─────────┬────┘
                         │         │         │
                 ┌───────▼──┐ ┌────▼────┐ ┌──▼──────┐
                 │Postgres  │ │  R2/S3  │ │ Stripe  │
                 │(store_id)│ │ (media) │ │(payments)│
                 └──────────┘ └─────────┘ └─────────┘

   Phase 3+ attach to the side, without touching the core:
   ┌──────────────┐   ┌──────────────┐
   │ JET AI / ML  │   │ JET Cloud    │
   │ FastAPI (Py) │   │ deploy svc   │
   └──────────────┘   └──────────────┘
```

One Next.js app serves **both** the dashboard and every storefront. The storefront is
multi-tenant: middleware reads the `Host` header, resolves the store, and renders that
store's theme with its products. Custom domains and static generation arrive with JET
Cloud later — the data model is already ready for them.

### Stack

| Layer      | Choice                        | Why |
|------------|-------------------------------|-----|
| Language   | TypeScript                    | one language across the product; huge commerce ecosystem |
| Framework  | Next.js 15 (App Router)       | SSR storefronts = strong SEO (a core JET feature); server actions remove an API layer early |
| UI         | Tailwind + shadcn/ui          | fast, clean; maps directly onto JET Studio (blocks = components) |
| Database   | PostgreSQL                    | relational orders/products; row-level multi-tenancy; JSONB for theme config |
| ORM        | Prisma                        | type-safety, migrations, fast start |
| Auth       | Clerk (or Auth.js)            | multi-tenant + organizations/teams → reused by JET CRM (staff) |
| Payments   | Stripe                        | Checkout in an evening; local providers via adapter later |
| Media      | Cloudflare R2 (S3-compatible) | cheap, no egress fees on product images |
| Search     | Postgres FTS → Meilisearch    | no extra service in MVP |
| Hosting    | Vercel (initially)            | zero devops until JET Cloud exists |
| ML service | Python + FastAPI (phase 3+)   | recommendations, demand forecast, search — grows independently |

**Deliberate fork:** the commerce core is TypeScript/Next.js (ecosystem + SSR), not
Python. ML is a separate Python service added in phase 3, so ML can grow without
rewriting the frontend.

### Multi-tenancy (the heart of the system)

- **Single Postgres, `store_id` on every tenant table** (shared DB, shared schema).
  Simplest and cheapest; reinforced with Postgres RLS.
- Store resolution: `middleware.ts` reads `Host` → finds `Store` by `subdomain` or
  `customDomain` → puts `storeId` into the request context.
- `store.jet.app` at start; `custom-domain.com` once JET Cloud provides domain + SSL.

### Core data model

```
User ──owns──► Store (tenant)
                 │  subdomain, customDomain, themeId, config(JSONB), status
                 ├── Product ── ProductVariant
                 │      └── slug, price, images[], inventory
                 ├── Collection (categories)
                 ├── Customer      (buyers of this store)
                 └── Order ── OrderItem ── Payment
```

`Store.config` (JSONB) holds theme choice and tokens (colors, fonts, logo) — this is
exactly what **JET Studio** edits and **JET AI** generates. A theme = a set of React
components + this config.

### How it grows into the rest of JET

- **Studio** → visual editor over `Store.config` + block layout (blocks are shadcn components).
- **AI** → writes into the same fields: `product.description`, SEO, `config.branding`.
- **Agents** → operate over `Order` / `Customer` / `Product` via the service layer.
- **Cloud** → takes over custom domains, SSL, CDN, isolation.
- **Analytics** → reads `Order` / `OrderItem` (LTV, CAC, conversion).

### First milestone

1. ✅ Scaffold Next.js + Tailwind + Prisma + Postgres; `Store` / `Product` schema.
2. ✅ Dashboard: create store, add product (CRUD).
3. ✅ Storefront: multi-tenant render by subdomain; one theme; product list + product page.
4. ⬜ Stripe Checkout → create `Order`.  ← next

That is the testable "launch a store in minutes."

---

## Repository layout

```
jet/
├── ARCHITECTURE.md
├── package.json          # pnpm workspace root
├── pnpm-workspace.yaml
├── docker-compose.yml    # local Postgres
├── apps/
│   └── commerce/         # JET Commerce — Next.js app  (future siblings: studio/, ai/)
└── packages/             # future shared: ui, db, config
```
