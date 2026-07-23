import Link from "next/link";
import clsx from "clsx";
import { format, addDays, subDays } from "date-fns";
import { getCalendarMonth, getCalendarWeek, getCalendarDay } from "@/lib/training/calendar";
import { getActiveChallenge } from "@/lib/challenge";
import { Card } from "@/components/ui/Card";
import { CalendarSessionEntry } from "@/components/CalendarSessionEntry";
import { CalendarDaySessionCard } from "@/components/CalendarDaySessionCard";

type View = "month" | "week" | "day";

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

function viewHref(view: View, anchor: Date) {
  return `/calendar?view=${view}&y=${anchor.getFullYear()}&m=${anchor.getMonth() + 1}&d=${anchor.getDate()}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string; d?: string; view?: string }>;
}) {
  const { y, m, d, view: viewParam } = await searchParams;
  const view: View = viewParam === "week" ? "week" : viewParam === "day" ? "day" : "month";
  const now = new Date();
  const year = y ? Number(y) : now.getFullYear();
  const month = m ? Number(m) - 1 : now.getMonth();
  const day = d ? Number(d) : now.getDate();
  const anchorDate = new Date(year, month, day);

  const [days, dayEntry, challenge] = await Promise.all([
    view === "week" ? getCalendarWeek(anchorDate) : view === "month" ? getCalendarMonth(year, month) : Promise.resolve([]),
    view === "day" ? getCalendarDay(anchorDate) : Promise.resolve(null),
    getActiveChallenge(),
  ]);

  const challengeDateKeys = new Set(
    (challenge?.days ?? []).map((d) => format(d.date, "yyyy-MM-dd"))
  );

  const leadingBlanks = days.length > 0 ? days[0].date.getDay() : 0;

  const prevHref =
    view === "day"
      ? viewHref("day", subDays(anchorDate, 1))
      : view === "week"
      ? viewHref("week", subDays(anchorDate, 7))
      : viewHref("month", new Date(year, month - 1, 1));
  const nextHref =
    view === "day"
      ? viewHref("day", addDays(anchorDate, 1))
      : view === "week"
      ? viewHref("week", addDays(anchorDate, 7))
      : viewHref("month", new Date(year, month + 1, 1));

  const heading =
    view === "day"
      ? format(anchorDate, "EEEE, MMMM d, yyyy")
      : view === "week"
      ? days.length > 0
        ? `${format(days[0].date, "MMM d")} – ${format(days[days.length - 1].date, "MMM d, yyyy")}`
        : ""
      : format(new Date(year, month, 1), "MMMM yyyy");

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-sm text-muted">{heading}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={prevHref}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
          >
            ←
          </Link>
          <Link
            href={nextHref}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
          >
            →
          </Link>
        </div>
      </div>

      <div className="flex gap-1.5 rounded-xl border border-border bg-surface p-1 text-sm">
        {(["month", "week", "day"] as const).map((v) => (
          <Link
            key={v}
            href={viewHref(v, anchorDate)}
            className={clsx(
              "flex-1 rounded-lg py-1.5 text-center font-medium capitalize transition",
              view === v ? "bg-accent-lime/20 text-foreground font-semibold" : "text-muted hover:text-foreground"
            )}
          >
            {v}
          </Link>
        ))}
      </div>

      {view === "day" ? (
        <>
          {challengeDateKeys.has(dayEntry?.dateKey ?? "") && (
            <p className="text-sm font-semibold text-accent-orange">🔥 Challenge day</p>
          )}
          {!dayEntry || dayEntry.sessions.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">No sessions logged this day.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {dayEntry.sessions.map((s) => (
                <CalendarDaySessionCard
                  key={s.id}
                  sessionId={s.id}
                  dayLabel={s.dayLabel}
                  title={s.title}
                  status={s.status}
                  completionPct={s.completionPct}
                  category={s.category}
                  href={sessionHref(s.id, s.status)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <Card>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-muted">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {view === "month" &&
                Array.from({ length: leadingBlanks }).map((_, i) => <div key={`blank-${i}`} />)}
              {days.map((dayEntry) => {
                const inChallenge = challengeDateKeys.has(dayEntry.dateKey);
                return (
                  <div
                    key={dayEntry.dateKey}
                    className={clsx(
                      "flex flex-col items-center gap-0.5 rounded-lg border p-1 text-center",
                      view === "week" ? "min-h-[220px]" : "aspect-square",
                      dayEntry.isToday ? "border-accent-blue" : "border-border"
                    )}
                  >
                    <div className="flex w-full items-center justify-between px-0.5">
                      <Link
                        href={viewHref("day", dayEntry.date)}
                        className="text-[10px] text-muted hover:text-foreground hover:underline"
                      >
                        {dayEntry.date.getDate()}
                      </Link>
                      {inChallenge && <span className="text-[9px]">🔥</span>}
                    </div>
                    <div className="flex w-full flex-1 flex-col items-stretch justify-center gap-1 pt-0.5">
                      {dayEntry.sessions.map((s) => (
                        <CalendarSessionEntry
                          key={s.id}
                          sessionId={s.id}
                          href={sessionHref(s.id, s.status)}
                          title={`${s.dayLabel} · ${s.title} · ${s.status} · ${s.completionPct}%`}
                          label={`${CATEGORY_ABBR[s.category] ?? "?"} ${s.completionPct}%`}
                          isSkipped={s.status === "SKIPPED"}
                          className={clsx(
                            CATEGORY_BADGE[s.category] ?? CATEGORY_BADGE.mixed,
                            STATUS_RING[s.status]
                          )}
                        />
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
                skipped — tap to reopen
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-accent-red/80 text-[7px] text-white">
                  ×
                </span>
                delete session
              </div>
              <div className="flex items-center gap-1.5">🔥 challenge day</div>
              <div className="flex items-center gap-1.5">tap the date number → day view</div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
