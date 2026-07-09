import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDashboardStats, getMonthlySnapshot } from "@/lib/stats";
import { getWeeklySplitStatus, actionLabel } from "@/lib/training/split-status";
import { logBodyMetric, addMediaEntry } from "@/lib/actions";
import { getActiveChallenge } from "@/lib/challenge";
import { Card } from "@/components/ui/Card";
import { RadialGauge } from "@/components/ui/RadialGauge";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WeeklySplitCard } from "@/components/WeeklySplitCard";
import { SetsChart } from "@/components/SetsChart";

function sessionHref(id: string, status: string) {
  return status === "COMPLETED" || status === "SKIPPED" ? `/content?session=${id}` : `/session/${id}`;
}

export default async function DashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [stats, days, monthly, todaysSession, media, challenge] = await Promise.all([
    getDashboardStats(),
    getWeeklySplitStatus(),
    getMonthlySnapshot(),
    prisma.sessionLog.findFirst({ where: { date: { gte: todayStart } }, orderBy: { date: "desc" } }),
    prisma.mediaEntry.findMany({ orderBy: { date: "desc" }, take: 8 }),
    getActiveChallenge(),
  ]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted">Your training operating system.</p>
      </div>

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Today</p>
          <p className="font-semibold">
            {todaysSession ? `${todaysSession.dayLabel} · ${todaysSession.title}` : "Not checked in yet"}
          </p>
        </div>
        {todaysSession ? (
          <div className="flex items-center gap-2">
            <StatusBadge status={todaysSession.status} />
            <Link
              href={sessionHref(todaysSession.id, todaysSession.status)}
              className="rounded-lg bg-accent-blue px-3 py-1.5 text-xs font-semibold text-background transition hover:brightness-110"
            >
              Open
            </Link>
          </div>
        ) : (
          <Link
            href="/"
            className="rounded-lg bg-accent-green px-3 py-1.5 text-xs font-semibold text-background transition hover:brightness-110"
          >
            Check In
          </Link>
        )}
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Weekly Split
          </h2>
          <Link href="/program" className="text-xs text-accent-blue hover:underline">
            View program →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {days.map((day) => (
            <WeeklySplitCard
              key={day.id}
              dayNumber={day.dayNumber}
              label={day.label}
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
                    className="block rounded-lg border border-accent-green/40 px-3 py-1.5 text-center text-xs font-semibold text-accent-green transition hover:bg-accent-green/10"
                  >
                    Start
                  </Link>
                )
              }
            />
          ))}
        </div>
      </div>

      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Items Completed
        </h2>
        <SetsChart data={stats.itemsByDay} />
      </Card>

      <Card>
        <div className="flex justify-around">
          <RadialGauge
            pct={stats.consistencyPct}
            value={`${stats.consistencyPct}%`}
            label="Consistency"
            color="var(--accent-green)"
          />
          <RadialGauge
            pct={stats.complianceThisWeekPct ?? 0}
            value={stats.complianceThisWeekPct != null ? `${stats.complianceThisWeekPct}%` : "—"}
            label="Compliance"
            color="var(--accent-blue)"
          />
          <RadialGauge
            pct={Math.min(100, stats.highlightsThisWeek * 20)}
            value={`${stats.highlightsThisWeek}`}
            label="Highlights"
            color="var(--accent-orange)"
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <p className="text-xs text-muted">Streak</p>
          <p className="text-xl font-bold">🔥 {stats.streakDays}d</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-muted">Sessions</p>
          <p className="text-xl font-bold">{stats.totalSessions}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-muted">Animal Flow (mo.)</p>
          <p className="text-xl font-bold">{stats.animalFlowSessionsThisMonth}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-muted">This Month</p>
          <p className="text-xl font-bold">
            {monthly.sessionsCompleted}
            <span className="text-sm text-muted">/{monthly.sessionsCompleted + monthly.sessionsPartial + monthly.sessionsSkipped}</span>
          </p>
        </Card>
      </div>

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
          Calendar →
        </Link>
      </Card>

      {challenge && (
        <Link href="/challenge">
          <Card className="flex items-center gap-3 border-accent-green/40 bg-surface-2 transition hover:border-accent-green/70">
            <span className="text-xl">🔥</span>
            <p className="text-sm">
              Day <span className="font-bold text-accent-green">{challenge.dayNumber}</span>/
              {challenge.durationDays} of{" "}
              <span className="font-semibold">{challenge.name}</span>
            </p>
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-muted">Weight</p>
          <p className="text-xl font-bold">
            {stats.latestWeightKg != null ? `${stats.latestWeightKg} kg` : "—"}
            {stats.weightDeltaKg != null && (
              <span
                className={
                  stats.weightDeltaKg <= 0
                    ? "ml-2 text-sm text-accent-green"
                    : "ml-2 text-sm text-accent-red"
                }
              >
                {stats.weightDeltaKg > 0 ? "↗" : "↘"} {Math.abs(stats.weightDeltaKg)}
              </span>
            )}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Body Fat</p>
          <p className="text-xl font-bold">
            {stats.latestBodyFatPct != null ? `${stats.latestBodyFatPct}%` : "—"}
            {stats.bodyFatDeltaPct != null && (
              <span
                className={
                  stats.bodyFatDeltaPct <= 0
                    ? "ml-2 text-sm text-accent-green"
                    : "ml-2 text-sm text-accent-red"
                }
              >
                {stats.bodyFatDeltaPct > 0 ? "↗" : "↘"} {Math.abs(stats.bodyFatDeltaPct)}
              </span>
            )}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Log Body Metrics
        </h2>
        <form action={logBodyMetric} className="flex flex-wrap items-end gap-3">
          <label className="min-w-[120px] flex-1 text-sm">
            Weight (kg)
            <input
              name="weightKg"
              type="number"
              step="0.1"
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent-blue"
            />
          </label>
          <label className="min-w-[120px] flex-1 text-sm">
            Body Fat (%)
            <input
              name="bodyFatPct"
              type="number"
              step="0.1"
              className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent-blue"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110"
          >
            Save
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.badges.map((b) => (
            <Badge
              key={b.id}
              label={b.label}
              achieved={b.achieved}
              icon={b.id === "consistency" ? "👑" : b.id === "milestone" ? "🏅" : "🦾"}
            />
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Progress Media
        </h2>
        <form action={addMediaEntry} className="mb-4 flex flex-wrap items-end gap-3">
          <input
            name="file"
            type="file"
            accept="image/*,video/*"
            required
            className="min-w-[160px] flex-1 text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-foreground"
          />
          <input
            name="caption"
            type="text"
            placeholder="Caption"
            className="min-w-[120px] flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent-blue"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent-green px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110"
          >
            Add
          </button>
        </form>
        {media.length === 0 ? (
          <p className="text-sm text-muted">No media logged yet.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {media.map((m) => (
              <div
                key={m.id}
                className="aspect-square overflow-hidden rounded-lg border border-border bg-surface-2"
              >
                {m.mediaType === "video" ? (
                  <video src={m.filePath} className="h-full w-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.filePath}
                    alt={m.caption ?? ""}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
