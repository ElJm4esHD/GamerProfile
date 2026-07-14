import { createWishlistItemSchema, updateWishlistItemSchema } from "@gp/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import * as wishlistService from "../services/wishlist.service.js";

const idParamsSchema = z.object({ id: z.string().uuid() });

/** La lista de "por jugar": juegos que querés jugar y todavía no tenés. */
export function registerWishlistRoutes(app: FastifyInstance): void {
  app.get("/api/wishlist", () => wishlistService.listWishlist());

  app.post("/api/wishlist", (request, reply) => {
    const input = createWishlistItemSchema.parse(request.body);
    return reply.code(201).send(wishlistService.createWishlistItem(input));
  });

  app.patch("/api/wishlist/:id", (request) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = updateWishlistItemSchema.parse(request.body);
    return wishlistService.updateWishlistItem(id, input);
  });

  app.delete("/api/wishlist/:id", (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    wishlistService.deleteWishlistItem(id);
    return reply.code(204).send();
  });
}
