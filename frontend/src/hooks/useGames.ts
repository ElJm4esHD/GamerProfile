import type { CreateGameInput, Criterion, GameType, GameView, UpdateGameInput } from "@gp/shared";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { gamesApi } from "../api/games.js";
import { queryKeys } from "../api/query-keys.js";
import { applyPatch, recalculate } from "../features/games/optimistic.js";

export function useGames() {
  return useQuery({ queryKey: queryKeys.games, queryFn: gamesApi.list });
}

interface UpdateVariables {
  id: string;
  input: UpdateGameInput;
}

/**
 * El autosave. La UI se actualiza al instante (optimistic update) y el PATCH
 * viaja por atrás. Si el server falla, el cache vuelve solo a como estaba.
 */
export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateVariables) => gamesApi.update(id, input),

    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.games });

      const previous = queryClient.getQueryData<GameView[]>(queryKeys.games);
      const criteria = readCatalog<Criterion>(queryClient, queryKeys.criteria);
      const gameTypes = readCatalog<GameType>(queryClient, queryKeys.gameTypes);

      if (previous) {
        const patched = previous.map((game) =>
          game.id === id ? applyPatch(game, input, gameTypes) : game,
        );
        queryClient.setQueryData(queryKeys.games, recalculate(patched, criteria));
      }

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.games, context.previous);
      }
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.games }),
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    // El id lo genera el server, así que acá no hay optimismo posible:
    // esperamos la respuesta y refrescamos.
    mutationFn: (input: CreateGameInput) => gamesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.games }),
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gamesApi.remove(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.games });

      const previous = queryClient.getQueryData<GameView[]>(queryKeys.games);
      const criteria = readCatalog<Criterion>(queryClient, queryKeys.criteria);

      if (previous) {
        const remaining = previous.filter((game) => game.id !== id);
        queryClient.setQueryData(queryKeys.games, recalculate(remaining, criteria));
      }

      return { previous };
    },

    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.games, context.previous);
      }
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.games }),
  });
}

function readCatalog<T>(queryClient: QueryClient, key: readonly unknown[]): T[] {
  return queryClient.getQueryData<T[]>(key) ?? [];
}
