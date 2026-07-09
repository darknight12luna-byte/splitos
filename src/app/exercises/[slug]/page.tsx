import { notFound } from "next/navigation";
import Link from "next/link";
import { getExerciseBySlug } from "@/lib/training/catalog";
import { getItemHistory } from "@/lib/training/history";
import { Card } from "@/components/ui/Card";
import { ItemHistoryCard } from "@/components/library/ItemHistoryCard";

function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

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

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exercise = getExerciseBySlug(slug);
  if (!exercise) notFound();
  const history = await getItemHistory(slug);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <Link href="/exercises" className="text-xs text-muted hover:text-foreground">
          ← Exercise Library
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{exercise.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize text-accent-blue">
            {exercise.category.replace(/_/g, " ")}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize text-muted">
            {exercise.movementPattern.replace(/_/g, " ")}
          </span>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize text-muted">
            {exercise.difficulty.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <ItemHistoryCard history={history} />

      <Card className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-muted">Sets</p>
          <p className="font-semibold">{exercise.defaultSets ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Reps</p>
          <p className="font-semibold">{exercise.defaultReps ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Rest</p>
          <p className="font-semibold">{exercise.defaultRest ?? "—"}</p>
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Muscles</h2>
        <p className="text-sm">
          <span className="text-muted">Primary: </span>
          {exercise.primaryMuscles.join(", ") || "—"}
        </p>
        <p className="text-sm">
          <span className="text-muted">Secondary: </span>
          {exercise.secondaryMuscles.join(", ") || "—"}
        </p>
        <p className="text-sm">
          <span className="text-muted">Equipment: </span>
          {exercise.equipment.join(", ") || "—"}
        </p>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Execution Steps
        </h2>
        <ListOrPlaceholder items={exercise.executionSteps} />
      </Card>

      <Card className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Cues</h2>
        <ListOrPlaceholder items={exercise.cues} />
      </Card>

      <Card className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Common Mistakes
        </h2>
        <ListOrPlaceholder items={exercise.mistakes} />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Regressions
          </h2>
          <ListOrPlaceholder items={exercise.regressions} />
        </Card>
        <Card className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Progressions
          </h2>
          <ListOrPlaceholder items={exercise.progressions} />
        </Card>
      </div>

      {(exercise.coachNotes.length > 0 || exercise.beginnerInstructions.length > 0) && (
        <Card className="space-y-3">
          {exercise.coachNotes.length > 0 && (
            <div>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Coach Notes
              </h2>
              <ListOrPlaceholder items={exercise.coachNotes} />
            </div>
          )}
          {exercise.beginnerInstructions.length > 0 && (
            <div>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Beginner Instructions
              </h2>
              <ListOrPlaceholder items={exercise.beginnerInstructions} />
            </div>
          )}
        </Card>
      )}

      <Card>
        {exercise.mediaReference?.url ? (
          <a
            href={exercise.mediaReference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue underline"
          >
            ▶ {exercise.mediaReference.title ?? "Watch reference"}
          </a>
        ) : (
          <a
            href={youtubeSearchUrl(exercise.recommendedSearchQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue underline"
          >
            🔍 Search &quot;{exercise.recommendedSearchQuery}&quot;
          </a>
        )}
      </Card>
    </div>
  );
}
