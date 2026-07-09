"use client";

import { useRouter } from "next/navigation";

export function SessionPicker({
  sessions,
  currentId,
}: {
  sessions: { id: string; title: string; date: string }[];
  currentId: string;
}) {
  const router = useRouter();

  return (
    <select
      value={currentId}
      onChange={(e) => router.push(`/content?session=${e.target.value}`)}
      className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent-blue"
    >
      {sessions.map((s) => (
        <option key={s.id} value={s.id}>
          {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} ·{" "}
          {s.title}
        </option>
      ))}
    </select>
  );
}
