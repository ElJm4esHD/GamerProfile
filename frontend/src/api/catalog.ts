import type { Criterion, GameType } from "@gp/shared";
import { api } from "./client.js";

export const catalogApi = {
  criteria: () => api.get<Criterion[]>("/criteria"),
  gameTypes: () => api.get<GameType[]>("/game-types"),
};
