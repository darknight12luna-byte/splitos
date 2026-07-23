import { prisma } from "@/lib/prisma";
import { startOfDay, startOfWeek } from "date-fns";
import { TRAINED_STATUSES } from "@/lib/stats";

export interface TodaySessionStatus {
  id: string;
  status: string;
  completionPct: number;
}

export interface LastPerformed {
  date: Date;
  status: string;
}

export type WeekStatus = "done" | "skipped" | "not_started";

export interface DaySplitStatus {
  id: string;
  dayNumber: number;
  label: string;
  category: string;
  goal: string;
  todaySession: TodaySessionStatus | null;
  lastPerformed: LastPerformed | null;
  thisWeekCount: number;
  weekStatus: WeekStatus;
}

/** Single source of truth for "how is each of the 4 split days doing" — consumed by
 * Check-In, Dashboard, and Calendar so status/percentage logic can't drift between pages. */
export async function getWeeklySplitStatus(): Promise<DaySplitStatus[]> {
  const program = await prisma.weeklyProgram.findFirst({
    where: { active: true },
    include: { trainingDays: { orderBy: { dayNumber: "asc" } } },
  });
  if (!program) return [];

  const todayStart = startOfDay(new Date());
  const weekStart = startOfWeek(todayStart, { weekStartsOn: 1 });
  const dayIds = program.trainingDays.map((d) => d.id);

  // One query for every day's sessions this week, rather than one query per day —
  // grouped client-side into thisWeekCount + weekStatus below.
  const weekSessions = await prisma.sessionLog.findMany({
    where: { trainingDayTemplateId: { in: dayIds }, date: { gte: weekStart } },
    select: { trainingDayTemplateId: true, status: true },
  });
  const weekSessionsByDay = new Map<string, { status: string }[]>();
  for (const s of weekSessions) {
    if (!s.trainingDayTemplateId) continue;
    const list = weekSessionsByDay.get(s.trainingDayTemplateId) ?? [];
    list.push({ status: s.status });
    weekSessionsByDay.set(s.trainingDayTemplateId, list);
  }

  const results = await Promise.all(
    program.trainingDays.map(async (day) => {
      const [todaySessionRaw, lastPerformedRaw] = await Promise.all([
        prisma.sessionLog.findFirst({
          where: { trainingDayTemplateId: day.id, date: { gte: todayStart } },
          orderBy: { date: "desc" },
          include: { itemLogs: true },
        }),
        prisma.sessionLog.findFirst({
          where: { trainingDayTemplateId: day.id, status: { in: TRAINED_STATUSES } },
          orderBy: { date: "desc" },
          select: { date: true, status: true },
        }),
      ]);

      const todaySession: TodaySessionStatus | null = todaySessionRaw
        ? {
            id: todaySessionRaw.id,
            status: todaySessionRaw.status,
            completionPct: todaySessionRaw.itemLogs.length
              ? Math.round(
                  (todaySessionRaw.itemLogs.filter((i) => i.completionStatus === "COMPLETED")
                    .length /
                    todaySessionRaw.itemLogs.length) *
                    100
                )
              : 0,
          }
        : null;

      const thisWeekSessions = weekSessionsByDay.get(day.id) ?? [];
      const thisWeekCount = thisWeekSessions.filter((s) => TRAINED_STATUSES.includes(s.status)).length;
      const weekStatus: WeekStatus =
        thisWeekCount > 0
          ? "done"
          : thisWeekSessions.some((s) => s.status === "SKIPPED")
          ? "skipped"
          : "not_started";

      return {
        id: day.id,
        dayNumber: day.dayNumber,
        label: day.label,
        category: day.category,
        goal: day.goal,
        todaySession,
        lastPerformed: lastPerformedRaw
          ? { date: lastPerformedRaw.date, status: lastPerformedRaw.status }
          : null,
        thisWeekCount,
        weekStatus,
      };
    })
  );

  return results;
}

/** Among days not yet started today, suggest whichever is most overdue (oldest/never
 * last-performed). Self-corrects regardless of what order sessions actually get started in —
 * no rotation counter to desync. */
export function getSuggestedDayId(days: DaySplitStatus[]): string | null {
  const notDoneToday = days.filter((d) => !d.todaySession);
  const pool = notDoneToday.length > 0 ? notDoneToday : days;

  const sorted = [...pool].sort((a, b) => {
    if (!a.lastPerformed && !b.lastPerformed) return a.dayNumber - b.dayNumber;
    if (!a.lastPerformed) return -1;
    if (!b.lastPerformed) return 1;
    return a.lastPerformed.date.getTime() - b.lastPerformed.date.getTime();
  });

  return sorted[0]?.id ?? null;
}

export function actionLabel(status: string, doneLabel: "View" | "Open" = "View"): string {
  if (status === "COMPLETED" || status === "SKIPPED") return doneLabel;
  if (status === "PARTIAL" || status === "IN_PROGRESS") return "Resume";
  return "Start";
}
