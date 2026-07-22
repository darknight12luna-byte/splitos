"use client";

import { useState } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";

export function BeginnerAdvancedToggle({
  beginner,
  advanced,
}: {
  beginner: string[];
  advanced: string[];
}) {
  const [mode, setMode] = useState<"beginner" | "advanced">("beginner");
  const items = mode === "beginner" ? beginner : advanced;

  return (
    <Card className="space-y-3">
      <div className="flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
        <button
          type="button"
          onClick={() => setMode("beginner")}
          className={clsx(
            "flex-1 rounded-lg py-1.5 text-sm font-medium transition",
            mode === "beginner" ? "bg-accent-lime text-on-accent" : "text-muted hover:text-foreground"
          )}
        >
          Beginner
        </button>
        <button
          type="button"
          onClick={() => setMode("advanced")}
          className={clsx(
            "flex-1 rounded-lg py-1.5 text-sm font-medium transition",
            mode === "advanced" ? "bg-accent-lime text-on-accent" : "text-muted hover:text-foreground"
          )}
        >
          Advanced
        </button>
      </div>
      {items.length === 0 ? (
        <p className="italic text-muted">Not documented in your source yet.</p>
      ) : (
        <ul className="list-disc space-y-1 pl-4 text-sm">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
