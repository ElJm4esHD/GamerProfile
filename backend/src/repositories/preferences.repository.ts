import { eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { preferences } from "../db/schema.js";

/**
 * Guarda y lee texto por clave. No sabe qué significa lo que guarda: quien
 * llama se ocupa de serializar y de validar.
 */

export function findValue(key: string): string | undefined {
  return db.select().from(preferences).where(eq(preferences.key, key)).get()?.value;
}

export function saveValue(key: string, value: string): void {
  db.insert(preferences)
    .values({ key, value })
    .onConflictDoUpdate({
      target: preferences.key,
      set: { value, updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))` },
    })
    .run();
}

export function removeValue(key: string): void {
  db.delete(preferences).where(eq(preferences.key, key)).run();
}
