"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function SetsChart({ data }: { data: { day: string; items: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="day"
          stroke="var(--muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} width={28} />
        <Tooltip
          contentStyle={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          cursor={{ fill: "var(--surface-2)" }}
        />
        <Bar dataKey="items" radius={[6, 6, 0, 0]} fill="var(--accent-blue)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
