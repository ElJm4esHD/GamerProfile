import { z } from "zod";

/**
 * El layout del Dashboard: qué tarjetas se ven, en qué orden y de qué ancho.
 *
 * Vive en `shared` porque las dos puntas necesitan lo mismo: el backend para
 * validar lo que guarda, el frontend para resolverlo contra las métricas que
 * existen hoy.
 */

/** Cuántas columnas ocupa una tarjeta. La grilla tiene 4. */
export const WIDGET_SPANS = [1, 2, 3, 4] as const;
export type WidgetSpan = (typeof WIDGET_SPANS)[number];
export const DEFAULT_WIDGET_SPAN: WidgetSpan = 1;

/** Cada tablero guarda su propio layout: la biblioteca y el sim son distintos. */
export const DASHBOARD_BOARDS = ["library", "sim"] as const;
export type DashboardBoard = (typeof DASHBOARD_BOARDS)[number];
export const dashboardBoardSchema = z.enum(DASHBOARD_BOARDS);

const widgetSpanSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const dashboardLayoutSchema = z.object({
  /** Las tarjetas visibles, en orden. */
  items: z.array(z.object({ key: z.string().min(1), span: widgetSpanSchema })).default([]),
  /**
   * Las que apagaste a mano.
   *
   * Guardar las apagadas —y no solo las visibles— es lo que distingue "esta la
   * escondí" de "esta no existía cuando guardé el layout". Sin esta lista, una
   * métrica nueva del registro nacería invisible, y se perdería la propiedad
   * más linda del Dashboard: que aparezca sola.
   */
  hidden: z.array(z.string().min(1)).default([]),
});

export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;

/** Sin preferencias guardadas: todo visible, en el orden del registro. */
export const EMPTY_DASHBOARD_LAYOUT: DashboardLayout = { items: [], hidden: [] };

/** Lo mínimo que el layout necesita saber de una métrica. `StatResult` lo cumple. */
export interface WidgetSource {
  key: string;
  label: string;
  span: WidgetSpan;
}

export interface ResolvedWidget extends WidgetSource {
  isVisible: boolean;
}

/**
 * Cruza las métricas que existen hoy con las preferencias guardadas.
 *
 * Manda el layout para lo que conoce; lo que no menciona va al final. Una
 * métrica borrada del registro simplemente se ignora, sin ensuciar nada.
 */
export function resolveWidgets(
  sources: readonly WidgetSource[],
  layout: DashboardLayout,
): ResolvedWidget[] {
  const sourceByKey = new Map(sources.map((source) => [source.key, source]));
  const hidden = new Set(layout.hidden);
  const placed = new Set<string>();
  const resolved: ResolvedWidget[] = [];

  for (const item of layout.items) {
    const source = sourceByKey.get(item.key);
    if (!source || placed.has(item.key)) continue;

    placed.add(item.key);
    resolved.push({ ...source, span: item.span, isVisible: true });
  }

  for (const source of sources) {
    if (placed.has(source.key)) continue;
    resolved.push({ ...source, isVisible: !hidden.has(source.key) });
  }

  return resolved;
}

/** La vuelta: de lo que se ve en pantalla al layout que se persiste. */
export function toDashboardLayout(widgets: readonly ResolvedWidget[]): DashboardLayout {
  return {
    items: widgets
      .filter((widget) => widget.isVisible)
      .map((widget) => ({ key: widget.key, span: widget.span })),
    hidden: widgets.filter((widget) => !widget.isVisible).map((widget) => widget.key),
  };
}
