import {
  createCarSchema,
  createLapSchema,
  createSetupParamSchema,
  createSimGameSchema,
  createTrackSchema,
  updateLapSchema,
} from "@gp/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import * as simService from "../services/sim.service.js";
import { computeSimStats } from "../services/sim/sim-stats.service.js";

const idParamsSchema = z.object({ id: z.string().uuid() });

export function registerSimRoutes(app: FastifyInstance): void {
  // Juegos, circuitos, autos y parámetros en una sola llamada: la UI necesita
  // los cuatro a la vez para armar los selectores.
  app.get("/api/sim/catalog", () => simService.getCatalog());

  app.get("/api/sim/stats", () => computeSimStats());

  // Solo se borra lo que no está en uso. El service devuelve 409 con el motivo.
  app.delete("/api/sim/tracks/:id", (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    simService.deleteTrack(id);
    return reply.code(204).send();
  });

  app.delete("/api/sim/cars/:id", (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    simService.deleteCar(id);
    return reply.code(204).send();
  });

  app.delete("/api/sim/setup-params/:id", (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    simService.deleteSetupParam(id);
    return reply.code(204).send();
  });

  app.post("/api/sim/games", (request, reply) => {
    const input = createSimGameSchema.parse(request.body);
    return reply.code(201).send(simService.createSimGame(input));
  });

  app.post("/api/sim/tracks", (request, reply) => {
    const input = createTrackSchema.parse(request.body);
    return reply.code(201).send(simService.createTrack(input));
  });

  app.post("/api/sim/cars", (request, reply) => {
    const input = createCarSchema.parse(request.body);
    return reply.code(201).send(simService.createCar(input));
  });

  app.post("/api/sim/setup-params", (request, reply) => {
    const input = createSetupParamSchema.parse(request.body);
    return reply.code(201).send(simService.createSetupParam(input));
  });

  app.get("/api/sim/laps", () => simService.listLaps());

  app.post("/api/sim/laps", (request, reply) => {
    const input = createLapSchema.parse(request.body);
    return reply.code(201).send(simService.createLap(input));
  });

  app.patch("/api/sim/laps/:id", (request) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = updateLapSchema.parse(request.body);
    return simService.updateLap(id, input);
  });

  app.delete("/api/sim/laps/:id", (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    simService.deleteLap(id);
    return reply.code(204).send();
  });
}
