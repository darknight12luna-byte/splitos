"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import Link from "next/link";
import { startChallenge, endChallenge } from "@/lib/actions";
import { Card } from "@/components/ui/Card";
import { RadialGauge } from "@/components/ui/RadialGauge";

interface StartChallengeFormProps {
  title: string;
}

function StartChallengeForm({ title }: StartChallengeFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await startChallenge(formData);
      if (!result.success) {
        setErrorMsg(result.error);
      } else {
        e.currentTarget.reset();
      }
    });
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {errorMsg && (
          <div className="rounded-lg border border-accent-red/50 bg-accent-red/10 p-2 text-xs text-accent-red">
            {errorMsg}
          </div>
        )}
        <label className="block text-sm">
          Challenge name
          <input
            name="name"
            type="text"
            required
            placeholder="30 Days of Handstands"
            className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent-blue"
          />
        </label>
        <label className="block text-sm">
          Duration (days)
          <input
            name="durationDays"
            type="number"
            defaultValue={30}
            min={1}
            max={365}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent-blue"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-accent-lime py-3 font-bold text-background transition hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Starting…" : "Start Challenge"}
        </button>
      </form>
    </Card>
  );
}

interface EndChallengeLinkProps {
  challengeId: string;
}

function EndChallengeLink({ challengeId }: EndChallengeLinkProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnd = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await endChallenge(challengeId);
      if (!result.success) {
        setErrorMsg(result.error);
      }
    });
  };

  return (
    <>
      {errorMsg && (
        <Card className="border border-accent-red/50 bg-accent-red/10 p-2">
          <p className="text-xs text-accent-red">{errorMsg}</p>
        </Card>
      )}
      <button
        onClick={handleEnd}
        disabled={isPending}
        className="text-sm text-muted transition hover:text-accent-red disabled:opacity-50"
      >
        {isPending ? "Ending…" : "End this challenge"}
      </button>
    </>
  );
}

import { getActiveChallenge, getChallengeHistory } from "@/lib/challenge";
import { getStreakDays } from "@/lib/stats";

export default async function ChallengePage() {
  const [challenge, history, streakDays] = await Promise.all([
    getActiveChallenge(),
    getChallengeHistory(),
    getStreakDays(),
  ]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Challenge</h1>
        <p className="text-sm text-muted">
          A serialized hook to keep people coming back to your feed.
        </p>
      </div>

      {challenge ? (
        <>
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">{challenge.name}</p>
                <p className="text-3xl font-bold">
                  Day {challenge.dayNumber}
                  <span className="text-lg text-muted">/{challenge.durationDays}</span>
                </p>
                {streakDays > 0 && (
                  <p className="mt-1 text-sm font-semibold text-accent-orange">
                    🔥 {streakDays} day{streakDays === 1 ? "" : "s"} streak
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {challenge.isComplete && (
                  <span className="rounded-full bg-accent-lime/20 px-3 py-1 text-xs font-semibold text-accent-lime">
                    Complete 🎉
                  </span>
                )}
                <RadialGauge
                  pct={(challenge.completedDays / challenge.durationDays) * 100}
                  value={`${Math.round((challenge.completedDays / challenge.durationDays) * 100)}%`}
                  label="Progress"
                  color="var(--accent-lime)"
                />
              </div>
            </div>

            <div className="grid grid-cols-10 gap-1.5">
              {challenge.days.map((d) => (
                <div
                  key={d.date.toISOString()}
                  title={d.date.toDateString()}
                  className={clsx(
                    "flex aspect-square items-center justify-center rounded-md border text-[10px]",
                    d.completed
                      ? "border-accent-lime bg-accent-lime text-background"
                      : d.isToday
                      ? "border-accent-blue text-accent-blue"
                      : d.isFuture
                      ? "border-border text-muted/40"
                      : "border-border text-muted"
                  )}
                >
                  {d.label}
                </div>
              ))}
            </div>

            <p className="text-sm text-muted">
              {challenge.completedDays} of {challenge.durationDays} days completed
            </p>

            {!challenge.isComplete && (
              <Link
                href="/"
                className="block w-full rounded-xl bg-accent-lime py-3 text-center font-bold text-background transition hover:brightness-110"
              >
                {challenge.days.find((d) => d.isToday)?.completed
                  ? "✓ Checked in today"
                  : "Check In For Today"}
              </Link>
            )}
          </Card>

          <EndChallengeLink challengeId={challenge.id} />

          {challenge.isComplete && <StartChallengeForm title="Start a New Challenge" />}
        </>
      ) : (
        <StartChallengeForm title="Start a Challenge" />
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Challenge History
          </h2>
          <div className="space-y-2">
            {history.map((h) => (
              <Card key={h.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{h.name}</p>
                  <p className="text-xs text-muted">
                    {h.startDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · {h.durationDays} days
                  </p>
                </div>
                <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                  {h.completedDays}/{h.durationDays} done
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
