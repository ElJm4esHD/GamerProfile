import type { GameStatus, StatValue } from "@gp/shared";

/** La foto de un juego que ven las métricas. Nada más, nada menos. */
export interface StatsGame {
  id: string;
  name: string;
  status: GameStatus;
  overall: number | null;
  isFavorite: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  playtimeMinutes: number | null;
  genres: string[];
  platforms: string[];
}

/**
 * Una estadística es una función pura sobre la lista de juegos.
 *
 * Agregar una al Dashboard = escribir un objeto de estos y sumarlo al
 * registro. No se toca el endpoint, ni el service, ni el frontend.
 */
export interface Metric {
  key: string;
  label: string;
  compute: (games: readonly StatsGame[]) => StatValue;
}

/* ── Helpers compartidos por las métricas ──────────────────────────────── */

/** Días entre dos fechas YYYY-MM-DD. `null` si falta alguna o no tienen sentido. */
export function daysBetween(from: string | null, to: string | null): number | null {
  if (!from || !to) return null;

  const start = Date.parse(from);
  const end = Date.parse(to);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;

  return Math.round((end - start) / 86_400_000);
}

export function countBy(values: readonly string[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function toRef(game: StatsGame) {
  return { id: game.id, name: game.name };
}
