import { daysBetween, toRef, type Metric, type StatsGame } from "../types.js";

/** Juegos terminados con las dos fechas cargadas, con su duración en días. */
function completionSpans(games: readonly StatsGame[]): { game: StatsGame; days: number }[] {
  return games
    .filter((game) => game.status === "completed")
    .map((game) => ({ game, days: daysBetween(game.startedAt, game.finishedAt) }))
    .filter((entry): entry is { game: StatsGame; days: number } => entry.days !== null);
}

export const milestoneMetrics: Metric[] = [
  {
    key: "last-completed",
    label: "Último juego terminado",
    compute: (games) => {
      const finished = games
        .filter((game) => game.finishedAt !== null)
        .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));

      const latest = finished[0];
      if (!latest) return { kind: "game", game: null };

      return { kind: "game", game: toRef(latest), caption: latest.finishedAt ?? undefined };
    },
  },

  {
    key: "longest-completion",
    label: "El que más me costó",
    compute: (games) => {
      const spans = completionSpans(games).sort((a, b) => b.days - a.days);
      const longest = spans[0];
      if (!longest) return { kind: "game", game: null };

      return {
        kind: "game",
        game: toRef(longest.game),
        caption: `${longest.days} días de principio a fin`,
      };
    },
  },

  {
    key: "fastest-completion",
    label: "El más rápido",
    compute: (games) => {
      const spans = completionSpans(games).sort((a, b) => a.days - b.days);
      const fastest = spans[0];
      if (!fastest) return { kind: "game", game: null };

      return {
        kind: "game",
        game: toRef(fastest.game),
        caption: `${fastest.days} días de principio a fin`,
      };
    },
  },
];
