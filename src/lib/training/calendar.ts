import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

export interface CalendarSessionSummary {
  id: string;
  dayLabel: string;
  status: string;
  title: string;
  category: string;
  completionPct: number;
}

export interface CalendarDay {
  date: Date;
  dateKey: string;
  sessions: CalendarSessionSummary[];
  isToday: boolean;
}

export async function getCalendarMonth(year: number, month: number): Promise<CalendarDay[]> {
  const monthStart = startOfMonth(new Date(year, month, 1));
  const monthEnd = endOfMonth(monthStart);

  const sessions = await prisma.sessionLog.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
    include: { trainingDayTemplate: { select: { category: true } }, itemLogs: true },
    orderBy: { date: "asc" },
  });

  const byDay = new Map<string, CalendarSessionSummary[]>();
  for (const s of sessions) {
    const key = format(s.date, "yyyy-MM-dd");
    const completionPct = s.itemLogs.length
      ? Math.round(
          (s.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length /
            s.itemLogs.length) *
            100
        )
      : 0;
    const summary: CalendarSessionSummary = {
      id: s.id,
      dayLabel: s.dayLabel,
      status: s.status,
      title: s.title,
      category: s.trainingDayTemplate?.category ?? "mixed",
      completionPct,
    };
    const list = byDay.get(key) ?? [];
    list.push(summary);
    byDay.set(key, list);
  }

  const todayKey = format(new Date(), "yyyy-MM-dd");

  return eachDayOfInterval({ start: monthStart, end: monthEnd }).map((date) => {
    const key = format(date, "yyyy-MM-dd");
    return {
      date,
      dateKey: key,
      sessions: byDay.get(key) ?? [],
      isToday: key === todayKey,
    };
  });
}
