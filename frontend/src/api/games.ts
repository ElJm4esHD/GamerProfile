import type { CreateGameInput, GameView, UpdateGameInput } from "@gp/shared";
import { api } from "./client.js";

export const gamesApi = {
  list: () => api.get<GameView[]>("/games"),
  create: (input: CreateGameInput) => api.post<GameView>("/games", input),
  update: (id: string, input: UpdateGameInput) => api.patch<GameView>(`/games/${id}`, input),
  remove: (id: string) => api.remove(`/games/${id}`),
};
