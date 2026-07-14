import { z } from "zod";

/**
 * Recomendaciones generadas por IA.
 *
 * El schema no es decorativo: la respuesta de un modelo es texto, y texto
 * puede venir con cualquier forma. Se valida antes de guardarla y mostrarla.
 */
export const recommendationSchema = z.object({
  title: z.string().trim().min(1),
  year: z.number().int().nullable().optional(),
  genre: z.string().trim().nullable().optional(),
  /** Por qué encaja con lo que jugás. */
  reason: z.string().trim().min(1),
  /** Juegos tuyos en los que se basó. */
  basedOn: z.array(z.string()).default([]),
});

export const recommendationsSchema = z.array(recommendationSchema).max(20);

export type Recommendation = z.infer<typeof recommendationSchema>;

/**
 * La tanda guardada. `generatedAt` es null si nunca generaste ninguna.
 * Se persiste en la base: cambiar de página o reiniciar no la borra.
 */
export interface RecommendationBatch {
  generatedAt: string | null;
  items: Recommendation[];
}
