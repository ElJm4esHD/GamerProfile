import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { gameGenres, gamePlatforms, genres, platforms } from "../db/schema.js";

/**
 * Las relaciones de TODOS los juegos en dos queries.
 * Pedirlas juego por juego sería N+1: con 500 juegos, 1000 consultas.
 */

export function findAllGenreLinks(): { gameId: string; name: string }[] {
  return db
    .select({ gameId: gameGenres.gameId, name: genres.name })
    .from(gameGenres)
    .innerJoin(genres, eq(gameGenres.genreId, genres.id))
    .all();
}

export function findAllPlatformLinks(): { gameId: string; name: string }[] {
  return db
    .select({ gameId: gamePlatforms.gameId, name: platforms.name })
    .from(gamePlatforms)
    .innerJoin(platforms, eq(gamePlatforms.platformId, platforms.id))
    .all();
}
