import Link from "next/link";
import { getActiveProgram } from "@/lib/training/program-v2";
import { getWeeklySplitStatus, actionLabel } from "@/lib/training/split-status";
import { resolveItem } from "@/lib/training/catalog";
import type { ItemKind } from "@/lib/training/types";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

function sessionHref(id: string, status: string) {
  return status === "COMPLETED" || status === "SKIPPED" ? `/content?session=${id}` : `/session/${id}`;
}

function formatRelative(date: Date | null) {
  if (!date) return "never";
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

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
  const [program, splitStatus] = await Promise.all([getActiveProgram(), getWeeklySplitStatus()]);

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

  const statusById = new Map(splitStatus.map((s) => [s.id, s]));

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">{program.name}</h1>
        <p className="text-sm text-muted">
          {program.daysPerWeek}-day rotation · advances automatically each time you check in
        </p>
      </div>

      {program.trainingDays.map((day) => {
        const status = statusById.get(day.id);
        const todaySession = status?.todaySession ?? null;

        return (
        <Card key={day.id} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                Day {day.dayNumber} · {day.category.replace(/_/g, " ")}
              </p>
              <h2 className="text-lg font-bold">{day.label}</h2>
              <p className="text-sm text-muted">{day.goal}</p>
              {day.notes && <p className="mt-1 text-xs italic text-muted">{day.notes}</p>}
            </div>
            <StatusBadge status={todaySession?.status ?? "NOT_STARTED"} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
            <span>
              This week: <span className="font-semibold text-foreground">{status?.thisWeekCount ?? 0}</span>{" "}
              session{status?.thisWeekCount === 1 ? "" : "s"}
            </span>
            <span>Last: {formatRelative(status?.lastPerformed?.date ?? null)}</span>
          </div>

          {todaySession ? (
            <Link
              href={sessionHref(todaySession.id, todaySession.status)}
              className="block rounded-lg bg-accent-blue px-3 py-2 text-center text-sm font-semibold text-on-accent transition hover:brightness-110"
            >
              {actionLabel(todaySession.status, "Open")} →
            </Link>
          ) : (
            <Link
              href={`/checkin?day=${day.id}`}
              className="block rounded-lg border border-accent-lime/40 px-3 py-2 text-center text-sm font-semibold text-accent-lime transition hover:bg-accent-lime/10"
            >
              Start Now ⚡
            </Link>
          )}

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
        );
      })}
    </div>
  );
}
