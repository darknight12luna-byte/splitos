"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { logItemActual, toggleHighlight, type ActualValuesInput } from "@/lib/actions";
import type { ResolvedItem } from "@/lib/training/catalog";
import { formatLabels } from "@/lib/formatLabel";

const KIND_ICON: Record<string, string> = {
  exercise: "🏋️",
  technique: "🐆",
  unresolved: "❓",
};

const HIGHLIGHT_LABEL: Record<string, string> = {
  exercise: "🏆 PR",
  technique: "✨ Nailed it",
  unresolved: "⭐ Highlight",
};

const STATUS_OPTIONS: { value: ActualValuesInput["completionStatus"]; icon: string; title: string }[] = [
  { value: "PENDING", icon: "–", title: "Not logged yet" },
  { value: "COMPLETED", icon: "✓", title: "Completed as planned" },
  { value: "PARTIAL", icon: "½", title: "Partially completed" },
  { value: "SKIPPED", icon: "✗", title: "Skipped" },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: "border-border text-muted",
  COMPLETED: "border-accent-green bg-accent-green/20 text-accent-green",
  PARTIAL: "border-accent-orange bg-accent-orange/20 text-accent-orange",
  SKIPPED: "border-accent-red bg-accent-red/20 text-accent-red",
};

function secToMin(sec: number | null): string {
  if (sec == null) return "";
  return String(Math.round((sec / 60) * 10) / 10);
}

function minToSec(min: string): number | null {
  const n = Number(min);
  if (!min || Number.isNaN(n)) return null;
  return Math.round(n * 60);
}

function numDelta(actual: number | null, planned: number | null) {
  if (actual == null || planned == null) return null;
  const delta = Math.round((actual - planned) * 100) / 100;
  return delta;
}

function DeltaBadge({ delta, unit }: { delta: number | null; unit: string }) {
  if (delta == null || delta === 0) return null;
  const positive = delta > 0;
  return (
    <span
      className={clsx(
        "ml-1.5 text-xs font-semibold",
        positive ? "text-accent-green" : "text-accent-red"
      )}
    >
      {positive ? "+" : ""}
      {delta}
      {unit}
    </span>
  );
}

interface Props {
  itemId: string;
  resolved: ResolvedItem;
  plannedSets: number | null;
  plannedReps: string | null;
  plannedWeightKg: number | null;
  plannedDurationSec: number | null;
  plannedSpeed: string | null;
  plannedRestSec: number | null;
  plannedTempo: string | null;
  plannedNotes: string | null;
  actualSets: number | null;
  actualReps: string | null;
  actualWeightKg: number | null;
  actualDurationSec: number | null;
  actualSpeed: string | null;
  actualRestSec: number | null;
  actualNotes: string | null;
  completionStatus: string;
  isHighlight: boolean;
}

export function SessionItemLogCard(props: Props) {
  const { itemId, resolved } = props;
  const [status, setStatus] = useState(props.completionStatus);
  const [isHighlight, setIsHighlight] = useState(props.isHighlight);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [actualSets, setActualSets] = useState(props.actualSets?.toString() ?? "");
  const [actualReps, setActualReps] = useState(props.actualReps ?? "");
  const [actualWeightKg, setActualWeightKg] = useState(props.actualWeightKg?.toString() ?? "");
  const [actualDurationMin, setActualDurationMin] = useState(secToMin(props.actualDurationSec));
  const [actualSpeed, setActualSpeed] = useState(props.actualSpeed ?? "");
  const [actualRestSec, setActualRestSec] = useState(props.actualRestSec?.toString() ?? "");
  const [actualNotes, setActualNotes] = useState(props.actualNotes ?? "");

  const markDirty = () => setSaved(false);

  const save = (nextStatus?: ActualValuesInput["completionStatus"]) => {
    const values: ActualValuesInput = {
      actualSets: actualSets ? Number(actualSets) : null,
      actualReps: actualReps || null,
      actualWeightKg: actualWeightKg ? Number(actualWeightKg) : null,
      actualDurationSec: minToSec(actualDurationMin),
      actualSpeed: actualSpeed || null,
      actualRestSec: actualRestSec ? Number(actualRestSec) : null,
      actualNotes: actualNotes || null,
      completionStatus: nextStatus ?? (status as ActualValuesInput["completionStatus"]),
    };
    startTransition(() => {
      logItemActual(itemId, values);
    });
    setSaved(true);
  };

  const ex = resolved.exercise;
  const tech = resolved.technique;
  const executionSteps = ex?.executionSteps ?? tech?.executionSteps ?? [];
  const cues = ex?.cues ?? tech?.keyCues ?? [];
  const mistakes = ex?.mistakes ?? tech?.commonMistakes ?? [];
  const regressions = ex?.regressions ?? tech?.beginnerVersion ?? [];
  const progressions = ex?.progressions ?? tech?.progressionVersion ?? [];
  const media = ex?.mediaReference ?? tech?.mediaReference ?? null;
  const searchQuery = ex?.recommendedSearchQuery ?? tech?.recommendedSearchQuery ?? null;
  const hasDetail =
    executionSteps.length > 0 || cues.length > 0 || mistakes.length > 0 ||
    regressions.length > 0 || progressions.length > 0;

  const showSets = props.plannedSets != null || actualSets !== "";
  const showReps = props.plannedReps != null || actualReps !== "";
  const showWeight = props.plannedWeightKg != null || actualWeightKg !== "";
  const showDuration = props.plannedDurationSec != null || actualDurationMin !== "";
  const showSpeed = props.plannedSpeed != null || actualSpeed !== "";
  const showRest = props.plannedRestSec != null || actualRestSec !== "";

  return (
    <div
      className={clsx(
        "rounded-xl border p-3 transition",
        status === "COMPLETED"
          ? "border-accent-green/40 bg-surface-2"
          : status === "PARTIAL"
          ? "border-accent-orange/40 bg-surface-2"
          : status === "SKIPPED"
          ? "border-accent-red/30 bg-surface-2 opacity-70"
          : "border-border bg-surface"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 text-lg">{KIND_ICON[resolved.kind]}</span>
        <div className="flex-1">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="text-left">
            <p className="font-medium">{resolved.name}</p>
            {resolved.kind === "unresolved" && (
              <p className="text-xs text-muted">not yet in your catalog</p>
            )}
          </button>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {showSets && (
              <label className="text-xs">
                <span className="text-muted">
                  Sets {props.plannedSets != null && <>· planned {props.plannedSets}</>}
                </span>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={actualSets}
                    onChange={(e) => {
                      setActualSets(e.target.value);
                      markDirty();
                    }}
                    className="mt-0.5 w-16 rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent-blue"
                  />
                  <DeltaBadge
                    delta={numDelta(actualSets ? Number(actualSets) : null, props.plannedSets)}
                    unit=""
                  />
                </div>
              </label>
            )}
            {showReps && (
              <label className="text-xs">
                <span className="text-muted">
                  Reps {props.plannedReps != null && <>· planned {props.plannedReps}</>}
                </span>
                <input
                  type="text"
                  value={actualReps}
                  onChange={(e) => {
                    setActualReps(e.target.value);
                    markDirty();
                  }}
                  className="mt-0.5 block w-20 rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent-blue"
                />
              </label>
            )}
            {showWeight && (
              <label className="text-xs">
                <span className="text-muted">
                  Weight (kg) {props.plannedWeightKg != null && <>· planned {props.plannedWeightKg}</>}
                </span>
                <div className="flex items-center">
                  <input
                    type="number"
                    step="0.5"
                    value={actualWeightKg}
                    onChange={(e) => {
                      setActualWeightKg(e.target.value);
                      markDirty();
                    }}
                    className="mt-0.5 w-16 rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent-blue"
                  />
                  <DeltaBadge
                    delta={numDelta(
                      actualWeightKg ? Number(actualWeightKg) : null,
                      props.plannedWeightKg
                    )}
                    unit="kg"
                  />
                </div>
              </label>
            )}
            {showDuration && (
              <label className="text-xs">
                <span className="text-muted">
                  Duration (min){" "}
                  {props.plannedDurationSec != null && <>· planned {secToMin(props.plannedDurationSec)}</>}
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={actualDurationMin}
                  onChange={(e) => {
                    setActualDurationMin(e.target.value);
                    markDirty();
                  }}
                  className="mt-0.5 block w-16 rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent-blue"
                />
              </label>
            )}
            {showSpeed && (
              <label className="text-xs">
                <span className="text-muted">
                  Speed {props.plannedSpeed != null && <>· planned {props.plannedSpeed}</>}
                </span>
                <input
                  type="text"
                  value={actualSpeed}
                  onChange={(e) => {
                    setActualSpeed(e.target.value);
                    markDirty();
                  }}
                  placeholder="e.g. 5 km/h"
                  className="mt-0.5 block w-24 rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent-blue"
                />
              </label>
            )}
            {showRest && (
              <label className="text-xs">
                <span className="text-muted">
                  Rest (s) {props.plannedRestSec != null && <>· planned {props.plannedRestSec}</>}
                </span>
                <input
                  type="number"
                  value={actualRestSec}
                  onChange={(e) => {
                    setActualRestSec(e.target.value);
                    markDirty();
                  }}
                  className="mt-0.5 block w-16 rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent-blue"
                />
              </label>
            )}
          </div>

          {props.plannedTempo && (
            <p className="mt-2 text-xs text-muted">Planned tempo: {props.plannedTempo}</p>
          )}
          {props.plannedNotes && (
            <p className="mt-1 text-xs text-muted">Coach note: {props.plannedNotes}</p>
          )}

          <input
            type="text"
            value={actualNotes}
            onChange={(e) => {
              setActualNotes(e.target.value);
              markDirty();
            }}
            placeholder="Notes on how it felt…"
            className="mt-2 w-full rounded border border-border bg-surface-2 px-2 py-1 text-xs outline-none focus:border-accent-blue"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !isHighlight;
            setIsHighlight(next);
            startTransition(() => toggleHighlight(itemId, next));
          }}
          title={HIGHLIGHT_LABEL[resolved.kind]}
          className={clsx(
            "shrink-0 rounded-lg px-2 py-1 text-xs font-semibold transition",
            isHighlight ? "bg-accent-orange/20 text-accent-orange" : "text-muted hover:text-accent-orange"
          )}
        >
          {isHighlight ? HIGHLIGHT_LABEL[resolved.kind] : "☆"}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              title={opt.title}
              onClick={() => {
                setStatus(opt.value);
                save(opt.value);
              }}
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-md border text-sm font-semibold transition",
                status === opt.value ? STATUS_COLOR[opt.value] : "border-border text-muted hover:text-foreground"
              )}
            >
              {opt.icon}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {!saved && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => save()}
              className="rounded-md bg-accent-blue px-3 py-1 text-xs font-semibold text-background transition hover:brightness-110 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          )}
          {hasDetail && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-muted hover:text-foreground"
            >
              {expanded ? "Hide detail" : "Technique detail"}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-border pt-3 text-sm">
          {resolved.kind === "unresolved" ? (
            <p className="text-muted">
              No catalog entry for <span className="font-mono">{resolved.slug}</span> yet.
            </p>
          ) : (
            <>
              {executionSteps.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    Execution
                  </p>
                  <ol className="list-decimal space-y-1 pl-4 text-foreground/90">
                    {executionSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              {cues.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Cues</p>
                  <p className="text-foreground/90">{formatLabels(cues).join(" · ")}</p>
                </div>
              )}
              {mistakes.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    Common mistakes
                  </p>
                  <p className="text-accent-red/90">{formatLabels(mistakes).join(" · ")}</p>
                </div>
              )}
              {regressions.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    {ex ? "Regressions" : "Beginner version"}
                  </p>
                  <p className="text-foreground/90">{formatLabels(regressions).join(" · ")}</p>
                </div>
              )}
              {progressions.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    Progressions
                  </p>
                  <p className="text-foreground/90">{formatLabels(progressions).join(" → ")}</p>
                </div>
              )}
              {media?.url ? (
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-accent-blue underline"
                >
                  ▶ {media.title ?? "Watch reference"}
                </a>
              ) : searchQuery ? (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-accent-blue underline"
                >
                  🔍 Search &quot;{searchQuery}&quot;
                </a>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
