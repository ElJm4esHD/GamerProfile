import type { StatResult } from "@gp/shared";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { queryKeys } from "../api/query-keys.js";

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => api.get<StatResult[]>("/stats"),
  });
}
