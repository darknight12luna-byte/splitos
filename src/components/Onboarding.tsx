"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

const STORAGE_KEY = "gymfit-onboarding-seen";

const SPLIT_DAYS = [
  { label: "Upper Body", emoji: "💪", color: "var(--accent-blue)" },
  { label: "Lower Body", emoji: "🦵", color: "var(--accent-green)" },
  { label: "Animal Flow / Mobility", emoji: "🐆", color: "var(--accent-purple)" },
  { label: "Mixed / Optional", emoji: "🔀", color: "var(--accent-orange)" },
];

const MOCK_CHART = [30, 55, 40, 70, 50, 85, 65];

function Screen1() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl">💪</div>
      <h1 className="text-3xl font-bold leading-tight">
        Unleash Your <span className="text-accent-lime">Potential</span>
      </h1>
      <p className="max-w-xs text-sm text-muted">
        Your real training system, tracked properly — planned vs. actual, every session.
      </p>
    </div>
  );
}

function Screen2() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-2xl font-bold leading-tight">Your 4-Day Training System</h1>
      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {SPLIT_DAYS.map((d, i) => (
          <div
            key={d.label}
            className="animate-[fadeIn_0.5s_ease_forwards] space-y-1.5 rounded-2xl border p-3 opacity-0"
            style={{
              borderColor: `color-mix(in oklab, ${d.color} 40%, transparent)`,
              background: `color-mix(in oklab, ${d.color} 12%, transparent)`,
              animationDelay: `${i * 120}ms`,
            }}
          >
            <div className="text-2xl">{d.emoji}</div>
            <p className="text-xs font-semibold" style={{ color: d.color }}>
              Day {i + 1}
            </p>
            <p className="text-[11px] text-muted">{d.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Screen3() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-2xl font-bold leading-tight">
        Track Every Rep. <span className="text-accent-lime">Own Your Progress.</span>
      </h1>
      <div className="flex h-32 w-full max-w-xs items-end justify-between gap-2 rounded-2xl border border-border bg-surface p-4">
        {MOCK_CHART.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-accent-lime/70"
            style={{ height: `${v}%` }}
          />
        ))}
      </div>
      <p className="max-w-xs text-sm text-muted">
        Planned vs. actual, compliance, streaks, and history for every exercise and movement.
      </p>
    </div>
  );
}

const SCREENS = [Screen1, Screen2, Screen3];

export function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Reading localStorage requires the client, so this can't be a lazy useState
    // initializer without a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!window.localStorage.getItem(STORAGE_KEY));
  }, []);

  function finish() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  const Current = SCREENS[step];
  const isLast = step === SCREENS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background px-6 py-10">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={finish}
          className="text-sm text-muted transition hover:text-foreground"
        >
          Skip
        </button>
      </div>

      <Current key={step} />

      <div className="space-y-4">
        <div className="flex justify-center gap-1.5">
          {SCREENS.map((_, i) => (
            <span
              key={i}
              className={clsx(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-accent-lime" : "w-1.5 bg-border"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
          className="w-full rounded-xl bg-accent-lime py-3.5 text-center font-bold text-on-accent transition hover:brightness-110"
        >
          {isLast ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
}
