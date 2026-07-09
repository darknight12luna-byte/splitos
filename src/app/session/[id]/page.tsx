import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveItem } from "@/lib/training/catalog";
import type { ItemKind } from "@/lib/training/types";
import { Card } from "@/components/ui/Card";
import { SessionItemLogCard } from "@/components/SessionItemLogCard";
import { SessionRunner } from "@/components/SessionRunner";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await prisma.sessionLog.findUnique({
    where: { id },
    include: { itemLogs: { orderBy: { order: "asc" } } },
  });

  if (!session) notFound();

  const tags = session.tags.split(",").filter(Boolean);
  const completedCount = session.itemLogs.filter((i) => i.completionStatus === "COMPLETED").length;
  const progressPct = session.itemLogs.length
    ? Math.round((completedCount / session.itemLogs.length) * 100)
    : 0;

  return (
    <SessionRunner sessionId={session.id}>
      <div>
        <p className="text-xs text-muted">
          {session.dayLabel} ·{" "}
          {new Date(session.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <h1 className="text-2xl font-bold">{session.title}</h1>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Progress</span>
          <span className="font-semibold text-accent-green">{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-accent-green transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-accent-blue"
            >
              {t}
            </span>
          ))}
        </div>
      </Card>

      <div className="space-y-2">
        {session.itemLogs.map((item) => (
          <SessionItemLogCard
            key={item.id}
            itemId={item.id}
            resolved={resolveItem(item.itemSlug, item.kind as ItemKind)}
            plannedSets={item.plannedSets}
            plannedReps={item.plannedReps}
            plannedWeightKg={item.plannedWeightKg}
            plannedDurationSec={item.plannedDurationSec}
            plannedSpeed={item.plannedSpeed}
            plannedRestSec={item.plannedRestSec}
            plannedTempo={item.plannedTempo}
            plannedNotes={item.plannedNotes}
            actualSets={item.actualSets}
            actualReps={item.actualReps}
            actualWeightKg={item.actualWeightKg}
            actualDurationSec={item.actualDurationSec}
            actualSpeed={item.actualSpeed}
            actualRestSec={item.actualRestSec}
            actualNotes={item.actualNotes}
            completionStatus={item.completionStatus}
            isHighlight={item.isHighlight}
          />
        ))}
      </div>
    </SessionRunner>
  );
}
