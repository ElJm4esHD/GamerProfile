import { buildApp } from "./app.js";
import { config } from "./config.js";
import { createBackup } from "./db/backup.js";

// Un backup por arranque. Es barato y algún día te va a salvar.
const backup = createBackup();

const app = await buildApp();
app.log.info(`Backup creado: ${backup}`);

await app.listen({ port: config.port, host: config.host });
