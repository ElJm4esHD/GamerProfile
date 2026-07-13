import type { CreateGameInput, GameDetail, GameView, UpdateGameInput } from "@gp/shared";
import { api } from "./client.js";

export const gamesApi = {
  list: () => api.get<GameView[]>("/games"),
  detail: (id: string) => api.get<GameDetail>(`/games/${id}`),
  create: (input: CreateGameInput) => api.post<GameView>("/games", input),
  update: (id: string, input: UpdateGameInput) => api.patch<GameDetail>(`/games/${id}`, input),
  remove: (id: string) => api.remove(`/games/${id}`),
};
