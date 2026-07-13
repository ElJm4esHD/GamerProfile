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

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => catalogApi.createTag(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags }),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => catalogApi.createCompany(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.companies }),
  });
}
