"use client";

import { useState, useTransition } from "react";
import { regenerateCaption } from "@/lib/actions";

export function CaptionBox({ sessionId, caption }: { sessionId: string; caption: string }) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <textarea
        readOnly
        value={caption}
        rows={5}
        className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm leading-relaxed outline-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(caption);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="rounded-lg bg-accent-lime px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110"
        >
          {copied ? "Copied ✓" : "Copy Caption"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => regenerateCaption(sessionId))}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:text-foreground disabled:opacity-50"
        >
          {isPending ? "Regenerating…" : "Regenerate"}
        </button>
      </div>
    </div>
  );
}
