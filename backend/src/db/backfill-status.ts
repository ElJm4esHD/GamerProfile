import { createBackup } from "./backup.js";
import { sqlite } from "./client.js";

/**
 * Backfill único: tus juegos previos a la biblioteca ya estaban puntuados, o
 * sea que los jugaste. Dejarlos en 'backlog' (el default de la columna nueva)
 * sería mentira y ensuciaría el dashboard desde el día uno.
 *
 * Solo toca juegos que tengan al menos un puntaje y sigan en 'backlog'.
 * Los juegos nuevos que crees a partir de ahora no se ven afectados.
 * Idempotente: correrlo dos veces no cambia nada.
 */

console.log(`Backup previo: ${createBackup()}`);

const result = sqlite
  .prepare(
    `UPDATE games
        SET status = 'completed'
      WHERE status = 'backlog'
        AND id IN (SELECT DISTINCT game_id FROM game_ratings)`,
  )
  .run();

console.log(`✔ ${result.changes} juegos marcados como 'completed'`);
