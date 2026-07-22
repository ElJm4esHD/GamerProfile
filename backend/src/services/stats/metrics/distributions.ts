import { countBy, type Metric } from "../types.js";

export const distributionMetrics: Metric[] = [
  {
    key: "genre-distribution",
    label: "Géneros",
    span: 3,
    compute: (games) => ({
      kind: "distribution",
      entries: countBy(games.flatMap((game) => game.genres)),
    }),
  },

  {
    key: "platform-distribution",
    label: "Plataformas",
    span: 3,
    compute: (games) => ({
      kind: "distribution",
      entries: countBy(games.flatMap((game) => game.platforms)),
    }),
  },

  {
    key: "completed-by-year",
    label: "Terminados por año",
    span: 3,
    compute: (games) => {
      const years = games
        .filter((game) => game.finishedAt !== null)
        .map((game) => (game.finishedAt ?? "").slice(0, 4));

      return {
        kind: "distribution",
        // Cronológico, no por cantidad: una serie temporal desordenada no se lee.
        entries: countBy(years).sort((a, b) => a.label.localeCompare(b.label)),
      };
    },
  },

  {
    key: "score-distribution",
    label: "Reparto de puntajes",
    compute: (games) => {
      const buckets = games
        .map((game) => game.overall)
        .filter((overall): overall is number => overall !== null)
        .map((overall) => {
          const floor = Math.min(90, Math.floor(overall / 10) * 10);
          return `${floor}–${floor + 9}`;
        });

      return {
        kind: "distribution",
        entries: countBy(buckets).sort((a, b) => a.label.localeCompare(b.label)),
      };
    },
  },
];
