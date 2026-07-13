import type { GameStatus } from "@gp/shared";
import type { Metric } from "../types.js";

/** Cuántos juegos hay en cada estado. */
function countByStatus(key: string, label: string, status: GameStatus): Metric {
  return {
    key,
    label,
    compute: (games) => ({
      kind: "number",
      value: games.filter((game) => game.status === status).length,
    }),
  };
}

export const countMetrics: Metric[] = [
  countByStatus("completed-count", "Completados", "completed"),
  countByStatus("playing-count", "Jugando ahora", "playing"),
  countByStatus("abandoned-count", "Abandonados", "abandoned"),
  countByStatus("backlog-count", "Pendientes", "backlog"),

  {
    key: "average-overall",
    label: "Overall promedio",
    compute: (games) => {
      const scores = games
        .map((game) => game.overall)
        .filter((overall): overall is number => overall !== null);

      if (scores.length === 0) return { kind: "number", value: null };

      const total = scores.reduce((sum, score) => sum + score, 0);
      return { kind: "number", value: Math.round(total / scores.length) };
    },
  },
];
