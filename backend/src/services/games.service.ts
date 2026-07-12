import { randomUUID } from "node:crypto";
import {
  assignRanks,
  computeOverall,
  type CreateGameInput,
  type GameView,
  type UpdateGameInput,
  type WeightedRating,
} from "@gp/shared";
import { NotFoundError } from "../errors.js";
import * as catalogRepository from "../repositories/catalog.repository.js";
import * as gamesRepository from "../repositories/games.repository.js";
import type { GameFields } from "../repositories/games.repository.js";

/**
 * Arma la vista completa de todos los juegos.
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

  const typesById = new Map(
    catalogRepository.findAllGameTypes().map((type) => [type.id, type]),
  );

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
      .map(([criterionId, value]) => ({
        weight: activeWeights.get(criterionId),
        value,
      }))
      .filter((entry): entry is WeightedRating => entry.weight !== undefined);

    return {
      id: row.id,
      name: row.name,
      type,
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

export function createGame(input: CreateGameInput): GameView {
  const id = randomUUID();

  gamesRepository.insertGame(
    id,
    {
      name: input.name,
      typeId: input.typeId,
      parentGameId: input.parentGameId ?? null,
      overallOverride: input.overallOverride ?? null,
    },
    input.ratings,
  );

  return getViewOrThrow(id);
}

export function updateGame(id: string, input: UpdateGameInput): GameView {
  if (!gamesRepository.findGameRowById(id)) throw new NotFoundError("Juego", id);

  // Solo se tocan las claves realmente enviadas: `undefined` significa
  // "no lo cambies", mientras que `null` sí es un valor válido a persistir.
  const fields: Partial<GameFields> = {};
  if (input.name !== undefined) fields.name = input.name;
  if (input.typeId !== undefined) fields.typeId = input.typeId;
  if (input.parentGameId !== undefined) fields.parentGameId = input.parentGameId;
  if (input.overallOverride !== undefined) {
    fields.overallOverride = input.overallOverride;
  }

  gamesRepository.updateGame(id, fields, input.ratings);

  return getViewOrThrow(id);
}

export function deleteGame(id: string): void {
  if (!gamesRepository.findGameRowById(id)) throw new NotFoundError("Juego", id);
  gamesRepository.softDeleteGame(id);
}
