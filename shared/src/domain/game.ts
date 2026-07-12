import { z } from "zod";
import { RATING_MAX, RATING_MIN } from "./rating.js";
import { gameStatusSchema, type GameStatus } from "./status.js";

export const ratingValueSchema = z.number().int().min(RATING_MIN).max(RATING_MAX);

/** Fecha sin hora: YYYY-MM-DD. */
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado: YYYY-MM-DD");

const minutesSchema = z.number().int().min(0);

export const createGameSchema = z.object({
  name: z.string().trim().min(1).max(200),
  typeId: z.string().uuid(),
  parentGameId: z.string().uuid().nullable().optional(),
  overallOverride: ratingValueSchema.nullable().optional(),
  ratings: z.record(z.string().uuid(), ratingValueSchema).default({}),

  // Biblioteca
  status: gameStatusSchema.optional(),
  isFavorite: z.boolean().optional(),
  purchasedAt: dateSchema.nullable().optional(),
  startedAt: dateSchema.nullable().optional(),
  finishedAt: dateSchema.nullable().optional(),
  releaseYear: z.number().int().min(1950).max(2100).nullable().optional(),
  developerId: z.string().uuid().nullable().optional(),
  publisherId: z.string().uuid().nullable().optional(),
  difficulty: z.string().trim().max(60).nullable().optional(),
  playthroughs: z.number().int().min(0).nullable().optional(),

  // Tiempos, siempre en minutos
  playtimeMinutes: minutesSchema.nullable().optional(),
  mainStoryMinutes: minutesSchema.nullable().optional(),
  completionistMinutes: minutesSchema.nullable().optional(),

  // Relaciones muchos-a-muchos: la lista que llega REEMPLAZA a la anterior
  platformIds: z.array(z.string().uuid()).optional(),
  genreIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

/** Todo opcional: el autosave manda cambios parciales, campo por campo. */
export const updateGameSchema = createGameSchema.partial();

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;

export interface GameType {
  id: string;
  name: string;
  position: number;
}

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  position: number;
  isActive: boolean;
}

/**
 * La fila de una tabla: liviana a propósito.
 * El detalle completo de un juego (fechas, géneros, tags, horas) va a vivir en
 * `GameDetail`, que se agrega cuando exista la pantalla que lo necesita.
 */
export interface GameView {
  id: string;
  name: string;
  type: GameType;
  status: GameStatus;
  isFavorite: boolean;
  parentGameId: string | null;
  ratings: Record<string, number>; // criterionId -> value
  overall: number | null;
  overallOverride: number | null;
  rank: number | null;
  createdAt: string;
  updatedAt: string;
}
