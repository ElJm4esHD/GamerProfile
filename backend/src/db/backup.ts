import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { sqlite } from "./client.js";
import { BACKUPS_DIR } from "./paths.js";

const KEEP_LAST = 20;

/** Backup en caliente y consistente. Rota los más viejos. */
export function createBackup(): string {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = path.join(BACKUPS_DIR, `app-${stamp}.db`);

  sqlite.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  pruneOldBackups();

  return target;
}

function pruneOldBackups(): void {
  const backups = fs
    .readdirSync(BACKUPS_DIR)
    .filter((file) => file.endsWith(".db"))
    .sort()
    .reverse();

  for (const stale of backups.slice(KEEP_LAST)) {
    fs.unlinkSync(path.join(BACKUPS_DIR, stale));
  }
}

// Se ejecuta solo si el archivo se corre directo (`npm run db:backup`).
// pathToFileURL es obligatorio en Windows: argv[1] es "C:\...", no una URL.
const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  console.log(`✔ Backup creado: ${createBackup()}`);
}
