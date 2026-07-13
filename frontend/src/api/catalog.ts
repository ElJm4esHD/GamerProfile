import type { Company, Criterion, GameType, Genre, Platform, Tag } from "@gp/shared";
import { api } from "./client.js";

export const catalogApi = {
  criteria: () => api.get<Criterion[]>("/criteria"),
  gameTypes: () => api.get<GameType[]>("/game-types"),
  platforms: () => api.get<Platform[]>("/platforms"),
  genres: () => api.get<Genre[]>("/genres"),
  tags: () => api.get<Tag[]>("/tags"),
  companies: () => api.get<Company[]>("/companies"),

  createTag: (name: string) => api.post<Tag>("/tags", { name }),
  createCompany: (name: string) => api.post<Company>("/companies", { name }),
};
