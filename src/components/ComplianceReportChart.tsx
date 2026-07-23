"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { SessionComplianceRow } from "@/lib/stats";

export function ComplianceReportChart({ data }: { data: SessionComplianceRow[] }) {
  // Keep each bar a legible width even as history grows — scroll horizontally instead
  // of squeezing every session into a fixed-width chart.
  const minWidth = Math.max(data.length * 64, 320);

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth }}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="var(--muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              cursor={{ fill: "var(--surface-2)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="completed"
              name="Completed"
              stackId="a"
              fill="var(--accent-lime)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="partial"
              name="Partial"
              stackId="a"
              fill="var(--accent-orange)"
            />
            <Bar
              dataKey="missed"
              name="Missed"
              stackId="a"
              fill="var(--accent-red)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
