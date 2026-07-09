"use client";

import { useState } from "react";
import clsx from "clsx";

const MOODS = [
  { value: "TIRED", label: "Tired", emoji: "😫" },
  { value: "NORMAL", label: "Normal", emoji: "😐" },
  { value: "ENERGIZED", label: "Energized", emoji: "⚡" },
  { value: "STRONG", label: "Strong", emoji: "💪" },
];

export function MoodPicker({ name }: { name: string }) {
  const [selected, setSelected] = useState("NORMAL");

  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <div className="grid grid-cols-4 gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setSelected(m.value)}
            className={clsx(
              "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition",
              selected === m.value
                ? "border-accent-lime bg-surface-2 text-accent-lime"
                : "border-border bg-surface text-muted hover:border-white/20"
            )}
          >
            <span className="text-xl">{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
