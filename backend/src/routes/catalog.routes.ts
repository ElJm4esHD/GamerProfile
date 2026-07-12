import type { FastifyInstance } from "fastify";
import * as catalogService from "../services/catalog.service.js";

export function registerCatalogRoutes(app: FastifyInstance): void {
  app.get("/api/game-types", () => catalogService.listGameTypes());
  app.get("/api/criteria", () => catalogService.listCriteria());
}
