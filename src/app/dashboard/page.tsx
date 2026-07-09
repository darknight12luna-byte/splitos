import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDashboardStats, getMonthlySnapshot } from "@/lib/stats";
import { getWeeklySplitStatus, actionLabel } from "@/lib/training/split-status";
import { getCategoryTheme } from "@/lib/training/category-theme";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WeeklySplitCard } from "@/components/WeeklySplitCard";
import { SetsChart } from "@/components/SetsChart";

export const dynamic = "force-dynamic";

function sessionHref(id: string, status: string) {
  return status === "COMPLETED" || status === "SKIPPED" ? `/content?session=${id}` : `/session/${id}`;
}

export default async function DashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [stats, days, monthly, todaysSession, recentSessions] = await Promise.all([
    getDashboardStats(),
    getWeeklySplitStatus(),
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
  ]);

  const todayTheme = getCategoryTheme(todaysSession?.trainingDayTemplate?.category ?? "");
  const todayCompletedItems = todaysSession?.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length ?? 0;
  const todayTotalItems = todaysSession?.itemLogs.length ?? 0;

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
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-background transition hover:brightness-110"
                style={{ background: todayTheme.color }}
              >
                Open Session
              </Link>
            </div>
          ) : (
            <Link
              href="/"
              className="shrink-0 rounded-lg bg-accent-lime px-3 py-1.5 text-xs font-semibold text-background transition hover:brightness-110"
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

      {/* Section B — Weekly Split (2x2) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Weekly Split
          </h2>
          <Link href="/program" className="text-xs text-accent-blue hover:underline">
            View program →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {days.map((day) => (
            <WeeklySplitCard
              key={day.id}
              dayNumber={day.dayNumber}
              label={day.label}
              category={day.category}
              status={day.todaySession?.status ?? "NOT_STARTED"}
              completionPct={day.todaySession?.completionPct ?? null}
              lastPerformed={day.lastPerformed?.date ?? null}
              action={
                day.todaySession ? (
                  <Link
                    href={sessionHref(day.todaySession.id, day.todaySession.status)}
                    className="block rounded-lg bg-accent-blue px-3 py-1.5 text-center text-xs font-semibold text-background transition hover:brightness-110"
                  >
                    {actionLabel(day.todaySession.status, "Open")}
                  </Link>
                ) : (
                  <Link
                    href={`/?day=${day.id}`}
                    className="block rounded-lg border border-accent-lime/40 px-3 py-1.5 text-center text-xs font-semibold text-accent-lime transition hover:bg-accent-lime/10"
                  >
                    Start
                  </Link>
                )
              }
            />
          ))}
        </div>
      </div>

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
              return (
                <Link key={s.id} href={sessionHref(s.id, s.status)}>
                  <Card className="flex items-center gap-3 py-3 transition hover:border-accent-blue/40">
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
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Section E — Monthly Snapshot */}
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Monthly Snapshot
          </h2>
          <p className="mt-1 text-sm text-muted">
            {monthly.sessionsCompleted} completed · {monthly.sessionsPartial} partial ·{" "}
            {monthly.sessionsSkipped} skipped · {monthly.totalHighlights} highlights
          </p>
        </div>
        <Link
          href="/calendar"
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
        >
          View Calendar →
        </Link>
      </Card>
    </div>
  );
}
