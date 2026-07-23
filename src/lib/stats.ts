import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format, startOfMonth } from "date-fns";

export const TRAINED_STATUSES = ["COMPLETED", "PARTIAL"];

export async function getStreakDays(): Promise<number> {
  const today = startOfDay(new Date());
  const sessions = await prisma.sessionLog.findMany({
    where: { status: { in: TRAINED_STATUSES } },
    select: { date: true },
  });
  const allDaySet = new Set(sessions.map((s) => format(s.date, "yyyy-MM-dd")));

  let streakDays = 0;
  for (let i = 0; i < 365; i++) {
    const d = subDays(today, i);
    if (allDaySet.has(format(d, "yyyy-MM-dd"))) {
      streakDays++;
    } else if (i > 0) {
      break;
    } else {
      continue;
    }
  }
  return streakDays;
}

export interface DashboardStats {
  itemsByDay: { day: string; items: number }[];
  consistencyPct: number;
  totalSessions: number;
  highlightsThisWeek: number;
  streakDays: number;
  complianceThisWeekPct: number | null;
  animalFlowSessionsThisMonth: number;
  latestWeightKg: number | null;
  weightDeltaKg: number | null;
  latestBodyFatPct: number | null;
  bodyFatDeltaPct: number | null;
  badges: { id: string; label: string; achieved: boolean }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6);
  const monthStart = startOfMonth(today);

  const sessions = await prisma.sessionLog.findMany({
    where: { status: { in: TRAINED_STATUSES } },
    include: { itemLogs: true },
    orderBy: { date: "desc" },
  });

  const recentSessions = sessions.filter((s) => s.date >= sevenDaysAgo);

  const itemsByDayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    itemsByDayMap.set(format(subDays(today, i), "EEE"), 0);
  }
  for (const s of recentSessions) {
    const key = format(s.date, "EEE");
    const completedItems = s.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length;
    itemsByDayMap.set(key, (itemsByDayMap.get(key) ?? 0) + completedItems);
  }
  const itemsByDay = Array.from(itemsByDayMap.entries()).map(([day, items]) => ({ day, items }));

  const daysWithSession = new Set(recentSessions.map((s) => format(s.date, "yyyy-MM-dd")));
  const consistencyPct = Math.round((daysWithSession.size / 7) * 100);

  const totalSessions = sessions.length;

  const highlightsThisWeek = recentSessions.reduce(
    (sum, s) => sum + s.itemLogs.filter((i) => i.isHighlight).length,
    0
  );

  const streakDays = await getStreakDays();

  const thisWeekItems = recentSessions
    .flatMap((s) => s.itemLogs)
    .filter((i) => i.completionStatus !== "PENDING");
  const complianceThisWeekPct =
    thisWeekItems.length > 0
      ? Math.round(
          (thisWeekItems.filter((i) => i.completionStatus === "COMPLETED").length /
            thisWeekItems.length) *
            100
        )
      : null;

  const animalFlowSessionsThisMonth = sessions.filter(
    (s) => s.date >= monthStart && s.tags.includes("animal_flow")
  ).length;

  const bodyMetrics = await prisma.bodyMetric.findMany({
    orderBy: { date: "desc" },
    take: 2,
  });
  const latestWeightKg = bodyMetrics[0]?.weightKg ?? null;
  const weightDeltaKg =
    bodyMetrics[0]?.weightKg != null && bodyMetrics[1]?.weightKg != null
      ? Math.round((bodyMetrics[0].weightKg - bodyMetrics[1].weightKg) * 10) / 10
      : null;
  const latestBodyFatPct = bodyMetrics[0]?.bodyFatPct ?? null;
  const bodyFatDeltaPct =
    bodyMetrics[0]?.bodyFatPct != null && bodyMetrics[1]?.bodyFatPct != null
      ? Math.round((bodyMetrics[0].bodyFatPct - bodyMetrics[1].bodyFatPct) * 10) / 10
      : null;

  const totalHighlights = sessions.reduce(
    (sum, s) => sum + s.itemLogs.filter((i) => i.isHighlight).length,
    0
  );

  const badges = [
    { id: "consistency", label: "Consistency King", achieved: streakDays >= 7 },
    {
      id: "milestone",
      label:
        totalSessions >= 50
          ? "Milestone 50"
          : totalSessions >= 25
          ? "Milestone 25"
          : "Milestone 10",
      achieved: totalSessions >= 10,
    },
    { id: "strength", label: "Strength Beast", achieved: totalHighlights >= 5 },
  ];

  return {
    itemsByDay,
    consistencyPct,
    totalSessions,
    highlightsThisWeek,
    streakDays,
    complianceThisWeekPct,
    animalFlowSessionsThisMonth,
    latestWeightKg,
    weightDeltaKg,
    latestBodyFatPct,
    bodyFatDeltaPct,
    badges,
  };
}

export interface SessionComplianceRow {
  id: string;
  label: string;
  date: string; // ISO
  planned: number;
  completed: number;
  partial: number;
  missed: number; // SKIPPED + never-touched (PENDING) items — both mean "didn't do it"
}

/** Planned vs. actual, per session, across the whole training history. */
export async function getSessionComplianceReport(): Promise<SessionComplianceRow[]> {
  const sessions = await prisma.sessionLog.findMany({
    where: { status: { not: "NOT_STARTED" } },
    orderBy: { date: "asc" },
    include: { itemLogs: { select: { completionStatus: true } } },
  });

  return sessions.map((s) => {
    const completed = s.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length;
    const partial = s.itemLogs.filter((i) => i.completionStatus === "PARTIAL").length;
    const missed = s.itemLogs.filter(
      (i) => i.completionStatus === "SKIPPED" || i.completionStatus === "PENDING"
    ).length;

    return {
      id: s.id,
      label: `${format(s.date, "MMM d")} · ${s.title}`,
      date: s.date.toISOString(),
      planned: s.itemLogs.length,
      completed,
      partial,
      missed,
    };
  });
}

export interface MonthlySnapshot {
  sessionsCompleted: number;
  sessionsPartial: number;
  sessionsSkipped: number;
  totalHighlights: number;
}

export async function getMonthlySnapshot(): Promise<MonthlySnapshot> {
  const monthStart = startOfMonth(new Date());
  const sessions = await prisma.sessionLog.findMany({
    where: { date: { gte: monthStart } },
    include: { itemLogs: true },
  });

  return {
    sessionsCompleted: sessions.filter((s) => s.status === "COMPLETED").length,
    sessionsPartial: sessions.filter((s) => s.status === "PARTIAL").length,
    sessionsSkipped: sessions.filter((s) => s.status === "SKIPPED").length,
    totalHighlights: sessions.reduce(
      (sum, s) => sum + s.itemLogs.filter((i) => i.isHighlight).length,
      0
    ),
  };
}
