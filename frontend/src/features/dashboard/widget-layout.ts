/**
 * Cuánto ocupa cada tarjeta en la grilla.
 *
 * Es lo ÚNICO que el frontend sabe sobre métricas concretas, y solo es una
 * cuestión de tamaño. Una métrica sin entrada acá igual se muestra: usa el
 * ancho por defecto. Nunca hay que tocar este archivo para que algo aparezca.
 */
const SPAN_BY_KEY: Record<string, 1 | 2 | 3> = {
  "recently-added": 2,
  favorites: 2,
  "playing-now": 2,
  "genre-distribution": 3,
  "platform-distribution": 3,
  "completed-by-year": 3,
};

const DEFAULT_SPAN = 1;

const SPAN_CLASS: Record<1 | 2 | 3, string> = {
  1: "",
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
};

export function spanClassFor(key: string): string {
  return SPAN_CLASS[SPAN_BY_KEY[key] ?? DEFAULT_SPAN];
}
