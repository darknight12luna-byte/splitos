"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { href: "/", label: "Check-In", icon: "🏠" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/program", label: "Program", icon: "📋" },
  { href: "/exercises", label: "Exercises", icon: "🏋️" },
  { href: "/movements", label: "Movements", icon: "🐆" },
  { href: "/challenge", label: "Challenge", icon: "🔥" },
  { href: "/content", label: "Content", icon: "✍️" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 hidden border-b border-border bg-background/80 backdrop-blur md:block">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="text-accent-lime">◆</span>
          Gymfit
        </Link>
        <nav className="flex flex-wrap gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition",
                pathname === l.href
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:text-foreground"
              )}
            >
              <span aria-hidden>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
