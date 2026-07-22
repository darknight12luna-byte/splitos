"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface RestTimerContextValue {
  start: (seconds: number, label: string) => void;
}

const RestTimerContext = createContext<RestTimerContextValue | null>(null);

export function useRestTimer(): RestTimerContextValue {
  const ctx = useContext(RestTimerContext);
  if (!ctx) throw new Error("useRestTimer must be used within RestTimerProvider");
  return ctx;
}

function formatSec(sec: number): string {
  const mm = Math.floor(sec / 60);
  const ss = String(sec % 60).padStart(2, "0");
  return mm > 0 ? `${mm}:${ss}` : `${sec}`;
}

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [total, setTotal] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (remaining <= 0) {
      setActive(false);
      setFinished(true);
      // navigator.vibrate is mobile-only; ignore where unsupported
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [active, remaining]);

  useEffect(() => {
    if (!finished) return;
    const t = setTimeout(() => setFinished(false), 4000);
    return () => clearTimeout(t);
  }, [finished]);

  const start = (seconds: number, lbl: string) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    setTotal(seconds);
    setRemaining(seconds);
    setLabel(lbl);
    setFinished(false);
    setActive(true);
  };

  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;

  return (
    <RestTimerContext.Provider value={{ start }}>
      {children}

      {active && (
        <div className="fixed bottom-44 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-accent-lime/40 bg-surface/95 p-3 shadow-xl shadow-black/10 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted">Rest · {label}</p>
              <p className="font-mono text-3xl font-bold text-accent-lime">
                {formatSec(remaining)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTotal((t) => t + 15);
                  setRemaining((r) => r + 15);
                }}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:text-foreground"
              >
                +15s
              </button>
              <button
                type="button"
                onClick={() => setActive(false)}
                aria-label="Cancel rest timer"
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:text-accent-red"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent-lime transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {finished && (
        <div className="fixed bottom-44 left-1/2 z-40 -translate-x-1/2 rounded-2xl border border-accent-lime bg-accent-lime px-5 py-3 text-sm font-bold text-on-accent shadow-xl shadow-black/20">
          Rest done — next set 💪
        </div>
      )}
    </RestTimerContext.Provider>
  );
}
