"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-xl bg-accent-lime px-6 py-3 font-bold text-background transition hover:brightness-110"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-border px-6 py-3 font-bold text-foreground transition hover:bg-surface"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
