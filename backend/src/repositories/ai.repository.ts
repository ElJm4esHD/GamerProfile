import { asc, type InferSelectModel } from "drizzle-orm";
import { db } from "../db/client.js";
import { aiRecommendations } from "../db/schema.js";

export type RecommendationRow = InferSelectModel<typeof aiRecommendations>;

/** Una recomendación lista para guardar, sin id ni orden (los pone el server). */
export interface RecommendationFields {
  title: string;
  year: number | null;
  genre: string | null;
  reason: string;
  /** JSON serializado de los títulos en los que se basó. */
  basedOn: string;
}

/**
 * Reemplaza la tanda entera de forma atómica.
 *
 * No es un historial: generar de nuevo pisa lo anterior. El borrado y el alta
 * van en una sola transacción para que nunca quede una foto a medias si algo
 * falla entre medio.
 */
export function replaceBatch(rows: { id: string; fields: RecommendationFields }[]): void {
  db.transaction((tx) => {
    tx.delete(aiRecommendations).run();

    rows.forEach(({ id, fields }, position) => {
      tx.insert(aiRecommendations)
        .values({ id, ...fields, position })
        .run();
    });
  });
}

/** La tanda guardada, en el mismo orden en que se generó. */
export function findBatch(): RecommendationRow[] {
  return db.select().from(aiRecommendations).orderBy(asc(aiRecommendations.position)).all();
}
