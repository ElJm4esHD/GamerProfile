import { and, eq, isNull, type InferSelectModel } from "drizzle-orm";
import { db } from "../db/client.js";
import { gameRatings, games } from "../db/schema.js";

export type GameRow = InferSelectModel<typeof games>;
export type GameRatingRow = InferSelectModel<typeof gameRatings>;

/** Campos del juego que se pueden persistir (sin ratings, sin timestamps). */
export interface GameFields {
  name: string;
  typeId: string;
  parentGameId: string | null;
  overallOverride: number | null;
}

/** criterionId -> valor */
export type RatingMap = Record<string, number>;

const nowIso = (): string => new Date().toISOString();

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

/** Inserta el juego y sus ratings de forma atómica. */
export function insertGame(
  id: string,
  fields: GameFields,
  ratings: RatingMap,
): void {
  db.transaction((tx) => {
    tx.insert(games).values({ id, ...fields }).run();

    for (const [criterionId, value] of Object.entries(ratings)) {
      tx.insert(gameRatings).values({ gameId: id, criterionId, value }).run();
    }
  });
}

/**
 * Aplica un cambio parcial. `fields` y `ratings` pueden venir incompletos:
 * solo se toca lo que llega, el resto queda intacto.
 */
export function updateGame(
  id: string,
  fields: Partial<GameFields>,
  ratings: RatingMap | undefined,
): void {
  const timestamp = nowIso();

  db.transaction((tx) => {
    tx.update(games)
      .set({ ...fields, updatedAt: timestamp })
      .where(eq(games.id, id))
      .run();

    for (const [criterionId, value] of Object.entries(ratings ?? {})) {
      tx.insert(gameRatings)
        .values({ gameId: id, criterionId, value, updatedAt: timestamp })
        .onConflictDoUpdate({
          target: [gameRatings.gameId, gameRatings.criterionId],
          set: { value, updatedAt: timestamp },
        })
        .run();
    }
  });
}

/** Soft delete: la fila queda en la base, marcada. Nada se pierde. */
export function softDeleteGame(id: string): void {
  db.update(games)
    .set({ deletedAt: nowIso() })
    .where(eq(games.id, id))
    .run();
}
