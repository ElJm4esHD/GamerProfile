import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = path.resolve(here, "../../..");
export const DATABASE_DIR = path.join(ROOT_DIR, "database");
export const DB_FILE = path.join(DATABASE_DIR, "app.db");
export const MIGRATIONS_DIR = path.join(DATABASE_DIR, "migrations");
export const BACKUPS_DIR = path.join(DATABASE_DIR, "backups");