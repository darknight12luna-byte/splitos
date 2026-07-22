import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveChallenge } from "@/lib/challenge";
import { getStreakDays } from "@/lib/stats";
import { getDailyQuote } from "@/lib/quotes";
import { getCategoryTheme } from "@/lib/training/category-theme";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function sessionHref(id: string, status: string) {
  return status === "COMPLETED" || status === "SKIPPED" ? `/content?session=${id}` : `/session/${id}`;
}

export default async function HomePage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todaysSession, challenge, streakDays] = await Promise.all([
    prisma.sessionLog.findFirst({
      where: { date: { gte: todayStart } },
      orderBy: { date: "desc" },
      include: { trainingDayTemplate: true, itemLogs: true },
    }),
    getActiveChallenge(),
    getStreakDays(),
  ]);

  const todayTheme = getCategoryTheme(todaysSession?.trainingDayTemplate?.category ?? "");
  const todayCompletedItems = todaysSession?.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length ?? 0;
  const todayTotalItems = todaysSession?.itemLogs.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, <span className="text-accent-lime">welcome back</span> 👋
          </h1>
          <p className="mt-1 text-sm text-muted">Here&apos;s where you stand today.</p>
        </div>
        {streakDays > 0 && (
          <span className="shrink-0 rounded-full border border-accent-orange/40 bg-accent-orange/10 px-3 py-1.5 text-xs font-semibold text-accent-orange">
            🔥 Day {streakDays} streak
          </span>
        )}
      </div>

      {/* Today card — the one thing this page has to answer: "what's today's status?" */}
      <Card
        className="space-y-3"
        style={{
          background: todaysSession
            ? `linear-gradient(135deg, color-mix(in oklab, ${todayTheme.color} 14%, var(--surface)), var(--surface) 70%)`
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
          {todaysSession && <StatusBadge status={todaysSession.status} />}
        </div>

        {todaysSession && (todaysSession.status === "IN_PROGRESS" || todaysSession.status === "PARTIAL") &&
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

        {todaysSession ? (
          <Link
            href={sessionHref(todaysSession.id, todaysSession.status)}
            className="block rounded-xl px-4 py-3 text-center text-sm font-bold text-on-accent transition hover:brightness-110"
            style={{ background: todayTheme.color }}
          >
            {todaysSession.status === "COMPLETED" || todaysSession.status === "SKIPPED"
              ? "View Session"
              : "Resume Session →"}
          </Link>
        ) : (
          <Link
            href="/checkin"
            className="block rounded-xl bg-accent-lime px-4 py-3 text-center text-sm font-bold text-on-accent transition hover:brightness-110"
          >
            Start Training ⚡
          </Link>
        )}
      </Card>

      <p className="rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm italic text-muted">
        &ldquo;{getDailyQuote()}&rdquo;
      </p>

      {challenge && (
        <Link href="/challenge">
          <Card className="flex items-center gap-3 border-accent-lime/40 bg-surface-2 transition hover:border-accent-lime/70">
            <span className="text-xl">🔥</span>
            <p className="text-sm">
              Day <span className="font-bold text-accent-lime">{challenge.dayNumber}</span>/
              {challenge.durationDays} of{" "}
              <span className="font-semibold">{challenge.name}</span>
            </p>
          </Card>
        </Link>
      )}
    </div>
  );
}
