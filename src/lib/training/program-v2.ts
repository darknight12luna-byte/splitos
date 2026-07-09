import { prisma } from "@/lib/prisma";

export async function getActiveProgram() {
  return prisma.weeklyProgram.findFirst({
    where: { active: true },
    include: {
      trainingDays: {
        orderBy: { dayNumber: "asc" },
        include: { planItems: { orderBy: { order: "asc" } } },
      },
    },
  });
}

interface PlanItemLike {
  id: string;
  itemSlug: string;
  kind: string;
  plannedSets: number | null;
  plannedReps: string | null;
  plannedWeightKg: number | null;
  plannedDurationSec: number | null;
  plannedSpeed: string | null;
  plannedRestSec: number | null;
  plannedTempo: string | null;
  plannedNotes: string | null;
}

/** Snapshot a TrainingDayTemplate's plan items into SessionItemLog-create payloads. */
export function buildItemLogSeeds(planItems: PlanItemLike[]) {
  return planItems.map((p, i) => ({
    planItemId: p.id,
    itemSlug: p.itemSlug,
    kind: p.kind,
    order: i,
    plannedSets: p.plannedSets,
    plannedReps: p.plannedReps,
    plannedWeightKg: p.plannedWeightKg,
    plannedDurationSec: p.plannedDurationSec,
    plannedSpeed: p.plannedSpeed,
    plannedRestSec: p.plannedRestSec,
    plannedTempo: p.plannedTempo,
    plannedNotes: p.plannedNotes,
  }));
}
