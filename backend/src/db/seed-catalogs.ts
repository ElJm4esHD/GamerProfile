import { randomUUID } from "node:crypto";
import { db } from "./client.js";
import { genres, platforms } from "./schema.js";

/**
 * Carga inicial de plataformas y géneros.
 * Idempotente: si ya existe el nombre, no hace nada. Podés correrlo mil veces.
 * Estos catálogos son tuyos: agregá o sacá lo que quieras desde acá.
 */

const PLATFORMS = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
  "Steam Deck",
  "Mobile",
] as const;

const GENRES = [
  "Acción",
  "Aventura",
  "RPG",
  "Shooter",
  "Plataformas",
  "Terror",
  "Puzzle",
  "Estrategia",
  "Simulación",
  "Deportes",
  "Carreras",
  "Metroidvania",
  "Roguelike",
  "Souls-like",
  "Narrativo",
  "Indie",
] as const;

function seedCatalogs(): void {
  db.transaction((tx) => {
    PLATFORMS.forEach((name, position) => {
      tx.insert(platforms)
        .values({ id: randomUUID(), name, position })
        .onConflictDoNothing()
        .run();
    });

    GENRES.forEach((name, position) => {
      tx.insert(genres).values({ id: randomUUID(), name, position }).onConflictDoNothing().run();
    });
  });

  console.log(`✔ Catálogos listos: ${PLATFORMS.length} plataformas, ${GENRES.length} géneros`);
}

seedCatalogs();
