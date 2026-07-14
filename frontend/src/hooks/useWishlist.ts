import type { CreateWishlistItemInput } from "@gp/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/query-keys.js";
import { wishlistApi } from "../api/wishlist.js";

export function useWishlist() {
  return useQuery({ queryKey: queryKeys.wishlist, queryFn: wishlistApi.list });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWishlistItemInput) => wishlistApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist }),
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => wishlistApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist }),
  });
}
