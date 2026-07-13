/**
 * El contrato del Dashboard.
 *
 * El backend devuelve una lista de estadísticas; el frontend elige qué
 * componente usar según el `kind` del valor. Consecuencia importante: agregar
 * una métrica nueva en el backend la hace aparecer sola en el Dashboard, sin
 * tocar una línea de React.
 */

export interface StatGameRef {
  id: string;
  name: string;
}

export type StatValue =
  /** Un número suelto: cantidades, promedios. */
  | { kind: "number"; value: number | null; unit?: string }
  /** Texto ya formateado: un tiempo de vuelta, un nombre. Con leyenda opcional. */
  | { kind: "text"; value: string | null; caption?: string }
  /** Tiempo. Siempre en minutos; el formato es problema de la UI. */
  | { kind: "duration"; minutes: number | null }
  /** Un juego destacado, con una leyenda opcional ("42 días"). */
  | { kind: "game"; game: StatGameRef | null; caption?: string }
  /** Varios juegos: agregados recientemente, favoritos. */
  | { kind: "gameList"; games: StatGameRef[] }
  /** Un reparto: géneros, plataformas, terminados por año. */
  | { kind: "distribution"; entries: DistributionEntry[] };

export interface DistributionEntry {
  label: string;
  value: number;
}

export interface StatResult {
  key: string;
  label: string;
  value: StatValue;
}
