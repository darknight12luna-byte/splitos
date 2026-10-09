import { prisma } from "@/lib/prisma";
import { buildItemLogSeeds } from "@/lib/training/program-v2";

export async function createSessionForTemplate(
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

/** An IN_PROGRESS session for this day template started today, if any. */
export async function findOpenSessionToday(trainingDayTemplateId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return prisma.sessionLog.findFirst({
    where: { trainingDayTemplateId, status: "IN_PROGRESS", date: { gte: startOfDay } },
    orderBy: { date: "desc" },
  });
}
