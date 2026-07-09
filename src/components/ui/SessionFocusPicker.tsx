"use client";

import { useState } from "react";
import clsx from "clsx";

const FOCUS_OPTIONS = [
  { value: "strength", label: "Strength", emoji: "🏋️" },
  { value: "mobility", label: "Mobility", emoji: "🧘" },
  { value: "flow", label: "Flow", emoji: "🐆" },
  { value: "recovery", label: "Recovery", emoji: "🌙" },
];

export function SessionFocusPicker({ name }: { name: string }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <input type="hidden" name={name} value={selected ?? ""} />
      <div className="grid grid-cols-4 gap-2">
        {FOCUS_OPTIONS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setSelected(f.value === selected ? null : f.value)}
            className={clsx(
              "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs transition",
              selected === f.value
                ? "border-accent-green bg-surface-2 text-accent-green"
                : "border-border bg-surface text-muted hover:border-white/20"
            )}
          >
            <span className="text-lg">{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
