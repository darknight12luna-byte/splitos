"use client";

import { useEffect, useState, useTransition, ReactNode } from "react";
import Link from "next/link";
import { completeSession } from "@/lib/actions";
import { ExerciseDrawerProvider } from "@/lib/exercise-drawer-context";
import { RestTimerProvider } from "@/lib/rest-timer-context";
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
  const hh = Math.floor(summary.durationSec / 3600);
  const mm = String(Math.floor((summary.durationSec % 3600) / 60)).padStart(2, "0");
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
            {hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`}
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
          className="block w-full rounded-xl bg-accent-lime py-3.5 text-center font-bold text-on-accent transition hover:brightness-110"
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

const FINISHED_STATUSES = ["COMPLETED", "PARTIAL", "SKIPPED"];

export function SessionRunner({
  sessionId,
  startedAt,
  initialStatus,
  savedDurationSec,
  children,
}: {
  sessionId: string;
  startedAt: string;
  initialStatus: string;
  savedDurationSec: number | null;
  children: ReactNode;
}) {
  const isFinished = FINISHED_STATUSES.includes(initialStatus);
  const [seconds, setSeconds] = useState(isFinished ? savedDurationSec ?? 0 : 0);
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pause/resume tracking — pausedMs is the running total of time spent paused,
  // subtracted from wall-clock elapsed so a break never counts toward the
  // tracked training duration. Not persisted: a refresh mid-pause resumes as if
  // running (same as before pause existed), it just won't survive a reload.
  const [isPaused, setIsPaused] = useState(false);
  const [pausedMs, setPausedMs] = useState(0);
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null);

  // Anchor the timer to the session's DB creation time (wall clock), not a
  // client-side counter — a page refresh must not reset the tracked gym time.
  useEffect(() => {
    if (isFinished || isPaused) return;
    const startMs = new Date(startedAt).getTime();
    const tick = () =>
      setSeconds(Math.max(0, Math.floor((Date.now() - startMs - pausedMs) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, isFinished, isPaused, pausedMs]);

  const togglePause = () => {
    if (isPaused) {
      setPausedMs((p) => p + (pauseStartedAt != null ? Date.now() - pauseStartedAt : 0));
      setPauseStartedAt(null);
      setIsPaused(false);
    } else {
      setPauseStartedAt(Date.now());
      setIsPaused(true);
    }
  };

  const hh = Math.floor(seconds / 3600);
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const display = hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;

  const finish = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeSession(sessionId, seconds);
      if (!result.success) {
        setError(result.error || "Failed to complete session");
      } else if (result.data) {
        setSummary(result.data);
      }
    });
  };

  if (summary) return <CelebrationOverlay summary={summary} />;

  return (
    <ExerciseDrawerProvider>
      <RestTimerProvider>
      <div className="space-y-6 pb-24">
        {children}
        {error && (
          <Card className="fixed bottom-48 left-1/2 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 border border-accent-red/50 bg-accent-red/10 p-4">
            <p className="text-sm text-accent-red">{error}</p>
          </Card>
        )}
        <div
          className="fixed bottom-24 left-1/2 flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 items-center justify-between gap-2 rounded-2xl border border-border bg-surface/95 p-4 shadow-xl shadow-black/10 backdrop-blur"
        >
          <div>
            <p className="text-xs text-muted">{isPaused ? "Paused" : "Timer"}</p>
            <p className={`font-mono text-2xl font-bold ${isPaused ? "text-muted" : ""}`}>{display}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={togglePause}
              aria-label={isPaused ? "Resume session" : "Pause session"}
              title={isPaused ? "Resume session" : "Pause session"}
              className="rounded-xl border border-border px-4 py-3 font-bold text-foreground transition hover:bg-surface-2 disabled:opacity-50"
            >
              {isPaused ? "▶" : "⏸"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={finish}
              className="rounded-xl bg-accent-blue px-4 py-3 font-bold text-on-accent transition hover:brightness-110 disabled:opacity-50 sm:px-6"
            >
              {isPending ? (
                "Finishing…"
              ) : (
                <>
                  <span className="hidden sm:inline">Finish Session 🚀</span>
                  <span className="sm:hidden">Finish 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      </RestTimerProvider>
    </ExerciseDrawerProvider>
  );
}
