import { randomUUID } from "node:crypto";
import { db } from "./client.js";
import { simGames } from "./schema.js";

/**
 * Los tres simuladores iniciales. Idempotente: el nombre es UNIQUE.
 * Agregar otro más adelante se hace desde la UI, no acá.
 */
const SIMS = ["Assetto Corsa", "Assetto Corsa Rally", "DiRT Rally 2.0"] as const;

function seedSims(): void {
  db.transaction((tx) => {
    SIMS.forEach((name, position) => {
      tx.insert(simGames)
        .values({ id: randomUUID(), name, position })
        .onConflictDoNothing()
        .run();
    });
  });

  console.log(`✔ ${SIMS.length} simuladores listos`);
}

seedSims();
