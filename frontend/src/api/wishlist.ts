import type {
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
  WishlistItem,
} from "@gp/shared";
import { api } from "./client.js";

export const wishlistApi = {
  list: () => api.get<WishlistItem[]>("/wishlist"),
  create: (input: CreateWishlistItemInput) => api.post<WishlistItem>("/wishlist", input),
  update: (id: string, input: UpdateWishlistItemInput) =>
    api.patch<WishlistItem>(`/wishlist/${id}`, input),
  remove: (id: string) => api.remove(`/wishlist/${id}`),
};
