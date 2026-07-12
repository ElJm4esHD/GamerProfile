/**
 * El tiempo se guarda SIEMPRE en minutos enteros, nunca en horas decimales.
 *
 * "2,5 horas" en punto flotante te da sumas con 0.30000000000004 en el
 * dashboard. Guardás 150, mostrás "2h 30m". Cambiarlo después sería una
 * migración con pérdida de precisión.
 */

export function formatMinutes(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return "—";

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

export function minutesToHours(minutes: number): number {
  return minutes / 60;
}
