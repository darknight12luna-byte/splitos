"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function BottomNav({ todaySessionHref }: { todaySessionHref: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: todaySessionHref, label: "Today", icon: "⚡" },
    { href: "/movements", label: "Movements", icon: "🐆" },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.label}
            href={l.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] transition",
              active ? "text-accent-lime" : "text-muted"
            )}
          >
            <span className="text-lg leading-none" aria-hidden>
              {l.icon}
            </span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
