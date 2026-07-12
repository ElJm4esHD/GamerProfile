import { buildApp } from "./app.js";
import { createBackup } from "./db/backup.js";

const PORT = 4000;
const HOST = "127.0.0.1"; // Solo esta PC. La app nunca escucha hacia afuera.

// Un backup por arranque. Es barato y algún día te va a salvar.
const backup = createBackup();

const app = await buildApp();
app.log.info(`Backup creado: ${backup}`);

await app.listen({ port: PORT, host: HOST });
