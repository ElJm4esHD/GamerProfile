import {
  DEFAULT_WIDGET_SPAN,
  formatLapTime,
  type LapRecord,
  type StatResult,
  type StatValue,
  type WidgetSpan,
} from "@gp/shared";
import { listLaps } from "../sim.service.js";

/**
 * Registro de métricas de Sim Racing.
 *
 * Mismo patrón que el de la biblioteca, pero con su propio registro y su
 * propio endpoint: son dominios distintos y no deben acoplarse. Agregar una
 * estadística sigue siendo escribir un objeto acá y sumarlo a METRICS: el
 * frontend la pinta sola, porque despacha por el `kind` del valor.
 */
interface SimMetric {
  key: string;
  label: string;
  /** Ancho por defecto de la tarjeta, de 1 a 4. Sin declarar, 1. */
  span?: WidgetSpan;
  compute: (laps: readonly LapRecord[]) => StatValue;
}

function countBy(values: readonly string[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

const METRICS: readonly SimMetric[] = [
  {
    key: "best-lap",
    label: "Vuelta más rápida",
    compute: (laps) => {
      const fastest = [...laps].sort((a, b) => a.timeMs - b.timeMs)[0];
      if (!fastest) return { kind: "text", value: null };

      return {
        kind: "text",
        value: formatLapTime(fastest.timeMs),
        caption: `${fastest.track.name} · ${fastest.car.name}`,
      };
    },
  },

  {
    key: "last-lap",
    label: "Última vuelta",
    compute: (laps) => {
      const latest = [...laps].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
      if (!latest) return { kind: "text", value: null };

      return {
        kind: "text",
        value: formatLapTime(latest.timeMs),
        caption: `${latest.track.name} · ${latest.recordedAt}`,
      };
    },
  },

  {
    key: "most-driven-car",
    label: "Auto más usado",
    compute: (laps) => {
      const top = countBy(laps.map((lap) => lap.car.name))[0];
      if (!top) return { kind: "text", value: null };

      return {
        kind: "text",
        value: top.label,
        caption: `${top.value} ${top.value === 1 ? "vuelta" : "vueltas"}`,
      };
    },
  },

  {
    key: "total-laps",
    label: "Vueltas registradas",
    compute: (laps) => ({ kind: "number", value: laps.length }),
  },

  {
    key: "personal-bests",
    label: "Récords vigentes",
    compute: (laps) => ({
      // Un PB por combinación circuito + auto.
      kind: "number",
      value: laps.filter((lap) => lap.isPersonalBest).length,
    }),
  },

  {
    key: "tracks-driven",
    label: "Circuitos corridos",
    compute: (laps) => ({
      kind: "number",
      value: new Set(laps.map((lap) => lap.track.id)).size,
    }),
  },

  {
    key: "cars-driven",
    label: "Autos usados",
    compute: (laps) => ({
      kind: "number",
      value: new Set(laps.map((lap) => lap.car.id)).size,
    }),
  },

  {
    key: "sim-laps-by-sim",
    label: "Vueltas por simulador",
    span: 2,
    compute: (laps) => ({
      kind: "distribution",
      entries: countBy(laps.map((lap) => lap.simGame.name)),
    }),
  },

  {
    key: "sim-laps-by-track",
    label: "Vueltas por circuito",
    span: 2,
    compute: (laps) => ({
      kind: "distribution",
      entries: countBy(laps.map((lap) => lap.track.name)),
    }),
  },

  {
    key: "sim-laps-by-month",
    label: "Vueltas por mes",
    span: 4,
    compute: (laps) => ({
      kind: "distribution",
      // Cronológico: una serie temporal ordenada por cantidad no se puede leer.
      entries: countBy(laps.map((lap) => lap.recordedAt.slice(0, 7))).sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
    }),
  },
];

export function computeSimStats(): StatResult[] {
  const laps = listLaps();

  return METRICS.map((metric) => ({
    key: metric.key,
    label: metric.label,
    span: metric.span ?? DEFAULT_WIDGET_SPAN,
    value: metric.compute(laps),
  }));
}
