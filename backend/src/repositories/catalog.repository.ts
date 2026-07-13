import { asc, eq } from "drizzle-orm";
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
