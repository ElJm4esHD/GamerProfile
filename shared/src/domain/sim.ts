import { z } from "zod";

/**
 * Sim Racing: módulo independiente del ranking de videojuegos.
 * No comparte tablas con `games`, salvo un vínculo opcional entre cada
 * simulador y su ficha de la biblioteca.
 */

export const TRACK_KINDS = ["circuit", "stage"] as const;
export type TrackKind = (typeof TRACK_KINDS)[number];

export const TRACK_KIND_LABELS: Record<TrackKind, string> = {
  circuit: "Circuito",
  stage: "Stage",
};

export interface SimGame {
  id: string;
  name: string;
  position: number;
  /** Ficha de la biblioteca, si el juego está cargado ahí. */
  gameId: string | null;
}

export interface Track {
  id: string;
  simGameId: string;
  name: string;
  kind: TrackKind;
  country: string | null;
  lengthM: number | null;
}

export interface Car {
  id: string;
  simGameId: string;
  name: string;
  carClass: string | null;
}

/**
 * Una clave de setup, por juego.
 *
 * "Camber Front" existe una sola vez en Assetto Corsa. Es lo que impide que a
 * los seis meses tengas cuatro variantes de la misma clave y no puedas
 * responder "¿con qué presión ando más rápido en Spa?".
 */
export interface SetupParam {
  id: string;
  simGameId: string;
  name: string;
  unit: string | null;
  position: number;
}

/** El setup de una vuelta, ya resuelto para mostrar. */
export interface SetupEntry {
  paramId: string;
  name: string;
  unit: string | null;
  value: string;
}

export interface LapRecord {
  id: string;
  simGame: SimGame;
  track: Track;
  car: Car;
  timeMs: number;
  recordedAt: string; // YYYY-MM-DD
  weather: string | null;
  timeOfDay: string | null;
  notes: string | null;
  setup: SetupEntry[];
  /** Derivado: el mejor tiempo para esa combinación juego + circuito + auto. */
  isPersonalBest: boolean;
  /** Derivado: diferencia en ms contra el mejor de esa combinación. */
  gapMs: number;
  createdAt: string;
  updatedAt: string;
}

/* ── Entrada ───────────────────────────────────────────────────────────── */

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado: YYYY-MM-DD");

export const createLapSchema = z.object({
  simGameId: z.string().uuid(),
  trackId: z.string().uuid(),
  carId: z.string().uuid(),
  timeMs: z.number().int().positive(),
  recordedAt: dateSchema,
  weather: z.string().trim().max(60).nullable().optional(),
  timeOfDay: z.string().trim().max(60).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  /** paramId -> valor. La lista que llega REEMPLAZA al setup anterior. */
  setup: z.record(z.string().uuid(), z.string().trim().max(60)).optional(),
});

export const updateLapSchema = createLapSchema.partial();

export type CreateLapInput = z.infer<typeof createLapSchema>;
export type UpdateLapInput = z.infer<typeof updateLapSchema>;

export const createSimGameSchema = z.object({
  name: z.string().trim().min(1).max(120),
  gameId: z.string().uuid().nullable().optional(),
});

export const createTrackSchema = z.object({
  simGameId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  kind: z.enum(TRACK_KINDS).default("circuit"),
  country: z.string().trim().max(60).nullable().optional(),
  lengthM: z.number().int().positive().nullable().optional(),
});

export const createCarSchema = z.object({
  simGameId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  carClass: z.string().trim().max(60).nullable().optional(),
});

export const createSetupParamSchema = z.object({
  simGameId: z.string().uuid(),
  name: z.string().trim().min(1).max(60),
  unit: z.string().trim().max(20).nullable().optional(),
});

export type CreateSimGameInput = z.infer<typeof createSimGameSchema>;
export type CreateTrackInput = z.infer<typeof createTrackSchema>;
export type CreateCarInput = z.infer<typeof createCarSchema>;
export type CreateSetupParamInput = z.infer<typeof createSetupParamSchema>;

/** Todo lo que la UI necesita para armar los selectores, en una sola llamada. */
export interface SimCatalog {
  games: SimGame[];
  tracks: Track[];
  cars: Car[];
  params: SetupParam[];
}
