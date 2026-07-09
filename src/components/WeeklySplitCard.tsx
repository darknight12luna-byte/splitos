import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";

function formatRelative(date: Date | null) {
  if (!date) return "never";
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export function WeeklySplitCard({
  dayNumber,
  label,
  status,
  completionPct,
  lastPerformed,
  action,
  selected,
}: {
  dayNumber: number;
  label: string;
  status: string;
  completionPct: number | null;
  lastPerformed: Date | null;
  action: ReactNode;
  selected?: boolean;
}) {
  return (
    <Card
      className={clsx(
        "space-y-2.5 transition",
        selected && "border-accent-blue ring-1 ring-accent-blue"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted">Day {dayNumber}</p>
          <p className="font-semibold leading-tight">{label}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-accent-green transition-all"
            style={{ width: `${completionPct ?? 0}%` }}
          />
        </div>
        <p className="text-xs text-muted">
          {completionPct != null ? `${completionPct}% complete` : "not started"}
        </p>
      </div>

      <p className="text-xs text-muted">Last: {formatRelative(lastPerformed)}</p>

      {action}
    </Card>
  );
}
