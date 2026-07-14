import { randomUUID } from "node:crypto";
import type {
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
  WishlistItem,
} from "@gp/shared";
import { ConflictError, NotFoundError } from "../errors.js";
import * as wishlistRepository from "../repositories/wishlist.repository.js";
import type { WishlistRow } from "../repositories/wishlist.repository.js";

export function listWishlist(): WishlistItem[] {
  return wishlistRepository.findAll().map(toItem);
}

/**
 * El nombre es UNIQUE: el mismo juego no entra dos veces. Es lo que hace que
 * apretar "Agregar" en una recomendación sea seguro aunque ya esté en la lista.
 */
export function createWishlistItem(input: CreateWishlistItemInput): WishlistItem {
  const name = input.name.trim();

  if (wishlistRepository.findByName(name)) {
    throw new ConflictError(`"${name}" ya está en tu lista de por jugar.`);
  }

  const row = wishlistRepository.insert(randomUUID(), {
    name,
    year: input.year ?? null,
    genre: input.genre ?? null,
    note: input.note ?? null,
    source: input.source,
  });

  return toItem(row);
}

export function updateWishlistItem(id: string, input: UpdateWishlistItemInput): WishlistItem {
  if (!wishlistRepository.findById(id)) throw new NotFoundError("Ítem de la lista", id);

  wishlistRepository.update(id, {
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.year !== undefined && { year: input.year }),
    ...(input.genre !== undefined && { genre: input.genre }),
    ...(input.note !== undefined && { note: input.note }),
    ...(input.source !== undefined && { source: input.source }),
  });

  const updated = wishlistRepository.findById(id);
  if (!updated) throw new NotFoundError("Ítem de la lista", id);
  return toItem(updated);
}

export function deleteWishlistItem(id: string): void {
  if (!wishlistRepository.findById(id)) throw new NotFoundError("Ítem de la lista", id);
  wishlistRepository.remove(id);
}

/** El schema del dominio es la fuente de verdad: la fila se adapta a él. */
function toItem(row: WishlistRow): WishlistItem {
  return {
    id: row.id,
    name: row.name,
    year: row.year,
    genre: row.genre,
    note: row.note,
    source: row.source === "ai" ? "ai" : "manual",
    createdAt: row.createdAt,
  };
}
