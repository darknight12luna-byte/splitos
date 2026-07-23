"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { reopenSession, deleteSession } from "@/lib/actions";

export function CalendarSessionEntry({
  sessionId,
  href,
  label,
  title,
  className,
  isSkipped,
}: {
  sessionId: string;
  href: string;
  label: string;
  title: string;
  className: string;
  isSkipped: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleReopen = () => {
    setError(null);
    startTransition(async () => {
      const result = await reopenSession(sessionId);
      if (!result.success) {
        setError(result.error);
      } else {
        router.push(`/session/${sessionId}`);
      }
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this session permanently? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteSession(sessionId);
      if (!result.success) setError(result.error);
    });
  };

  return (
    <div className="relative">
      {isSkipped ? (
        <button
          type="button"
          onClick={handleReopen}
          disabled={isPending}
          title={error ?? "Reopen this skipped session"}
          className={clsx(
            "flex w-full items-center justify-center gap-0.5 rounded border px-0.5 py-[1px] text-[9px] font-semibold leading-tight transition hover:brightness-125 disabled:opacity-50",
            error ? "border-accent-red/60 text-accent-red" : className
          )}
        >
          {isPending ? "…" : error ? "! retry" : <>↺ {label}</>}
        </button>
      ) : (
        <Link
          href={href}
          title={title}
          className={clsx(
            "block rounded border px-0.5 py-[1px] text-[9px] font-semibold leading-tight transition hover:brightness-125",
            className
          )}
        >
          {label}
        </Link>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Delete this session"
        title="Delete this session permanently"
        className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-accent-red/80 text-[7px] leading-none text-white transition hover:bg-accent-red disabled:opacity-50"
      >
        ×
      </button>
    </div>
  );
}
