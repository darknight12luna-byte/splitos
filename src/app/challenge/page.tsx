import clsx from "clsx";
import { getActiveChallenge } from "@/lib/challenge";
import { startChallenge, endChallenge } from "@/lib/actions";
import { Card } from "@/components/ui/Card";

export default async function ChallengePage() {
  const challenge = await getActiveChallenge();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Challenge</h1>
        <p className="text-sm text-muted">
          A serialized hook to keep people coming back to your feed.
        </p>
      </div>

      {challenge ? (
        <>
          <Card className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">{challenge.name}</p>
                <p className="text-3xl font-bold">
                  Day {challenge.dayNumber}
                  <span className="text-lg text-muted">/{challenge.durationDays}</span>
                </p>
              </div>
              {challenge.isComplete && (
                <span className="rounded-full bg-accent-green/20 px-3 py-1 text-xs font-semibold text-accent-green">
                  Complete 🎉
                </span>
              )}
            </div>

            <div className="grid grid-cols-10 gap-1.5">
              {challenge.days.map((d) => (
                <div
                  key={d.date.toISOString()}
                  title={d.date.toDateString()}
                  className={clsx(
                    "flex aspect-square items-center justify-center rounded-md border text-[10px]",
                    d.completed
                      ? "border-accent-green bg-accent-green text-background"
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
          </Card>

          <form action={endChallenge.bind(null, challenge.id)}>
            <button
              type="submit"
              className="text-sm text-muted transition hover:text-accent-red"
            >
              End this challenge
            </button>
          </form>
        </>
      ) : (
        <Card className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Start a Challenge
          </h2>
          <form action={startChallenge} className="space-y-3">
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
                max={90}
                className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent-blue"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-accent-green py-3 font-bold text-background transition hover:brightness-110"
            >
              Start Challenge
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
