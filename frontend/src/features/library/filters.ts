import type { GameStatus, GameView } from "@gp/shared";

export interface LibraryFilters {
  search: string;
  statuses: GameStatus[];
  typeIds: string[];
  onlyFavorites: boolean;
}

export const EMPTY_FILTERS: LibraryFilters = {
  search: "",
  statuses: [],
  typeIds: [],
  onlyFavorites: false,
};

export function hasActiveFilters(filters: LibraryFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.statuses.length > 0 ||
    filters.typeIds.length > 0 ||
    filters.onlyFavorites
  );
}

/**
 * Función pura: juegos + filtros → juegos.
 *
 * Vive fuera de React a propósito. Hoy corre en el navegador porque la
 * colección entera está en memoria y filtrar es instantáneo. El día que sean
 * miles de juegos, esto se muda al backend como cláusula WHERE y la UI ni se
 * entera: cambia quién la llama, no lo que hace.
 *
 * Los filtros se combinan con AND; dentro de cada filtro, los valores son OR.
 * ("Completado o Jugando" Y "es favorito").
 */
export function filterGames(
  games: readonly GameView[],
  filters: LibraryFilters,
): GameView[] {
  const needle = filters.search.trim().toLowerCase();

  return games.filter((game) => {
    if (needle && !game.name.toLowerCase().includes(needle)) return false;
    if (filters.onlyFavorites && !game.isFavorite) return false;

    if (filters.statuses.length > 0 && !filters.statuses.includes(game.status)) return false;
    if (filters.typeIds.length > 0 && !filters.typeIds.includes(game.type.id)) return false;

    return true;
  });
}
