import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ConflictError, NotFoundError } from "./errors.js";
import { registerCatalogRoutes } from "./routes/catalog.routes.js";
import { registerGameRoutes } from "./routes/games.routes.js";
import { registerSimRoutes } from "./routes/sim.routes.js";
import { registerStatsRoutes } from "./routes/stats.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: { transport: { target: "pino-pretty" } } });

  // App local: el frontend corre en otro puerto (Vite), nada más entra acá.
  await app.register(cors, { origin: true });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: "Datos inválidos", issues: error.issues });
    }
    if (error instanceof NotFoundError) {
      return reply.code(404).send({ error: error.message });
    }
    if (error instanceof ConflictError) {
      return reply.code(409).send({ error: error.message });
    }
    app.log.error(error);
    return reply.code(500).send({ error: "Error interno" });
  });

  registerCatalogRoutes(app);
  registerGameRoutes(app);
  registerStatsRoutes(app);
  registerSimRoutes(app);

  return app;
}
