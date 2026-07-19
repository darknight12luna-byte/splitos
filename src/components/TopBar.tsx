"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

function buildLinks(todaySessionHref: string) {
  return [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: todaySessionHref, label: "Today's Session", icon: "⚡" },
    { href: "/movements", label: "Movements", icon: "🐆" },
    { href: "/calendar", label: "Calendar", icon: "📅" },
    { href: "/program", label: "Program", icon: "📋" },
    { href: "/exercises", label: "Exercises", icon: "🏋️" },
    { href: "/challenge", label: "Challenge", icon: "🔥" },
    { href: "/content", label: "Content", icon: "✍️" },
  ];
}

export function TopBar({ todaySessionHref }: { todaySessionHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu whenever navigation happens
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click / touch / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = buildLinks(todaySessionHref);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2.5">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="text-accent-lime" aria-hidden>
            ◆
          </span>
          Gymfit
        </Link>

        <div className="relative flex items-center gap-1.5" ref={menuRef}>
          <Link
            href={todaySessionHref}
            className="flex items-center gap-1.5 rounded-lg bg-accent-lime/15 px-3 py-1.5 text-sm font-semibold text-accent-lime transition hover:bg-accent-lime/25"
          >
            <span aria-hidden>⚡</span>
            <span className="hidden sm:inline">Today</span>
          </Link>

          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-lg border transition",
              open
                ? "border-accent-lime/40 bg-surface-2 text-accent-lime"
                : "border-border text-muted hover:text-foreground"
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {open && (
            <nav className="absolute right-0 top-[calc(100%+0.5rem)] w-60 rounded-xl border border-border bg-surface p-1.5 shadow-xl shadow-black/50">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.label}
                    href={l.href}
                    className={clsx(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition",
                      active
                        ? "bg-accent-lime/15 font-semibold text-accent-lime"
                        : "text-foreground/90 hover:bg-surface-2"
                    )}
                  >
                    <span aria-hidden>{l.icon}</span>
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
