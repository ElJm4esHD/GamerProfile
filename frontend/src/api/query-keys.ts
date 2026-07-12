/** Las claves de cache, en un solo lugar. Evita typos y desincronizaciones. */
export const queryKeys = {
  games: ["games"] as const,
  criteria: ["criteria"] as const,
  gameTypes: ["game-types"] as const,
};
