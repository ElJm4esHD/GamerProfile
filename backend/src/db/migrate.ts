import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./client.js";
import { MIGRATIONS_DIR } from "./paths.js";

migrate(db, { migrationsFolder: MIGRATIONS_DIR });
console.log("✔ Migraciones aplicadas");