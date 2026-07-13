import { randomUUID } from "node:crypto";
import {
  assignRanks,
  computeOverall,
  DEFAULT_GAME_STATUS,
  type CreateGameInput,
  type GameDetail,
  type GameStatus,
  type GameView,
  type UpdateGameInput,
  type WeightedRating,
} from "@gp/shared";
import { NotFoundError } from "../errors.js";
import * as catalogRepository from "../repositories/catalog.repository.js";
import * as gamesRepository from "../repositories/games.repository.js";
import type { GameFields, RelationInput } from "../repositories/games.repository.js";

/**
 * Arma la vista de tabla de todos los juegos.
 * El rank es global (depende de todos los juegos), así que siempre se
 * recalcula sobre el conjunto entero. Con cientos de juegos esto es
 * instantáneo; si algún día son decenas de miles, se optimiza acá y en
 * ningún otro lado.
 */
function buildViews(): GameView[] {
  const activeWeights = new Map(
    catalogRepository
      .findAllCriteria()
      .filter((criterion) => criterion.isActive)
      .map((criterion) => [criterion.id, criterion.weight]),
  );

  const typesById = new Map(catalogRepository.findAllGameTypes().map((type) => [type.id, type]));

  const ratingsByGame = new Map<string, Record<string, number>>();
  for (const row of gamesRepository.findAllRatingRows()) {
    const bucket = ratingsByGame.get(row.gameId) ?? {};
    bucket[row.criterionId] = row.value;
    ratingsByGame.set(row.gameId, bucket);
  }

  const unranked = gamesRepository.findAllGameRows().map((row) => {
    const ratings = ratingsByGame.get(row.id) ?? {};
    const type = typesById.get(row.typeId);
    if (!type) throw new NotFoundError("Tipo de juego", row.typeId);

    // Un criterio desactivado conserva su valor histórico pero no pesa
    // en el overall.
    const weighted: WeightedRating[] = Object.entries(ratings)
      .map(([criterionId, value]) => ({ weight: activeWeights.get(criterionId), value }))
      .filter((entry): entry is WeightedRating => entry.weight !== undefined);

    return {
      id: row.id,
      name: row.name,
      type,
      status: row.status as GameStatus,
      isFavorite: row.isFavorite,
      parentGameId: row.parentGameId,
      ratings,
      overall: computeOverall(weighted, row.overallOverride),
      overallOverride: row.overallOverride,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });

  return assignRanks(unranked);
}

function getViewOrThrow(id: string): GameView {
  const game = buildViews().find((candidate) => candidate.id === id);
  if (!game) throw new NotFoundError("Juego", id);
  return game;
}

export function listGames(): GameView[] {
  return buildViews();
}

/** El detalle reutiliza la vista (rank incluido) y le suma todo lo demás. */
export function getGameDetail(id: string): GameDetail {
  const view = getViewOrThrow(id);
  const row = gamesRepository.findGameRowById(id);
  if (!row) throw new NotFoundError("Juego", id);

  return {
    ...view,
    purchasedAt: row.purchasedAt,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    releaseYear: row.releaseYear,
    developer: gamesRepository.findCompanyById(row.developerId),
    publisher: gamesRepository.findCompanyById(row.publisherId),
    difficulty: row.difficulty,
    playthroughs: row.playthroughs,
    playtimeMinutes: row.playtimeMinutes,
    mainStoryMinutes: row.mainStoryMinutes,
    completionistMinutes: row.completionistMinutes,
    platforms: gamesRepository.findPlatformsByGame(id),
    genres: gamesRepository.findGenresByGame(id),
    tags: gamesRepository.findTagsByGame(id),
  };
}

export function createGame(input: CreateGameInput): GameView {
  const id = randomUUID();

  gamesRepository.insertGame(
    id,
    {
      ...toPersistableFields(input),
      name: input.name,
      typeId: input.typeId,
      status: input.status ?? DEFAULT_GAME_STATUS,
    },
    input.ratings,
    toRelations(input),
  );

  return getViewOrThrow(id);
}

export function updateGame(id: string, input: UpdateGameInput): GameDetail {
  if (!gamesRepository.findGameRowById(id)) throw new NotFoundError("Juego", id);

  gamesRepository.updateGame(id, toPersistableFields(input), input.ratings, toRelations(input));

  return getGameDetail(id);
}

export function deleteGame(id: string): void {
  if (!gamesRepository.findGameRowById(id)) throw new NotFoundError("Juego", id);
  gamesRepository.softDeleteGame(id);
}

/* ── Internos ──────────────────────────────────────────────────────────── */

const PERSISTABLE_KEYS = [
  "name",
  "typeId",
  "parentGameId",
  "overallOverride",
  "status",
  "isFavorite",
  "purchasedAt",
  "startedAt",
  "finishedAt",
  "releaseYear",
  "developerId",
  "publisherId",
  "difficulty",
  "playthroughs",
  "playtimeMinutes",
  "mainStoryMinutes",
  "completionistMinutes",
] as const satisfies readonly (keyof GameFields)[];

/**
 * Copia SOLO las claves realmente enviadas: `undefined` significa "no lo
 * cambies", mientras que `null` sí es un valor válido a persistir. Es lo que
 * hace posible el autosave campo por campo.
 */
function toPersistableFields(input: UpdateGameInput): Partial<GameFields> {
  const fields: Partial<GameFields> = {};

  for (const key of PERSISTABLE_KEYS) {
    const value = input[key];
    if (value !== undefined) Object.assign(fields, { [key]: value });
  }

  return fields;
}

function toRelations(input: UpdateGameInput): RelationInput {
  return {
    platformIds: input.platformIds,
    genreIds: input.genreIds,
    tagIds: input.tagIds,
  };
}
