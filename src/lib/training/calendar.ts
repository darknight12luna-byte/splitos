import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
} from "date-fns";

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

interface RawSession {
  id: string;
  dayLabel: string;
  status: string;
  title: string;
  date: Date;
  trainingDayTemplate: { category: string } | null;
  itemLogs: { completionStatus: string }[];
}

function toSummary(s: RawSession): CalendarSessionSummary {
  const completionPct = s.itemLogs.length
    ? Math.round(
        (s.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length / s.itemLogs.length) *
          100
      )
    : 0;
  return {
    id: s.id,
    dayLabel: s.dayLabel,
    status: s.status,
    title: s.title,
    category: s.trainingDayTemplate?.category ?? "mixed",
    completionPct,
  };
}

async function fetchSessionsByDay(start: Date, end: Date): Promise<Map<string, CalendarSessionSummary[]>> {
  const sessions = await prisma.sessionLog.findMany({
    where: { date: { gte: start, lte: end } },
    include: { trainingDayTemplate: { select: { category: true } }, itemLogs: { select: { completionStatus: true } } },
    orderBy: { date: "asc" },
  });

  const byDay = new Map<string, CalendarSessionSummary[]>();
  for (const s of sessions) {
    const key = format(s.date, "yyyy-MM-dd");
    const list = byDay.get(key) ?? [];
    list.push(toSummary(s));
    byDay.set(key, list);
  }
  return byDay;
}

function buildDays(start: Date, end: Date, byDay: Map<string, CalendarSessionSummary[]>): CalendarDay[] {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  return eachDayOfInterval({ start, end }).map((date) => {
    const key = format(date, "yyyy-MM-dd");
    return {
      date,
      dateKey: key,
      sessions: byDay.get(key) ?? [],
      isToday: key === todayKey,
    };
  });
}

export async function getCalendarMonth(year: number, month: number): Promise<CalendarDay[]> {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  const byDay = await fetchSessionsByDay(start, end);
  return buildDays(start, end, byDay);
}

export async function getCalendarWeek(anchor: Date): Promise<CalendarDay[]> {
  const start = startOfWeek(anchor);
  const end = endOfWeek(anchor);
  const byDay = await fetchSessionsByDay(start, end);
  return buildDays(start, end, byDay);
}

export async function getCalendarDay(anchor: Date): Promise<CalendarDay> {
  const start = startOfDay(anchor);
  const end = endOfDay(anchor);
  const byDay = await fetchSessionsByDay(start, end);
  return buildDays(start, end, byDay)[0];
}
