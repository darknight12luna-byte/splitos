import Link from "next/link";
import clsx from "clsx";
import { format } from "date-fns";
import { getCalendarMonth } from "@/lib/training/calendar";
import { getActiveChallenge } from "@/lib/challenge";
import { Card } from "@/components/ui/Card";

const CATEGORY_ABBR: Record<string, string> = {
  upper_body: "UB",
  lower_body: "LB",
  animal_flow: "AF",
  mixed: "MX",
};

const CATEGORY_BADGE: Record<string, string> = {
  upper_body: "bg-accent-blue/25 text-accent-blue border-accent-blue/40",
  lower_body: "bg-accent-green/25 text-accent-green border-accent-green/40",
  animal_flow: "bg-accent-purple/25 text-accent-purple border-accent-purple/40",
  mixed: "bg-accent-orange/25 text-accent-orange border-accent-orange/40",
};

const STATUS_RING: Record<string, string> = {
  NOT_STARTED: "opacity-50",
  IN_PROGRESS: "ring-1 ring-accent-blue",
  COMPLETED: "",
  PARTIAL: "ring-1 ring-accent-orange",
  SKIPPED: "opacity-40 line-through",
};

function sessionHref(id: string, status: string) {
  return status === "COMPLETED" || status === "SKIPPED" ? `/content?session=${id}` : `/session/${id}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const { y, m } = await searchParams;
  const now = new Date();
  const year = y ? Number(y) : now.getFullYear();
  const month = m ? Number(m) - 1 : now.getMonth();

  const [days, challenge] = await Promise.all([
    getCalendarMonth(year, month),
    getActiveChallenge(),
  ]);

  const challengeDateKeys = new Set(
    (challenge?.days ?? []).map((d) => format(d.date, "yyyy-MM-dd"))
  );

  const monthDate = new Date(year, month, 1);
  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const leadingBlanks = days.length > 0 ? days[0].date.getDay() : 0;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-sm text-muted">{format(monthDate, "MMMM yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/calendar?y=${prevMonth.getFullYear()}&m=${prevMonth.getMonth() + 1}`}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
          >
            ←
          </Link>
          <Link
            href={`/calendar?y=${nextMonth.getFullYear()}&m=${nextMonth.getMonth() + 1}`}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
          >
            →
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-muted">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map((day) => {
            const inChallenge = challengeDateKeys.has(day.dateKey);
            return (
              <div
                key={day.dateKey}
                className={clsx(
                  "flex aspect-square flex-col items-center gap-0.5 rounded-lg border p-1 text-center",
                  day.isToday ? "border-accent-blue" : "border-border"
                )}
              >
                <div className="flex w-full items-center justify-between px-0.5">
                  <span className="text-[10px] text-muted">{day.date.getDate()}</span>
                  {inChallenge && <span className="text-[9px]">🔥</span>}
                </div>
                <div className="flex w-full flex-1 flex-col items-stretch justify-center gap-0.5">
                  {day.sessions.map((s) => (
                    <Link
                      key={s.id}
                      href={sessionHref(s.id, s.status)}
                      title={`${s.dayLabel} · ${s.title} · ${s.status} · ${s.completionPct}%`}
                      className={clsx(
                        "rounded border px-0.5 py-[1px] text-[9px] font-semibold leading-tight transition hover:brightness-125",
                        CATEGORY_BADGE[s.category] ?? CATEGORY_BADGE.mixed,
                        STATUS_RING[s.status]
                      )}
                    >
                      {CATEGORY_ABBR[s.category] ?? "?"} {s.completionPct}%
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Legend</h2>
        <div className="flex flex-wrap gap-3 text-xs text-muted">
          {Object.entries(CATEGORY_ABBR).map(([category, abbr]) => (
            <div key={category} className="flex items-center gap-1.5">
              <span
                className={clsx(
                  "rounded border px-1.5 py-0.5 text-[10px] font-semibold",
                  CATEGORY_BADGE[category]
                )}
              >
                {abbr}
              </span>
              {category.replace("_", " ")}
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="rounded ring-1 ring-accent-orange px-1.5 py-0.5 text-[10px]">
              ring
            </span>
            partial
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded opacity-40 line-through px-1.5 py-0.5 text-[10px] border border-border">
              abc
            </span>
            skipped
          </div>
          <div className="flex items-center gap-1.5">🔥 challenge day</div>
        </div>
      </Card>
    </div>
  );
}
