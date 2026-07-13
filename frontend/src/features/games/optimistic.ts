import {
  assignRanks,
  computeOverall,
  type Criterion,
  type GameType,
  type GameView,
  type UpdateGameInput,
  type WeightedRating,
} from "@gp/shared";

/**
 * Funciones puras para el update optimista.
 *
 * Reutilizan `computeOverall` y `assignRanks` de @gp/shared: exactamente las
 * mismas que corre el backend. Por eso lo que ves en pantalla al instante es
 * idéntico a lo que la base va a devolver un milisegundo después.
 */

/** Aplica un cambio parcial a un juego, respetando la semántica del PATCH. */
export function applyPatch(
  game: GameView,
  input: UpdateGameInput,
  gameTypes: readonly GameType[],
): GameView {
  const nextType = input.typeId
    ? (gameTypes.find((type) => type.id === input.typeId) ?? game.type)
    : game.type;

  return {
    ...game,
    name: input.name ?? game.name,
    type: nextType,
    status: input.status ?? game.status,
    isFavorite: input.isFavorite ?? game.isFavorite,
    parentGameId: input.parentGameId !== undefined ? input.parentGameId : game.parentGameId,
    overallOverride:
      input.overallOverride !== undefined ? input.overallOverride : game.overallOverride,
    genreIds: input.genreIds ?? game.genreIds,
    platformIds: input.platformIds ?? game.platformIds,
    ratings: { ...game.ratings, ...input.ratings },
  };
}

/** Recalcula overall y rank de toda la colección. */
export function recalculate(
  games: readonly GameView[],
  criteria: readonly Criterion[],
): GameView[] {
  const activeWeights = new Map(
    criteria.filter((criterion) => criterion.isActive).map((c) => [c.id, c.weight]),
  );

  const withOverall = games.map((game) => {
    const weighted: WeightedRating[] = Object.entries(game.ratings).flatMap(
      ([criterionId, value]) => {
        const weight = activeWeights.get(criterionId);
        return weight === undefined ? [] : [{ weight, value }];
      },
    );

    return { ...game, overall: computeOverall(weighted, game.overallOverride) };
  });

  return assignRanks(withOverall);
}
