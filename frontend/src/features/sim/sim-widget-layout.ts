/**
 * Cuánto ocupa cada tarjeta del dashboard de Sim Racing.
 *
 * Es lo único que el frontend sabe sobre métricas concretas de este módulo, y
 * solo es una cuestión de tamaño. Una métrica sin entrada acá igual se muestra:
 * usa el ancho por defecto.
 */
const SPAN_BY_KEY: Record<string, 2 | 4> = {
  "sim-laps-by-sim": 2,
  "sim-laps-by-track": 2,
  "sim-laps-by-month": 4,
};

const SPAN_CLASS: Record<2 | 4, string> = {
  2: "sm:col-span-2",
  4: "sm:col-span-2 lg:col-span-4",
};

export function simSpanClassFor(key: string): string {
  const span = SPAN_BY_KEY[key];
  return span ? SPAN_CLASS[span] : "";
}
