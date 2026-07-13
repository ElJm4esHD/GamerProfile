import { formatGap, formatLapTime, type LapRecord } from "@gp/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface ColumnOptions {
  onEdit: (lap: LapRecord) => void;
  onDelete: (lap: LapRecord) => void;
}

export function useLapColumns({ onEdit, onDelete }: ColumnOptions): ColumnDef<LapRecord>[] {
  return useMemo(
    () => [
      {
        id: "best",
        header: "",
        enableSorting: false,
        accessorFn: (lap) => lap.isPersonalBest,
        cell: ({ row }) =>
          row.original.isPersonalBest ? (
            <span
              title="Mejor tiempo para este circuito y auto"
              className="block text-center text-amber-300"
            >
              ★
            </span>
          ) : null,
      },
      {
        id: "time",
        header: "Tiempo",
        accessorFn: (lap) => lap.timeMs,
        cell: ({ row }) => (
          <span className="block text-center font-mono font-bold tabular-nums text-ink">
            {formatLapTime(row.original.timeMs)}
          </span>
        ),
      },
      {
        id: "gap",
        header: "Gap",
        accessorFn: (lap) => lap.gapMs,
        cell: ({ row }) => (
          <span className="block text-center font-mono text-xs tabular-nums text-muted">
            {formatGap(row.original.gapMs)}
          </span>
        ),
      },
      {
        id: "game",
        header: "Simulador",
        accessorFn: (lap) => lap.simGame.name,
        meta: { align: "left" },
        cell: ({ row }) => (
          <span className="block px-2 text-xs text-muted">{row.original.simGame.name}</span>
        ),
      },
      {
        id: "track",
        header: "Circuito / Stage",
        accessorFn: (lap) => lap.track.name,
        meta: { align: "left" },
        cell: ({ row }) => (
          <span className="block px-2 font-medium">{row.original.track.name}</span>
        ),
      },
      {
        id: "car",
        header: "Auto",
        accessorFn: (lap) => lap.car.name,
        meta: { align: "left" },
        cell: ({ row }) => <span className="block px-2">{row.original.car.name}</span>,
      },
      {
        id: "date",
        header: "Fecha",
        accessorFn: (lap) => lap.recordedAt,
        cell: ({ row }) => (
          <span className="block text-center font-mono text-xs tabular-nums text-muted">
            {row.original.recordedAt}
          </span>
        ),
      },
      {
        id: "conditions",
        header: "Condiciones",
        enableSorting: false,
        accessorFn: (lap) => lap.weather,
        cell: ({ row }) => {
          const { weather, timeOfDay } = row.original;
          const label = [weather, timeOfDay].filter(Boolean).join(" · ");

          return (
            <span className="block text-center text-xs text-muted">{label || "—"}</span>
          );
        },
      },
      {
        id: "setup",
        header: "Setup",
        enableSorting: false,
        accessorFn: (lap) => lap.setup.length,
        cell: ({ row }) => {
          const { setup } = row.original;
          if (setup.length === 0) return <span className="block text-center text-muted/50">—</span>;

          return (
            <span
              title={setup.map((entry) => `${entry.name}: ${entry.value}`).join("\n")}
              className="block cursor-help text-center font-mono text-xs text-accent"
            >
              {setup.length}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              className="rounded px-2 py-1 text-xs text-muted transition hover:bg-raised hover:text-ink"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(row.original)}
              className="rounded px-2 py-1 text-xs text-muted transition hover:bg-rose-500/10 hover:text-rose-200"
            >
              Borrar
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );
}
