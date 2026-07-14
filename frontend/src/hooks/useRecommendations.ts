import type { RecommendationBatch } from "@gp/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiApi } from "../api/ai.js";
import { queryKeys } from "../api/query-keys.js";

export function useAiStatus() {
  return useQuery({
    queryKey: ["ai", "status"],
    queryFn: aiApi.status,
    staleTime: Infinity, // La clave no cambia mientras el server esté vivo.
  });
}

/**
 * La tanda guardada. Es una query normal: se lee de la base al entrar, así que
 * cambiar de pestaña y volver ya no borra lo que se había generado.
 */
export function useSavedRecommendations() {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: aiApi.savedRecommendations,
    staleTime: Infinity, // Solo cambia cuando vos generás de nuevo.
  });
}

/**
 * Generar sale a internet, tarda y cuesta: por eso es una mutación, no una
 * query que se dispare sola. Al terminar, escribe la tanda nueva en el cache de
 * la query para que la UI la muestre sin un fetch extra.
 */
export function useGenerateRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiApi.recommendations,
    onSuccess: (batch: RecommendationBatch) => {
      queryClient.setQueryData(queryKeys.recommendations, batch);
    },
  });
}
