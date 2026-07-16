"use client";

import { useState, useTransition } from "react";
import { startChallenge, endChallenge } from "@/lib/actions";
import { Card } from "@/components/ui/Card";

export function StartChallengeForm({ title }: { title: string }) {
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

export function EndChallengeLink({ challengeId }: { challengeId: string }) {
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
