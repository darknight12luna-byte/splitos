"use client";

import { useEffect } from "react";
import { resolveItem } from "@/lib/training/catalog";
import { WatchAndLearn } from "@/components/WatchAndLearn";
import { NumberedSteps } from "@/components/library/NumberedSteps";
import { formatLabels } from "@/lib/formatLabel";
import { extractYouTubeId } from "@/lib/youtube";
import type { DrawerTarget } from "@/lib/exercise-drawer-context";

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm italic text-muted">Not documented yet.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs">
          {item}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm italic text-muted">Not documented yet.</p>;
  return (
    <ul className="list-disc space-y-1 pl-4 text-sm">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function StatCard({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3 text-center">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-lg font-bold">{value ?? "—"}</p>
    </div>
  );
}

export function ExerciseDetailDrawer({
  target,
  onClose,
}: {
  target: DrawerTarget | null;
  onClose: () => void;
}) {
  const open = target !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!target) return null;

  const resolved = resolveItem(target.slug, target.kind);
  const ex = resolved.exercise;
  const tech = resolved.technique;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        type="button"
        aria-label="Close detail"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-b-0 border-border bg-surface shadow-2xl animate-[slideUp_0.25s_ease-out]">
        <div className="relative flex shrink-0 flex-col items-center pt-3">
          <div className="h-1.5 w-10 rounded-full bg-border" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-2 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-8 pt-3">
          {!ex && !tech ? (
            <div className="py-10 text-center">
              <p className="text-lg font-semibold">{target.name}</p>
              <p className="mt-2 text-sm text-muted">No detail available yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">{ex?.name ?? tech?.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize text-muted">
                    {(ex?.category ?? tech?.parentSystem ?? "").replace(/_/g, " ")}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize text-muted">
                    {(ex?.difficulty ?? tech?.difficulty ?? "").replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <WatchAndLearn
                videoId={extractYouTubeId((ex ?? tech)?.mediaReference?.url)}
                title={(ex ?? tech)?.mediaReference?.title ?? (ex?.name ?? tech?.name ?? target.name)}
                tiktokQuery={ex?.recommendedSearchQuery ?? tech?.recommendedSearchQuery ?? target.name}
              />

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Prescription
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {ex ? (
                    <>
                      <StatCard label="Sets" value={ex.defaultSets} />
                      <StatCard label="Reps" value={ex.defaultReps} />
                      <StatCard label="Rest" value={ex.defaultRest} />
                    </>
                  ) : (
                    <>
                      <StatCard label="Dose" value={tech?.suggestedDose ?? null} />
                      <StatCard label="Frequency" value={tech?.suggestedFrequency ?? null} />
                      <StatCard label="Type" value={(tech?.techniqueType ?? "").replace(/_/g, " ") || null} />
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Execution Steps
                </h3>
                <NumberedSteps steps={ex?.executionSteps ?? tech?.executionSteps ?? []} />
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Key Cues
                </h3>
                <ChipList items={formatLabels(ex?.cues ?? tech?.keyCues ?? [])} />
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Common Mistakes
                </h3>
                <BulletList items={formatLabels(ex?.mistakes ?? tech?.commonMistakes ?? [])} />
              </div>

              {(ex?.beginnerInstructions?.length || tech?.beginnerVersion?.length) ? (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Beginner Version
                  </h3>
                  <BulletList items={ex?.beginnerInstructions ?? tech?.beginnerVersion ?? []} />
                </div>
              ) : null}

              {(ex?.progressions?.length || tech?.progressionVersion?.length) ? (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Progression
                  </h3>
                  <BulletList items={ex?.progressions ?? formatLabels(tech?.progressionVersion ?? [])} />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
