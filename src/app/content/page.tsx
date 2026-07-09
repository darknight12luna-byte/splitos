import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveChallenge } from "@/lib/challenge";
import { resolveItem } from "@/lib/training/catalog";
import type { ItemKind } from "@/lib/training/types";
import { Card } from "@/components/ui/Card";
import { CaptionBox } from "@/components/CaptionBox";
import { SessionPicker } from "@/components/SessionPicker";

export const dynamic = "force-dynamic";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionId } = await searchParams;

  const session = sessionId
    ? await prisma.sessionLog.findUnique({
        where: { id: sessionId },
        include: { itemLogs: { orderBy: { order: "asc" } } },
      })
    : await prisma.sessionLog.findFirst({
        where: { status: { in: ["COMPLETED", "PARTIAL"] } },
        orderBy: { date: "desc" },
        include: { itemLogs: { orderBy: { order: "asc" } } },
      });

  if (!session) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Content</h1>
        <Card>
          <p className="text-sm text-muted">
            Finish a workout session first — I&apos;ll draft a caption and pull together
            everything you need to post here.
          </p>
        </Card>
      </div>
    );
  }

  const dayStart = new Date(session.date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [recentCompleted, media, challenge] = await Promise.all([
    prisma.sessionLog.findMany({
      where: { status: { in: ["COMPLETED", "PARTIAL"] } },
      orderBy: { date: "desc" },
      take: 10,
      select: { id: true, title: true, date: true },
    }),
    prisma.mediaEntry.findMany({
      where: { date: { gte: dayStart, lt: dayEnd } },
      orderBy: { date: "desc" },
    }),
    getActiveChallenge(),
  ]);

  const completedItems = session.itemLogs.filter((i) => i.completionStatus === "COMPLETED");
  const highlightCount = session.itemLogs.filter((i) => i.isHighlight).length;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-sm text-muted">Everything you need to post this session.</p>
        </div>
        {recentCompleted.length > 1 && (
          <SessionPicker
            sessions={recentCompleted.map((s) => ({
              id: s.id,
              title: s.title,
              date: s.date.toISOString(),
            }))}
            currentId={session.id}
          />
        )}
      </div>

      <Card>
        <p className="text-xs text-muted">
          {new Date(session.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <h2 className="text-lg font-bold">{session.title}</h2>
      </Card>

      {challenge && (
        <Card className="flex items-center gap-3 border-accent-blue/40 bg-surface-2">
          <span className="text-xl">🔥</span>
          <p className="text-sm">
            Day <span className="font-bold text-accent-blue">{challenge.dayNumber}</span>/
            {challenge.durationDays} of <span className="font-semibold">{challenge.name}</span>
          </p>
        </Card>
      )}

      <Card>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Caption</h3>
        <CaptionBox sessionId={session.id} caption={session.caption ?? ""} />
      </Card>

      <Card>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          What You Did ({completedItems.length} moves
          {highlightCount > 0 ? `, ${highlightCount} highlight${highlightCount > 1 ? "s" : ""}` : ""})
        </h3>
        <ul className="space-y-1.5 text-sm">
          {completedItems.map((item) => {
            const resolved = resolveItem(item.itemSlug, item.kind as ItemKind);
            const doseParts = [
              item.actualSets != null && item.actualReps
                ? `${item.actualSets} x ${item.actualReps}`
                : item.actualSets != null
                ? `${item.actualSets} sets`
                : item.actualReps,
              item.actualWeightKg != null ? `${item.actualWeightKg}kg` : null,
            ].filter(Boolean);
            const dose = doseParts.length > 0 ? doseParts.join(" · ") : resolved.dose ?? "—";
            return (
              <li key={item.id} className="flex items-center justify-between">
                <span>
                  {resolved.name}
                  {item.isHighlight && " 🏆"}
                </span>
                <span className="text-muted">{dose}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Media from today
        </h3>
        {media.length === 0 ? (
          <p className="text-sm text-muted">
            No photos or clips logged for this day yet — add some from the{" "}
            <Link href="/dashboard" className="text-accent-blue underline">
              Dashboard
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {media.map((m) => (
              <div
                key={m.id}
                className="aspect-square overflow-hidden rounded-lg border border-border bg-surface-2"
              >
                {m.mediaType === "video" ? (
                  <video src={m.filePath} className="h-full w-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.filePath}
                    alt={m.caption ?? ""}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
