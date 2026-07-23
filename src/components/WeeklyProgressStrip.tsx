"use client";

import Link from "next/link";
import clsx from "clsx";
import { getCategoryTheme } from "@/lib/training/category-theme";
import type { WeekStatus } from "@/lib/training/split-status";

export interface WeeklyProgressDay {
  id: string;
  label: string;
  category: string;
  weekStatus: WeekStatus;
}

const STATUS_GLYPH: Record<WeekStatus, string> = {
  done: "✓",
  skipped: "✗",
  not_started: "–",
};

/** This week's status for all split days at a glance. Days already done this week are
 * just shown (nothing to jump into); not-started/skipped days are selectable — either
 * via onSelect (controlled, used inside the Check-In carousel) or as a plain Link into
 * /checkin?day=id (used on the read-only Daily overview). */
export function WeeklyProgressStrip({
  days,
  selectedDayId,
  onSelect,
}: {
  days: WeeklyProgressDay[];
  selectedDayId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const doneCount = days.filter((d) => d.weekStatus === "done").length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">This Week</h2>
        <span className="text-xs text-muted">
          {doneCount}/{days.length} done
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {days.map((day) => {
          const theme = getCategoryTheme(day.category);
          const isDone = day.weekStatus === "done";
          const isSkipped = day.weekStatus === "skipped";
          const selected = day.id === selectedDayId;

          const content = (
            <>
              <span className="text-lg leading-none" aria-hidden>
                {theme.emoji}
              </span>
              <span className="w-full truncate text-[10px] font-medium">{day.label}</span>
              <span
                className={clsx(
                  "text-xs font-bold",
                  isDone ? "text-accent-lime" : isSkipped ? "text-accent-red" : "text-muted"
                )}
              >
                {STATUS_GLYPH[day.weekStatus]}
              </span>
            </>
          );

          const className = clsx(
            "flex flex-col items-center gap-0.5 rounded-xl border p-2 text-center transition",
            isDone
              ? "border-accent-lime/40 bg-accent-lime/10"
              : isSkipped
              ? "border-accent-red/30 bg-accent-red/5 hover:bg-accent-red/10"
              : "border-border bg-surface hover:border-accent-blue/40",
            selected && "ring-2 ring-accent-blue"
          );

          if (isDone) {
            return (
              <div key={day.id} className={className}>
                {content}
              </div>
            );
          }

          if (onSelect) {
            return (
              <button key={day.id} type="button" onClick={() => onSelect(day.id)} className={className}>
                {content}
              </button>
            );
          }

          return (
            <Link key={day.id} href={`/checkin?day=${day.id}`} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
