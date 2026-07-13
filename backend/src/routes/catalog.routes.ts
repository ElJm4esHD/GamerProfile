import type { FastifyInstance } from "fastify";
import { z } from "zod";
import * as catalogService from "../services/catalog.service.js";

const nameSchema = z.object({ name: z.string().trim().min(1).max(120) });

export function registerCatalogRoutes(app: FastifyInstance): void {
  app.get("/api/game-types", () => catalogService.listGameTypes());
  app.get("/api/criteria", () => catalogService.listCriteria());
  app.get("/api/platforms", () => catalogService.listPlatforms());
  app.get("/api/genres", () => catalogService.listGenres());
  app.get("/api/tags", () => catalogService.listTags());
  app.get("/api/companies", () => catalogService.listCompanies());

  // Alta al vuelo desde la ficha del juego: no hace falta ir a Ajustes
  // para escribir un tag o un estudio nuevo.
  app.post("/api/tags", (request, reply) => {
    const { name } = nameSchema.parse(request.body);
    return reply.code(201).send(catalogService.createTag(name));
  });

  app.post("/api/companies", (request, reply) => {
    const { name } = nameSchema.parse(request.body);
    return reply.code(201).send(catalogService.createCompany(name));
  });
}
