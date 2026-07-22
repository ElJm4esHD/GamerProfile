import { EMPTY_DASHBOARD_LAYOUT, type DashboardBoard, type DashboardLayout } from "@gp/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.js";
import { queryKeys } from "../api/query-keys.js";

/**
 * El layout de un tablero: se lee una vez y se guarda solo, como todo lo demás
 * en esta app.
 *
 * El update es optimista y no hay invalidación después: arrastrar una tarjeta
 * tiene que sentirse instantáneo, y el server no calcula nada — devuelve lo
 * mismo que le mandaste. Si falla, el cache vuelve a como estaba.
 */
export function useDashboardLayout(board: DashboardBoard) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.dashboardLayout(board);

  const query = useQuery({
    queryKey,
    queryFn: () => dashboardApi.getLayout(board),
  });

  const save = useMutation({
    mutationFn: (layout: DashboardLayout) => dashboardApi.saveLayout(board, layout),

    onMutate: async (layout) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<DashboardLayout>(queryKey);
      queryClient.setQueryData(queryKey, layout);
      return { previous };
    },

    onError: (_error, _layout, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  const reset = useMutation({
    mutationFn: () => dashboardApi.resetLayout(board),
    onSuccess: () => queryClient.setQueryData(queryKey, EMPTY_DASHBOARD_LAYOUT),
  });

  return {
    layout: query.data ?? EMPTY_DASHBOARD_LAYOUT,
    isReady: !query.isPending,
    save: save.mutate,
    reset: reset.mutate,
    error: save.error ?? reset.error,
  };
}
