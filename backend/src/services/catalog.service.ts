import { randomUUID } from "node:crypto";
import type { Company, Criterion, GameType, Genre, Platform, Tag } from "@gp/shared";
import * as catalogRepository from "../repositories/catalog.repository.js";

export function listGameTypes(): GameType[] {
  return catalogRepository.findAllGameTypes();
}

export function listCriteria(): Criterion[] {
  return catalogRepository.findAllCriteria().map(({ createdAt, ...rest }) => rest);
}

export function listPlatforms(): Platform[] {
  return catalogRepository.findAllPlatforms();
}

export function listGenres(): Genre[] {
  return catalogRepository.findAllGenres();
}

export function listTags(): Tag[] {
  return catalogRepository.findAllTags();
}

export function listCompanies(): Company[] {
  return catalogRepository.findAllCompanies();
}

/** Idempotente por nombre: pedir dos veces "Indie" devuelve el mismo tag. */
export function createTag(name: string): Tag {
  return catalogRepository.findOrCreateTag(randomUUID(), name);
}

export function createCompany(name: string): Company {
  return catalogRepository.findOrCreateCompany(randomUUID(), name);
}
