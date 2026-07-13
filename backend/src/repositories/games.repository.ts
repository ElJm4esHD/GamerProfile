import { and, eq, isNull, type InferSelectModel } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  companies,
  gameGenres,
  gamePlatforms,
  gameRatings,
  games,
  gameTags,
  genres,
  platforms,
  tags,
} from "../db/schema.js";

export type GameRow = InferSelectModel<typeof games>;
export type GameRatingRow = InferSelectModel<typeof gameRatings>;

/** Campos escalares del juego. Las relaciones tienen su propio camino. */
export interface GameFields {
  name: string;
  typeId: string;
  parentGameId: string | null;
  overallOverride: number | null;
  status: string;
  isFavorite: boolean;
  purchasedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  releaseYear: number | null;
  developerId: string | null;
  publisherId: string | null;
  difficulty: string | null;
  playthroughs: number | null;
  playtimeMinutes: number | null;
  mainStoryMinutes: number | null;
  completionistMinutes: number | null;
}

/** Cada lista presente REEMPLAZA a la anterior. Ausente = no se toca. */
export interface RelationInput {
  platformIds?: string[];
  genreIds?: string[];
  tagIds?: string[];
}

/** criterionId -> valor */
export type RatingMap = Record<string, number>;

const nowIso = (): string => new Date().toISOString();

/* ── Lectura ───────────────────────────────────────────────────────────── */

export function findAllGameRows(): GameRow[] {
  return db.select().from(games).where(isNull(games.deletedAt)).all();
}

export function findGameRowById(id: string): GameRow | undefined {
  return db
    .select()
    .from(games)
    .where(and(eq(games.id, id), isNull(games.deletedAt)))
    .get();
}

export function findAllRatingRows(): GameRatingRow[] {
  return db.select().from(gameRatings).all();
}

export function findRatingsByGame(gameId: string): GameRatingRow[] {
  return db.select().from(gameRatings).where(eq(gameRatings.gameId, gameId)).all();
}

export function findPlatformsByGame(gameId: string) {
  return db
    .select({ id: platforms.id, name: platforms.name, position: platforms.position })
    .from(gamePlatforms)
    .innerJoin(platforms, eq(gamePlatforms.platformId, platforms.id))
    .where(eq(gamePlatforms.gameId, gameId))
    .all();
}

export function findGenresByGame(gameId: string) {
  return db
    .select({ id: genres.id, name: genres.name, position: genres.position })
    .from(gameGenres)
    .innerJoin(genres, eq(gameGenres.genreId, genres.id))
    .where(eq(gameGenres.gameId, gameId))
    .all();
}

export function findTagsByGame(gameId: string) {
  return db
    .select({ id: tags.id, name: tags.name })
    .from(gameTags)
    .innerJoin(tags, eq(gameTags.tagId, tags.id))
    .where(eq(gameTags.gameId, gameId))
    .all();
}

export function findCompanyById(id: string | null) {
  if (!id) return null;
  return db.select().from(companies).where(eq(companies.id, id)).get() ?? null;
}

/* ── Escritura ─────────────────────────────────────────────────────────── */

/**
 * Todo en una sola transacción: campos, puntajes y relaciones.
 * O entra completo, o no entra nada.
 */
export function insertGame(
  id: string,
  fields: Partial<GameFields> & Pick<GameFields, "name" | "typeId">,
  ratings: RatingMap,
  relations: RelationInput,
): void {
  db.transaction((tx) => {
    tx.insert(games).values({ id, ...fields }).run();
    writeRatings(tx, id, ratings, nowIso());
    writeRelations(tx, id, relations);
  });
}

export function updateGame(
  id: string,
  fields: Partial<GameFields>,
  ratings: RatingMap | undefined,
  relations: RelationInput,
): void {
  const timestamp = nowIso();

  db.transaction((tx) => {
    tx.update(games)
      .set({ ...fields, updatedAt: timestamp })
      .where(eq(games.id, id))
      .run();

    writeRatings(tx, id, ratings ?? {}, timestamp);
    writeRelations(tx, id, relations);
  });
}

/** Soft delete: la fila queda en la base, marcada. Nada se pierde. */
export function softDeleteGame(id: string): void {
  db.update(games).set({ deletedAt: nowIso() }).where(eq(games.id, id)).run();
}

/* ── Internos ──────────────────────────────────────────────────────────── */

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function writeRatings(tx: Tx, gameId: string, ratings: RatingMap, timestamp: string): void {
  for (const [criterionId, value] of Object.entries(ratings)) {
    tx.insert(gameRatings)
      .values({ gameId, criterionId, value, updatedAt: timestamp })
      .onConflictDoUpdate({
        target: [gameRatings.gameId, gameRatings.criterionId],
        set: { value, updatedAt: timestamp },
      })
      .run();
  }
}

function writeRelations(tx: Tx, gameId: string, relations: RelationInput): void {
  if (relations.platformIds) {
    tx.delete(gamePlatforms).where(eq(gamePlatforms.gameId, gameId)).run();
    for (const platformId of relations.platformIds) {
      tx.insert(gamePlatforms).values({ gameId, platformId }).run();
    }
  }

  if (relations.genreIds) {
    tx.delete(gameGenres).where(eq(gameGenres.gameId, gameId)).run();
    for (const genreId of relations.genreIds) {
      tx.insert(gameGenres).values({ gameId, genreId }).run();
    }
  }

  if (relations.tagIds) {
    tx.delete(gameTags).where(eq(gameTags.gameId, gameId)).run();
    for (const tagId of relations.tagIds) {
      tx.insert(gameTags).values({ gameId, tagId }).run();
    }
  }
}
