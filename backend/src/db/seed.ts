import { randomUUID } from "node:crypto";
import { db } from "./client.js";
import { criteria, gameRatings, gameTypes, games } from "./schema.js";
import { SEED_GAMES } from "./seed-data.js";

const CRITERIA_NAMES = [
  "Gameplay",
  "Story & Narrative",
  "Graphics & Art Style",
  "Sound & Music",
  "Originality",
  "Emotional Impact",
] as const;

const TYPE_NAMES = ["Full Game", "DLC", "Demo", "Expansion", "Remake"] as const;

function seed(): void {
  const existing = db.select().from(games).limit(1).all();
  if (existing.length > 0) {
    console.log("⚠ La base ya tiene juegos. Seed cancelado (no piso datos).");
    return;
  }

  db.transaction((tx) => {
    const typeIds = new Map<string, string>();
    TYPE_NAMES.forEach((name, position) => {
      const id = randomUUID();
      typeIds.set(name, id);
      tx.insert(gameTypes).values({ id, name, position }).run();
    });

    const criterionIds = new Map<string, string>();
    CRITERIA_NAMES.forEach((name, position) => {
      const id = randomUUID();
      criterionIds.set(name, id);
      tx.insert(criteria).values({ id, name, weight: 1, position }).run();
    });

    for (const entry of SEED_GAMES) {
      const gameId = randomUUID();
      tx.insert(games)
        .values({ id: gameId, name: entry.name, typeId: typeIds.get(entry.type)! })
        .run();

      CRITERIA_NAMES.forEach((name, index) => {
        tx.insert(gameRatings)
          .values({
            gameId,
            criterionId: criterionIds.get(name)!,
            value: entry.scores[index]!,
          })
          .run();
      });
    }
  });

  console.log(`✔ ${SEED_GAMES.length} juegos importados`);
}

seed();