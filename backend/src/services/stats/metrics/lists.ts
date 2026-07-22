import { toRef, type Metric } from "../types.js";

const LIST_SIZE = 5;

export const listMetrics: Metric[] = [
  {
    key: "recently-added",
    label: "Agregados recientemente",
    span: 2,
    compute: (games) => ({
      kind: "gameList",
      games: [...games]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, LIST_SIZE)
        .map(toRef),
    }),
  },

  {
    key: "favorites",
    label: "Favoritos",
    span: 2,
    compute: (games) => ({
      kind: "gameList",
      games: games
        .filter((game) => game.isFavorite)
        .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
        .slice(0, LIST_SIZE)
        .map(toRef),
    }),
  },

  {
    key: "playing-now",
    label: "Jugando ahora",
    span: 2,
    compute: (games) => ({
      kind: "gameList",
      games: games.filter((game) => game.status === "playing").map(toRef),
    }),
  },
];
