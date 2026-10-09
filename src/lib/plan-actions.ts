"use server";

import { prisma } from "@/lib/prisma";
import { getExerciseBySlug } from "@/lib/training/catalog";
import { revalidatePath } from "next/cache";

type Result = { success: true } | { success: false; error: string };

function refresh() {
  revalidatePath("/program");
  revalidatePath("/program/edit");
  revalidatePath("/checkin");
  revalidatePath("/");
}

function intOrNull(v: FormDataEntryValue | null, min: number, max: number): number | null {
  if (v == null || String(v).trim() === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(Math.round(n), min), max);
}

function floatOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null || String(v).trim() === "") return null;
  const n = Number(String(v).replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 1000) return null;
  return n;
}

// Plan edits only touch SessionPlanItem. Past SessionItemLogs hold their own snapshot of the
// plan, so history is never rewritten.
export async function updatePlanItem(formData: FormData): Promise<Result> {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return { success: false, error: "Missing item." };
    const reps = String(formData.get("plannedReps") ?? "").trim().slice(0, 20);
    await prisma.sessionPlanItem.update({
      where: { id },
      data: {
        plannedSets: intOrNull(formData.get("plannedSets"), 1, 20),
        plannedReps: reps || null,
        plannedWeightKg: floatOrNull(formData.get("plannedWeightKg")),
        plannedRestSec: intOrNull(formData.get("plannedRestSec"), 0, 900),
      },
    });
    refresh();
    return { success: true };
  } catch (error) {
    console.error("updatePlanItem error:", error);
    return { success: false, error: "Failed to save. Please try again." };
  }
}

export async function addPlanItem(dayId: string, slug: string): Promise<Result> {
  try {
    const exercise = getExerciseBySlug(slug);
    if (!exercise) return { success: false, error: "Unknown exercise." };
    const last = await prisma.sessionPlanItem.findFirst({
      where: { trainingDayTemplateId: dayId },
      orderBy: { order: "desc" },
    });
    const sets = Number.parseInt(exercise.defaultSets ?? "", 10);
    await prisma.sessionPlanItem.create({
      data: {
        trainingDayTemplateId: dayId,
        itemSlug: slug,
        kind: "exercise",
        order: (last?.order ?? -1) + 1,
        plannedSets: Number.isFinite(sets) ? sets : 3,
        plannedReps: exercise.defaultReps ?? null,
      },
    });
    refresh();
    return { success: true };
  } catch (error) {
    console.error("addPlanItem error:", error);
    return { success: false, error: "Failed to add exercise." };
  }
}

export async function removePlanItem(id: string): Promise<Result> {
  try {
    await prisma.sessionPlanItem.delete({ where: { id } });
    refresh();
    return { success: true };
  } catch (error) {
    console.error("removePlanItem error:", error);
    return { success: false, error: "Failed to remove exercise." };
  }
}

export async function movePlanItem(id: string, direction: "up" | "down"): Promise<Result> {
  try {
    const item = await prisma.sessionPlanItem.findUniqueOrThrow({ where: { id } });
    const siblings = await prisma.sessionPlanItem.findMany({
      where: { trainingDayTemplateId: item.trainingDayTemplateId },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });
    const i = siblings.findIndex((s) => s.id === id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= siblings.length) return { success: true };
    const reordered = [...siblings];
    [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
    await prisma.$transaction(
      reordered.map((s, idx) =>
        prisma.sessionPlanItem.update({ where: { id: s.id }, data: { order: idx } })
      )
    );
    refresh();
    return { success: true };
  } catch (error) {
    console.error("movePlanItem error:", error);
    return { success: false, error: "Failed to reorder." };
  }
}
