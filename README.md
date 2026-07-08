# JET

AI-powered tools to launch and run a digital business. See [ARCHITECTURE.md](./ARCHITECTURE.md)
for the full vision and phased roadmap.

Monorepo (pnpm workspaces). First product: **JET Commerce** (`apps/commerce`).

## Prerequisites

- Node 22+, pnpm 11+
- Docker (for local Postgres)

## Quick start

```bash
pnpm install          # install workspace deps
pnpm db:up            # start Postgres (Docker, host port 5433)
pnpm db:push          # create tables from prisma/schema.prisma
pnpm db:seed          # seed a demo store with 3 products
pnpm dev              # run JET Commerce at http://localhost:3000
```

Then:

- **Root / dashboard** → http://localhost:3000 (landing) and http://localhost:3000/dashboard
- **Demo storefront** → http://demo.lvh.me:3000 (`*.lvh.me` resolves to 127.0.0.1, so
  subdomains work locally with no `/etc/hosts` edits)

## Handy scripts (repo root)

| Command          | What it does                                  |
|------------------|-----------------------------------------------|
| `pnpm dev`       | run JET Commerce dev server                   |
| `pnpm build`     | production build                              |
| `pnpm db:up`     | start local Postgres (Docker)                 |
| `pnpm db:down`   | stop local Postgres                           |
| `pnpm db:push`   | sync schema to the database                   |
| `pnpm db:seed`   | seed demo data                                |
| `pnpm db:studio` | open Prisma Studio (browse the DB)            |

## Notes

- Postgres runs on host port **5433** (5432 was already taken by another project).
  Configured in `docker-compose.yml` and `apps/commerce/.env`.
- Prisma 7: connection URL lives in `apps/commerce/prisma.config.ts` (not the schema),
  and the runtime client uses the `@prisma/adapter-pg` driver adapter.
