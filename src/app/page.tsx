import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveChallenge } from "@/lib/challenge";
import { getDashboardStats } from "@/lib/stats";
import { getDailyQuote } from "@/lib/quotes";
import { getWeeklySplitStatus } from "@/lib/training/split-status";
import { getCategoryTheme } from "@/lib/training/category-theme";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { WeeklyProgressStrip } from "@/components/WeeklyProgressStrip";

export const dynamic = "force-dynamic";

const BADGE_ICONS: Record<string, string> = {
  consistency: "🔥",
  milestone: "🏅",
  strength: "💥",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

/** Real-stakes copy tied to the actual streak — never shown as a threat when there's no
 * streak to lose (streakDays === 0 always gets the neutral line). */
function getEmptyStateCopy(hour: number, streakDays: number) {
  if (streakDays <= 0) return "Not checked in yet";
  if (hour < 18) return `Not checked in yet — Day ${streakDays} streak is still alive today`;
  return `Day ${streakDays} streak — don't let today be the one that breaks it`;
}

function sessionHref(id: string, status: string) {
  return status === "COMPLETED" || status === "SKIPPED" ? `/content?session=${id}` : `/session/${id}`;
}

export default async function HomePage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todaysSession, challenge, stats, splitStatus] = await Promise.all([
    prisma.sessionLog.findFirst({
      where: { date: { gte: todayStart } },
      orderBy: { date: "desc" },
      include: { trainingDayTemplate: true, itemLogs: true },
    }),
    getActiveChallenge(),
    getDashboardStats(),
    getWeeklySplitStatus(),
  ]);
  const streakDays = stats.streakDays;

  const todayTheme = getCategoryTheme(todaysSession?.trainingDayTemplate?.category ?? "");
  const todayCompletedItems = todaysSession?.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length ?? 0;
  const todayTotalItems = todaysSession?.itemLogs.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}, <span className="text-accent-lime">welcome back</span> 👋
        </h1>
        <p className="mt-1 text-sm text-muted">Here&apos;s where you stand today.</p>
      </div>

      {/* Streak + challenge + badges — the strongest existing motivators, surfaced where
          the eye lands first instead of split between a tiny header pill and a footer link. */}
      <Card className="space-y-3 border-accent-orange/30 bg-surface-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none" aria-hidden>
              🔥
            </span>
            <div>
              <p className="text-lg font-bold text-accent-orange">
                {streakDays > 0 ? `Day ${streakDays} streak` : "No active streak yet"}
              </p>
              {challenge && (
                <Link href="/challenge" className="text-xs text-muted hover:text-foreground hover:underline">
                  Day {challenge.dayNumber}/{challenge.durationDays} of{" "}
                  <span className="font-semibold">{challenge.name}</span>
                </Link>
              )}
            </div>
          </div>
          {challenge && (
            <span className="shrink-0 text-sm font-bold text-accent-lime">
              {Math.round((challenge.completedDays / challenge.durationDays) * 100)}%
            </span>
          )}
        </div>

        <p className="text-xs text-muted">
          {stats.consistencyPct}% of the last 7 days trained
          {stats.complianceThisWeekPct !== null && ` · ${stats.complianceThisWeekPct}% compliance this week`}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {stats.badges.map((badge) => (
            <Badge key={badge.id} label={badge.label} achieved={badge.achieved} icon={BADGE_ICONS[badge.id] ?? "⭐"} />
          ))}
        </div>
      </Card>

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
                {todaysSession
                  ? `${todaysSession.dayLabel} · ${todaysSession.title}`
                  : getEmptyStateCopy(new Date().getHours(), streakDays)}
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
            className="glow-pulse block rounded-xl bg-accent-lime px-4 py-3 text-center text-sm font-bold text-on-accent transition hover:brightness-110"
          >
            Start Training ⚡
          </Link>
        )}
      </Card>

      {splitStatus.length > 0 && (
        <Card>
          <WeeklyProgressStrip days={splitStatus} />
        </Card>
      )}

      <p className="rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm italic text-muted">
        &ldquo;{getDailyQuote()}&rdquo;
      </p>
    </div>
  );
}
