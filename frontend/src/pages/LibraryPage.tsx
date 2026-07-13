import type { GameView, UpdateGameInput } from "@gp/shared";
import { useCallback, useMemo, useState } from "react";
import { AddGameButton } from "../features/library/AddGameButton.js";
import { EMPTY_FILTERS, filterGames, hasActiveFilters } from "../features/library/filters.js";
import { LibraryToolbar } from "../features/library/LibraryToolbar.js";
import { useLibraryColumns } from "../features/library/useLibraryColumns.js";
import { useGameTypes } from "../hooks/useCatalog.js";
import { useDeleteGame, useGames, useUpdateGame } from "../hooks/useGames.js";
import { DataTable } from "../ui/DataTable.js";
import { ErrorBanner, Page } from "../ui/Page.js";

/** La biblioteca es la entidad principal: acá se dan de alta y de baja los juegos. */
export function LibraryPage() {
  const games = useGames();
  const gameTypes = useGameTypes();
  const updateGame = useUpdateGame();
  const deleteGame = useDeleteGame();

  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const handleUpdate = useCallback(
    (id: string, input: UpdateGameInput) => updateGame.mutate({ id, input }),
    [updateGame],
  );

  const handleDelete = useCallback(
    (game: GameView) => {
      if (confirm(`¿Borrar "${game.name}"?`)) deleteGame.mutate(game.id);
    },
    [deleteGame],
  );

  const columns = useLibraryColumns({
    gameTypes: gameTypes.data ?? [],
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  });

  const all = useMemo(() => games.data ?? [], [games.data]);
  const visible = useMemo(() => filterGames(all, filters), [all, filters]);

  return (
    <Page eyebrow="Tu colección" title="Biblioteca" actions={<AddGameButton />}>
      <ErrorBanner error={updateGame.error ?? deleteGame.error} />

      {games.isPending ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : (
        <>
          <LibraryToolbar
            filters={filters}
            gameTypes={gameTypes.data ?? []}
            onChange={setFilters}
            resultCount={visible.length}
            totalCount={all.length}
          />

          <DataTable
            data={visible}
            columns={columns}
            getRowId={(game) => game.id}
            initialSorting={[{ id: "name", desc: false }]}
            emptyMessage={
              hasActiveFilters(filters)
                ? "Ningún juego coincide con los filtros."
                : "Tu biblioteca está vacía. Agregá el primer juego."
            }
          />
        </>
      )}
    </Page>
  );
}
