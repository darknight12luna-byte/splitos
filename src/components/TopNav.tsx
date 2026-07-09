"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const SECONDARY_LINKS = [
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/program", label: "Program", icon: "📋" },
  { href: "/exercises", label: "Exercises", icon: "🏋️" },
  { href: "/challenge", label: "Challenge", icon: "🔥" },
  { href: "/content", label: "Content", icon: "✍️" },
];

function NavLink({
  href,
  label,
  icon,
  active,
  primary,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition",
        primary ? "text-sm font-semibold" : "text-xs",
        active
          ? primary
            ? "bg-accent-lime/15 text-accent-lime"
            : "bg-surface-2 text-foreground"
          : "text-muted hover:text-foreground"
      )}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </Link>
  );
}

export function TopNav({ todaySessionHref }: { todaySessionHref: string }) {
  const pathname = usePathname();

  const primaryLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: todaySessionHref, label: "Today's Session", icon: "⚡" },
    { href: "/movements", label: "Movements", icon: "🐆" },
  ];

  return (
    <header className="sticky top-0 z-10 hidden border-b border-border bg-background/80 backdrop-blur md:block">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="text-accent-lime">◆</span>
          Gymfit
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-1">
            {primaryLinks.map((l) => (
              <NavLink key={l.label} {...l} active={pathname === l.href} primary />
            ))}
          </nav>

          <div className="h-5 w-px bg-border" aria-hidden />

          <nav className="flex flex-wrap gap-1">
            {SECONDARY_LINKS.map((l) => (
              <NavLink key={l.href} {...l} active={pathname === l.href} />
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
