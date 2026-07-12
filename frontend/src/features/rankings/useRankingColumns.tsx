import type { Criterion, GameType, GameView, UpdateGameInput } from "@gp/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { EditableScore } from "../games/EditableScore.js";
import { EditableText } from "../games/EditableText.js";
import { overallTone } from "../games/score-tone.js";
import { TypeSelect } from "../games/TypeSelect.js";

interface ColumnOptions {
  criteria: readonly Criterion[];
  gameTypes: readonly GameType[];
  onUpdate: (id: string, input: UpdateGameInput) => void;
}

/**
 * Las columnas de criterios se GENERAN desde la API, no se escriben a mano.
 * Agregás "Replayability" como fila en la tabla `criteria` y la columna
 * aparece sola. Ese es todo el punto del modelo de criterios dinámicos.
 */
export function useRankingColumns({
  criteria,
  gameTypes,
  onUpdate,
}: ColumnOptions): ColumnDef<GameView>[] {
  return useMemo(() => {
    const criterionColumns: ColumnDef<GameView>[] = criteria
      .filter((criterion) => criterion.isActive)
      .map((criterion) => ({
        id: criterion.id,
        header: criterion.name,
        accessorFn: (game) => game.ratings[criterion.id] ?? null,
        sortUndefined: "last",
        cell: ({ row, getValue }) => (
          <EditableScore
            value={getValue<number | null>()}
            allowEmpty
            className="text-ink"
            onCommit={(next) =>
              next !== null && onUpdate(row.original.id, { ratings: { [criterion.id]: next } })
            }
          />
        ),
      }));

    return [
      {
        id: "rank",
        header: "#",
        accessorFn: (game) => game.rank,
        sortUndefined: "last",
        cell: ({ getValue }) => (
          <span className="block text-center font-mono text-xs text-muted tabular-nums">
            {getValue<number | null>() ?? "—"}
          </span>
        ),
      },
      {
        id: "type",
        header: "Tipo",
        accessorFn: (game) => game.type.name,
        cell: ({ row }) => (
          <TypeSelect
            value={row.original.type.id}
            types={gameTypes}
            onCommit={(typeId) => onUpdate(row.original.id, { typeId })}
          />
        ),
      },
      {
        id: "name",
        header: "Nombre",
        accessorFn: (game) => game.name,
        meta: { align: "left" },
        cell: ({ row }) => (
          <EditableText
            value={row.original.name}
            onCommit={(name) => onUpdate(row.original.id, { name })}
          />
        ),
      },
      ...criterionColumns,
      {
        id: "overall",
        header: "Overall",
        accessorFn: (game) => game.overall,
        sortUndefined: "last",
        cell: ({ row }) => {
          const game = row.original;

          return (
            <div className="relative">
              <EditableScore
                value={game.overall}
                allowEmpty
                className={`rounded font-bold ${overallTone(game.overall)}`}
                // Editar el Overall no lo "guarda": fija un override manual.
                // Vaciar la celda borra el override y vuelve al calculado.
                onCommit={(next) => onUpdate(game.id, { overallOverride: next })}
              />
              {game.overallOverride !== null && (
                <span
                  title="Valor fijado a mano. Vaciá la celda para volver al promedio."
                  className="pointer-events-none absolute right-1 top-1 h-1 w-1 rounded-full bg-accent"
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [criteria, gameTypes, onUpdate]);
}
