import type { RecommendationBatch } from "@gp/shared";
import { api } from "./client.js";

export const aiApi = {
  status: () => api.get<{ enabled: boolean }>("/ai/status"),
  // La última tanda guardada: gratis, se lee de la base.
  savedRecommendations: () => api.get<RecommendationBatch>("/ai/recommendations"),
  // Genera una tanda nueva y reemplaza la guardada.
  recommendations: () => api.post<RecommendationBatch>("/ai/recommendations", {}),
};
