import { dashboardBoardSchema, dashboardLayoutSchema } from "@gp/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import * as dashboardService from "../services/dashboard.service.js";

const paramsSchema = z.object({ board: dashboardBoardSchema });

/** Qué tarjetas se ven en cada tablero, en qué orden y de qué ancho. */
export function registerDashboardRoutes(app: FastifyInstance): void {
  app.get("/api/dashboards/:board/layout", (request) => {
    const { board } = paramsSchema.parse(request.params);
    return dashboardService.getDashboardLayout(board);
  });

  app.put("/api/dashboards/:board/layout", (request) => {
    const { board } = paramsSchema.parse(request.params);
    const layout = dashboardLayoutSchema.parse(request.body);
    return dashboardService.saveDashboardLayout(board, layout);
  });

  app.delete("/api/dashboards/:board/layout", (request) => {
    const { board } = paramsSchema.parse(request.params);
    return dashboardService.resetDashboardLayout(board);
  });
}
