import Link from "next/link";
import { startOfWeek, startOfMonth, differenceInCalendarWeeks } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getDashboardStats, getMonthlySnapshot } from "@/lib/stats";
import { getCategoryTheme } from "@/lib/training/category-theme";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SetsChart } from "@/components/SetsChart";
import { ActivityRings } from "@/components/ui/ActivityRings";
import { SemiDonutGauge } from "@/components/ui/SemiDonutGauge";
import { DeleteSessionButton } from "@/components/DeleteSessionButton";

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}`;
  return `${m}m`;
}

// Elapsed time for a still-running session (no durationSec saved yet) — a snapshot at
// render time, same logic SessionRunner uses live, just computed once server-side here.
function liveElapsedSec(status: string, durationSec: number | null, date: Date): number {
  if (durationSec != null) return durationSec;
  if (status === "IN_PROGRESS") return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  return 0;
}

export const dynamic = "force-dynamic";

function sessionHref(id: string, status: string) {
  return status === "COMPLETED" || status === "SKIPPED" ? `/content?session=${id}` : `/session/${id}`;
}

export default async function DashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = startOfWeek(todayStart, { weekStartsOn: 1 });

  const [stats, monthly, todaysSession, recentSessions, todaysSessions, weekSessions, activeProgram] =
    await Promise.all([
      getDashboardStats(),
      getMonthlySnapshot(),
      prisma.sessionLog.findFirst({
        where: { date: { gte: todayStart } },
        orderBy: { date: "desc" },
        include: { trainingDayTemplate: true, itemLogs: true },
      }),
      prisma.sessionLog.findMany({
        where: { status: { not: "NOT_STARTED" } },
        orderBy: { date: "desc" },
        take: 5,
        include: { trainingDayTemplate: true },
      }),
      // All of today's sessions (not just the latest) — the app allows more than one
      // SessionLog per day, so "today's" totals need to sum across every one of them.
      prisma.sessionLog.findMany({
        where: { date: { gte: todayStart } },
        select: { date: true, status: true, durationSec: true, itemLogs: { select: { completionStatus: true } } },
      }),
      prisma.sessionLog.findMany({
        where: { date: { gte: weekStart }, status: { not: "NOT_STARTED" } },
        select: { date: true, status: true, durationSec: true },
      }),
      prisma.weeklyProgram.findFirst({ where: { active: true }, select: { daysPerWeek: true } }),
    ]);

  const todayTheme = getCategoryTheme(todaysSession?.trainingDayTemplate?.category ?? "");
  const todayCompletedItems = todaysSession?.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length ?? 0;
  const todayTotalItems = todaysSession?.itemLogs.length ?? 0;

  const itemsDoneToday = todaysSessions.reduce(
    (sum, s) => sum + s.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length,
    0
  );
  const itemsPlannedToday = todaysSessions.reduce((sum, s) => sum + s.itemLogs.length, 0);
  const secondsToday = todaysSessions.reduce(
    (sum, s) => sum + liveElapsedSec(s.status, s.durationSec, s.date),
    0
  );
  const secondsThisWeek = weekSessions.reduce(
    (sum, s) => sum + liveElapsedSec(s.status, s.durationSec, s.date),
    0
  );
  // Neutral visual scales for the time rings (not claimed personal goals) — a session
  // rarely runs past an hour, and the split is a 4-day/week program.
  const todayTimePct = Math.min(100, (secondsToday / (60 * 60)) * 100);
  const weekTimePct = Math.min(100, (secondsThisWeek / (4 * 60 * 60)) * 100);

  // This month's real goal, derived from the program's own cadence — not a fabricated
  // target: daysPerWeek sessions x however many weeks have started so far this month.
  const monthStart = startOfMonth(todayStart);
  const weeksElapsedThisMonth = differenceInCalendarWeeks(todayStart, monthStart, { weekStartsOn: 1 }) + 1;
  const monthlyGoal = (activeProgram?.daysPerWeek ?? 4) * weeksElapsedThisMonth;
  const monthlyActual = monthly.sessionsCompleted + monthly.sessionsPartial;
  const monthlyPct = monthlyGoal > 0 ? (monthlyActual / monthlyGoal) * 100 : 0;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted">Your training operating system.</p>
      </div>

      {/* Section A — Today Hero Card */}
      <Card
        className="space-y-3"
        style={{
          background: todaysSession
            ? `linear-gradient(135deg, color-mix(in oklab, ${todayTheme.color} 22%, var(--surface)), var(--surface) 70%)`
            : undefined,
          borderColor: todaysSession
            ? `color-mix(in oklab, ${todayTheme.color} 35%, var(--border))`
            : undefined,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {todaysSession && (
              <span className="text-3xl leading-none" aria-hidden>
                {todayTheme.emoji}
              </span>
            )}
            <div>
              <p className="text-xs text-muted">Today</p>
              <p className="text-lg font-bold">
                {todaysSession ? `${todaysSession.dayLabel} · ${todaysSession.title}` : "Not checked in yet"}
              </p>
            </div>
          </div>
          {todaysSession ? (
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={todaysSession.status} />
              <Link
                href={sessionHref(todaysSession.id, todaysSession.status)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-on-accent transition hover:brightness-110"
                style={{ background: todayTheme.color }}
              >
                Open Session
              </Link>
            </div>
          ) : (
            <Link
              href="/checkin"
              className="shrink-0 rounded-lg bg-accent-lime px-3 py-1.5 text-xs font-semibold text-on-accent transition hover:brightness-110"
            >
              Check In
            </Link>
          )}
        </div>

        {(todaysSession?.status === "IN_PROGRESS" || todaysSession?.status === "PARTIAL") &&
          todayTotalItems > 0 && (
            <div className="space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.round((todayCompletedItems / todayTotalItems) * 100)}%`,
                    background: todayTheme.color,
                  }}
                />
              </div>
              <p className="text-xs text-muted">
                {todayCompletedItems}/{todayTotalItems} exercises done
              </p>
            </div>
          )}

        {todaysSession?.status === "PARTIAL" && (
          <Link
            href={sessionHref(todaysSession.id, todaysSession.status)}
            className="block rounded-xl border border-accent-orange/40 bg-accent-orange/10 px-3 py-2 text-sm font-medium text-accent-orange transition hover:bg-accent-orange/20"
          >
            ⚡ Continue where you left off →
          </Link>
        )}
      </Card>

      {/* Section A.5 — Activity Rings: exercises done vs planned, time today, time this week */}
      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Activity
        </h2>
        <ActivityRings
          rings={[
            {
              pct: itemsPlannedToday > 0 ? (itemsDoneToday / itemsPlannedToday) * 100 : 0,
              value: `${itemsDoneToday}/${itemsPlannedToday}`,
              label: "Exercises Today",
              color: "var(--accent-lime)",
            },
            {
              pct: todayTimePct,
              value: formatDuration(secondsToday),
              label: "Time Today",
              color: "var(--accent-blue)",
            },
            {
              pct: weekTimePct,
              value: formatDuration(secondsThisWeek),
              label: "Time This Week",
              color: "var(--accent-orange)",
            },
          ]}
        />
      </Card>

      {/* Section C — Items Completed (7-day bar chart) */}
      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          This Week
        </h2>
        <SetsChart data={stats.itemsByDay} />
      </Card>

      {/* Section D — Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {recentSessions.map((s) => {
              const theme = getCategoryTheme(s.trainingDayTemplate?.category ?? "");
              const sessionSeconds = liveElapsedSec(s.status, s.durationSec, s.date);
              return (
                <Card key={s.id} className="space-y-2.5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ background: `color-mix(in oklab, ${theme.color} 22%, transparent)` }}
                    >
                      {theme.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted">
                        {s.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·{" "}
                        {s.dayLabel}
                        {sessionSeconds > 0 && <> · ⏱ {formatDuration(sessionSeconds)}</>}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/session/${s.id}`}
                      className="flex-1 rounded-lg px-3 py-1.5 text-center text-xs font-semibold text-on-accent transition hover:brightness-110"
                      style={{ background: theme.color }}
                    >
                      Open Activity →
                    </Link>
                    <Link
                      href={`/content?session=${s.id}`}
                      className="flex-1 rounded-lg border border-border px-3 py-1.5 text-center text-xs font-semibold text-muted transition hover:text-foreground"
                    >
                      View / Edit Content
                    </Link>
                    <DeleteSessionButton sessionId={s.id} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Section E — Monthly Snapshot */}
      <Card className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Monthly Snapshot
        </h2>
        <SemiDonutGauge
          pct={monthlyPct}
          centerLabel={`${monthlyActual}/${monthlyGoal}`}
          subLabel={`sessions done this month · goal is ${activeProgram?.daysPerWeek ?? 4}/week`}
          color="var(--accent-lime)"
        />
        <p className="text-center text-sm text-muted">
          {monthly.sessionsCompleted} completed · {monthly.sessionsPartial} partial ·{" "}
          {monthly.sessionsSkipped} skipped · {monthly.totalHighlights} highlights
        </p>
        <Link
          href="/calendar"
          className="block rounded-xl bg-accent-lime px-4 py-3 text-center text-sm font-bold text-on-accent transition hover:brightness-110"
        >
          View Calendar →
        </Link>
      </Card>

      {/* Section F — Compliance Report link */}
      <Link href="/report">
        <Card className="flex items-center justify-between transition hover:border-accent-blue/40">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Full Report
            </h2>
            <p className="mt-1 text-sm text-muted">Every session, planned vs. what you actually did</p>
          </div>
          <span className="text-accent-blue">→</span>
        </Card>
      </Link>
    </div>
  );
}
