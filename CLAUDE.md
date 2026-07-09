# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Gymfit is a personal training operating system built around one specific real training system
(extracted from the user's actual coaching history) — not a generic fitness app. A configurable
4-day weekly split (Upper / Lower / Animal Flow-Mobility / Mixed) drives everything: daily
check-in → today's planned session (with real per-item prescriptions: sets, reps, weight,
duration, speed, rest, tempo) → a logging page where you record what you *actually* did against
what was planned, with delta/compliance tracking → dashboard, calendar, and per-exercise history
all built from that logged data. On top sits a content layer (auto-drafted captions, a named
challenge tracker, a "ready to post" export view) for a solo calisthenics/Animal Flow TikTok
journey. Single-user, no auth — data stays local in a SQLite file.

There is deliberately no TikTok API integration (no auto-posting) — that requires business-account
approval and is a poor fit for a personal account. The content layer only prepares
copy-paste-ready material; posting stays manual.

**Data-fidelity policy: never fabricate training content.** The exercise/technique *catalog*
(what a movement is, how to execute it, its cues/mistakes) comes only from
`data-sources/training-history.md` — where the source doesn't document something, the UI shows
"Not documented in your source yet," not invented detail. This policy does **not** extend to the
*program* (`prisma/seed.ts`): planned weight/duration/speed/tempo per day are inherently something
that changes as you progress, so the catalog never prescribes them — the seeded program has
illustrative example values you're expected to overwrite with your real numbers, and that's
called out explicitly in the seed file's own comments.

## Commands

```
npm run dev             # start dev server (Turbopack) on :3000
npm run build            # production build
npm run lint             # eslint

npm run db:migrate       # create/apply a Prisma migration (edits to prisma/schema.prisma)
npm run db:seed          # seed the active WeeklyProgram (prisma/seed.ts)
npm run db:studio        # open Prisma Studio to browse dev.db

npm run parse:training   # re-parse data-sources/training-history.md into src/data/training/*.json
```

There is no test suite yet.

The SQLite file lives at `prisma/dev.db` (gitignored). `DATABASE_URL` is set in `.env`
(also gitignored) as `file:./dev.db`. Deleting `prisma/dev.db` + `prisma/migrations`, then
`npm run db:migrate` + `npm run db:seed`, gives a clean slate with the default 4-day program.

**Prisma is pinned to v6**, not v7 — v7 moved SQLite datasource config to a driver-adapter model
that needs native bindings and is more setup than this project needs.

**Windows note:** stop the dev server before running `prisma migrate`/`generate` — the query
engine `.dll` gets locked by the running process and migration fails with `EPERM`.

## Architecture

### Two independent layers: catalog (static) vs program (DB, editable)

1. **Catalog** — `data-sources/training-history.md` → `scripts/parse-training-markdown.ts` →
   `src/data/training/*.json` (`exercises.json`, `movement-techniques.json`,
   `movement-techniques.json`, `unresolved-refs.json`, plus the source's own weekly-structure/
   templates/progression-rules tables, kept as historical reference). This is *what a movement is*
   — name, execution steps, cues, mistakes, regressions/progressions, media. Read via
   `src/lib/training/catalog.ts` (`getExerciseBySlug`, `getTechniqueBySlug`, `resolveItem`).
   Re-run the parser any time the source markdown changes; it's a real re-runnable ingestion
   pipeline, not a one-off transcription.

2. **Program** — `WeeklyProgram` → `TrainingDayTemplate` (1 per day in the rotation, e.g. "Day 1 —
   Upper Body") → `SessionPlanItem` (the prescription: `itemSlug` + `kind` resolving against the
   catalog above, plus `plannedSets/Reps/WeightKg/DurationSec/Speed/RestSec/Tempo/Notes`). This is
   *what you're actually prescribed today* — DB-stored via `prisma/seed.ts`, not parsed, because
   unlike the catalog it's meant to be edited/reconfigured over time. Only one `WeeklyProgram` is
   `active` at a time.

**Why two layers instead of one:** the catalog answers "how do I do a Romanian deadlift" (stable,
sourced, shared across any program); the program answers "how many sets of it, at what weight, on
which day" (changes as you progress, specific to your current plan). Conflating them was V1's
mistake — every session showed the same static prescription forever with no way to distinguish
"the standard reference tempo" from "what I'm doing this cycle."

### Planned vs. actual — the core of the app

- `SessionLog` = one performed (or skipped) instance of a `TrainingDayTemplate`.
  `status`: `NOT_STARTED | IN_PROGRESS | COMPLETED | PARTIAL | SKIPPED` — **derived**, not chosen
  by the user. `deriveSessionStatus()` in `actions.ts` computes it from item completion states
  when a session finishes: all items `COMPLETED` → `COMPLETED`; some touched → `PARTIAL`; none
  touched → `SKIPPED`.
- `SessionItemLog` = the actual-performance record for one item within a `SessionLog`. It carries
  a **snapshot** of the plan (`plannedSets`, `plannedWeightKg`, etc., copied from
  `SessionPlanItem` at generation time) *alongside* the actual values
  (`actualSets/Reps/WeightKg/DurationSec/Speed/RestSec/Notes`) and its own
  `completionStatus: PENDING | COMPLETED | PARTIAL | SKIPPED`. The snapshot means editing
  `SessionPlanItem` later never rewrites history — past sessions keep showing what was actually
  planned that day.
- **Multiple `SessionLog` rows can share a date** — nothing in the schema stops you from doing
  Upper Body in the morning and Lower Body in the afternoon; each is its own `SessionLog` against
  a different `TrainingDayTemplate`. There's no "next in rotation" counter anymore (an earlier
  count-based approach desynced the moment sessions weren't started in strict order — see
  `src/lib/training/split-status.ts` below). `buildItemLogSeeds()` in `program-v2.ts` still
  snapshots a `TrainingDayTemplate`'s `SessionPlanItem`s into `SessionItemLog`-create payloads;
  session creation always targets an explicit `trainingDayTemplateId` passed in from the UI, never
  an implicit "next" pointer.
- **`src/lib/training/split-status.ts`** is the single source of truth for "how is each of the 4
  split days doing," consumed identically by Check-In, Dashboard, and Calendar so status/
  percentage logic can't drift between pages:
  - `getWeeklySplitStatus()` — per day: today's `SessionLog` (if any, with live completion %) and
    the most recent `TRAINED_STATUSES` (`COMPLETED`/`PARTIAL`, exported from `stats.ts`) session
    ever, for "last performed."
  - `getSuggestedDayId(days)` — among days not yet started *today*, suggests whichever is most
    overdue (oldest/never last-performed). This is recency-based, not a rotation counter, so it
    self-corrects no matter what order you actually train in.
  - `actionLabel(status, doneLabel)` — maps status to the CTA word (`Start` / `Resume` /
    `View`|`Open`) — same function on both Check-In and Dashboard, just a different `doneLabel`.
- **`src/components/SessionItemLogCard.tsx`** is the actual logging UI: per-item editable actual
  fields (only rendered for dimensions the plan uses — a conditioning item shows duration/speed,
  a strength lift shows sets/weight), a numeric delta badge vs. plan, a 4-state completion control,
  and the collapsed catalog technique detail (execution steps/cues/etc.) from `resolveItem()`.
- **`src/lib/training/history.ts#getItemHistory(slug)`** — last performed date, compliance %, best
  weight, and a chronological log list, computed from `SessionItemLog` grouped by `itemSlug`. Shown
  on both `/exercises/[slug]` and `/movements/[slug]`.
- **`src/lib/training/calendar.ts#getCalendarMonth(year, month)`** — returns an *array* of
  sessions per day (not one), each with its `TrainingDayTemplate.category` and completion %, since
  a day can have more than one `SessionLog`. The `/calendar` grid renders each as its own small
  colored badge (category color, e.g. Upper=blue/Lower=green/AnimalFlow=purple/Mixed=orange) and
  links to that specific session.

**Deliberately not stored:** `CalendarEntry` and `ProgressMetric` (both fully derivable from
`SessionLog`/`SessionItemLog` — a stored copy would just be a second source of truth that can
drift). `ExercisePlan`/`MovementPlan` and `ExerciseLog`/`MovementLog` aren't separate Prisma
models either — `SessionPlanItem`/`SessionItemLog` unify both via a `kind` discriminator
(`exercise | technique`), since the two shapes are identical and splitting them would just
duplicate the model.

### App flow

`/` (Check-In) shows **all 4 split days at once** via `WeeklySplitCard` — status badge, live
completion %, last-performed, and a CTA (`Resume`/`View` for days already started today, `Start`
for days not yet started). `src/components/CheckInFlow.tsx` (client) owns "which day is currently
selected" state, defaulting to `getSuggestedDayId()` (or a `?day=<templateId>` query param, which
is how Dashboard's "Start" links and the "Start another session today" section both work — they
just navigate to `/?day=...` rather than duplicating the form). The readiness form below
(`MoodPicker` + `RatingPicker` ×3 for energy/soreness/sleep, both 1–5 discrete scales, +
`SessionFocusPicker` for strength/mobility/flow/recovery + an optional note) always targets
whichever day is currently selected, retitling itself ("Ready for Day N? {Label}") as selection
changes. Selecting a day never navigates — only submitting does. `submitCheckIn` requires an
explicit `trainingDayTemplateId` from the form (there is no implicit "next day"); it creates a
`SessionLog` + snapshot `SessionItemLog`s → `/session/[id]` (the logging page) → `completeSession`
derives the session status, generates a caption, redirects to `/content?session=<id>`.
`/dashboard`, `/calendar`, and `/program` are reachable any time from the nav. `/exercises` and
`/movements` are catalog libraries with per-item history sections.

- **`src/lib/actions.ts`** — all mutations are Server Actions (`"use server"`). No API routes.
  `logItemActual(itemLogId, values)` is the core write for the planned-vs-actual page. `skipDay
  (trainingDayTemplateId)` replaces the old single-implicit-day `skipToday`.
- **`isHighlight`**, not `isPR`: a mobility drill doesn't have a "personal record," so the
  highlight flag is labeled contextually (`🏆 PR` for exercises, `✨ Nailed it` for techniques).
- **`src/lib/stats.ts`** — `getDashboardStats()`, `getMonthlySnapshot()` (completed/partial/
  skipped counts this month), and standalone `getStreakDays()`/`TRAINED_STATUSES` (both re-used by
  `split-status.ts` and `challenge.ts` so "what counts as trained" has one definition).
- **`Challenge`** progress is derived the same way as `SessionLog`/history — see
  `src/lib/challenge.ts#getActiveChallenge()`.
- **`src/lib/caption-generator.ts`** — pure templated function, two variants per `Mood`, no
  AI/LLM call. Called from `completeSession` and `regenerateCaption`.

**UI:** dark neon theme as CSS variables in `src/app/globals.css` (`--accent-blue/green/orange/
purple` map to the 4 split categories throughout — Upper/Lower/AnimalFlow/Mixed), exposed to
Tailwind via `@theme inline`. Shared primitives in `src/components/ui/` (`Card`, `RadialGauge`,
`Badge`, `StatusBadge`, `MoodPicker`, `RatingPicker`, `SessionFocusPicker`).
`src/components/WeeklySplitCard.tsx` is shared between Check-In and Dashboard — same status/%/
CTA rendering in both places by construction, not by convention. `src/components/library/
CatalogList.tsx` and `ItemHistoryCard.tsx` are shared between `/exercises` and `/movements`.

**File uploads:** `addMediaEntry` writes to `public/uploads/` via `fs/promises`. No cloud storage
— local/single-instance only.

**Date formatting:** always pass `"en-US"` explicitly to `toLocaleDateString` (not `undefined`) —
server components use Node's locale, client components use the browser's, and leaving it implicit
produces inconsistent dates between them (e.g. "8 juil." next to "Jul 8").

## Extending the program

To change the weekly split (add a day, swap an exercise, adjust planned weight), edit
`prisma/seed.ts` and re-run `npm run db:seed` — it deactivates the previous `WeeklyProgram` and
creates a fresh one, so past `SessionLog`s (which snapshot their own plan) are unaffected. There's
no in-app program editor yet; that's the natural next step once the read side (`/program`) has
proven out.
