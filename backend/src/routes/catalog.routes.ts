import { catalogNameSchema, createCriterionSchema, updateCriterionSchema } from "@gp/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createBackup } from "../db/backup.js";
import * as catalogService from "../services/catalog.service.js";

const idParamsSchema = z.object({ id: z.string().uuid() });

export function registerCatalogRoutes(app: FastifyInstance): void {
  app.get("/api/game-types", () => catalogService.listGameTypes());
  app.get("/api/criteria", () => catalogService.listCriteria());
  app.get("/api/platforms", () => catalogService.listPlatforms());
  app.get("/api/genres", () => catalogService.listGenres());
  app.get("/api/tags", () => catalogService.listTags());
  app.get("/api/companies", () => catalogService.listCompanies());

  // Alta al vuelo: no hace falta ir a Ajustes para escribir un tag nuevo.
  app.post("/api/tags", (request, reply) => {
    const { name } = catalogNameSchema.parse(request.body);
    return reply.code(201).send(catalogService.createTag(name));
  });

  app.post("/api/companies", (request, reply) => {
    const { name } = catalogNameSchema.parse(request.body);
    return reply.code(201).send(catalogService.createCompany(name));
  });

  app.post("/api/platforms", (request, reply) => {
    const { name } = catalogNameSchema.parse(request.body);
    return reply.code(201).send(catalogService.createPlatform(name));
  });

  app.post("/api/genres", (request, reply) => {
    const { name } = catalogNameSchema.parse(request.body);
    return reply.code(201).send(catalogService.createGenre(name));
  });

  app.post("/api/criteria", (request, reply) => {
    const input = createCriterionSchema.parse(request.body);
    return reply.code(201).send(catalogService.createCriterion(input));
  });

  // Sin DELETE, a propósito: borrar un criterio arrastraría todos los
  // puntajes que le diste. Se desactiva con isActive: false.
  app.patch("/api/criteria/:id", (request) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = updateCriterionSchema.parse(request.body);
    return catalogService.updateCriterion(id, input);
  });

  app.post("/api/backup", () => ({ path: createBackup() }));
}
