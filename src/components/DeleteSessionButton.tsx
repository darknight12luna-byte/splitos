"use client";

import { useState, useTransition } from "react";
import { deleteSession } from "@/lib/actions";

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!window.confirm("Delete this session permanently? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSession(sessionId);
      if (!result.success) setError(result.error);
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete this session"
      title={error ?? "Delete this session permanently"}
      className="shrink-0 rounded-lg border border-accent-red/40 px-3 py-1.5 text-xs font-semibold text-accent-red transition hover:bg-accent-red/10 disabled:opacity-50"
    >
      {isPending ? "…" : error ? "!" : "🗑"}
    </button>
  );
}
