import { asc } from "drizzle-orm";
import { db } from "../db/client.js";
import { criteria, gameTypes } from "../db/schema.js";

/** Catálogos: tipos de juego y criterios de puntuación. */

export function findAllGameTypes() {
  return db.select().from(gameTypes).orderBy(asc(gameTypes.position)).all();
}

export function findAllCriteria() {
  return db.select().from(criteria).orderBy(asc(criteria.position)).all();
}
