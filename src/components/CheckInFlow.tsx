"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import clsx from "clsx";
import { submitCheckIn, skipDay } from "@/lib/actions";
import { WeeklySplitCard } from "@/components/WeeklySplitCard";
import { Card } from "@/components/ui/Card";
import { MoodPicker } from "@/components/ui/MoodPicker";
import { RatingPicker } from "@/components/ui/RatingPicker";
import { SessionFocusPicker } from "@/components/ui/SessionFocusPicker";

export interface CheckInDay {
  id: string;
  dayNumber: number;
  label: string;
  category: string;
  goal: string;
  todaySession: { id: string; status: string; completionPct: number } | null;
  lastPerformed: string | null; // ISO date string
}

function actionLabel(status: string): string {
  if (status === "COMPLETED" || status === "SKIPPED") return "View";
  if (status === "PARTIAL" || status === "IN_PROGRESS") return "Resume";
  return "Start";
}

function sessionHref(id: string, status: string) {
  return status === "COMPLETED" || status === "SKIPPED" ? `/content?session=${id}` : `/session/${id}`;
}

export function CheckInFlow({
  days,
  initialSelectedDayId,
}: {
  days: CheckInDay[];
  initialSelectedDayId: string | null;
}) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(initialSelectedDayId);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLDivElement>(null);

  const doneToday = days.filter((d) => d.todaySession);
  const remaining = days.filter((d) => !d.todaySession);
  const selectedDay = days.find((d) => d.id === selectedDayId) ?? null;

  const selectDay = (id: string) => {
    setSelectedDayId(id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Your 4-Day Split
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {days.map((day) => (
            <WeeklySplitCard
              key={day.id}
              dayNumber={day.dayNumber}
              label={day.label}
              category={day.category}
              status={day.todaySession?.status ?? "NOT_STARTED"}
              completionPct={day.todaySession?.completionPct ?? null}
              lastPerformed={day.lastPerformed ? new Date(day.lastPerformed) : null}
              selected={!day.todaySession && day.id === selectedDayId}
              action={
                day.todaySession ? (
                  <Link
                    href={sessionHref(day.todaySession.id, day.todaySession.status)}
                    className="block rounded-lg bg-accent-blue px-3 py-1.5 text-center text-xs font-semibold text-background transition hover:brightness-110"
                  >
                    {actionLabel(day.todaySession.status)}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => selectDay(day.id)}
                    className="w-full rounded-lg border border-accent-lime/40 px-3 py-1.5 text-xs font-semibold text-accent-lime transition hover:bg-accent-lime/10"
                  >
                    Start
                  </button>
                )
              }
            />
          ))}
        </div>
      </div>

      {doneToday.length > 0 && remaining.length > 0 && (
        <Card className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Start another session today
          </h2>
          <p className="text-xs text-muted">
            Already did {doneToday.map((d) => d.label).join(", ")} today — train again?
          </p>
          <div className="space-y-1.5 pt-1">
            {remaining.map((day) => (
              <div
                key={day.id}
                className={clsx(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition",
                  day.id === selectedDayId
                    ? "border-accent-blue bg-surface-2"
                    : "border-border bg-surface"
                )}
              >
                <span>
                  Day {day.dayNumber} · {day.label}
                </span>
                <button
                  type="button"
                  onClick={() => selectDay(day.id)}
                  className="rounded-md bg-accent-lime px-3 py-1 text-xs font-semibold text-background transition hover:brightness-110"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div ref={formRef}>
        {selectedDay ? (
          <form action={submitCheckIn} className="space-y-6">
            <input type="hidden" name="trainingDayTemplateId" value={selectedDay.id} />

            <Card className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted">
                Ready for Day {selectedDay.dayNumber}?
              </p>
              <p className="text-lg font-bold">{selectedDay.label}</p>
              <p className="text-sm text-muted">{selectedDay.goal}</p>
            </Card>

            <Card className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Daily Check-In
              </h2>
              <p className="text-sm text-muted">How are you feeling?</p>
              <MoodPicker name="mood" />
            </Card>

            <Card className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Readiness
              </h2>
              <RatingPicker name="energyLevel" label="Energy Level" defaultValue={3} accent="blue" />
              <RatingPicker
                name="muscleSoreness"
                label="Muscle Soreness"
                defaultValue={2}
                accent="red"
              />
              <RatingPicker name="sleepQuality" label="Sleep Quality" defaultValue={3} accent="green" />
            </Card>

            <Card className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Today&apos;s Focus
              </h2>
              <SessionFocusPicker name="focus" />
              <textarea
                name="note"
                placeholder="Optional note…"
                rows={2}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent-blue"
              />
            </Card>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-accent-lime py-3.5 text-center font-bold text-background transition hover:brightness-110"
              >
                Start Planned Session ⚡
              </button>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => skipDay(selectedDay.id))}
              className="w-full text-center text-sm text-muted transition hover:text-accent-red disabled:opacity-50"
            >
              {isPending ? "Skipping…" : `Skip Day ${selectedDay.dayNumber} today`}
            </button>
          </form>
        ) : (
          <Card>
            <p className="text-sm text-muted">
              🎉 You&apos;ve started every session in the split today. Rest up, or check the{" "}
              <Link href="/dashboard" className="text-accent-blue underline">
                Dashboard
              </Link>
              .
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
