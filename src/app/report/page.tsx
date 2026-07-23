import Link from "next/link";
import { getSessionComplianceReport } from "@/lib/stats";
import { Card } from "@/components/ui/Card";
import { ComplianceReportChart } from "@/components/ComplianceReportChart";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const rows = await getSessionComplianceReport();

  const totalPlanned = rows.reduce((sum, r) => sum + r.planned, 0);
  const totalCompleted = rows.reduce((sum, r) => sum + r.completed, 0);
  const totalPartial = rows.reduce((sum, r) => sum + r.partial, 0);
  const overallPct = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Report</h1>
        <p className="text-sm text-muted">Every session, planned vs. actually done.</p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">
            No sessions yet — check in from{" "}
            <Link href="/checkin" className="text-accent-blue underline">
              Build Your Routine
            </Link>{" "}
            to start building your history.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <p className="text-2xl font-bold text-accent-lime">{overallPct}%</p>
              <p className="text-xs text-muted">Overall Compliance</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold">{rows.length}</p>
              <p className="text-xs text-muted">Sessions Logged</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-accent-orange">{totalPartial}</p>
              <p className="text-xs text-muted">Partial Items</p>
            </Card>
          </div>

          <Card>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Planned vs. Actual, Per Session
            </h2>
            <p className="mb-3 text-xs text-muted">
              Each bar is one session&apos;s full plan — the color mix shows what actually happened:
              completed, partial, or missed.
            </p>
            <ComplianceReportChart data={rows} />
          </Card>
        </>
      )}
    </div>
  );
}
