import { DEFAULT_WIDGET_SPAN, type StatResult } from "@gp/shared";
import * as gamesRepository from "../../repositories/games.repository.js";
import * as statsRepository from "../../repositories/stats.repository.js";
import { listGames } from "../games.service.js";
import { METRICS } from "./registry.js";
import type { StatsGame } from "./types.js";

/**
 * Arma la foto de la colección UNA vez y se la pasa a todas las métricas.
 * Si cada métrica consultara la base por su cuenta, veinte tarjetas serían
 * veinte recorridas del disco.
 */
function buildContext(): StatsGame[] {
  const views = listGames(); // ya trae overall, status, favorito
  const rows = new Map(gamesRepository.findAllGameRows().map((row) => [row.id, row]));

  const genresByGame = groupNames(statsRepository.findAllGenreLinks());
  const platformsByGame = groupNames(statsRepository.findAllPlatformLinks());

  return views.map((view) => {
    const row = rows.get(view.id);

    return {
      id: view.id,
      name: view.name,
      status: view.status,
      overall: view.overall,
      isFavorite: view.isFavorite,
      startedAt: row?.startedAt ?? null,
      finishedAt: row?.finishedAt ?? null,
      createdAt: view.createdAt,
      playtimeMinutes: row?.playtimeMinutes ?? null,
      genres: genresByGame.get(view.id) ?? [],
      platforms: platformsByGame.get(view.id) ?? [],
    };
  });
}

export function computeStats(): StatResult[] {
  const games = buildContext();

  return METRICS.map((metric) => ({
    key: metric.key,
    label: metric.label,
    span: metric.span ?? DEFAULT_WIDGET_SPAN,
    value: metric.compute(games),
  }));
}

function groupNames(links: readonly { gameId: string; name: string }[]): Map<string, string[]> {
  const grouped = new Map<string, string[]>();

  for (const link of links) {
    const names = grouped.get(link.gameId) ?? [];
    names.push(link.name);
    grouped.set(link.gameId, names);
  }

  return grouped;
}
