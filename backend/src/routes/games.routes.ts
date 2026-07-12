import { createGameSchema, updateGameSchema } from "@gp/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import * as gamesService from "../services/games.service.js";

const idParamsSchema = z.object({ id: z.string().uuid() });

export function registerGameRoutes(app: FastifyInstance): void {
  app.get("/api/games", () => gamesService.listGames());

  app.post("/api/games", (request, reply) => {
    const input = createGameSchema.parse(request.body);
    return reply.code(201).send(gamesService.createGame(input));
  });

  // El autosave del frontend pega acá, campo por campo.
  app.patch("/api/games/:id", (request) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = updateGameSchema.parse(request.body);
    return gamesService.updateGame(id, input);
  });

  app.delete("/api/games/:id", (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    gamesService.deleteGame(id);
    return reply.code(204).send();
  });
}
