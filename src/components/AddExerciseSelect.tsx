"use client";

import { useState, useTransition } from "react";
import { addPlanItem } from "@/lib/plan-actions";

export function AddExerciseSelect({
  dayId,
  options,
}: {
  dayId: string;
  options: { slug: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <select
        disabled={pending}
        defaultValue=""
        onChange={(e) => {
          const slug = e.target.value;
          if (!slug) return;
          e.target.value = "";
          start(async () => {
            const r = await addPlanItem(dayId, slug);
            setError(r.success ? null : r.error);
          });
        }}
        className="w-full rounded-lg border border-dashed border-border bg-surface-2 px-3 py-2 text-sm text-muted"
      >
        <option value="">{pending ? "Adding…" : "+ Add exercise"}</option>
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
