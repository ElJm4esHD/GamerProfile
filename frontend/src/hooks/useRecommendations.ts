import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "../api/ai.js";

export function useAiStatus() {
  return useQuery({
    queryKey: ["ai", "status"],
    queryFn: aiApi.status,
    staleTime: Infinity, // La clave no cambia mientras el server esté vivo.
  });
}

/**
 * Es una mutación, no una query: cada llamada sale a internet, tarda y cuesta.
 * No se dispara sola al entrar a la página — la disparás vos.
 */
export function useRecommendations() {
  return useMutation({ mutationFn: aiApi.recommendations });
}
