import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import type { ZodError } from "zod";
import { ConflictError, NotFoundError, UnavailableError } from "./errors.js";
import { registerAiRoutes } from "./routes/ai.routes.js";
import { registerCatalogRoutes } from "./routes/catalog.routes.js";
import { registerDashboardRoutes } from "./routes/dashboard.routes.js";
import { registerGameRoutes } from "./routes/games.routes.js";
import { registerSimRoutes } from "./routes/sim.routes.js";
import { registerStatsRoutes } from "./routes/stats.routes.js";
import { registerWishlistRoutes } from "./routes/wishlist.routes.js";

/**
 * Se mira el `name` y no `instanceof ZodError`, a propósito.
 *
 * Los esquemas de `@gp/shared` y los de `backend` cargan copias distintas del
 * módulo `zod` (dos workspaces), así que sus clases NO son la misma y el
 * `instanceof` da false para todo lo que valide un esquema compartido. El
 * síntoma era feo y silencioso: un nombre vacío devolvía 500 "Error interno"
 * en vez de 400 con el detalle de qué campo está mal.
 */
function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "ZodError" &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: { transport: { target: "pino-pretty" } } });

  // App local: el frontend corre en otro puerto (Vite), nada más entra acá.
  await app.register(cors, { origin: true });

  app.setErrorHandler((error, _request, reply) => {
    if (isZodError(error)) {
      return reply.code(400).send({ error: "Datos inválidos", issues: error.issues });
    }
    if (error instanceof NotFoundError) {
      return reply.code(404).send({ error: error.message });
    }
    if (error instanceof ConflictError) {
      return reply.code(409).send({ error: error.message });
    }
    if (error instanceof UnavailableError) {
      return reply.code(503).send({ error: error.message });
    }
    app.log.error(error);
    return reply.code(500).send({ error: "Error interno" });
  });

  registerCatalogRoutes(app);
  registerGameRoutes(app);
  registerStatsRoutes(app);
  registerDashboardRoutes(app);
  registerSimRoutes(app);
  registerAiRoutes(app);
  registerWishlistRoutes(app);

  return app;
}
