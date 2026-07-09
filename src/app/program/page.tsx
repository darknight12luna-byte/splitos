import Link from "next/link";
import { getActiveProgram } from "@/lib/training/program-v2";
import { resolveItem } from "@/lib/training/catalog";
import type { ItemKind } from "@/lib/training/types";
import { Card } from "@/components/ui/Card";

function formatDose(item: {
  plannedSets: number | null;
  plannedReps: string | null;
  plannedWeightKg: number | null;
  plannedDurationSec: number | null;
  plannedSpeed: string | null;
  plannedRestSec: number | null;
}) {
  const parts: string[] = [];
  if (item.plannedSets != null && item.plannedReps) {
    parts.push(`${item.plannedSets} x ${item.plannedReps}`);
  } else if (item.plannedSets != null) {
    parts.push(`${item.plannedSets} sets`);
  } else if (item.plannedReps) {
    parts.push(item.plannedReps);
  }
  if (item.plannedWeightKg != null) parts.push(`${item.plannedWeightKg}kg`);
  if (item.plannedDurationSec != null) {
    parts.push(`${Math.round((item.plannedDurationSec / 60) * 10) / 10} min`);
  }
  if (item.plannedSpeed) parts.push(item.plannedSpeed);
  if (item.plannedRestSec != null) parts.push(`rest ${item.plannedRestSec}s`);
  return parts.length > 0 ? parts.join(" · ") : "no dose specified";
}

export default async function ProgramPage() {
  const program = await getActiveProgram();

  if (!program) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Program</h1>
        <Card>
          <p className="text-sm text-muted">No active weekly program configured.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">{program.name}</h1>
        <p className="text-sm text-muted">
          {program.daysPerWeek}-day rotation · advances automatically each time you check in
        </p>
      </div>

      {program.trainingDays.map((day) => (
        <Card key={day.id} className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Day {day.dayNumber} · {day.category.replace(/_/g, " ")}
            </p>
            <h2 className="text-lg font-bold">{day.label}</h2>
            <p className="text-sm text-muted">{day.goal}</p>
            {day.notes && <p className="mt-1 text-xs italic text-muted">{day.notes}</p>}
          </div>

          <div className="space-y-1.5 border-t border-border pt-3">
            {day.planItems.map((item) => {
              const resolved = resolveItem(item.itemSlug, item.kind as ItemKind);
              const href = item.kind === "technique" ? `/movements/${item.itemSlug}` : `/exercises/${item.itemSlug}`;
              return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  {resolved.kind === "unresolved" ? (
                    <span className="text-muted">{resolved.name}</span>
                  ) : (
                    <Link href={href} className="text-foreground/90 hover:text-accent-blue">
                      {resolved.name}
                    </Link>
                  )}
                  <span className="text-xs text-muted">{formatDose(item)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
