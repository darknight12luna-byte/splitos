# SplitOS (Gymfit)

**A personal training operating system for structured splits, planned-vs-actual tracking, and Animal Flow practice.**

> Status: actively evolving personal product / structured prototype — not a finished commercial app. See [Project Status](#project-status).

## What it is

SplitOS is built around one real, configurable 4-day training split (Upper / Lower /
Animal Flow &amp; Mobility / Mixed) — not a generic workout-log template. Every day starts with a
readiness check-in, moves into a fully planned session (real sets, reps, weight, duration,
tempo per item), and gets logged against that plan set by set. The gap between what was
planned and what actually happened is the core data the app is built around — not just a
checklist of completed exercises.

Animal Flow and mobility work are treated as first-class training content alongside
traditional strength work, each with real execution steps, coaching cues, and video
references, not an afterthought bolted onto a lifting app.

It's single-user and local-first: no accounts, no multi-tenant cloud backend — your training
history lives in a SQLite file you control.

## Feature Overview

- **Daily check-in** — mood, energy/soreness/sleep readiness, session focus, all four split
  days visible with live status so you always know where you stand.
- **Planned vs. actual logging** — every session snapshots its plan, then tracks what you
  actually did (sets/reps/weight/duration) with delta indicators against that plan.
- **Coaching dashboard** — today's session, weekly split status, a 7-day activity chart, and
  recent session history in one focused view.
- **Exercise & movement library** — real execution steps, cues, common mistakes,
  regressions/progressions, and a Watch &amp; Learn video panel (YouTube + TikTok search) per item.
- **Session detail drawer** — full exercise instructions and video open in a slide-up panel
  without leaving the session you're logging.
- **Calendar & history** — every session, every day, color-coded by split category.
- **Challenge tracking** — a running streak-based challenge with a progress calendar and
  history of past challenges.
- **Content layer** — auto-drafted captions per session for a personal training/Animal Flow
  content journey (copy-paste ready, no auto-posting).

## Screens

| Screen | Purpose |
|---|---|
| Check-In (`/`) | Daily readiness form, all 4 split days, starts a session |
| Dashboard (`/dashboard`) | Today's session, weekly split, weekly chart, recent sessions, monthly snapshot |
| Session (`/session/[id]`) | Live logging: planned vs. actual, per-item completion, timer |
| Exercises / Movements (`/exercises`, `/movements`) | Library grids with category theming |
| Exercise/Movement detail | Full instructions, cues, video, history |
| Calendar (`/calendar`) | Month view of every logged session |
| Program (`/program`) | The active weekly program definition |
| Challenge (`/challenge`) | Active challenge progress + history |
| Content (`/content`) | Drafted captions per session |

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Server Actions — no separate API layer)
- **Language:** TypeScript, React 19
- **Database:** SQLite via Prisma ORM (v6)
- **Styling:** Tailwind CSS v4, custom dark design system (`globals.css`)
- **Charts:** Recharts
- **Data ingestion:** a real markdown → JSON parsing pipeline (`scripts/parse-training-markdown.ts`) for the exercise/movement catalog

## Local Setup

```bash
git clone <repo-url>
cd gymfit
npm install

# environment
cp .env.example .env   # then fill in DATABASE_URL, see below

# database
npm run db:migrate
npm run db:seed

npm run dev             # http://localhost:3000
```

Other useful scripts:

```bash
npm run build            # production build
npm run lint              # eslint
npm run db:studio        # browse the SQLite DB in Prisma Studio
npm run parse:training   # re-parse data-sources/training-history.md into the catalog JSON
```

**Windows:** stop the dev server before running `prisma migrate`/`generate` — the query engine
`.dll` gets locked by the running process.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma connection string. Local dev: `file:./dev.db`. See [Production Deployment](#production-deployment) for why this needs to change for Vercel. |

There is currently no auth, no third-party API keys, and no analytics — this is intentionally
a minimal-config, single-user app.

## Production Deployment

**Honest caveat first:** local dev uses a SQLite file (`prisma/dev.db`). Vercel's serverless
functions run on an ephemeral, per-invocation filesystem — a file-based SQLite database will
not reliably persist writes across requests in that environment. Deploying this as-is to
Vercel will work for browsing a *seeded, read-mostly* demo, but session logging will not
durably persist.

To deploy for real, production use:

1. Swap `DATABASE_URL` to a hosted database Prisma supports over the network — e.g.
   [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres)
   (requires a small schema/provider change in `prisma/schema.prisma`), or a
   SQLite-compatible edge DB like [Turso](https://turso.tech) (`libsql` Prisma driver) if you
   want to keep the SQLite data model as-is.
2. Run `prisma migrate deploy` against that database (via a build step or manually).
3. Set `DATABASE_URL` as an encrypted environment variable in the Vercel project settings —
   never commit it.

Until that swap happens, treat any Vercel deployment as a **preview/demo environment**, not
the system of record for real training data.

## GitHub → Vercel Workflow

1. Push `main` to GitHub.
2. Import the repo in Vercel → it auto-detects Next.js, no config needed beyond
   `DATABASE_URL`.
3. Every push to `main` deploys to production; every other branch/PR gets its own preview
   URL (`<project>-git-<branch>-<team>.vercel.app`).
4. Recommended branch convention for clean preview URLs: `feature/<short-name>`,
   `fix/<short-name>`.

## Future Improvements

- Hosted-database migration path for real production persistence (see above)
- Profile page (body metrics history, badges — currently removed from the main Dashboard to
  keep it focused, logic still intact)
- In-app program editor (currently the weekly program is edited via `prisma/seed.ts`)
- Auth, if this ever moves beyond single-user
- Automated tests (none yet)

## Project Status

This is an actively evolving personal product, not a finished commercial release. Core
logging, catalog, and dashboard flows are in daily use and stable; visual design, content
tooling, and the deployment story above are still being worked on. Version numbers before
`1.0.0` should be read as "working prototype," not "feature-complete."
