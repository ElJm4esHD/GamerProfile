import type { GameStatus, GameType, GameView, UpdateGameInput } from "@gp/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { EditableText } from "../games/EditableText.js";
import { overallTone } from "../games/score-tone.js";
import { StatusSelect } from "../games/StatusSelect.js";
import { TypeSelect } from "../games/TypeSelect.js";

interface ColumnOptions {
  gameTypes: readonly GameType[];
  onUpdate: (id: string, input: UpdateGameInput) => void;
  onDelete: (game: GameView) => void;
}

/**
 * La biblioteca es la entidad principal: acá se administra el juego (estado,
 * favorito, alta y baja). Los puntajes se editan en Rankings.
 */
export function useLibraryColumns({
  gameTypes,
  onUpdate,
  onDelete,
}: ColumnOptions): ColumnDef<GameView>[] {
  return useMemo(
    () => [
      {
        id: "favorite",
        header: "",
        enableSorting: false,
        accessorFn: (game) => game.isFavorite,
        cell: ({ row }) => {
          const game = row.original;
          return (
            <button
              type="button"
              title={game.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
              onClick={() => onUpdate(game.id, { isFavorite: !game.isFavorite })}
              className={`w-full rounded py-1 text-center transition hover:bg-raised ${
                game.isFavorite ? "text-amber-300" : "text-muted/40 hover:text-muted"
              }`}
            >
              ★
            </button>
          );
        },
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
        id: "status",
        header: "Estado",
        accessorFn: (game) => game.status,
        cell: ({ row }) => (
          <StatusSelect
            value={row.original.status}
            onCommit={(status: GameStatus) => onUpdate(row.original.id, { status })}
          />
        ),
      },
      {
        id: "overall",
        header: "Overall",
        accessorFn: (game) => game.overall,
        sortUndefined: "last",
        cell: ({ getValue }) => {
          const overall = getValue<number | null>();
          return (
            <span
              className={`block rounded py-1 text-center font-mono font-bold tabular-nums ${overallTone(overall)}`}
            >
              {overall ?? "—"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => onDelete(row.original)}
            className="w-full rounded px-2 py-1 text-xs text-muted opacity-0 transition hover:bg-rose-500/10 hover:text-rose-200 focus:opacity-100 group-hover:opacity-100"
          >
            Borrar
          </button>
        ),
      },
    ],
    [gameTypes, onUpdate, onDelete],
  );
}
