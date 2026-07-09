import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveItem } from "@/lib/training/catalog";
import type { ItemKind } from "@/lib/training/types";
import { getCategoryTheme } from "@/lib/training/category-theme";
import { Card } from "@/components/ui/Card";
import { SessionItemLogCard } from "@/components/SessionItemLogCard";
import { SessionRunner } from "@/components/SessionRunner";

export const dynamic = "force-dynamic";

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
  const theme = getCategoryTheme(tags[0] ?? "");

  return (
    <SessionRunner sessionId={session.id}>
      <div
        className="-mx-4 -mt-6 px-4 pb-6 pt-8 sm:-mx-6 sm:px-6"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, ${theme.color} 25%, var(--background)), var(--background) 85%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl leading-none" aria-hidden>
            {theme.emoji}
          </span>
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
        </div>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Progress</span>
          <span className="font-semibold" style={{ color: theme.color }}>
            {completedCount}/{session.itemLogs.length} · {progressPct}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full transition-all"
            style={{ width: `${progressPct}%`, background: theme.color }}
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
