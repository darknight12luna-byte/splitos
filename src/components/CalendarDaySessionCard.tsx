"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { reopenSession, deleteSession } from "@/lib/actions";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCategoryTheme } from "@/lib/training/category-theme";

export function CalendarDaySessionCard({
  sessionId,
  dayLabel,
  title,
  status,
  completionPct,
  category,
  href,
}: {
  sessionId: string;
  dayLabel: string;
  title: string;
  status: string;
  completionPct: number;
  category: string;
  href: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const theme = getCategoryTheme(category);
  const isSkipped = status === "SKIPPED";

  const handleReopen = () => {
    setError(null);
    startTransition(async () => {
      const result = await reopenSession(sessionId);
      if (!result.success) {
        setError(result.error);
      } else {
        router.push(`/session/${sessionId}`);
      }
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this session permanently? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSession(sessionId);
      if (!result.success) setError(result.error);
    });
  };

  return (
    <Card className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            {theme.emoji}
          </span>
          <div>
            <p className="text-xs text-muted">{dayLabel}</p>
            <p className="font-semibold leading-tight">{title}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full transition-all"
          style={{ width: `${completionPct}%`, background: theme.color }}
        />
      </div>

      {error && <p className="text-xs text-accent-red">{error}</p>}

      <div className="flex gap-2">
        {isSkipped ? (
          <button
            type="button"
            onClick={handleReopen}
            disabled={isPending}
            className="flex-1 rounded-lg border border-accent-lime/40 px-3 py-2 text-center text-xs font-semibold text-accent-lime transition hover:bg-accent-lime/10 disabled:opacity-50"
          >
            {isPending ? "…" : "↺ Reopen & Log"}
          </button>
        ) : (
          <Link
            href={href}
            className="flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold text-on-accent transition hover:brightness-110"
            style={{ background: theme.color }}
          >
            {status === "COMPLETED" ? "View" : status === "IN_PROGRESS" ? "Resume" : "Open"}
          </Link>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-lg border border-accent-red/40 px-3 py-2 text-xs font-semibold text-accent-red transition hover:bg-accent-red/10 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </Card>
  );
}
