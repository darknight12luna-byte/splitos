import { prisma } from "@/lib/prisma";

export interface ItemHistoryEntry {
  sessionLogId: string;
  date: Date;
  dayLabel: string;
  plannedSets: number | null;
  plannedReps: string | null;
  plannedWeightKg: number | null;
  actualSets: number | null;
  actualReps: string | null;
  actualWeightKg: number | null;
  completionStatus: string;
  isHighlight: boolean;
}

export interface ItemHistory {
  entries: ItemHistoryEntry[];
  lastPerformed: Date | null;
  complianceRate: number | null;
  bestWeightKg: number | null;
  timesLogged: number;
}

export async function getItemHistory(slug: string): Promise<ItemHistory> {
  const logs = await prisma.sessionItemLog.findMany({
    where: { itemSlug: slug, NOT: { completionStatus: "PENDING" } },
    include: { sessionLog: { select: { date: true, dayLabel: true } } },
    orderBy: { sessionLog: { date: "desc" } },
  });

  const entries: ItemHistoryEntry[] = logs.map((l) => ({
    sessionLogId: l.sessionLogId,
    date: l.sessionLog.date,
    dayLabel: l.sessionLog.dayLabel,
    plannedSets: l.plannedSets,
    plannedReps: l.plannedReps,
    plannedWeightKg: l.plannedWeightKg,
    actualSets: l.actualSets,
    actualReps: l.actualReps,
    actualWeightKg: l.actualWeightKg,
    completionStatus: l.completionStatus,
    isHighlight: l.isHighlight,
  }));

  const timesLogged = entries.length;
  const completedCount = entries.filter((e) => e.completionStatus === "COMPLETED").length;
  const complianceRate = timesLogged > 0 ? Math.round((completedCount / timesLogged) * 100) : null;

  const bestWeightKg = entries.reduce<number | null>((best, e) => {
    if (e.actualWeightKg == null) return best;
    return best == null ? e.actualWeightKg : Math.max(best, e.actualWeightKg);
  }, null);

  return {
    entries,
    lastPerformed: entries[0]?.date ?? null,
    complianceRate,
    bestWeightKg,
    timesLogged,
  };
}
