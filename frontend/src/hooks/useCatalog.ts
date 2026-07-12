import { useQuery } from "@tanstack/react-query";
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
