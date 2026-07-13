import { countBy, type Metric } from "../types.js";

export const distributionMetrics: Metric[] = [
  {
    key: "genre-distribution",
    label: "Géneros",
    compute: (games) => ({
      kind: "distribution",
      entries: countBy(games.flatMap((game) => game.genres)),
    }),
  },

  {
    key: "platform-distribution",
    label: "Plataformas",
    compute: (games) => ({
      kind: "distribution",
      entries: countBy(games.flatMap((game) => game.platforms)),
    }),
  },

  {
    key: "completed-by-year",
    label: "Terminados por año",
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
];
