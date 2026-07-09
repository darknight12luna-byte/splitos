"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";

export interface CatalogListItem {
  slug: string;
  name: string;
  category: string;
  subtitle: string;
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
              ? "border-accent-green bg-accent-green/10 text-accent-green"
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
                ? "border-accent-green bg-accent-green/10 text-accent-green"
                : "border-border text-muted hover:text-foreground"
            )}
          >
            {c.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted">No matches.</p>
        )}
        {filtered.map((item) => (
          <Link key={item.slug} href={`${basePath}/${item.slug}`}>
            <Card className="flex items-center justify-between transition hover:border-accent-blue/40">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted">{item.subtitle}</p>
              </div>
              <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize text-muted">
                {item.category.replace(/_/g, " ")}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
