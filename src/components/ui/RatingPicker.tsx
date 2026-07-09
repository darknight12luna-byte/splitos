"use client";

import { useState } from "react";
import clsx from "clsx";

export function RatingPicker({
  name,
  label,
  defaultValue = 3,
  accent = "blue",
}: {
  name: string;
  label: string;
  defaultValue?: number;
  accent?: "blue" | "red" | "green";
}) {
  const [value, setValue] = useState(defaultValue);
  const accentClass =
    accent === "red"
      ? "border-accent-red bg-accent-red/20 text-accent-red"
      : accent === "green"
      ? "border-accent-green bg-accent-green/20 text-accent-green"
      : "border-accent-blue bg-accent-blue/20 text-accent-blue";

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold">{value}/5</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            className={clsx(
              "rounded-lg border py-1.5 text-sm font-semibold transition",
              value === n ? accentClass : "border-border text-muted hover:border-white/20"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
