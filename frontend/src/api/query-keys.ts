/**
 * Las claves de cache, en un solo lugar.
 *
 * `game` es ["game", id] y NO ["games", id] a propósito: TanStack Query
 * invalida por prefijo, así que la segunda forma haría que refrescar la lista
 * refresque también todas las fichas abiertas. Claves hermanas, no anidadas.
 */
export const queryKeys = {
  games: ["games"] as const,
  game: (id: string) => ["game", id] as const,
  stats: ["stats"] as const,
  criteria: ["criteria"] as const,
  gameTypes: ["game-types"] as const,
  platforms: ["platforms"] as const,
  genres: ["genres"] as const,
  tags: ["tags"] as const,
  companies: ["companies"] as const,

  simCatalog: ["sim", "catalog"] as const,
  simLaps: ["sim", "laps"] as const,
  simStats: ["sim", "stats"] as const,

  wishlist: ["wishlist"] as const,
  recommendations: ["ai", "recommendations"] as const,
};
