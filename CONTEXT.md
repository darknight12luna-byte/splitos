# Gymfit (SplitOS) — Project Context Document

_Generated from a live codebase + database audit. This is a snapshot, not a spec — verify against
`CLAUDE.md` and the code itself before making decisions that depend on exact details._

---

## 1. Project Overview

**Core purpose:** Gymfit (branded "SplitOS") is a personal training operating system built around
**one specific real training system** extracted from the user's actual coaching history — not a
generic workout logger or a multi-user fitness SaaS.

**Target user:** A single person (no accounts, no multi-tenancy) running a fixed 4-day weekly
split: **Upper Body / Lower Body / Animal Flow & Mobility / Mixed**. The user personally trains
and logs sessions with this app, including in-gym real-time logging from a phone.

**The problem it solves:** Most workout apps either (a) just check off a static exercise list, or
(b) require heavy manual program-building. This app instead separates **what the plan says** from
**what you actually did**, and treats the *gap* between them as the primary data of interest —
compliance drift, skip reasons, weight/rep deltas — rather than a simple binary "workout done."

On top of the training core sits a lightweight content layer: auto-drafted captions and a
challenge/streak tracker, aimed at a personal calisthenics/Animal Flow content journey (manual
posting only — there is deliberately no TikTok API integration).

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, Server Actions — no separate API routes) |
| Language | TypeScript, React 19 |
| Database | **PostgreSQL via Supabase** (pooler connection for runtime, direct connection for schema pushes) |
| ORM | **Prisma v6** (pinned — v7 changes are not adopted yet) |
| Schema workflow | **`prisma db push`** — there is **no migrations folder**. `prisma migrate dev`/`deploy` are explicitly avoided (would force a destructive reset with no migration history) |
| Styling | Tailwind CSS v4, custom dark neon design system in `globals.css`, exposed via `@theme inline` |
| Charts | Recharts |
| State management | No global client state library — React `useState`/`useTransition` + Server Actions + Next.js `revalidatePath`. Two lightweight React Context providers: `ExerciseDrawerProvider` (slide-up technique detail) and `RestTimerProvider` (floating rest countdown) |
| Auth | **None** — single-user by design |
| Hosting | **Vercel**, auto-deploy on push to `main` |
| Third-party APIs | None integrated server-side. `WatchAndLearn.tsx` links out to YouTube/TikTok search URLs (no API key, just constructed search links) |
| Data ingestion pipeline | `scripts/parse-training-markdown.ts` parses `data-sources/training-history.md` into `src/data/training/*.json` (29 exercises, 13 techniques, 1 unresolved reference) — a real re-runnable pipeline, not a one-off transcription |
| Tests | **None yet** |

---

## 3. Database Schema & Data Models

All models live in `prisma/schema.prisma`. There is a hard architectural split between two
layers that is easy to miss and important to preserve:

- **Catalog (static, file-based)** — exercise/technique execution steps, cues, mistakes,
  regressions, media. Lives in JSON files generated from markdown, **not** in Postgres at all.
  Read via `src/lib/training/catalog.ts`.
- **Program (DB, editable)** — the actual Prisma models below. This is *prescription and log
  data*, not exercise knowledge.

### Models (current row counts in the live Supabase DB, for scale reference)

| Model | Purpose | Live rows |
|---|---|---|
| `WeeklyProgram` | The active 4-day split definition. Only one `active: true` at a time. | — |
| `TrainingDayTemplate` | One day in the rotation (e.g. "Day 1 — Upper Body"), with `category`/`goal`. | — |
| `SessionPlanItem` | One prescribed exercise/technique on a day: `itemSlug` + `kind` (resolves against the catalog) + planned sets/reps/weight/duration/speed/rest/tempo/notes. | — |
| `CheckInEntry` | Daily readiness: `mood` enum, energy/soreness/sleep (1–5), optional `focus` + note. | 6 |
| `SessionLog` | One performed/skipped instance of a `TrainingDayTemplate`. `status` is **derived**, not chosen (`NOT_STARTED\|IN_PROGRESS\|COMPLETED\|PARTIAL\|SKIPPED`). Multiple `SessionLog`s can share a date (no "next in rotation" counter). | 6 (3 PARTIAL, 2 SKIPPED, 1 IN_PROGRESS) |
| `SessionItemLog` | The actual-performance record per item. **Snapshots** the plan at creation time (so later edits to `SessionPlanItem` never rewrite history) alongside `actual*` fields and a per-item `completionStatus`. Has a nullable **`setDetails` Json column** (added recently) for optional per-set logging: `[{ reps, weightKg, done }]` — when present, the aggregate `actual*` fields are derived from it so history/stats code paths are unchanged. | 65 |
| `BodyMetric` | Optional weight/body-fat log, decoupled from sessions. | 0 |
| `MediaEntry` | Uploaded photo/video with caption, stored on local `public/uploads/` (no cloud storage). | 0 |
| `Challenge` | A running named streak challenge with `durationDays`; only one `active` at a time. | 1 |

**Deliberately not modeled:** `CalendarEntry` / `ProgressMetric` (fully derivable from
`SessionLog`/`SessionItemLog`) and separate `ExercisePlan`/`ExerciseLog` vs
`MovementPlan`/`MovementLog` tables (unified via the `kind: "exercise" | "technique"`
discriminator on `SessionPlanItem`/`SessionItemLog`).

---

## 4. UI/UX Structure

### Navigation
A single sticky **`TopBar`** (`src/components/TopBar.tsx`) on all screen sizes — brand mark, an
always-visible **⚡ Today** quick link, and a **Chrome-style ⋮ dropdown** listing every route
(closes on navigate, outside click, or Escape). There is no separate desktop/mobile nav anymore
(older `TopNav`/`BottomNav` components were removed).

### Screens

| Route | Purpose |
|---|---|
| `/` (Check-In) | Shows **all 4 split days at once** via `WeeklySplitCard`, with live status/%/CTA. Below, a readiness form (mood, energy/soreness/sleep 1–5, session focus, note) targets whichever day is selected. Submitting creates the session and redirects into it. |
| `/session/[id]` | The live logging page. Per-item cards with editable actual values, a 4-state completion control (✓ / ½ / ✗ / pending), a **floating rest countdown timer**, **skip-reason chips**, optional **per-set logging** ("⊞ Log per set"), and a highlight toggle (🏆 PR / ✨ Nailed it). A session timer bar is anchored to `SessionLog.date` (survives refresh — see §6). |
| `/dashboard` | Today's session, weekly split status, a 7-day activity chart, recent sessions, monthly snapshot. |
| `/calendar` | Month grid; each day can show multiple color-coded session badges (category color). |
| `/program` | Read-only view of the active weekly program definition. |
| `/exercises`, `/movements` | Catalog libraries with per-item history (last performed, compliance %, best weight). |
| `/exercises/[slug]`, `/movements/[slug]` | Full technique detail + history for one item. |
| `/challenge` | Active challenge progress calendar + history of past challenges. |
| `/content` | Auto-drafted caption per session, copy-paste ready, with a regenerate button. |

### Core user journey
1. Open `/` → see all 4 days' status → pick the suggested (most overdue) or any not-yet-done day.
2. Fill readiness check-in → submit → session created, redirected to `/session/[id]`.
3. Per exercise: log actual sets/reps/weight (or expand to per-set rows), optionally start a rest
   countdown, mark completion status (with a reason if skipped).
4. Tap **Finish Session** → session status is derived from item completion, a caption is
   generated → redirected to `/content?session=<id>` to copy/share.

---

## 5. Backend & API Logic

**There are no API routes.** All mutations are **Next.js Server Actions** (`"use server"`) in
`src/lib/actions.ts` (472 lines, 12 exported actions: `submitCheckIn`, `skipDay`,
`logItemActual`, `toggleHighlight`, `completeSession`, `regenerateCaption`, `startChallenge`,
`endChallenge`, `logBodyMetric`, `addMediaEntry`, plus the `ActualValuesInput`/`SetDetailInput`
types).

**Error-handling contract (applies to every action):**
- Input is validated up front (numeric bounds, enum membership, string length) with
  user-friendly messages — no raw Prisma errors ever reach the client.
- Every Prisma call is wrapped in try/catch.
- Return shape is always `{ success: true, data?/sessionId? }` or `{ success: false, error: string }`.
- Client components (`CheckInFlow`, `SessionRunner`, `SessionItemLogCard`, `challenge-forms`,
  `CaptionBox`) all display these errors inline rather than crashing silently.

**Key business logic (no ML/AI, all deterministic):**
- **`deriveSessionStatus()`** (in `actions.ts`) — a session's status is computed from its items'
  completion states when finishing: all `COMPLETED` → `COMPLETED`; some touched → `PARTIAL`; none
  touched → `SKIPPED`. Never chosen directly by the user.
- **`getWeeklySplitStatus()` / `getSuggestedDayId()` / `actionLabel()`** (`src/lib/training/split-status.ts`)
  — single source of truth for "how is each of the 4 days doing," shared identically by Check-In,
  Dashboard, and Calendar. Suggestion is **recency-based** (most overdue), not a rotation counter,
  so it self-corrects regardless of training order.
- **`getItemHistory(slug)`** (`src/lib/training/history.ts`) — last performed date, compliance %,
  best weight, chronological log, from grouping `SessionItemLog` by `itemSlug`.
- **`getCalendarMonth(year, month)`** — returns an array of sessions per day (a day can have >1).
- **Per-set aggregation** — when `setDetails` is present on a `SessionItemLog`, `actualSets`,
  `actualReps` (joined as `"12/8/10"`), and `actualWeightKg` (max across sets) are derived from
  the set rows in `SessionItemLogCard.tsx`, so no other read path needed to change.
- **No 1RM/strength-standard calculation exists anywhere in the codebase.**
- **Caption generation** (`src/lib/caption-generator.ts`) is a **pure templated function** (two
  variants per mood) — explicitly **not** an LLM call.

---

## 6. Current State of the Build

### ✅ Fully working (built, tested against the real Supabase DB, deployed to Vercel)
- Daily check-in → session creation → per-item logging → completion → caption → full loop.
- Planned-vs-actual snapshotting and delta badges.
- Dashboard, calendar, program view, exercise/movement libraries with history.
- Challenge/streak tracking.
- Input validation + structured error handling across **all** server actions.
- Global error boundaries: `error.tsx`, `not-found.tsx`, `loading.tsx`.
- **Rest countdown timer** — floating pill, auto-starts when a set is marked done, +15s/cancel controls, vibration on finish.
- **Skip-reason chips** — quick reasons ("Machine busy," "No time," etc.) recorded into `actualNotes` when an item is marked skipped.
- **Per-set logging** — optional expandable per-set rows (reps/kg/done) backed by the `setDetails` Json column; aggregates auto-derive.
- **Session timer anchored to DB** — computed from `SessionLog.date` wall-clock time, not a client counter, so a page refresh mid-workout no longer resets tracked time (this was a real bug found via field-testing and fixed).
- New unified `TopBar` navigation (replacing separate desktop/mobile nav components).
- Documentation (`CLAUDE.md`, `README.md`) now matches the Postgres/Supabase/Vercel reality — earlier docs incorrectly referenced SQLite.

### 🟡 Partially built / known gaps
- **Body metrics and media upload** (`BodyMetric`, `MediaEntry` models + actions) exist and are validated, but there are currently **0 rows** for either in the live DB — the corresponding UI entry points are minimal/unverified in real use.
- **One stale session-log data point**: the July 18 field-test session recorded `durationSec: 215` despite the user training closer to an hour (this was from before the timer-anchoring fix; the row itself was never corrected).
- Per-set logging is additive/optional per item — most historical `SessionItemLog` rows still have `setDetails: null` and use the simple aggregate fields only, which is intentional but means historical data isn't uniformly "rich."

### ❌ Missing / not started
- **Adding an unplanned exercise from the catalog mid-session** — requested by the user from real gym use, not yet built. (Verify this hasn't shipped since this document was generated before treating it as absent.)
- **Freestyle/ad-hoc sessions** not tied to one of the 4 split days (e.g., "just today I used this one cable machine") — related to the above, not yet built.
- **No automated test suite** of any kind.
- **No in-app program editor** — the weekly program is only changed by editing `prisma/seed.ts` and re-seeding.
- **No auth** — by design, not a gap, but worth stating explicitly since it means this app cannot currently support more than one person's data.

---

## 7. Immediate Next Steps

Ranked by what's already scoped from real usage feedback and lowest risk to the stabilized core:

1. **Add-from-library mid-session** — a searchable picker inside `/session/[id]` to insert an
   unplanned catalog item into the running session as a new `SessionItemLog` with empty planned
   fields. No schema change needed (`SessionPlanItem`/planned fields are already nullable);
   mostly new UI + one new server action. This also substantially covers the "freestyle machine
   session" request without needing a separate session type.
2. **Correct the one known-bad historical data point** (`durationSec: 215` on the July 18
   session) now that the timer bug is fixed, so historical stats aren't skewed by pre-fix data.
3. **Verify/exercise the Body Metrics and Media Upload flows** end-to-end in the real UI** — they
   have validated server actions but zero real usage; either surface them more prominently or
   confirm they're intentionally low-priority.
4. **Decide on a testing strategy** — even a small smoke-test suite around `deriveSessionStatus`,
   `getWeeklySplitStatus`, and the per-set aggregation logic would catch regressions in the parts
   of the app most load-bearing for data integrity.
5. **Revisit the `SessionLog.date` default** (`@default(now())`) if sessions are ever created
   ahead of when training actually starts — the new timer-anchoring logic assumes `date` reflects
   the real start moment, which is true today only because sessions are created at start-of-workout.

---

_This document reflects a point-in-time audit. For anything load-bearing, re-check `CLAUDE.md`,
`prisma/schema.prisma`, and `git log` directly rather than trusting this file as it ages._
