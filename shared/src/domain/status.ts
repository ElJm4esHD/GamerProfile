import { z } from "zod";

/**
 * Los estados son slugs fijos, NO una tabla de catálogo.
 *
 * Es lo opuesto a `criteria`, y a propósito: los criterios los inventás vos y
 * crecen; los estados los consume el código (el dashboard pregunta "¿cuántos
 * completed?"). Si fueran filas con UUID, el backend tendría que buscarlos por
 * nombre y se rompería el día que le cambies el texto a la etiqueta.
 */
export const GAME_STATUSES = [
  "backlog",
  "playing",
  "completed",
  "abandoned",
  "replaying",
] as const;

export type GameStatus = (typeof GAME_STATUSES)[number];

export const gameStatusSchema = z.enum(GAME_STATUSES);

/** El slug es el contrato; la etiqueta es solo lo que se ve. */
export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  backlog: "Pendiente",
  playing: "Jugando",
  completed: "Completado",
  abandoned: "Abandonado",
  replaying: "Rejugando",
};

export const DEFAULT_GAME_STATUS: GameStatus = "backlog";
