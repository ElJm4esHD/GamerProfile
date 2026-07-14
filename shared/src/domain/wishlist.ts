import { z } from "zod";

/**
 * La wishlist: juegos que querés jugar pero todavía no tenés.
 * Cuando lo conseguís, se promueve a la biblioteca y sale de acá.
 */

export const WISHLIST_SOURCES = ["manual", "ai"] as const;
export type WishlistSource = (typeof WISHLIST_SOURCES)[number];

export interface WishlistItem {
  id: string;
  name: string;
  year: number | null;
  genre: string | null;
  note: string | null;
  source: WishlistSource;
  createdAt: string;
}

export const createWishlistItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  year: z.number().int().min(1950).max(2100).nullable().optional(),
  genre: z.string().trim().max(60).nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
  source: z.enum(WISHLIST_SOURCES).default("manual"),
});

export const updateWishlistItemSchema = createWishlistItemSchema.partial();

export type CreateWishlistItemInput = z.infer<typeof createWishlistItemSchema>;
export type UpdateWishlistItemInput = z.infer<typeof updateWishlistItemSchema>;
