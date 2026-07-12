/** Un criterio con su peso y el valor asignado a un juego. */
export interface WeightedRating {
  weight: number;
  value: number;
}

export const RATING_MIN = 0;
export const RATING_MAX = 100;

/**
 * Overall = promedio ponderado de los criterios puntuados.
 * Un override manual siempre gana. Sin ratings, no hay overall.
 */
export function computeOverall(
  ratings: readonly WeightedRating[],
  override?: number | null,
): number | null {
  if (override != null) return override;
  if (ratings.length === 0) return null;

  const totalWeight = ratings.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight === 0) return null;

  const weightedSum = ratings.reduce((sum, r) => sum + r.value * r.weight, 0);
  return Math.round(weightedSum / totalWeight);
}

/** El rank es siempre derivado. Nunca se persiste. */
export function assignRanks<T extends { overall: number | null }>(
  games: readonly T[],
): (T & { rank: number | null })[] {
  const ranked = [...games].sort(
    (a, b) => (b.overall ?? -1) - (a.overall ?? -1),
  );

  let lastOverall: number | null = null;
  let lastRank = 0;

  return ranked.map((game, index) => {
    if (game.overall == null) return { ...game, rank: null };
    const rank = game.overall === lastOverall ? lastRank : index + 1;
    lastOverall = game.overall;
    lastRank = rank;
    return { ...game, rank };
  });
}