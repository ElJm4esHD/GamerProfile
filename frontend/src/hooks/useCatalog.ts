import type { CreateCriterionInput, UpdateCriterionInput } from "@gp/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "../api/catalog.js";
import { queryKeys } from "../api/query-keys.js";

// Los catálogos casi nunca cambian: no vale la pena refetchearlos seguido.
const CATALOG_STALE_TIME = 5 * 60 * 1000;

export function useCriteria() {
  return useQuery({
    queryKey: queryKeys.criteria,
    queryFn: catalogApi.criteria,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useGameTypes() {
  return useQuery({
    queryKey: queryKeys.gameTypes,
    queryFn: catalogApi.gameTypes,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function usePlatforms() {
  return useQuery({
    queryKey: queryKeys.platforms,
    queryFn: catalogApi.platforms,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: queryKeys.genres,
    queryFn: catalogApi.genres,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags,
    queryFn: catalogApi.tags,
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: catalogApi.companies,
    staleTime: CATALOG_STALE_TIME,
  });
}

/* ── Altas ─────────────────────────────────────────────────────────────── */

export function useCreateTag() {
  return useCatalogMutation(catalogApi.createTag, queryKeys.tags);
}

export function useCreateCompany() {
  return useCatalogMutation(catalogApi.createCompany, queryKeys.companies);
}

export function useCreatePlatform() {
  return useCatalogMutation(catalogApi.createPlatform, queryKeys.platforms);
}

export function useCreateGenre() {
  return useCatalogMutation(catalogApi.createGenre, queryKeys.genres);
}

/* ── Criterios ─────────────────────────────────────────────────────────── */

/**
 * Cambiar un criterio (peso, activo) cambia el overall de TODOS los juegos.
 * Por eso estas mutaciones invalidan también la lista y las estadísticas.
 */
export function useCreateCriterion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCriterionInput) => catalogApi.createCriterion(input),
    onSuccess: () => invalidateScoring(queryClient),
  });
}

export function useUpdateCriterion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCriterionInput }) =>
      catalogApi.updateCriterion(id, input),
    onSuccess: () => invalidateScoring(queryClient),
  });
}

export function useBackup() {
  return useMutation({ mutationFn: () => catalogApi.backup() });
}

/* ── Internos ──────────────────────────────────────────────────────────── */

function useCatalogMutation<T>(mutationFn: (name: string) => Promise<T>, key: readonly unknown[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

function invalidateScoring(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.criteria });
  queryClient.invalidateQueries({ queryKey: queryKeys.games });
  queryClient.invalidateQueries({ queryKey: queryKeys.stats });
}
