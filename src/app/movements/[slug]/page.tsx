import { notFound } from "next/navigation";
import Link from "next/link";
import { getTechniqueBySlug } from "@/lib/training/catalog";
import { getItemHistory } from "@/lib/training/history";
import { Card } from "@/components/ui/Card";
import { ItemHistoryCard } from "@/components/library/ItemHistoryCard";
import { WatchAndLearn } from "@/components/WatchAndLearn";
import { formatLabels } from "@/lib/formatLabel";
import { extractYouTubeId } from "@/lib/youtube";

function ListOrPlaceholder({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="italic text-muted">Not documented in your source yet.</p>;
  }
  return (
    <ul className="list-disc space-y-1 pl-4">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default async function MovementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const technique = getTechniqueBySlug(slug);
  if (!technique) notFound();
  const history = await getItemHistory(slug);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <Link href="/movements" className="text-xs text-muted hover:text-foreground">
          ← Movement Library
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{technique.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize text-accent-blue">
            {technique.parentSystem.replace(/_/g, " ")}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize text-muted">
            {technique.techniqueType.replace(/_/g, " ")}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize text-muted">
            {technique.difficulty.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <ItemHistoryCard history={history} />

      {(technique.suggestedDose || technique.suggestedFrequency) && (
        <Card className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-xs text-muted">Suggested Dose</p>
            <p className="font-semibold">{technique.suggestedDose ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Frequency</p>
            <p className="font-semibold">{technique.suggestedFrequency ?? "—"}</p>
          </div>
        </Card>
      )}

      <Card className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          What It Trains
        </h2>
        <p className="text-sm">{formatLabels(technique.whatItTrains).join(", ") || "—"}</p>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Execution Steps
        </h2>
        <ListOrPlaceholder items={technique.executionSteps} />
      </Card>

      <Card className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Key Cues</h2>
        <ListOrPlaceholder items={formatLabels(technique.keyCues)} />
      </Card>

      <Card className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Common Mistakes
        </h2>
        <ListOrPlaceholder items={formatLabels(technique.commonMistakes)} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Beginner Version
          </h2>
          <ListOrPlaceholder items={technique.beginnerVersion} />
        </Card>
        <Card className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Progression Path
          </h2>
          <ListOrPlaceholder items={formatLabels(technique.progressionVersion)} />
        </Card>
      </div>

      {technique.coachNotes.length > 0 && (
        <Card className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Coach Notes
          </h2>
          <ListOrPlaceholder items={technique.coachNotes} />
        </Card>
      )}

      <WatchAndLearn
        videoId={extractYouTubeId(technique.mediaReference?.url)}
        title={technique.mediaReference?.title ?? technique.name}
        tiktokQuery={technique.recommendedSearchQuery}
      />
      {technique.mediaReference?.source && (
        <p className="-mt-3 px-1 text-xs text-muted">Source: {technique.mediaReference.source}</p>
      )}
    </div>
  );
}
