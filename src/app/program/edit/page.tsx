import Link from "next/link";
import { getActiveProgram } from "@/lib/training/program-v2";
import { exercises, resolveItem } from "@/lib/training/catalog";
import type { ItemKind } from "@/lib/training/types";
import { Card } from "@/components/ui/Card";
import { PlanItemEditor } from "@/components/PlanItemEditor";
import { AddExerciseSelect } from "@/components/AddExerciseSelect";

export const dynamic = "force-dynamic";

export default async function EditProgramPage() {
  const program = await getActiveProgram();

  if (!program) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Edit plan</h1>
        <Card>
          <p className="text-sm text-muted">No active weekly program configured.</p>
        </Card>
      </div>
    );
  }

  const options = [...exercises]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => ({ slug: e.slug, name: e.name }));

  return (
    <div className="space-y-6 pb-10">
      <div>
        <Link href="/program" className="text-xs text-muted hover:text-foreground">
          ← Back to program
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Edit plan</h1>
        <p className="text-sm text-muted">
          Change sets, reps, weight, rest, order. Past sessions keep the plan they were done with.
        </p>
      </div>

      {program.trainingDays.map((day) => (
        <Card key={day.id} className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Day {day.dayNumber}</p>
            <h2 className="text-lg font-bold">{day.label}</h2>
          </div>
          {day.planItems.map((item, i) => (
            <PlanItemEditor
              key={item.id}
              id={item.id}
              name={resolveItem(item.itemSlug, item.kind as ItemKind).name}
              plannedSets={item.plannedSets}
              plannedReps={item.plannedReps}
              plannedWeightKg={item.plannedWeightKg}
              plannedRestSec={item.plannedRestSec}
              isFirst={i === 0}
              isLast={i === day.planItems.length - 1}
            />
          ))}
          <AddExerciseSelect dayId={day.id} options={options} />
        </Card>
      ))}
    </div>
  );
}
