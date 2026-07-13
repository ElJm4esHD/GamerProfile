import { asc, eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { companies, criteria, gameTypes, genres, platforms, tags } from "../db/schema.js";

/* ── Lectura ───────────────────────────────────────────────────────────── */

export function findAllGameTypes() {
  return db.select().from(gameTypes).orderBy(asc(gameTypes.position)).all();
}

export function findAllCriteria() {
  return db.select().from(criteria).orderBy(asc(criteria.position)).all();
}

export function findAllPlatforms() {
  return db.select().from(platforms).orderBy(asc(platforms.position)).all();
}

export function findAllGenres() {
  return db.select().from(genres).orderBy(asc(genres.position)).all();
}

export function findAllTags() {
  return db.select().from(tags).orderBy(asc(tags.name)).all();
}

export function findAllCompanies() {
  return db.select().from(companies).orderBy(asc(companies.name)).all();
}

export function findCriterionById(id: string) {
  return db.select().from(criteria).where(eq(criteria.id, id)).get();
}

/* ── Alta al vuelo ─────────────────────────────────────────────────────── */

/**
 * Devuelve la fila existente o la crea. El nombre es UNIQUE, así que dos
 * "FromSoftware" nunca conviven: es exactamente el problema que la tabla
 * `companies` vino a resolver.
 */
export function findOrCreateTag(id: string, name: string) {
  const existing = db.select().from(tags).where(eq(tags.name, name)).get();
  if (existing) return existing;

  db.insert(tags).values({ id, name }).run();
  return { id, name };
}

export function findOrCreateCompany(id: string, name: string) {
  const existing = db.select().from(companies).where(eq(companies.name, name)).get();
  if (existing) return existing;

  db.insert(companies).values({ id, name }).run();
  return { id, name };
}

export function findOrCreatePlatform(id: string, name: string) {
  const existing = db.select().from(platforms).where(eq(platforms.name, name)).get();
  if (existing) return existing;

  const position = nextPosition("platforms");
  db.insert(platforms).values({ id, name, position }).run();
  return { id, name, position };
}

export function findOrCreateGenre(id: string, name: string) {
  const existing = db.select().from(genres).where(eq(genres.name, name)).get();
  if (existing) return existing;

  const position = nextPosition("genres");
  db.insert(genres).values({ id, name, position }).run();
  return { id, name, position };
}

/* ── Criterios ─────────────────────────────────────────────────────────── */

export function insertCriterion(id: string, name: string, weight: number) {
  const position = nextPosition("criteria");
  db.insert(criteria).values({ id, name, weight, position }).run();
  return { id, name, weight, position, isActive: true };
}

/**
 * Solo se actualiza. NO existe un delete a propósito: borrar un criterio
 * arrastraría (ON DELETE CASCADE) todos los puntajes que le diste a ese
 * criterio en todos los juegos. Desactivarlo lo saca de la tabla y del
 * cálculo del overall, pero conserva el historial.
 */
export function updateCriterion(
  id: string,
  fields: { name?: string; weight?: number; isActive?: boolean },
) {
  db.update(criteria).set(fields).where(eq(criteria.id, id)).run();
}

/** El nombre de tabla nunca viene del usuario: es literal en el código. */
function nextPosition(table: "platforms" | "genres" | "criteria"): number {
  const row = db.get<{ next: number }>(
    sql.raw(`SELECT COALESCE(MAX(position), -1) + 1 AS next FROM ${table}`),
  );
  return row?.next ?? 0;
}
