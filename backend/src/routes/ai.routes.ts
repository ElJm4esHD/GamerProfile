import type { FastifyInstance } from "fastify";
import { config, isGeminiEnabled } from "../config.js";
import {
  getSavedRecommendations,
  recommendGames,
} from "../services/ai/recommendations.service.js";

export function registerAiRoutes(app: FastifyInstance): void {
  /**
   * Diagnóstico. NO devuelve la clave, solo si existe y cuántos caracteres
   * tiene: alcanza para detectar el 90% de los problemas (clave vacía, .env en
   * el lugar equivocado, comillas de más) sin filtrar el secreto.
   */
  app.get("/api/ai/status", () => ({
    enabled: isGeminiEnabled(),
    model: config.gemini.model,
    keyLength: config.gemini.apiKey?.length ?? 0,
    envFilesLoaded: config.envFilesLoaded,
  }));

  // GET: la última tanda guardada. Gratis e instantáneo, se lee de la base.
  app.get("/api/ai/recommendations", () => getSavedRecommendations());

  // POST y no GET: cada llamada cuesta plata y tarda. No es cacheable.
  // Reemplaza la tanda guardada y devuelve la nueva.
  app.post("/api/ai/recommendations", () => recommendGames());
}
