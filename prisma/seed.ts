/**
 * Seeds the V2 weekly program: one WeeklyProgram, 4 TrainingDayTemplates, and their
 * SessionPlanItem prescriptions.
 *
 * Planned weight/duration/speed/tempo values below are illustrative starting numbers —
 * your source catalog (data-sources/training-history.md) only documents sets/reps/rest for
 * most exercises, never absolute load, since that's inherently something that changes as you
 * progress rather than a fixed catalog attribute. Treat these as an editable example program,
 * not a claim about your historical lifts. Overwrite them with your real working numbers.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type PlanItemSeed = {
  slug: string;
  kind: "exercise" | "technique";
  sets?: number;
  reps?: string;
  weightKg?: number;
  durationSec?: number;
  speed?: string;
  restSec?: number;
  tempo?: string;
  notes?: string;
};

const DAY_1_UPPER: PlanItemSeed[] = [
  { slug: "arm-circles", kind: "exercise", sets: 1, reps: "15 each direction", restSec: 20 },
  { slug: "band-pull-apart", kind: "exercise", sets: 2, reps: "15", restSec: 30 },
  { slug: "scapular-push-up", kind: "exercise", sets: 2, reps: "10", restSec: 30 },
  { slug: "wrist-circles-finger-pumps", kind: "exercise", durationSec: 90, restSec: 15 },
  {
    slug: "flat-db-bench-press",
    kind: "exercise",
    sets: 3,
    reps: "8-12",
    weightKg: 15,
    restSec: 90,
    tempo: "2-1-2-0",
    notes: "Restart lighter after any break; return to 17.5kg once reps are consistent.",
  },
  { slug: "seated-row", kind: "exercise", sets: 3, reps: "8-10", weightKg: 25, restSec: 90 },
  { slug: "lat-pulldown", kind: "exercise", sets: 3, reps: "8-10", weightKg: 30, restSec: 90 },
  { slug: "db-shoulder-press", kind: "exercise", sets: 3, reps: "8-10", weightKg: 12, restSec: 90 },
  { slug: "cable-lateral-raise", kind: "exercise", sets: 3, reps: "10-15", weightKg: 5, restSec: 60 },
  {
    slug: "cable-triceps-pressdown",
    kind: "exercise",
    sets: 3,
    reps: "10-12",
    weightKg: 15,
    restSec: 60,
  },
  { slug: "db-hammer-curl", kind: "exercise", sets: 3, reps: "10-12", weightKg: 10, restSec: 60 },
  { slug: "dead-bug", kind: "exercise", sets: 2, reps: "8 each side", restSec: 30 },
];

const DAY_2_LOWER: PlanItemSeed[] = [
  { slug: "treadmill-walk", kind: "exercise", durationSec: 300, speed: "5 km/h", notes: "Warm-up pace" },
  { slug: "bodyweight-squat", kind: "exercise", sets: 2, reps: "15", restSec: 30 },
  {
    slug: "leg-press",
    kind: "exercise",
    sets: 4,
    reps: "10",
    weightKg: 80,
    restSec: 90,
    notes: "Knees tracking over toes, full control on the negative.",
  },
  { slug: "leg-curl", kind: "exercise", sets: 3, reps: "10-12", weightKg: 20, restSec: 75 },
  {
    slug: "db-romanian-deadlift",
    kind: "exercise",
    sets: 3,
    reps: "10",
    weightKg: 14,
    restSec: 90,
    notes: "Weight per hand.",
  },
  { slug: "standing-calf-raise", kind: "exercise", sets: 3, reps: "12-15", weightKg: 20, restSec: 60 },
  { slug: "glute-bridge", kind: "exercise", sets: 2, reps: "12", restSec: 45 },
  {
    slug: "dead-bug",
    kind: "exercise",
    sets: 2,
    reps: "8 each side",
    restSec: 30,
    notes: "Source template offered cable crunch or dead bug — dead bug chosen for lower-day core work.",
  },
  { slug: "cooldown-walk", kind: "exercise", durationSec: 300, speed: "4 km/h" },
];

const DAY_3_ANIMAL_FLOW: PlanItemSeed[] = [
  { slug: "leg-swings", kind: "exercise", sets: 1, reps: "10-15 each", restSec: 20 },
  { slug: "wrist-circles-finger-pumps", kind: "exercise", durationSec: 90, restSec: 15 },
  { slug: "wrist-mobilization", kind: "technique", durationSec: 60, restSec: 15 },
  { slug: "beast-rock", kind: "exercise", sets: 2, durationSec: 20, restSec: 30 },
  { slug: "static-beast", kind: "technique", sets: 2, durationSec: 20, restSec: 30 },
  {
    slug: "beast-side-kickthrough",
    kind: "technique",
    sets: 2,
    reps: "4 each side",
    restSec: 45,
    notes: "Suggested dose from source: 2 x 4/side.",
  },
  {
    slug: "table-hand-foot-tap-hip-slide",
    kind: "technique",
    sets: 2,
    reps: "8 each side",
    restSec: 30,
  },
  { slug: "knee-forward-squat-tap", kind: "technique", sets: 2, reps: "10", restSec: 30 },
];

const DAY_4_MIXED: PlanItemSeed[] = [
  { slug: "arm-circles", kind: "exercise", sets: 1, reps: "15 each direction", restSec: 20 },
  { slug: "bodyweight-squat", kind: "exercise", sets: 2, reps: "15", restSec: 30 },
  { slug: "panatta-chest-press", kind: "exercise", sets: 3, reps: "10", weightKg: 25, restSec: 90 },
  { slug: "lat-pulldown", kind: "exercise", sets: 3, reps: "8-10", weightKg: 28, restSec: 90 },
  {
    slug: "leg-press",
    kind: "exercise",
    sets: 3,
    reps: "10",
    weightKg: 70,
    restSec: 90,
    notes: "Lighter than Day 2 — this is a maintenance day, not a second leg day.",
  },
  { slug: "standing-calf-raise", kind: "exercise", sets: 2, reps: "15", weightKg: 15, restSec: 60 },
  { slug: "hanging-knee-raise", kind: "exercise", sets: 2, reps: "10", restSec: 45 },
  { slug: "knee-forward-squat-tap", kind: "technique", sets: 2, reps: "10", restSec: 30 },
  { slug: "cooldown-walk", kind: "exercise", durationSec: 240, speed: "4 km/h" },
];

const PROGRAM = [
  {
    dayNumber: 1,
    label: "Upper Body",
    category: "upper_body",
    goal: "Muscle density, push/pull balance, shoulders and back emphasis.",
    notes: "Restart lighter after any pause; don't chase benchmark loads on the first session back.",
    items: DAY_1_UPPER,
  },
  {
    dayNumber: 2,
    label: "Lower Body",
    category: "lower_body",
    goal: "Lower body strength and posterior chain, moderate controlled fatigue.",
    notes: "Avoid excessive hamstring fatigue — keep quality high over adding sets.",
    items: DAY_2_LOWER,
  },
  {
    dayNumber: 3,
    label: "Animal Flow / Mobility",
    category: "animal_flow",
    goal: "Quadrupedal strength, wrist prep, and coordination work — primal movement day.",
    notes: "Progress wrist prep -> activation -> transitions -> linked flow. Don't rush transitions.",
    items: DAY_3_ANIMAL_FLOW,
  },
  {
    dayNumber: 4,
    label: "Mixed / Optional",
    category: "mixed",
    goal: "Light full-body maintenance day — upper + lower + mobility variation.",
    notes: "Lower total volume than Day 1/2. Use this slot for whatever your readiness supports.",
    items: DAY_4_MIXED,
  },
];

async function main() {
  await prisma.weeklyProgram.updateMany({ where: { active: true }, data: { active: false } });

  const program = await prisma.weeklyProgram.create({
    data: { name: "My 4-Day Split", daysPerWeek: 4, active: true },
  });

  for (const day of PROGRAM) {
    const dayTemplate = await prisma.trainingDayTemplate.create({
      data: {
        weeklyProgramId: program.id,
        dayNumber: day.dayNumber,
        label: day.label,
        category: day.category,
        goal: day.goal,
        notes: day.notes,
      },
    });

    for (let i = 0; i < day.items.length; i++) {
      const item = day.items[i];
      await prisma.sessionPlanItem.create({
        data: {
          trainingDayTemplateId: dayTemplate.id,
          itemSlug: item.slug,
          kind: item.kind,
          order: i,
          plannedSets: item.sets ?? null,
          plannedReps: item.reps ?? null,
          plannedWeightKg: item.weightKg ?? null,
          plannedDurationSec: item.durationSec ?? null,
          plannedSpeed: item.speed ?? null,
          plannedRestSec: item.restSec ?? null,
          plannedTempo: item.tempo ?? null,
          plannedNotes: item.notes ?? null,
        },
      });
    }
  }

  console.log(`Seeded WeeklyProgram "${program.name}" with ${PROGRAM.length} training days.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
