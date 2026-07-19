"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { logItemActual, toggleHighlight, type ActualValuesInput, type SetDetailInput } from "@/lib/actions";
import type { ResolvedItem } from "@/lib/training/catalog";
import { formatLabels } from "@/lib/formatLabel";
import { useExerciseDrawer } from "@/lib/exercise-drawer-context";
import { useRestTimer } from "@/lib/rest-timer-context";

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
  COMPLETED: "border-accent-lime bg-accent-lime/20 text-accent-lime",
  PARTIAL: "border-accent-orange bg-accent-orange/20 text-accent-orange",
  SKIPPED: "border-accent-red bg-accent-red/20 text-accent-red",
};

const SKIP_REASONS = ["Machine busy", "No time", "Pain / discomfort", "Too tired"];

interface SetRow {
  reps: string;
  weightKg: string;
  done: boolean;
}

function parseSetDetails(raw: unknown): SetRow[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((r) => {
    const o = r as { reps?: unknown; weightKg?: unknown; done?: unknown };
    return {
      reps: typeof o?.reps === "string" ? o.reps : "",
      weightKg: typeof o?.weightKg === "number" ? String(o.weightKg) : "",
      done: o?.done === true,
    };
  });
}

function toSetPayload(rows: SetRow[]): SetDetailInput[] {
  return rows.map((r) => ({
    reps: r.reps.trim() || null,
    weightKg: r.weightKg !== "" && !Number.isNaN(Number(r.weightKg)) ? Number(r.weightKg) : null,
    done: r.done,
  }));
}

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

function Stepper({
  value,
  onChange,
  step,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  step: number;
  className?: string;
}) {
  const bump = (dir: 1 | -1) => {
    const current = Number(value) || 0;
    const next = Math.max(0, Math.round((current + dir * step) * 100) / 100);
    onChange(String(next));
  };
  return (
    <div className={clsx("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={() => bump(-1)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border text-xs text-muted transition hover:text-foreground"
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 rounded border border-border bg-surface-2 px-1 py-1 text-center text-sm outline-none focus:border-accent-blue"
      />
      <button
        type="button"
        onClick={() => bump(1)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border text-xs text-muted transition hover:text-foreground"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

function DeltaBadge({ delta, unit }: { delta: number | null; unit: string }) {
  if (delta == null || delta === 0) return null;
  const positive = delta > 0;
  return (
    <span
      className={clsx(
        "ml-1.5 text-xs font-semibold",
        positive ? "text-accent-lime" : "text-accent-red"
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
  setDetails: unknown;
  completionStatus: string;
  isHighlight: boolean;
}

export function SessionItemLogCard(props: Props) {
  const { itemId, resolved } = props;
  const drawer = useExerciseDrawer();
  const restTimer = useRestTimer();
  const [status, setStatus] = useState(props.completionStatus);
  const [isHighlight, setIsHighlight] = useState(props.isHighlight);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [actualSets, setActualSets] = useState(props.actualSets?.toString() ?? "");
  const [actualReps, setActualReps] = useState(props.actualReps ?? "");
  const [actualWeightKg, setActualWeightKg] = useState(props.actualWeightKg?.toString() ?? "");
  const [actualDurationMin, setActualDurationMin] = useState(secToMin(props.actualDurationSec));
  const [actualSpeed, setActualSpeed] = useState(props.actualSpeed ?? "");
  const [actualRestSec, setActualRestSec] = useState(props.actualRestSec?.toString() ?? "");
  const [actualNotes, setActualNotes] = useState(props.actualNotes ?? "");
  const [setRows, setSetRows] = useState<SetRow[] | null>(() => parseSetDetails(props.setDetails));

  const markDirty = () => setSaved(false);

  const save = (
    nextStatus?: ActualValuesInput["completionStatus"],
    noteOverride?: string,
    rowsOverride?: SetRow[] | null
  ) => {
    const rows = rowsOverride !== undefined ? rowsOverride : setRows;
    const payload = rows ? toSetPayload(rows) : null;
    const doneCount = payload ? payload.filter((r) => r.done).length : 0;
    const weights = payload
      ? payload.map((r) => r.weightKg).filter((w): w is number => w !== null)
      : [];

    const values: ActualValuesInput = {
      actualSets: actualSets ? Number(actualSets) : null,
      actualReps: actualReps || null,
      actualWeightKg: actualWeightKg ? Number(actualWeightKg) : null,
      actualDurationSec: minToSec(actualDurationMin),
      actualSpeed: actualSpeed || null,
      actualRestSec: actualRestSec ? Number(actualRestSec) : null,
      actualNotes: (noteOverride ?? actualNotes) || null,
      setDetails: payload,
      completionStatus: nextStatus ?? (status as ActualValuesInput["completionStatus"]),
    };

    // Per-set mode owns the aggregates: derive them from the rows so
    // dashboard/history/compliance keep reading the same columns.
    if (payload) {
      values.actualSets = doneCount > 0 ? doneCount : null;
      values.actualReps = payload.some((r) => r.reps)
        ? payload.map((r) => r.reps ?? "–").join("/")
        : null;
      values.actualWeightKg = weights.length > 0 ? Math.max(...weights) : null;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const result = await logItemActual(itemId, values);
      if (!result.success) {
        setErrorMsg(result.error);
        setSaved(false);
      } else {
        setSaved(true);
      }
    });
  };

  const applySkipReason = (reason: string) => {
    const note = `Skipped: ${reason}`;
    setActualNotes(note);
    save("SKIPPED", note);
  };

  const startRest = () => {
    const seconds = Number(actualRestSec) || props.plannedRestSec || 0;
    restTimer.start(seconds, resolved.name);
  };

  const enablePerSet = () => {
    const count = props.plannedSets ?? (actualSets ? Number(actualSets) : 3);
    const n = Math.min(Math.max(count || 3, 1), 20);
    const prefillWeight =
      actualWeightKg || (props.plannedWeightKg != null ? String(props.plannedWeightKg) : "");
    setSetRows(Array.from({ length: n }, () => ({ reps: "", weightKg: prefillWeight, done: false })));
    markDirty();
  };

  const disablePerSet = () => {
    setSetRows(null);
    save(undefined, undefined, null);
  };

  const updateSetRow = (idx: number, field: "reps" | "weightKg", value: string) => {
    setSetRows((rows) => rows?.map((r, i) => (i === idx ? { ...r, [field]: value } : r)) ?? rows);
    markDirty();
  };

  const toggleSetDone = (idx: number) => {
    if (!setRows) return;
    const next = setRows.map((r, i) => (i === idx ? { ...r, done: !r.done } : r));
    setSetRows(next);
    save(undefined, undefined, next);
    const restSec = Number(actualRestSec) || props.plannedRestSec || 0;
    if (next[idx].done && restSec > 0 && next.some((r) => !r.done)) {
      restTimer.start(restSec, `${resolved.name} · Set ${idx + 1} done`);
    }
  };

  const addSetRow = () => {
    setSetRows((rows) => {
      if (!rows || rows.length >= 20) return rows;
      const last = rows[rows.length - 1];
      return [...rows, { reps: "", weightKg: last?.weightKg ?? "", done: false }];
    });
    markDirty();
  };

  const removeSetRow = (idx: number) => {
    setSetRows((rows) => (rows && rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows));
    markDirty();
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
          ? "border-accent-lime/40 bg-surface-2"
          : status === "PARTIAL"
          ? "border-accent-orange/40 bg-surface-2"
          : status === "SKIPPED"
          ? "border-accent-red/30 bg-surface-2 opacity-70"
          : "border-border bg-surface"
      )}
    >
      {errorMsg && (
        <div className="mb-3 rounded-lg border border-accent-red/50 bg-accent-red/10 p-2 text-xs text-accent-red">
          {errorMsg}
        </div>
      )}
      <div className="flex items-start gap-3">
        <span className="mt-1 text-lg">{KIND_ICON[resolved.kind]}</span>
        <div className="flex-1">
          <button
            type="button"
            onClick={() =>
              drawer.open({ slug: resolved.slug, kind: resolved.kind, name: resolved.name })
            }
            className="text-left"
          >
            <p className="flex items-center gap-1.5 font-medium">
              {resolved.name}
              <span className="text-xs text-muted" aria-hidden>
                ℹ️
              </span>
            </p>
            {resolved.kind === "unresolved" && (
              <p className="text-xs text-muted">not yet in your catalog</p>
            )}
          </button>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {!setRows && showSets && (
              <label className="text-xs">
                <span className="text-muted">
                  Sets {props.plannedSets != null && <>· planned {props.plannedSets}</>}
                </span>
                <div className="mt-0.5 flex items-center">
                  <Stepper
                    value={actualSets}
                    step={1}
                    onChange={(v) => {
                      setActualSets(v);
                      markDirty();
                    }}
                  />
                  <DeltaBadge
                    delta={numDelta(actualSets ? Number(actualSets) : null, props.plannedSets)}
                    unit=""
                  />
                </div>
              </label>
            )}
            {!setRows && showReps && (
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
            {!setRows && showWeight && (
              <label className="text-xs">
                <span className="text-muted">
                  Weight (kg) {props.plannedWeightKg != null && <>· planned {props.plannedWeightKg}</>}
                </span>
                <div className="mt-0.5 flex items-center">
                  <Stepper
                    value={actualWeightKg}
                    step={2.5}
                    onChange={(v) => {
                      setActualWeightKg(v);
                      markDirty();
                    }}
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
                <div className="mt-0.5 flex items-center gap-1.5">
                  <input
                    type="number"
                    value={actualRestSec}
                    onChange={(e) => {
                      setActualRestSec(e.target.value);
                      markDirty();
                    }}
                    className="block w-16 rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent-blue"
                  />
                  <button
                    type="button"
                    onClick={startRest}
                    title="Start rest countdown"
                    className="rounded border border-accent-lime/40 px-2 py-1 text-xs font-semibold text-accent-lime transition hover:bg-accent-lime/10"
                  >
                    ⏱ Rest
                  </button>
                </div>
              </label>
            )}
          </div>

          {props.plannedTempo && (
            <p className="mt-2 text-xs text-muted">Planned tempo: {props.plannedTempo}</p>
          )}
          {props.plannedNotes && (
            <p className="mt-1 text-xs text-muted">Coach note: {props.plannedNotes}</p>
          )}

          {(props.plannedSets != null || setRows) && (
            <div className="mt-2">
              {setRows ? (
                <div className="space-y-1.5 rounded-lg border border-border bg-surface-2/50 p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted">
                      Per-set log
                      {props.plannedReps != null && (
                        <span className="font-normal"> · planned {props.plannedReps} reps</span>
                      )}
                      {props.plannedWeightKg != null && (
                        <span className="font-normal"> × {props.plannedWeightKg}kg</span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={disablePerSet}
                      className="text-[11px] text-muted transition hover:text-foreground"
                    >
                      Simple mode
                    </button>
                  </div>
                  {setRows.map((row, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-9 shrink-0 text-xs text-muted">Set {i + 1}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="reps"
                        value={row.reps}
                        onChange={(e) => updateSetRow(i, "reps", e.target.value)}
                        className="w-14 rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent-blue"
                      />
                      <input
                        type="number"
                        step={2.5}
                        placeholder="kg"
                        value={row.weightKg}
                        onChange={(e) => updateSetRow(i, "weightKg", e.target.value)}
                        className="w-16 rounded border border-border bg-surface-2 px-2 py-1 text-sm outline-none focus:border-accent-blue"
                      />
                      <span className="text-[10px] text-muted">kg</span>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => toggleSetDone(i)}
                        title={row.done ? "Set done — tap to undo" : "Mark set done (starts rest timer)"}
                        className={clsx(
                          "ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-semibold transition disabled:opacity-50",
                          row.done
                            ? "border-accent-lime bg-accent-lime/20 text-accent-lime"
                            : "border-border text-muted hover:text-foreground"
                        )}
                      >
                        ✓
                      </button>
                      {setRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSetRow(i)}
                          aria-label={`Remove set ${i + 1}`}
                          className="shrink-0 text-xs text-muted/60 transition hover:text-accent-red"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSetRow}
                    className="text-xs text-accent-lime transition hover:brightness-110"
                  >
                    + Add set
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={enablePerSet}
                  className="text-xs text-accent-lime transition hover:brightness-110"
                >
                  ⊞ Log per set
                </button>
              )}
            </div>
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
            setErrorMsg(null);
            startTransition(async () => {
              const result = await toggleHighlight(itemId, next);
              if (!result.success) {
                setErrorMsg(result.error);
                setIsHighlight(!next);
              }
            });
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

      {status === "SKIPPED" && (
        <div className="mt-2 space-y-1.5">
          <p className="text-xs text-muted">Why skipped?</p>
          <div className="flex flex-wrap gap-1.5">
            {SKIP_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                disabled={isPending}
                onClick={() => applySkipReason(reason)}
                className={clsx(
                  "rounded-full border px-2.5 py-1 text-xs transition disabled:opacity-50",
                  actualNotes === `Skipped: ${reason}`
                    ? "border-accent-red bg-accent-red/20 text-accent-red"
                    : "border-border text-muted hover:text-foreground"
                )}
              >
                {reason}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted/70">
            Or type your own reason in the notes field above, then Save.
          </p>
        </div>
      )}

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
