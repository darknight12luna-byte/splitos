// End-to-end check of the plan → session → history path against the real DB, using a throwaway
// program that is deleted afterwards. Run: npx tsx scripts/e2e-session.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createSessionForTemplate, findOpenSessionToday } from "../src/lib/training/session-service";

const prisma = new PrismaClient();
let failed = 0;
function check(label: string, ok: boolean) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failed++;
}

async function main() {
  const program = await prisma.weeklyProgram.create({
    data: {
      name: "__e2e__",
      active: false,
      daysPerWeek: 1,
      trainingDays: {
        create: {
          dayNumber: 1,
          label: "E2E day",
          category: "test",
          goal: "test",
          planItems: {
            create: { itemSlug: "e2e-move", kind: "exercise", order: 0, plannedSets: 3, plannedReps: "10", plannedWeightKg: 20 },
          },
        },
      },
    },
    include: { trainingDays: { include: { planItems: true } } },
  });
  try {
    const day = program.trainingDays[0];

    check("no open session before check-in", (await findOpenSessionToday(day.id)) === null);

    const s1 = await createSessionForTemplate(day.id, null, "IN_PROGRESS");
    const open = await findOpenSessionToday(day.id);
    check("check-in creates one open session", open?.id === s1.id);

    const count = await prisma.sessionLog.count({ where: { trainingDayTemplateId: day.id } });
    check("second check-in would resume (guard finds it) → still 1 session", count === 1 && open?.id === s1.id);

    const items = await prisma.sessionItemLog.findMany({ where: { sessionLogId: s1.id } });
    check("session seeded 1 item with planned 3 x 10 @ 20kg", items.length === 1 && items[0].plannedSets === 3 && items[0].plannedReps === "10" && items[0].plannedWeightKg === 20);

    await prisma.sessionPlanItem.update({ where: { id: day.planItems[0].id }, data: { plannedSets: 5 } });
    const after = await prisma.sessionItemLog.findFirst({ where: { sessionLogId: s1.id } });
    check("editing the plan does not rewrite the logged session (snapshot)", after?.plannedSets === 3);

    await prisma.sessionLog.update({ where: { id: s1.id }, data: { status: "COMPLETED", durationSec: 1200 } });
    check("completed session is no longer 'open' (next check-in starts fresh)", (await findOpenSessionToday(day.id)) === null);

    const s2 = await createSessionForTemplate(day.id, null, "IN_PROGRESS");
    const items2 = await prisma.sessionItemLog.findFirst({ where: { sessionLogId: s2.id } });
    check("new session picks up the edited plan (5 sets)", items2?.plannedSets === 5);
  } finally {
    await prisma.sessionLog.deleteMany({ where: { trainingDayTemplate: { weeklyProgramId: program.id } } });
    await prisma.weeklyProgram.delete({ where: { id: program.id } });
    await prisma.$disconnect();
  }
  console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
