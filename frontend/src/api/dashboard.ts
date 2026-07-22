import type { DashboardBoard, DashboardLayout } from "@gp/shared";
import { api } from "./client.js";

export const dashboardApi = {
  getLayout: (board: DashboardBoard) => api.get<DashboardLayout>(`/dashboards/${board}/layout`),
  saveLayout: (board: DashboardBoard, layout: DashboardLayout) =>
    api.put<DashboardLayout>(`/dashboards/${board}/layout`, layout),
  resetLayout: (board: DashboardBoard) =>
    api.remove(`/dashboards/${board}/layout`) as Promise<void>,
};
