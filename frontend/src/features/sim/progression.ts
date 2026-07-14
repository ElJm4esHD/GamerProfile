import type { LapRecord } from "@gp/shared";

export interface ProgressionPoint {
  /** Fecha del intento. Eje X. */
  date: string;
  /** Una clave por auto: permite comparar autos en el mismo circuito. */
  [carName: string]: string | number | null;
}

export interface Progression {
  points: ProgressionPoint[];
  carNames: string[];
}

/**
 * La evolución de tus tiempos en un circuito.
 *
 * Una serie por auto. Recharts necesita las filas ya mergeadas por fecha, así
 * que si dos autos corrieron el mismo día comparten fila y cada uno llena su
 * columna. Los huecos van en `null`: Recharts los saltea con `connectNulls`.
 *
 * Función pura, sin React ni fetch: se puede probar sola y no obliga a
 * ninguna llamada extra al backend, porque las vueltas ya están en memoria.
 */
export function buildProgression(
  laps: readonly LapRecord[],
  trackId: string | null,
): Progression {
  if (!trackId) return { points: [], carNames: [] };

  const relevant = laps
    .filter((lap) => lap.track.id === trackId)
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));

  if (relevant.length === 0) return { points: [], carNames: [] };

  const carNames = [...new Set(relevant.map((lap) => lap.car.name))];

  const rowsByDate = new Map<string, ProgressionPoint>();

  for (const lap of relevant) {
    const row = rowsByDate.get(lap.recordedAt) ?? emptyRow(lap.recordedAt, carNames);

    // Dos vueltas del mismo auto el mismo día: se queda la más rápida.
    const current = row[lap.car.name];
    if (typeof current !== "number" || lap.timeMs < current) {
      row[lap.car.name] = lap.timeMs;
    }

    rowsByDate.set(lap.recordedAt, row);
  }

  return {
    points: [...rowsByDate.values()].sort((a, b) => a.date.localeCompare(b.date)),
    carNames,
  };
}

function emptyRow(date: string, carNames: readonly string[]): ProgressionPoint {
  const row: ProgressionPoint = { date };
  for (const name of carNames) row[name] = null;
  return row;
}
