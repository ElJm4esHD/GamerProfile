import type {
  CreateCarInput,
  CreateLapInput,
  CreateSetupParamInput,
  CreateTrackInput,
  UpdateLapInput,
} from "@gp/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys.js";
import { simApi } from "../api/sim.js";

export function useSimCatalog() {
  return useQuery({
    queryKey: queryKeys.simCatalog,
    queryFn: simApi.catalog,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLaps() {
  return useQuery({ queryKey: queryKeys.simLaps, queryFn: simApi.laps });
}

/**
 * Crear o borrar una vuelta puede cambiar cuál es el mejor tiempo de esa
 * combinación, y por lo tanto el `gap` de todas las demás. Por eso siempre se
 * invalida la lista entera y nunca se parchea una fila sola en el cache.
 */
export function useCreateLap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLapInput) => simApi.createLap(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.simLaps }),
  });
}

export function useUpdateLap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLapInput }) =>
      simApi.updateLap(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.simLaps }),
  });
}

export function useDeleteLap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => simApi.removeLap(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.simLaps }),
  });
}

/* ── Catálogos ─────────────────────────────────────────────────────────── */

export function useCreateTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTrackInput) => simApi.createTrack(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.simCatalog }),
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCarInput) => simApi.createCar(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.simCatalog }),
  });
}

export function useCreateSetupParam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSetupParamInput) => simApi.createSetupParam(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.simCatalog }),
  });
}
