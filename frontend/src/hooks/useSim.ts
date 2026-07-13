import type {
  CreateCarInput,
  CreateLapInput,
  CreateSetupParamInput,
  CreateTrackInput,
  UpdateLapInput,
} from "@gp/shared";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys.js";
import { simApi } from "../api/sim.js";

export function useSimCatalog() {
  return useQuery({ queryKey: queryKeys.simCatalog, queryFn: simApi.catalog });
}

export function useLaps() {
  return useQuery({ queryKey: queryKeys.simLaps, queryFn: simApi.laps });
}

export function useSimStats() {
  return useQuery({ queryKey: queryKeys.simStats, queryFn: simApi.stats });
}

/**
 * Cualquier cambio en las vueltas puede mover el mejor tiempo de una
 * combinación, y con él el `gap` de todas las demás y el conteo de uso del
 * catálogo. Por eso se invalida todo el módulo, nunca una fila suelta.
 */
function invalidateSim(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.simLaps });
  queryClient.invalidateQueries({ queryKey: queryKeys.simCatalog });
  queryClient.invalidateQueries({ queryKey: queryKeys.simStats });
}

export function useCreateLap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLapInput) => simApi.createLap(input),
    onSuccess: () => invalidateSim(queryClient),
  });
}

export function useUpdateLap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLapInput }) =>
      simApi.updateLap(id, input),
    onSuccess: () => invalidateSim(queryClient),
  });
}

export function useDeleteLap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => simApi.removeLap(id),
    onSuccess: () => invalidateSim(queryClient),
  });
}

/* ── Catálogos ─────────────────────────────────────────────────────────── */

export function useCreateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTrackInput) => simApi.createTrack(input),
    onSuccess: () => invalidateSim(queryClient),
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCarInput) => simApi.createCar(input),
    onSuccess: () => invalidateSim(queryClient),
  });
}

export function useCreateSetupParam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSetupParamInput) => simApi.createSetupParam(input),
    onSuccess: () => invalidateSim(queryClient),
  });
}

/** El backend responde 409 si el ítem está en uso; el mensaje se muestra tal cual. */
export function useDeleteCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ kind, id }: { kind: "track" | "car" | "param"; id: string }) => {
      if (kind === "track") return simApi.removeTrack(id);
      if (kind === "car") return simApi.removeCar(id);
      return simApi.removeSetupParam(id);
    },
    onSuccess: () => invalidateSim(queryClient),
  });
}
