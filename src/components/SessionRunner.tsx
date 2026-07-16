"use client";

import { useEffect, useState, useTransition, ReactNode } from "react";
import Link from "next/link";
import { completeSession } from "@/lib/actions";
import { ExerciseDrawerProvider } from "@/lib/exercise-drawer-context";
import { Card } from "@/components/ui/Card";

interface SessionSummary {
  sessionId: string;
  title: string;
  status: string;
  itemsCompleted: number;
  itemsTotal: number;
  highlights: number;
  durationSec: number;
}

function CelebrationOverlay({ summary }: { summary: SessionSummary }) {
  const mm = String(Math.floor(summary.durationSec / 60)).padStart(2, "0");
  const ss = String(summary.durationSec % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="animate-[fadeIn_0.5s_ease_forwards] text-7xl">🎉</div>
      <div className="animate-[fadeIn_0.5s_ease_forwards]" style={{ animationDelay: "100ms" }}>
        <h1 className="text-3xl font-bold">Session Complete!</h1>
        <p className="mt-1 text-muted">{summary.title}</p>
      </div>

      <div
        className="grid w-full max-w-xs grid-cols-3 gap-3 animate-[fadeIn_0.5s_ease_forwards]"
        style={{ animationDelay: "200ms" }}
      >
        <div className="rounded-2xl border border-border bg-surface p-3">
          <p className="text-xl font-bold text-accent-lime">
            {summary.itemsCompleted}/{summary.itemsTotal}
          </p>
          <p className="text-[11px] text-muted">Items done</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-3">
          <p className="text-xl font-bold text-accent-orange">✨ {summary.highlights}</p>
          <p className="text-[11px] text-muted">Highlights</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-3">
          <p className="font-mono text-xl font-bold text-accent-blue">
            {mm}:{ss}
          </p>
          <p className="text-[11px] text-muted">Duration</p>
        </div>
      </div>

      <div
        className="w-full max-w-xs space-y-2 animate-[fadeIn_0.5s_ease_forwards]"
        style={{ animationDelay: "300ms" }}
      >
        <Link
          href={`/content?session=${summary.sessionId}`}
          className="block w-full rounded-xl bg-accent-lime py-3.5 text-center font-bold text-background transition hover:brightness-110"
        >
          📤 Share Your Progress
        </Link>
        <Link
          href="/dashboard"
          className="block w-full text-center text-sm text-muted transition hover:text-foreground"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export function SessionRunner({
  sessionId,
  children,
}: {
  sessionId: string;
  children: ReactNode;
}) {
  const [seconds, setSeconds] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const finish = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeSession(sessionId, seconds);
      if (!result.success) {
        setError(result.error);
      } else {
        setSummary(result.data);
      }
    });
  };

  if (summary) return <CelebrationOverlay summary={summary} />;

  return (
    <ExerciseDrawerProvider>
      <div className="space-y-6 pb-24">
        {children}
        {error && (
          <Card className="fixed bottom-32 left-1/2 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 border border-accent-red/50 bg-accent-red/10 p-4">
            <p className="text-sm text-accent-red">{error}</p>
          </Card>
        )}
        <div className="fixed bottom-20 left-1/2 flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 items-center justify-between rounded-2xl border border-border bg-surface/95 p-4 shadow-xl shadow-black/40 backdrop-blur md:bottom-4">
          <div>
            <p className="text-xs text-muted">Timer</p>
            <p className="font-mono text-2xl font-bold">
              {mm}:{ss}
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={finish}
            className="rounded-xl bg-accent-blue px-6 py-3 font-bold text-background transition hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? "Finishing…" : "Finish Session 🚀"}
          </button>
        </div>
      </div>
    </ExerciseDrawerProvider>
  );
}
