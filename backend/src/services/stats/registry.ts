import { countMetrics } from "./metrics/counts.js";
import { distributionMetrics } from "./metrics/distributions.js";
import { listMetrics } from "./metrics/lists.js";
import { milestoneMetrics } from "./metrics/milestones.js";
import { playtimeMetrics } from "./metrics/playtime.js";
import type { Metric } from "./types.js";

/**
 * El índice de estadísticas. El orden acá es el orden en el Dashboard.
 *
 * Para sumar una métrica nueva: escribila en `metrics/` y agregala a esta
 * lista. Nada más. El endpoint la sirve y el Dashboard la pinta solo, porque
 * el frontend elige el componente según el `kind` del valor, no según la clave.
 */
export const METRICS: readonly Metric[] = [
  ...milestoneMetrics,
  ...countMetrics,
  ...playtimeMetrics,
  ...listMetrics,
  ...distributionMetrics,
];
