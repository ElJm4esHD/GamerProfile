import type { UpdateGameInput } from "@gp/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gamesApi } from "../api/games.js";
import { queryKeys } from "../api/query-keys.js";

export function useGameDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.game(id),
    queryFn: () => gamesApi.detail(id),
  });
}

/**
 * Autosave de la ficha.
 *
 * Acá NO hay update optimista, y es deliberado: el PATCH devuelve el detalle
 * completo ya recalculado (overall, rank, relaciones), y el server es local
 * — responde en milisegundos. Reconstruir a mano ese objeto en el cliente
 * sería duplicar lógica del backend para ganar nada.
 *
 * La lista sí se invalida: cambiar un puntaje reordena el ranking.
 */
export function useUpdateGameDetail(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateGameInput) => gamesApi.update(id, input),

    onSuccess: (detail) => {
      queryClient.setQueryData(queryKeys.game(id), detail);
      queryClient.invalidateQueries({ queryKey: queryKeys.games });
    },
  });
}
