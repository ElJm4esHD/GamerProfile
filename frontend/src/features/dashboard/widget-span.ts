import type { WidgetSpan } from "@gp/shared";

/**
 * El ancho de una tarjeta traducido a la grilla de 4 columnas.
 *
 * Es lo ÚNICO que el frontend sabe sobre tamaños, y no menciona ninguna
 * métrica: el ancho por defecto lo declara cada métrica en el backend y lo
 * puede pisar el layout guardado.
 *
 * En pantallas chicas todo colapsa igual: dos columnas o una. Un dashboard que
 * respeta anchos de 4 columnas en un celular es un dashboard ilegible.
 */
export const SPAN_CLASS: Record<WidgetSpan, string> = {
  1: "",
  2: "sm:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
  4: "sm:col-span-2 lg:col-span-4",
};
