import type { DistributionEntry } from "@gp/shared";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DistributionChartProps {
  entries: DistributionEntry[];
  /** Horizontal cuando las etiquetas son largas (géneros); vertical para años. */
  orientation?: "vertical" | "horizontal";
}

const AXIS = { fill: "#8296aa", fontSize: 11, fontFamily: "JetBrains Mono" };

export function DistributionChart({ entries, orientation = "vertical" }: DistributionChartProps) {
  if (entries.length === 0) {
    return <p className="py-12 text-center text-sm text-muted/60">Sin datos todavía</p>;
  }

  const isHorizontal = orientation === "horizontal";
  const height = isHorizontal ? Math.max(180, entries.length * 30) : 260;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={entries}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
      >
        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              width={110}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          </>
        )}

        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "#141d2a",
            border: "1px solid #25313f",
            borderRadius: 6,
            fontSize: 12,
          }}
          labelStyle={{ color: "#eef3f8" }}
          itemStyle={{ color: "#7ba3c9" }}
        />

        <Bar dataKey="value" fill="#7ba3c9" radius={3} />
      </BarChart>
    </ResponsiveContainer>
  );
}
