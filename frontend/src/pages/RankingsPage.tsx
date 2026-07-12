import type { UpdateGameInput } from "@gp/shared";
import { useCallback } from "react";
import { useRankingColumns } from "../features/rankings/useRankingColumns.js";
import { useCriteria, useGameTypes } from "../hooks/useCatalog.js";
import { useGames, useUpdateGame } from "../hooks/useGames.js";
import { DataTable } from "../ui/DataTable.js";
import { ErrorBanner, Page } from "../ui/Page.js";

/**
 * El ranking NO tiene base de datos propia: es una vista sobre la biblioteca.
 * Los mismos juegos, ordenados por Overall, con el Rank calculado al vuelo.
 */
export function RankingsPage() {
  const games = useGames();
  const criteria = useCriteria();
  const gameTypes = useGameTypes();
  const updateGame = useUpdateGame();

  const handleUpdate = useCallback(
    (id: string, input: UpdateGameInput) => updateGame.mutate({ id, input }),
    [updateGame],
  );

  const columns = useRankingColumns({
    criteria: criteria.data ?? [],
    gameTypes: gameTypes.data ?? [],
    onUpdate: handleUpdate,
  });

  return (
    <Page eyebrow="Ordenado por Overall" title="Rankings">
      <ErrorBanner error={updateGame.error} />

      {games.isPending || criteria.isPending ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : (
        <DataTable
          data={games.data ?? []}
          columns={columns}
          getRowId={(game) => game.id}
          initialSorting={[{ id: "rank", desc: false }]}
          emptyMessage="No hay juegos todavía. Agregalos desde la Biblioteca."
        />
      )}

      <p className="mt-6 text-xs text-muted">
        Los cambios se guardan solos. Enter confirma, Escape cancela.
      </p>
    </Page>
  );
}
