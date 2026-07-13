import type {
  Company,
  CreateCriterionInput,
  Criterion,
  GameType,
  Genre,
  Platform,
  Tag,
  UpdateCriterionInput,
} from "@gp/shared";
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
  createPlatform: (name: string) => api.post<Platform>("/platforms", { name }),
  createGenre: (name: string) => api.post<Genre>("/genres", { name }),

  createCriterion: (input: CreateCriterionInput) => api.post<Criterion>("/criteria", input),
  updateCriterion: (id: string, input: UpdateCriterionInput) =>
    api.patch<Criterion>(`/criteria/${id}`, input),

  backup: () => api.post<{ path: string }>("/backup", {}),
};
