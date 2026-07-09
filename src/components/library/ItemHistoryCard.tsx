import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ItemHistory } from "@/lib/training/history";

export function ItemHistoryCard({ history }: { history: ItemHistory }) {
  if (history.timesLogged === 0) {
    return (
      <Card>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">History</h2>
        <p className="text-sm italic text-muted">
          You haven&apos;t logged this yet — it&apos;ll show up here once you do.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">History</h2>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-muted">Last Performed</p>
          <p className="font-semibold">
            {history.lastPerformed
              ? new Date(history.lastPerformed).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">Compliance</p>
          <p className="font-semibold">
            {history.complianceRate != null ? `${history.complianceRate}%` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">Best Weight</p>
          <p className="font-semibold">
            {history.bestWeightKg != null ? `${history.bestWeightKg} kg` : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        {history.entries.slice(0, 10).map((entry) => (
          <div
            key={entry.sessionLogId}
            className={clsx(
              "flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm",
              entry.isHighlight && "border-accent-orange/40"
            )}
          >
            <div>
              <p className="text-xs text-muted">
                {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                · {entry.dayLabel}
              </p>
              <p>
                {entry.actualSets != null || entry.actualReps
                  ? `${entry.actualSets ?? "—"} x ${entry.actualReps ?? "—"}`
                  : "no dose logged"}
                {entry.actualWeightKg != null && ` · ${entry.actualWeightKg}kg`}
                {entry.isHighlight && " 🏆"}
              </p>
            </div>
            <StatusBadge status={entry.completionStatus} />
          </div>
        ))}
      </div>
    </Card>
  );
}
