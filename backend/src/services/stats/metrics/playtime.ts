import { daysBetween, type Metric } from "../types.js";

export const playtimeMetrics: Metric[] = [
  {
    key: "total-playtime",
    label: "Horas jugadas totales",
    compute: (games) => {
      const total = games.reduce((sum, game) => sum + (game.playtimeMinutes ?? 0), 0);
      return { kind: "duration", minutes: total === 0 ? null : total };
    },
  },

  {
    key: "average-playtime",
    label: "Duración promedio",
    compute: (games) => {
      const played = games.filter((game) => (game.playtimeMinutes ?? 0) > 0);
      if (played.length === 0) return { kind: "duration", minutes: null };

      const total = played.reduce((sum, game) => sum + (game.playtimeMinutes ?? 0), 0);
      return { kind: "duration", minutes: Math.round(total / played.length) };
    },
  },

  {
    key: "average-completion-days",
    label: "Días promedio para terminar",
    compute: (games) => {
      // Solo juegos terminados con las dos fechas cargadas: un promedio sobre
      // datos incompletos es peor que no mostrar nada.
      const spans = games
        .filter((game) => game.status === "completed")
        .map((game) => daysBetween(game.startedAt, game.finishedAt))
        .filter((days): days is number => days !== null);

      if (spans.length === 0) return { kind: "number", value: null, unit: "días" };

      const total = spans.reduce((sum, days) => sum + days, 0);
      return { kind: "number", value: Math.round(total / spans.length), unit: "días" };
    },
  },
];
