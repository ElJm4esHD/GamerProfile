import { desc, eq, type InferSelectModel } from "drizzle-orm";
import { db } from "../db/client.js";
import { wishlistItems } from "../db/schema.js";

export type WishlistRow = InferSelectModel<typeof wishlistItems>;

/** Campos escalares de un ítem, sin id ni createdAt (los pone el server). */
export interface WishlistFields {
  name: string;
  year: number | null;
  genre: string | null;
  note: string | null;
  source: string;
}

/* ── Lectura ───────────────────────────────────────────────────────────── */

/** El último agregado arriba: la lista se lee de lo más nuevo a lo más viejo. */
export function findAll(): WishlistRow[] {
  return db.select().from(wishlistItems).orderBy(desc(wishlistItems.createdAt)).all();
}

export function findById(id: string): WishlistRow | undefined {
  return db.select().from(wishlistItems).where(eq(wishlistItems.id, id)).get();
}

export function findByName(name: string): WishlistRow | undefined {
  return db.select().from(wishlistItems).where(eq(wishlistItems.name, name)).get();
}

/* ── Escritura ─────────────────────────────────────────────────────────── */

export function insert(id: string, fields: WishlistFields): WishlistRow {
  db.insert(wishlistItems)
    .values({ id, ...fields })
    .run();

  // La fila recién insertada trae el createdAt que puso la base.
  const row = findById(id);
  if (!row) throw new Error("No se pudo leer el ítem recién creado");
  return row;
}

export function update(id: string, fields: Partial<WishlistFields>): void {
  db.update(wishlistItems).set(fields).where(eq(wishlistItems.id, id)).run();
}

export function remove(id: string): void {
  db.delete(wishlistItems).where(eq(wishlistItems.id, id)).run();
}
