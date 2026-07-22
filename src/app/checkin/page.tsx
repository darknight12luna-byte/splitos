import Link from "next/link";
import { getWeeklySplitStatus, getSuggestedDayId } from "@/lib/training/split-status";
import { Card } from "@/components/ui/Card";
import { CheckInFlow, type CheckInDay } from "@/components/CheckInFlow";

export const dynamic = "force-dynamic";

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const { day: dayParam } = await searchParams;

  const days = await getWeeklySplitStatus();

  if (days.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Build Your Routine</h1>
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
      <div>
        <h1 className="text-2xl font-bold">Build Your Routine</h1>
        <p className="mt-1 text-sm text-muted">
          Your 4-day split, live — see where you stand and start (or resume) any day.
        </p>
      </div>

      <CheckInFlow days={checkInDays} initialSelectedDayId={initialSelectedDayId} />
    </div>
  );
}
