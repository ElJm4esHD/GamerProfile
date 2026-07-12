import { useCreateGame } from "../../hooks/useGames.js";
import { useGameTypes } from "../../hooks/useCatalog.js";

/**
 * Sin modal y sin botón "Guardar": crea la fila al instante y la editás ahí
 * mismo. Es la misma filosofía que el resto de la app.
 */
export function AddGameButton() {
  const createGame = useCreateGame();
  const gameTypes = useGameTypes();

  const defaultType = gameTypes.data?.[0];

  return (
    <button
      type="button"
      disabled={!defaultType || createGame.isPending}
      onClick={() =>
        defaultType &&
        createGame.mutate({
          name: "Juego nuevo",
          typeId: defaultType.id,
          ratings: {},
        })
      }
      className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-accent/50 hover:text-ink disabled:opacity-40"
    >
      + Agregar juego
    </button>
  );
}
