import type { ReactNode, CSSProperties } from "react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCategoryTheme } from "@/lib/training/category-theme";

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
  category,
  status,
  completionPct,
  lastPerformed,
  action,
  selected,
}: {
  dayNumber: number;
  label: string;
  category: string;
  status: string;
  completionPct: number | null;
  lastPerformed: Date | null;
  action: ReactNode;
  selected?: boolean;
}) {
  const theme = getCategoryTheme(category);

  return (
    <Card
      className="space-y-2.5 border transition"
      style={
        {
          background: `linear-gradient(135deg, color-mix(in oklab, ${theme.color} 16%, var(--surface)), var(--surface) 65%)`,
          borderColor: selected
            ? theme.color
            : `color-mix(in oklab, ${theme.color} 30%, var(--border))`,
          boxShadow: selected ? `0 0 0 1px ${theme.color}` : undefined,
        } as CSSProperties
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none" aria-hidden>
            {theme.emoji}
          </span>
          <div>
            <p className="text-xs text-muted">Day {dayNumber}</p>
            <p className="font-semibold leading-tight">{label}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full transition-all"
            style={{ width: `${completionPct ?? 0}%`, background: theme.color }}
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
