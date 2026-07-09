import { prisma } from "@/lib/prisma";
import { startOfDay, addDays, differenceInCalendarDays, format } from "date-fns";

export interface ChallengeDay {
  date: Date;
  label: string;
  completed: boolean;
  isFuture: boolean;
  isToday: boolean;
}

export interface ChallengeProgress {
  id: string;
  name: string;
  startDate: Date;
  durationDays: number;
  dayNumber: number;
  completedDays: number;
  isComplete: boolean;
  days: ChallengeDay[];
}

export interface ChallengeHistoryEntry {
  id: string;
  name: string;
  startDate: Date;
  durationDays: number;
  completedDays: number;
}

export async function getChallengeHistory(): Promise<ChallengeHistoryEntry[]> {
  const past = await prisma.challenge.findMany({
    where: { active: false },
    orderBy: { startDate: "desc" },
  });
  if (past.length === 0) return [];

  const results: ChallengeHistoryEntry[] = [];
  for (const challenge of past) {
    const start = startOfDay(challenge.startDate);
    const end = addDays(start, challenge.durationDays);
    const sessions = await prisma.sessionLog.findMany({
      where: { status: { in: ["COMPLETED", "PARTIAL"] }, date: { gte: start, lt: end } },
      select: { date: true },
    });
    const completedDates = new Set(sessions.map((s) => format(s.date, "yyyy-MM-dd")));
    results.push({
      id: challenge.id,
      name: challenge.name,
      startDate: challenge.startDate,
      durationDays: challenge.durationDays,
      completedDays: completedDates.size,
    });
  }
  return results;
}

export async function getActiveChallenge(): Promise<ChallengeProgress | null> {
  const challenge = await prisma.challenge.findFirst({
    where: { active: true },
    orderBy: { startDate: "desc" },
  });
  if (!challenge) return null;

  const today = startOfDay(new Date());
  const start = startOfDay(challenge.startDate);
  const elapsedDays = differenceInCalendarDays(today, start) + 1;
  const dayNumber = Math.min(Math.max(elapsedDays, 1), challenge.durationDays);

  const sessions = await prisma.sessionLog.findMany({
    where: { status: { in: ["COMPLETED", "PARTIAL"] }, date: { gte: start } },
    select: { date: true },
  });
  const completedDates = new Set(sessions.map((s) => format(s.date, "yyyy-MM-dd")));

  const days: ChallengeDay[] = Array.from({ length: challenge.durationDays }, (_, i) => {
    const date = addDays(start, i);
    const key = format(date, "yyyy-MM-dd");
    return {
      date,
      label: format(date, "d"),
      completed: completedDates.has(key),
      isFuture: date > today,
      isToday: key === format(today, "yyyy-MM-dd"),
    };
  });

  return {
    id: challenge.id,
    name: challenge.name,
    startDate: challenge.startDate,
    durationDays: challenge.durationDays,
    dayNumber,
    completedDays: days.filter((d) => d.completed).length,
    isComplete: elapsedDays > challenge.durationDays,
    days,
  };
}
