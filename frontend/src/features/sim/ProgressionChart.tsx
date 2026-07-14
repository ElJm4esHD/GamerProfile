import { formatLapTime, type LapRecord, type Track } from "@gp/shared";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildProgression } from "./progression.js";

interface ProgressionChartProps {
  laps: readonly LapRecord[];
  tracks: readonly Track[];
}

const AXIS = { fill: "#8296aa", fontSize: 11, fontFamily: "JetBrains Mono" };

/** Una línea por auto. Paleta corta y apagada: no compite con los datos. */
const COLORS = ["#7ba3c9", "#8fbf9f", "#c9a87b", "#a98fc9", "#c98f9f"];

export function ProgressionChart({ laps, tracks }: ProgressionChartProps) {
  // Arranca en el circuito donde más corriste: es el que tiene algo que contar.
  const busiest = useMemo(() => findBusiestTrack(laps), [laps]);
  const [trackId, setTrackId] = useState<string | null>(busiest);

  const selected = trackId ?? busiest;
  const progression = useMemo(() => buildProgression(laps, selected), [laps, selected]);

  // Con un solo punto no hay evolución que mostrar, solo un punto suelto.
  const hasEnoughData = progression.points.length >= 2;

  const available = tracks.filter((track) => laps.some((lap) => lap.track.id === track.id));
  if (available.length === 0) return null;

  return (
    <section className="mb-8 rounded-lg border border-line bg-surface/40 p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
          Evolución de tiempos
        </h2>

        <select
          value={selected ?? ""}
          onChange={(event) => setTrackId(event.target.value || null)}
          className="cursor-pointer rounded-md border border-line bg-canvas px-3 py-1.5 text-sm text-ink focus:border-accent/60"
        >
          {available.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>

      {!hasEnoughData ? (
        <p className="py-12 text-center text-sm text-muted/60">
          Hacen falta al menos dos intentos en este circuito para ver una evolución.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progression.points} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
            <CartesianGrid stroke="#25313f" strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="date" tick={AXIS} axisLine={false} tickLine={false} />

            <YAxis
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              width={70}
              // El dominio se ajusta a los datos: con tiempos de 1:42, arrancar
              // el eje en cero aplastaría toda la variación contra el techo.
              domain={["dataMin - 2000", "dataMax + 2000"]}
              tickFormatter={(value: number) => formatLapTime(value)}
            />

            <Tooltip
              contentStyle={{
                background: "#141d2a",
                border: "1px solid #25313f",
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{ color: "#eef3f8" }}
              formatter={(value: number, name: string) => [formatLapTime(value), name]}
            />

            {progression.carNames.map((carName, index) => (
              <Line
                key={carName}
                type="monotone"
                dataKey={carName}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                // Sin esto, un día sin vuelta con ese auto cortaría la línea.
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      <p className="mt-4 text-xs text-muted/70">
        Cuanto más baja la línea, más rápido. Una serie por auto.
      </p>
    </section>
  );
}

function findBusiestTrack(laps: readonly LapRecord[]): string | null {
  const counts = new Map<string, number>();
  for (const lap of laps) counts.set(lap.track.id, (counts.get(lap.track.id) ?? 0) + 1);

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}
