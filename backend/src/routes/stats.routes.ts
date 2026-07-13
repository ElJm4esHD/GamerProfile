import type { FastifyInstance } from "fastify";
import { computeStats } from "../services/stats/stats.service.js";

export function registerStatsRoutes(app: FastifyInstance): void {
  app.get("/api/stats", () => computeStats());
}
