"use server";

import { prisma } from "@/lib/prisma";
import { buildItemLogSeeds } from "@/lib/training/program-v2";
import { resolveItem } from "@/lib/training/catalog";
import type { ItemKind } from "@/lib/training/types";
import { generateCaption, Mood } from "@/lib/caption-generator";
import { getStreakDays } from "@/lib/stats";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";

async function createSessionForTemplate(
  trainingDayTemplateId: string,
  checkInId: string | null,
  status: "IN_PROGRESS" | "SKIPPED"
) {
  const trainingDay = await prisma.trainingDayTemplate.findUniqueOrThrow({
    where: { id: trainingDayTemplateId },
    include: { planItems: { orderBy: { order: "asc" } } },
  });

  const itemSeeds = buildItemLogSeeds(trainingDay.planItems).map((seed) => ({
    ...seed,
    completionStatus: status === "SKIPPED" ? "SKIPPED" : "PENDING",
  }));

  return prisma.sessionLog.create({
    data: {
      title: trainingDay.label,
      tags: [trainingDay.category, status === "SKIPPED" ? "skipped" : "planned"].join(","),
      trainingDayTemplateId: trainingDay.id,
      dayLabel: `Day ${trainingDay.dayNumber}`,
      status,
      checkInId: checkInId ?? undefined,
      itemLogs: { create: itemSeeds },
    },
  });
}

export async function submitCheckIn(formData: FormData) {
  const trainingDayTemplateId = formData.get("trainingDayTemplateId") as string;
  if (!trainingDayTemplateId) throw new Error("No training day selected.");

  const mood = formData.get("mood") as Mood;
  const energyLevel = Number(formData.get("energyLevel"));
  const muscleSoreness = Number(formData.get("muscleSoreness"));
  const sleepQuality = Number(formData.get("sleepQuality"));
  const focus = (formData.get("focus") as string) || null;
  const note = (formData.get("note") as string) || null;

  const checkIn = await prisma.checkInEntry.create({
    data: { mood, energyLevel, muscleSoreness, sleepQuality, focus, note },
  });

  const session = await createSessionForTemplate(trainingDayTemplateId, checkIn.id, "IN_PROGRESS");

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect(`/session/${session.id}`);
}

export async function skipDay(trainingDayTemplateId: string) {
  await createSessionForTemplate(trainingDayTemplateId, null, "SKIPPED");
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  redirect("/");
}

export interface ActualValuesInput {
  actualSets?: number | null;
  actualReps?: string | null;
  actualWeightKg?: number | null;
  actualDurationSec?: number | null;
  actualSpeed?: string | null;
  actualRestSec?: number | null;
  actualNotes?: string | null;
  completionStatus: "PENDING" | "COMPLETED" | "PARTIAL" | "SKIPPED";
}

export async function logItemActual(itemLogId: string, values: ActualValuesInput) {
  await prisma.sessionItemLog.update({
    where: { id: itemLogId },
    data: {
      actualSets: values.actualSets ?? null,
      actualReps: values.actualReps ?? null,
      actualWeightKg: values.actualWeightKg ?? null,
      actualDurationSec: values.actualDurationSec ?? null,
      actualSpeed: values.actualSpeed ?? null,
      actualRestSec: values.actualRestSec ?? null,
      actualNotes: values.actualNotes ?? null,
      completionStatus: values.completionStatus,
    },
  });
  revalidatePath("/session");
}

export async function toggleHighlight(itemLogId: string, isHighlight: boolean) {
  await prisma.sessionItemLog.update({
    where: { id: itemLogId },
    data: { isHighlight },
  });
  revalidatePath("/session");
}

function deriveSessionStatus(itemLogs: { completionStatus: string }[]): string {
  if (itemLogs.length === 0) return "COMPLETED";
  const completed = itemLogs.filter((i) => i.completionStatus === "COMPLETED").length;
  const touched = itemLogs.filter((i) => i.completionStatus !== "PENDING").length;
  if (completed === itemLogs.length) return "COMPLETED";
  if (touched === 0) return "SKIPPED";
  return "PARTIAL";
}

async function buildCaptionForSession(sessionId: string): Promise<string> {
  const session = await prisma.sessionLog.findUniqueOrThrow({
    where: { id: sessionId },
    include: { itemLogs: true, checkIn: true },
  });

  const streakDay = await getStreakDays();

  return generateCaption({
    mood: (session.checkIn?.mood as Mood) ?? "NORMAL",
    title: session.title,
    itemCount: session.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length,
    streakDay,
    highlightNames: session.itemLogs
      .filter((i) => i.isHighlight)
      .map((i) => resolveItem(i.itemSlug, i.kind as ItemKind).name),
  });
}

export async function completeSession(sessionId: string, durationSec: number) {
  const itemLogs = await prisma.sessionItemLog.findMany({ where: { sessionLogId: sessionId } });
  const status = deriveSessionStatus(itemLogs);

  await prisma.sessionLog.update({
    where: { id: sessionId },
    data: { status, durationSec },
  });

  const caption = await buildCaptionForSession(sessionId);
  const session = await prisma.sessionLog.update({
    where: { id: sessionId },
    data: { caption },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/content");

  return {
    sessionId,
    title: session.title,
    status,
    itemsCompleted: itemLogs.filter((i) => i.completionStatus === "COMPLETED").length,
    itemsTotal: itemLogs.length,
    highlights: itemLogs.filter((i) => i.isHighlight).length,
    durationSec,
  };
}

export async function regenerateCaption(sessionId: string) {
  const caption = await buildCaptionForSession(sessionId);
  await prisma.sessionLog.update({
    where: { id: sessionId },
    data: { caption },
  });
  revalidatePath("/content");
}

export async function startChallenge(formData: FormData) {
  const name = formData.get("name") as string;
  const durationDays = Number(formData.get("durationDays")) || 30;

  await prisma.challenge.updateMany({
    where: { active: true },
    data: { active: false },
  });
  await prisma.challenge.create({
    data: { name, durationDays },
  });

  revalidatePath("/challenge");
  revalidatePath("/");
}

export async function endChallenge(challengeId: string) {
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { active: false },
  });
  revalidatePath("/challenge");
  revalidatePath("/");
}

export async function logBodyMetric(formData: FormData) {
  const weightKg = formData.get("weightKg") ? Number(formData.get("weightKg")) : null;
  const bodyFatPct = formData.get("bodyFatPct") ? Number(formData.get("bodyFatPct")) : null;

  await prisma.bodyMetric.create({
    data: { weightKg, bodyFatPct },
  });
  revalidatePath("/dashboard");
}

export async function addMediaEntry(formData: FormData) {
  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || null;
  if (!file || file.size === 0) return;

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await writeFile(path.join(uploadDir, filename), bytes);

  const mediaType = file.type.startsWith("video") ? "video" : "image";

  await prisma.mediaEntry.create({
    data: {
      filePath: `/uploads/${filename}`,
      mediaType,
      caption,
    },
  });
  revalidatePath("/dashboard");
}
