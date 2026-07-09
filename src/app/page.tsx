import Link from "next/link";
import { getActiveChallenge } from "@/lib/challenge";
import { getStreakDays } from "@/lib/stats";
import { getWeeklySplitStatus, getSuggestedDayId } from "@/lib/training/split-status";
import { getDailyQuote } from "@/lib/quotes";
import { Card } from "@/components/ui/Card";
import { CheckInFlow, type CheckInDay } from "@/components/CheckInFlow";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const { day: dayParam } = await searchParams;

  const [days, challenge, streakDays] = await Promise.all([
    getWeeklySplitStatus(),
    getActiveChallenge(),
    getStreakDays(),
  ]);

  if (days.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Check-In</h1>
        <Card>
          <p className="text-sm text-muted">
            No active weekly program configured — visit{" "}
            <Link href="/program" className="text-accent-blue underline">
              Program
            </Link>{" "}
            to set one up.
          </p>
        </Card>
      </div>
    );
  }

  const suggestedDayId = getSuggestedDayId(days);
  const requestedDay = dayParam ? days.find((d) => d.id === dayParam && !d.todaySession) : null;
  const initialSelectedDayId = requestedDay?.id ?? suggestedDayId;

  const checkInDays: CheckInDay[] = days.map((d) => ({
    id: d.id,
    dayNumber: d.dayNumber,
    label: d.label,
    category: d.category,
    goal: d.goal,
    todaySession: d.todaySession,
    lastPerformed: d.lastPerformed ? d.lastPerformed.date.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, <span className="text-accent-lime">let&apos;s train</span> 💪
          </h1>
          <p className="mt-1 text-sm text-muted">
            Your 4-day split, live — see where you stand and start (or resume) any day.
          </p>
        </div>
        {streakDays > 0 && (
          <span className="shrink-0 rounded-full border border-accent-orange/40 bg-accent-orange/10 px-3 py-1.5 text-xs font-semibold text-accent-orange">
            🔥 Day {streakDays} streak
          </span>
        )}
      </div>

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

      <CheckInFlow days={checkInDays} initialSelectedDayId={initialSelectedDayId} />
    </div>
  );
}
