"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

export function WatchAndLearn({
  videoId,
  title,
  tiktokQuery,
}: {
  videoId: string | null;
  title: string;
  tiktokQuery: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const tiktokUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(tiktokQuery)}`;

  async function copyTiktokQuery() {
    try {
      await navigator.clipboard.writeText(tiktokQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied — the visible text is still selectable/copyable manually
    }
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Watch &amp; Learn</h2>

      {videoId ? (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-2">
          {loaded ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
              title={title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-muted transition hover:text-foreground"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-lime text-background">
                ▶
              </span>
              Load video
            </button>
          )}
        </div>
      ) : (
        <p className="italic text-muted">No verified video for this movement yet.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {videoId && (
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-3 py-1.5 text-xs text-accent-blue transition hover:border-accent-blue"
          >
            ▶ Watch on YouTube
          </a>
        )}
        <a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
        >
          🔍 Search TikTok: &quot;{tiktokQuery}&quot;
        </a>
        <button
          type="button"
          onClick={copyTiktokQuery}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
        >
          {copied ? "Copied!" : "Copy search"}
        </button>
      </div>
    </Card>
  );
}
