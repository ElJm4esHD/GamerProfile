/**
 * Los tiempos se guardan SIEMPRE en milisegundos enteros.
 *
 * Guardarlos como texto ("1:42.334") rompe todo: no se pueden ordenar
 * ("59.900" > "1:02.100" alfabéticamente), no se pueden restar y no se pueden
 * promediar. El formato es un problema de presentación, no de datos.
 */

/** Acepta "1:42.334", "1:42,334", "42.334" o "102334" (ms crudos). */
export function parseLapTime(input: string): number | null {
  const raw = input.trim().replace(",", ".");
  if (raw === "") return null;

  const match = /^(?:(\d+):)?(\d{1,2})(?:\.(\d{1,3}))?$/.exec(raw);
  if (!match) return null;

  const [, minutes, seconds, fraction] = match;

  const secondsValue = Number(seconds);
  if (secondsValue > 59) return null;

  const millis = Number((fraction ?? "0").padEnd(3, "0"));
  const total = Number(minutes ?? 0) * 60_000 + secondsValue * 1000 + millis;

  return total > 0 ? total : null;
}

/** 102334 → "1:42.334". Bajo el minuto, "42.334". */
export function formatLapTime(milliseconds: number | null): string {
  if (milliseconds === null || milliseconds <= 0) return "—";

  const minutes = Math.floor(milliseconds / 60_000);
  const seconds = Math.floor((milliseconds % 60_000) / 1000);
  const millis = milliseconds % 1000;

  const fraction = millis.toString().padStart(3, "0");

  return minutes === 0
    ? `${seconds}.${fraction}`
    : `${minutes}:${seconds.toString().padStart(2, "0")}.${fraction}`;
}

/** Diferencia contra el mejor tiempo: "+1.204". */
export function formatGap(milliseconds: number): string {
  if (milliseconds === 0) return "—";
  return `+${formatLapTime(milliseconds)}`;
}
