import type { GameView, UpdateGameInput } from "@gp/shared";
import { useCallback } from "react";
import { AddGameButton } from "../features/library/AddGameButton.js";
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

  return (
    <Page
      eyebrow={`${games.data?.length ?? 0} entradas`}
      title="Biblioteca"
      actions={<AddGameButton />}
    >
      <ErrorBanner error={updateGame.error ?? deleteGame.error} />

      {games.isPending ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : (
        <DataTable
          data={games.data ?? []}
          columns={columns}
          getRowId={(game) => game.id}
          initialSorting={[{ id: "name", desc: false }]}
          emptyMessage="Tu biblioteca está vacía. Agregá el primer juego."
        />
      )}
    </Page>
  );
}
