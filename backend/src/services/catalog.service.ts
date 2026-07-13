import { randomUUID } from "node:crypto";
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
import { NotFoundError } from "../errors.js";
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

/* ── Altas idempotentes por nombre ─────────────────────────────────────── */

export function createTag(name: string): Tag {
  return catalogRepository.findOrCreateTag(randomUUID(), name);
}

export function createCompany(name: string): Company {
  return catalogRepository.findOrCreateCompany(randomUUID(), name);
}

export function createPlatform(name: string): Platform {
  return catalogRepository.findOrCreatePlatform(randomUUID(), name);
}

export function createGenre(name: string): Genre {
  return catalogRepository.findOrCreateGenre(randomUUID(), name);
}

/* ── Criterios ─────────────────────────────────────────────────────────── */

/**
 * Un criterio nuevo aparece solo como columna en Rankings y como campo en la
 * ficha. Los juegos viejos simplemente no lo tienen puntuado, y su overall se
 * calcula con los criterios que sí tengan: nada se rompe ni se recalcula mal.
 */
export function createCriterion(input: CreateCriterionInput): Criterion {
  return catalogRepository.insertCriterion(randomUUID(), input.name, input.weight);
}

export function updateCriterion(id: string, input: UpdateCriterionInput): Criterion {
  if (!catalogRepository.findCriterionById(id)) throw new NotFoundError("Criterio", id);

  catalogRepository.updateCriterion(id, input);

  const updated = catalogRepository.findCriterionById(id);
  if (!updated) throw new NotFoundError("Criterio", id);

  const { createdAt, ...criterion } = updated;
  return criterion;
}
