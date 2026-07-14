import path from "node:path";
import { ROOT_DIR } from "./db/paths.js";

/**
 * Configuración desde `.env`, sin dependencias.
 *
 * Node trae `loadEnvFile` desde la 20.12: no hace falta dotenv.
 * Se busca en `backend/.env` y en la raíz del proyecto, porque es fácil
 * crearlo en el lugar equivocado y el síntoma sería silencioso.
 */
const ENV_CANDIDATES = [path.join(ROOT_DIR, "backend", ".env"), path.join(ROOT_DIR, ".env")];

const loadedFrom: string[] = [];

for (const candidate of ENV_CANDIDATES) {
  try {
    process.loadEnvFile(candidate);
    loadedFrom.push(candidate);
  } catch {
    // No existe: es un escenario válido, no un error.
  }
}

export const config = {
  port: 4000,
  host: "127.0.0.1", // Solo esta PC. La app nunca escucha hacia afuera.

  gemini: {
    apiKey: process.env.GEMINI_API_KEY?.trim() || null,
    // Configurable a propósito: los nombres de modelo se deprecan y no quiero
    // que eso te obligue a tocar código.
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
  },

  envFilesLoaded: loadedFrom,
} as const;

export function isGeminiEnabled(): boolean {
  return config.gemini.apiKey !== null;
}
