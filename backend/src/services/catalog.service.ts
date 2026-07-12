import type { Criterion, GameType } from "@gp/shared";
import * as catalogRepository from "../repositories/catalog.repository.js";

export function listGameTypes(): GameType[] {
  return catalogRepository.findAllGameTypes();
}

export function listCriteria(): Criterion[] {
  return catalogRepository.findAllCriteria().map(({ createdAt, ...rest }) => rest);
}
