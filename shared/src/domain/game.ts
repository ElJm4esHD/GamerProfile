import { z } from "zod";
import type { Company, Genre, Platform, Tag } from "./catalog.js";
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

  // Muchos-a-muchos: la lista que llega REEMPLAZA a la anterior.
  // Mandar [] borra todas las relaciones; no mandar la clave no toca nada.
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
 *
 * Trae los IDs de géneros y plataformas (no los objetos) para poder filtrar
 * sin pedir el detalle de cada juego. Un id es un string; el objeto completo
 * multiplicado por 500 filas es otra cosa.
 */
export interface GameView {
  id: string;
  name: string;
  type: GameType;
  status: GameStatus;
  isFavorite: boolean;
  parentGameId: string | null;
  ratings: Record<string, number>; // criterionId -> value
  genreIds: string[];
  platformIds: string[];
  overall: number | null;
  overallOverride: number | null;
  rank: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Todo lo que sabe la app de un juego. Solo lo pide la ficha. */
export interface GameDetail extends GameView {
  purchasedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  releaseYear: number | null;
  developer: Company | null;
  publisher: Company | null;
  difficulty: string | null;
  playthroughs: number | null;
  playtimeMinutes: number | null;
  mainStoryMinutes: number | null;
  completionistMinutes: number | null;
  platforms: Platform[];
  genres: Genre[];
  tags: Tag[];
}
