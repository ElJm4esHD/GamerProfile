import { z } from "zod";

/**
 * Catálogos de la biblioteca.
 *
 * Todos comparten la misma forma: una entidad con nombre y una tabla puente
 * hacia `games`. Es el mismo patrón que `criteria` + `game_ratings`, que ya
 * está probado. Sin esto, "distribución de géneros" es imposible: no se puede
 * agrupar por texto libre donde escribiste "RPG", "rpg" y "R.P.G.".
 */

export interface Platform {
  id: string;
  name: string;
  position: number;
}

export interface Genre {
  id: string;
  name: string;
  position: number;
}

export interface Tag {
  id: string;
  name: string;
}

/** Developer y publisher salen de acá: una sola fuente, cero variantes tipeadas. */
export interface Company {
  id: string;
  name: string;
}

/* ── Entrada ───────────────────────────────────────────────────────────── */

export const catalogNameSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const createCriterionSchema = z.object({
  name: z.string().trim().min(1).max(60),
  weight: z.number().positive().max(100).default(1),
});

/**
 * Los criterios se editan, nunca se borran: una fila de `criteria` es la
 * llave de miles de puntajes históricos. Desactivar saca la columna de la
 * tabla y del cálculo del overall, pero conserva todo lo que ya puntuaste.
 */
export const updateCriterionSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  weight: z.number().positive().max(100).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCriterionInput = z.infer<typeof createCriterionSchema>;
export type UpdateCriterionInput = z.infer<typeof updateCriterionSchema>;
