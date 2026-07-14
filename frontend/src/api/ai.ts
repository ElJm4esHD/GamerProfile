import type { Recommendation } from "@gp/shared";
import { api } from "./client.js";

export const aiApi = {
  status: () => api.get<{ enabled: boolean }>("/ai/status"),
  recommendations: () => api.post<Recommendation[]>("/ai/recommendations", {}),
};
