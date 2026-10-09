"use client";

import { useState, useTransition } from "react";
import { updatePlanItem, removePlanItem, movePlanItem } from "@/lib/plan-actions";

interface Props {
  id: string;
  name: string;
  plannedSets: number | null;
  plannedReps: string | null;
  plannedWeightKg: number | null;
  plannedRestSec: number | null;
  isFirst: boolean;
  isLast: boolean;
}

const input =
  "w-full rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm text-foreground";

export function PlanItemEditor(p: Props) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function save(formData: FormData) {
    start(async () => {
      const r = await updatePlanItem(formData);
      setMsg(r.success ? "Saved ✓" : r.error);
    });
  }

  function run(fn: () => Promise<{ success: boolean } & { error?: string }>) {
    start(async () => {
      const r = await fn();
      if (!r.success) setMsg(r.error ?? "Failed");
    });
  }

  return (
    <form action={save} className="space-y-2 rounded-lg bg-surface-2/60 p-3">
      <input type="hidden" name="id" value={p.id} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{p.name}</p>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={pending || p.isFirst}
            onClick={() => run(() => movePlanItem(p.id, "up"))}
            className="rounded px-2 py-1 text-xs text-muted disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={pending || p.isLast}
            onClick={() => run(() => movePlanItem(p.id, "down"))}
            className="rounded px-2 py-1 text-xs text-muted disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(`Remove ${p.name} from this day?`)) run(() => removePlanItem(p.id));
            }}
            className="rounded px-2 py-1 text-xs text-red-400"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-[11px] text-muted">
        <label>
          Sets
          <input name="plannedSets" type="number" min={1} max={20} defaultValue={p.plannedSets ?? ""} className={input} />
        </label>
        <label>
          Reps
          <input name="plannedReps" defaultValue={p.plannedReps ?? ""} className={input} />
        </label>
        <label>
          Kg
          <input name="plannedWeightKg" inputMode="decimal" defaultValue={p.plannedWeightKg ?? ""} className={input} />
        </label>
        <label>
          Rest s
          <input name="plannedRestSec" type="number" min={0} max={900} defaultValue={p.plannedRestSec ?? ""} className={input} />
        </label>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{pending ? "Saving…" : msg}</span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent-lime px-3 py-1.5 text-xs font-bold text-on-accent disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}
