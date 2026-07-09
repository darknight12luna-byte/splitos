import { notFound } from "next/navigation";
import Link from "next/link";
import { getExerciseBySlug } from "@/lib/training/catalog";
import { getItemHistory } from "@/lib/training/history";
import { getExerciseCategoryColor } from "@/lib/training/category-theme";
import { Card } from "@/components/ui/Card";
import { ItemHistoryCard } from "@/components/library/ItemHistoryCard";
import { WatchAndLearn } from "@/components/WatchAndLearn";
import { NumberedSteps } from "@/components/library/NumberedSteps";
import { DetailTabs } from "@/components/library/DetailTabs";
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

function MuscleBadge({ label, tone }: { label: string; tone: "primary" | "secondary" }) {
  return (
    <span
      className={
        tone === "primary"
          ? "rounded-full bg-accent-blue/15 px-2.5 py-1 text-xs font-medium text-accent-blue"
          : "rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted"
      }
    >
      {label}
    </span>
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
  const categoryColor = getExerciseCategoryColor(exercise.category);

  return (
    <div className="space-y-6 pb-10">
      <div
        className="-mx-4 -mt-6 px-4 pb-6 pt-8 sm:-mx-6 sm:px-6"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, ${categoryColor} 22%, var(--background)), var(--background) 85%)`,
        }}
      >
        <Link href="/exercises" className="text-xs text-muted hover:text-foreground">
          ← Exercise Library
        </Link>
        <h1 className="mt-1 text-2xl font-bold">{exercise.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
            style={{
              color: categoryColor,
              background: `color-mix(in oklab, ${categoryColor} 15%, transparent)`,
            }}
          >
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

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-xs text-muted">Sets</p>
          <p className="text-xl font-bold">{exercise.defaultSets ?? "—"}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-muted">Reps</p>
          <p className="text-xl font-bold">{exercise.defaultReps ?? "—"}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-muted">Rest</p>
          <p className="text-xl font-bold">{exercise.defaultRest ?? "—"}</p>
        </Card>
      </div>

      <WatchAndLearn
        videoId={extractYouTubeId(exercise.mediaReference?.url)}
        title={exercise.mediaReference?.title ?? exercise.name}
        tiktokQuery={exercise.recommendedSearchQuery}
      />

      <DetailTabs
        tabs={[
          {
            label: "Instructions",
            content: (
              <>
                <Card className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Execution Steps
                  </h2>
                  <NumberedSteps steps={exercise.executionSteps} />
                </Card>
                <Card className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Cues</h2>
                  <ListOrPlaceholder items={formatLabels(exercise.cues)} />
                </Card>
                <Card className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Common Mistakes
                  </h2>
                  <ListOrPlaceholder items={formatLabels(exercise.mistakes)} />
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
              </>
            ),
          },
          {
            label: "Muscles",
            content: (
              <Card className="space-y-4">
                <div>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Primary
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {formatLabels(exercise.primaryMuscles).map((m) => (
                      <MuscleBadge key={m} label={m} tone="primary" />
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Secondary
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {formatLabels(exercise.secondaryMuscles).map((m) => (
                      <MuscleBadge key={m} label={m} tone="secondary" />
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Equipment
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {formatLabels(exercise.equipment).map((m) => (
                      <MuscleBadge key={m} label={m} tone="secondary" />
                    ))}
                  </div>
                </div>
              </Card>
            ),
          },
          {
            label: "History",
            content: <ItemHistoryCard history={history} />,
          },
          {
            label: "Progress",
            content: (
              <Card className="space-y-2 text-center">
                <p className="text-xs text-muted">Best Weight</p>
                <p className="text-2xl font-bold text-accent-lime">
                  {history.bestWeightKg != null ? `${history.bestWeightKg} kg` : "—"}
                </p>
                <p className="text-xs text-muted">
                  {history.complianceRate != null
                    ? `${history.complianceRate}% compliance across ${history.timesLogged} logged sessions`
                    : "No compliance data yet."}
                </p>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
