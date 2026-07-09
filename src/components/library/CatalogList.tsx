"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export interface CatalogListItem {
  slug: string;
  name: string;
  category: string;
  subtitle: string;
  color: string;
  icon: string;
  difficulty?: string;
  hasVideo?: boolean;
}

export function CatalogList({
  items,
  basePath,
}: {
  items: CatalogListItem[];
  basePath: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).sort(),
    [items]
  );

  const filtered = items.filter((i) => {
    const matchesQuery = i.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || i.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent-blue"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={clsx(
            "rounded-full border px-3 py-1 text-xs transition",
            category === null
              ? "border-accent-lime bg-accent-lime/10 text-accent-lime"
              : "border-border text-muted hover:text-foreground"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs capitalize transition",
              category === c
                ? "border-accent-lime bg-accent-lime/10 text-accent-lime"
                : "border-border text-muted hover:text-foreground"
            )}
          >
            {c.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-sm text-muted">No matches.</p>}

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((item) => (
          <Link key={item.slug} href={`${basePath}/${item.slug}`}>
            <div
              className="flex h-full flex-col gap-2 rounded-2xl border p-3.5 transition hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, color-mix(in oklab, ${item.color} 18%, var(--surface)), var(--surface) 70%)`,
                borderColor: `color-mix(in oklab, ${item.color} 30%, var(--border))`,
              }}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {item.icon}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{item.name}</p>
                <p className="mt-0.5 text-xs text-muted">{item.subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {item.difficulty && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                    style={{
                      color: item.color,
                      background: `color-mix(in oklab, ${item.color} 15%, transparent)`,
                    }}
                  >
                    {item.difficulty.replace(/_/g, " ")}
                  </span>
                )}
                {item.hasVideo && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">
                    ▶ Watch
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
