import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import { DATABASE_DIR, DB_FILE } from "./paths.js";
import * as schema from "./schema.js";

fs.mkdirSync(DATABASE_DIR, { recursive: true });

export const sqlite = new Database(DB_FILE);

// WAL: lecturas y escrituras concurrentes sin bloqueos. FULL: cero pérdida ante crash.
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = FULL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });