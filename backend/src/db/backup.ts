import fs from "node:fs";
import path from "node:path";
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

// Permite `npm run db:backup` a mano; el servidor lo llamará al arrancar.
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`✔ Backup creado: ${createBackup()}`);
}