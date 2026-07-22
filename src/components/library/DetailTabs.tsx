"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";

export function DetailTabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface-2 p-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(i)}
            className={clsx(
              "flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
              active === i ? "bg-accent-lime text-on-accent" : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-4">{tabs[active].content}</div>
    </div>
  );
}
