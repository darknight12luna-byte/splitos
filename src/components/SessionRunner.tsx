"use client";

import { useEffect, useState, useTransition, ReactNode } from "react";
import { completeSession } from "@/lib/actions";

export function SessionRunner({
  sessionId,
  children,
}: {
  sessionId: string;
  children: ReactNode;
}) {
  const [seconds, setSeconds] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-6 pb-24">
      {children}
      <div className="fixed bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 items-center justify-between rounded-2xl border border-border bg-surface/95 p-4 shadow-xl shadow-black/40 backdrop-blur">
        <div>
          <p className="text-xs text-muted">Timer</p>
          <p className="font-mono text-2xl font-bold">
            {mm}:{ss}
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => completeSession(sessionId, seconds))}
          className="rounded-xl bg-accent-blue px-6 py-3 font-bold text-background transition hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Finishing…" : "Finish Session 🚀"}
        </button>
      </div>
    </div>
  );
}
