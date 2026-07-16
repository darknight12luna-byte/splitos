"use server";

import { prisma } from "@/lib/prisma";
import { buildItemLogSeeds } from "@/lib/training/program-v2";
import { resolveItem } from "@/lib/training/catalog";
import type { ItemKind } from "@/lib/training/types";
import { generateCaption, Mood } from "@/lib/caption-generator";
import { getStreakDays } from "@/lib/stats";
import { revalidatePath } from "next/cache";
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

export async function submitCheckIn(
  formData: FormData
): Promise<{ success: false; error: string } | { success: true; sessionId: string }> {
  try {
    const trainingDayTemplateId = formData.get("trainingDayTemplateId") as string;
    if (!trainingDayTemplateId || typeof trainingDayTemplateId !== "string") {
      return { success: false, error: "No training day selected." };
    }

    const mood = formData.get("mood") as string;
    const validMoods = ["TIRED", "NORMAL", "ENERGIZED", "STRONG"];
    if (!validMoods.includes(mood)) {
      return { success: false, error: "Invalid mood selection." };
    }

    const energyLevel = Number(formData.get("energyLevel"));
    const muscleSoreness = Number(formData.get("muscleSoreness"));
    const sleepQuality = Number(formData.get("sleepQuality"));

    if (!Number.isInteger(energyLevel) || energyLevel < 1 || energyLevel > 5) {
      return { success: false, error: "Energy level must be between 1 and 5." };
    }
    if (!Number.isInteger(muscleSoreness) || muscleSoreness < 1 || muscleSoreness > 5) {
      return { success: false, error: "Muscle soreness must be between 1 and 5." };
    }
    if (!Number.isInteger(sleepQuality) || sleepQuality < 1 || sleepQuality > 5) {
      return { success: false, error: "Sleep quality must be between 1 and 5." };
    }

    const focus = (formData.get("focus") as string) || null;
    const note = (formData.get("note") as string) || null;

    const checkIn = await prisma.checkInEntry.create({
      data: { mood: mood as Mood, energyLevel, muscleSoreness, sleepQuality, focus, note },
    });

    const session = await createSessionForTemplate(trainingDayTemplateId, checkIn.id, "IN_PROGRESS");

    revalidatePath("/");
    revalidatePath("/dashboard");

    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error("submitCheckIn error:", error);
    return { success: false, error: "Failed to create check-in. Please try again." };
  }
}

export async function skipDay(
  trainingDayTemplateId: string
): Promise<{ success: false; error: string } | { success: true }> {
  try {
    if (!trainingDayTemplateId || typeof trainingDayTemplateId !== "string") {
      return { success: false, error: "Invalid training day ID." };
    }

    await createSessionForTemplate(trainingDayTemplateId, null, "SKIPPED");
    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("skipDay error:", error);
    return { success: false, error: "Failed to skip day. Please try again." };
  }
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

export async function logItemActual(
  itemLogId: string,
  values: ActualValuesInput
): Promise<{ success: false; error: string } | { success: true }> {
  try {
    if (!itemLogId || typeof itemLogId !== "string") {
      return { success: false, error: "Invalid item ID." };
    }

    const validStatuses = ["PENDING", "COMPLETED", "PARTIAL", "SKIPPED"];
    if (!validStatuses.includes(values.completionStatus)) {
      return { success: false, error: "Invalid completion status." };
    }

    if (values.actualSets !== null && values.actualSets !== undefined) {
      if (!Number.isInteger(values.actualSets) || values.actualSets < 0) {
        return { success: false, error: "Sets must be a non-negative integer." };
      }
    }

    if (values.actualWeightKg !== null && values.actualWeightKg !== undefined) {
      if (typeof values.actualWeightKg !== "number" || values.actualWeightKg < 0) {
        return { success: false, error: "Weight must be non-negative." };
      }
    }

    if (values.actualDurationSec !== null && values.actualDurationSec !== undefined) {
      if (!Number.isInteger(values.actualDurationSec) || values.actualDurationSec < 0) {
        return { success: false, error: "Duration must be a non-negative integer." };
      }
    }

    if (values.actualRestSec !== null && values.actualRestSec !== undefined) {
      if (!Number.isInteger(values.actualRestSec) || values.actualRestSec < 0) {
        return { success: false, error: "Rest time must be a non-negative integer." };
      }
    }

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

    return { success: true };
  } catch (error) {
    console.error("logItemActual error:", error);
    return { success: false, error: "Failed to log item. Please try again." };
  }
}

export async function toggleHighlight(
  itemLogId: string,
  isHighlight: boolean
): Promise<{ success: false; error: string } | { success: true }> {
  try {
    if (!itemLogId || typeof itemLogId !== "string") {
      return { success: false, error: "Invalid item ID." };
    }

    if (typeof isHighlight !== "boolean") {
      return { success: false, error: "Invalid highlight value." };
    }

    await prisma.sessionItemLog.update({
      where: { id: itemLogId },
      data: { isHighlight },
    });
    revalidatePath("/session");

    return { success: true };
  } catch (error) {
    console.error("toggleHighlight error:", error);
    return { success: false, error: "Failed to update highlight. Please try again." };
  }
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
  try {
    if (!sessionId || typeof sessionId !== "string") {
      return { success: false, error: "Invalid session ID." };
    }

    if (!Number.isInteger(durationSec) || durationSec < 0) {
      return { success: false, error: "Duration must be a non-negative integer." };
    }

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
      success: true,
      data: {
        sessionId,
        title: session.title,
        status,
        itemsCompleted: itemLogs.filter((i) => i.completionStatus === "COMPLETED").length,
        itemsTotal: itemLogs.length,
        highlights: itemLogs.filter((i) => i.isHighlight).length,
        durationSec,
      },
    };
  } catch (error) {
    console.error("completeSession error:", error);
    return { success: false, error: "Failed to complete session. Please try again." };
  }
}

export async function regenerateCaption(
  sessionId: string
): Promise<{ success: false; error: string } | { success: true }> {
  try {
    if (!sessionId || typeof sessionId !== "string") {
      return { success: false, error: "Invalid session ID." };
    }

    const caption = await buildCaptionForSession(sessionId);
    await prisma.sessionLog.update({
      where: { id: sessionId },
      data: { caption },
    });
    revalidatePath("/content");

    return { success: true };
  } catch (error) {
    console.error("regenerateCaption error:", error);
    return { success: false, error: "Failed to regenerate caption. Please try again." };
  }
}

export async function startChallenge(
  formData: FormData
): Promise<{ success: false; error: string } | { success: true }> {
  try {
    const name = formData.get("name") as string;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return { success: false, error: "Challenge name is required." };
    }
    if (name.length > 100) {
      return { success: false, error: "Challenge name must be 100 characters or less." };
    }

    const durationDays = Number(formData.get("durationDays")) || 30;
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) {
      return { success: false, error: "Challenge duration must be between 1 and 365 days." };
    }

    await prisma.challenge.updateMany({
      where: { active: true },
      data: { active: false },
    });
    await prisma.challenge.create({
      data: { name: name.trim(), durationDays },
    });

    revalidatePath("/challenge");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("startChallenge error:", error);
    return { success: false, error: "Failed to start challenge. Please try again." };
  }
}

export async function endChallenge(
  challengeId: string
): Promise<{ success: false; error: string } | { success: true }> {
  try {
    if (!challengeId || typeof challengeId !== "string") {
      return { success: false, error: "Invalid challenge ID." };
    }

    await prisma.challenge.update({
      where: { id: challengeId },
      data: { active: false },
    });
    revalidatePath("/challenge");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("endChallenge error:", error);
    return { success: false, error: "Failed to end challenge. Please try again." };
  }
}

export async function logBodyMetric(
  formData: FormData
): Promise<{ success: false; error: string } | { success: true }> {
  try {
    const weightKgStr = formData.get("weightKg");
    const weightKg = weightKgStr ? Number(weightKgStr) : null;
    const bodyFatPctStr = formData.get("bodyFatPct");
    const bodyFatPct = bodyFatPctStr ? Number(bodyFatPctStr) : null;

    if (weightKg !== null) {
      if (typeof weightKg !== "number" || weightKg < 20 || weightKg > 500) {
        return { success: false, error: "Weight must be between 20 and 500 kg." };
      }
    }

    if (bodyFatPct !== null) {
      if (typeof bodyFatPct !== "number" || bodyFatPct < 0 || bodyFatPct > 100) {
        return { success: false, error: "Body fat percentage must be between 0 and 100." };
      }
    }

    if (weightKg === null && bodyFatPct === null) {
      return { success: false, error: "At least one metric (weight or body fat) is required." };
    }

    await prisma.bodyMetric.create({
      data: { weightKg, bodyFatPct },
    });
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("logBodyMetric error:", error);
    return { success: false, error: "Failed to log body metric. Please try again." };
  }
}

export async function addMediaEntry(
  formData: FormData
): Promise<{ success: false; error: string } | { success: true }> {
  try {
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || null;

    if (!file || file.size === 0) {
      return { success: false, error: "File is required." };
    }

    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) {
      return { success: false, error: "File must be smaller than 100 MB." };
    }

    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
    const allValidTypes = [...validImageTypes, ...validVideoTypes];

    if (!allValidTypes.includes(file.type)) {
      return { success: false, error: "File type not supported. Use image or video files." };
    }

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

    return { success: true };
  } catch (error) {
    console.error("addMediaEntry error:", error);
    return { success: false, error: "Failed to upload media. Please try again." };
  }
}
