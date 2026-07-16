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

It's single-user and cloud-hosted: no accounts, no multi-tenant backend — your training
history lives in PostgreSQL (Supabase) and is synced to Vercel.

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
- **Database:** PostgreSQL (Supabase) via Prisma ORM (v6)
- **Hosting:** Vercel (serverless deployment)
- **Styling:** Tailwind CSS v4, custom dark design system (`globals.css`)
- **Charts:** Recharts
- **Data ingestion:** a real markdown → JSON parsing pipeline (`scripts/parse-training-markdown.ts`) for the exercise/movement catalog

## Local Setup

```bash
git clone <repo-url>
cd gymfit
npm install

# environment
cp .env.example .env   # fill in DATABASE_URL and DIRECT_URL from Supabase

# database (only needed once or after database reset)
npx prisma migrate deploy
npm run db:seed

npm run dev             # http://localhost:3000
```

Other useful scripts:

```bash
npm run build            # production build
npm run lint              # eslint
npm run db:studio        # browse the database in Prisma Studio
npm run parse:training   # re-parse data-sources/training-history.md into the catalog JSON
```

**Windows:** stop the dev server before running `prisma migrate deploy` or `prisma generate` — the query engine
`.dll` gets locked by the running process and the migration will fail with `EPERM`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase pooler connection string (port 6543, pgbouncer=true) — used by the app at runtime on Vercel |
| `DIRECT_URL` | Yes | Supabase direct connection string (port 5432) — used only for running migrations locally |

Get both from your Supabase project: **Project Settings → Database → Connection Strings**.

There is currently no auth, no third-party API keys, and no analytics — this is intentionally
a minimal-config, single-user app.

## Deployment

### Setup: Supabase + Vercel

1. **Create a Supabase project** — free tier is sufficient
   - Copy the connection strings from **Project Settings → Database → Connection Strings**
   - `DATABASE_URL` → pooler connection (for serverless/Vercel)
   - `DIRECT_URL` → direct connection (for migrations only)

2. **Create a Vercel project** — import this GitHub repo
   - Vercel auto-detects Next.js, no special config needed
   - Set these environment variables in **Project Settings → Environment Variables**:
     - `DATABASE_URL` (pooler string from Supabase)
     - `DIRECT_URL` (direct string from Supabase)
   - Do NOT commit `.env` — these stay in Vercel's encrypted settings only

3. **Run migrations** — after the first deploy, run migrations locally
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
   (The build step on Vercel will fail until migrations are run — this is expected.)

### Deployment Workflow

1. Push `main` to GitHub.
2. Vercel auto-deploys to production; every other branch/PR gets a preview URL.
3. **Important:** all pages that query the database must have `export const dynamic = 'force-dynamic'` to prevent stale serverless caches. See `src/app/(main)/dashboard/page.tsx` for examples.

### Database Resets

To reset the database during development:
1. Go to Supabase project → **SQL Editor** → drop and recreate the database
2. Run `npx prisma migrate deploy` locally
3. Run `npm run db:seed` to repopulate the default program

## Future Improvements

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
