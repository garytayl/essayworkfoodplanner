# Kate’s Wheelhouse

Essay support, weekly priorities, meal planning, and restaurant picks in one week-centric dashboard.

## Prerequisites

- Node.js 20+

## Database (`DATABASE_URL`)

Data is stored with **Drizzle ORM** and **libSQL** (SQLite-compatible). Copy [.env.example](.env.example) to `.env.local` and set `DATABASE_URL` if you need something other than the default.

| Environment | Typical `DATABASE_URL` |
|---------------|-------------------------|
| Local dev | `file:./local.db` (or omit; the app falls back to `file:local.db` in code—keep one convention per machine) |
| Hosted (e.g. Turso) | `libsql://…` URL with auth token from your provider |

Apply migrations after cloning or changing schema:

```bash
npm run db:migrate
```

Generate new SQL after editing [db/schema.ts](db/schema.ts):

```bash
npm run db:generate
```

## Getting started

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the week navigation and `?week=YYYY-MM-DD` (any date in that week) to jump between weeks.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Create migration SQL from Drizzle schema |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:push` | Push schema (Drizzle Kit) — optional for quick local experiments |

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Drizzle, libSQL (`@libsql/client`).
