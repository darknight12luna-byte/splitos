"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const TABS = [
  { href: "/", label: "Daily", icon: "🏠", match: (p: string) => p === "/" },
  {
    href: "/exercises",
    label: "Library",
    icon: "📚",
    match: (p: string) => p.startsWith("/exercises") || p.startsWith("/movements"),
  },
  {
    href: "/custom",
    label: "Custom",
    icon: "🛠️",
    match: (p: string) => p.startsWith("/custom") || p.startsWith("/checkin"),
  },
  {
    href: "/dashboard",
    label: "Stats",
    icon: "📊",
    match: (p: string) => p.startsWith("/dashboard") || p.startsWith("/calendar"),
  },
  { href: "/challenge", label: "Me", icon: "👤", match: (p: string) => p.startsWith("/challenge") },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-2 pb-2 md:bottom-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
    >
      <div className="flex w-full max-w-md items-stretch justify-between gap-1 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-xl shadow-black/10 backdrop-blur md:max-w-lg md:rounded-full md:px-2">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-medium transition md:flex-row md:gap-1.5 md:rounded-full md:px-4 md:py-2 md:text-sm",
                active ? "bg-accent-lime/15 text-foreground font-semibold" : "text-muted hover:text-foreground"
              )}
            >
              <span
                className={clsx("text-lg leading-none md:text-base", active && "text-accent-lime")}
                aria-hidden
              >
                {tab.icon}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
