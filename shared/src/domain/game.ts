import { z } from "zod";
import { RATING_MAX, RATING_MIN } from "./rating.js";

export const ratingValueSchema = z.number().int().min(RATING_MIN).max(RATING_MAX);

export const createGameSchema = z.object({
  name: z.string().trim().min(1).max(200),
  typeId: z.string().uuid(),
  parentGameId: z.string().uuid().nullable().optional(),
  overallOverride: ratingValueSchema.nullable().optional(),
  ratings: z.record(z.string().uuid(), ratingValueSchema).default({}),
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

/** Lo que consume la tabla del frontend. */
export interface GameView {
  id: string;
  name: string;
  type: GameType;
  parentGameId: string | null;
  ratings: Record<string, number>; // criterionId -> value
  overall: number | null;
  overallOverride: number | null;
  rank: number | null;
  createdAt: string;
  updatedAt: string;
}