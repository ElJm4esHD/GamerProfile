import { randomUUID } from "node:crypto";
import type {
  Car,
  CreateCarInput,
  CreateLapInput,
  CreateSetupParamInput,
  CreateSimGameInput,
  CreateTrackInput,
  LapRecord,
  SetupEntry,
  SetupParam,
  SimCatalog,
  SimGame,
  Track,
  TrackKind,
  UpdateLapInput,
} from "@gp/shared";
import { NotFoundError } from "../errors.js";
import * as simRepository from "../repositories/sim.repository.js";
import type { LapFields } from "../repositories/sim.repository.js";

/* ── Catálogo ──────────────────────────────────────────────────────────── */

/** Todo lo que la UI necesita para armar los selectores, en una sola llamada. */
export function getCatalog(): SimCatalog {
  return {
    games: simRepository.findAllSimGames(),
    tracks: simRepository.findAllTracks().map(toTrack),
    cars: simRepository.findAllCars(),
    params: simRepository.findAllSetupParams(),
  };
}

export function createSimGame(input: CreateSimGameInput): SimGame {
  return simRepository.insertSimGame({
    id: randomUUID(),
    name: input.name,
    gameId: input.gameId ?? null,
  });
}

export function createTrack(input: CreateTrackInput): Track {
  const row = simRepository.findOrCreateTrack(
    {
      id: randomUUID(),
      simGameId: input.simGameId,
      name: input.name,
      kind: input.kind,
    },
    { country: input.country ?? null, lengthM: input.lengthM ?? null },
  );

  return toTrack(row);
}

export function createCar(input: CreateCarInput): Car {
  return simRepository.findOrCreateCar({
    id: randomUUID(),
    simGameId: input.simGameId,
    name: input.name,
    carClass: input.carClass ?? null,
  });
}

export function createSetupParam(input: CreateSetupParamInput): SetupParam {
  return simRepository.findOrCreateSetupParam({
    id: randomUUID(),
    simGameId: input.simGameId,
    name: input.name,
    unit: input.unit ?? null,
  });
}

/* ── Vueltas ───────────────────────────────────────────────────────────── */

/**
 * Arma todas las vueltas con su setup resuelto.
 *
 * `isPersonalBest` y `gapMs` son DERIVADOS, nunca almacenados: el mejor tiempo
 * de una combinación es el mínimo de sus intentos. Un flag `is_best` en la
 * tabla se desincroniza el día que borres la vuelta que lo tenía.
 */
function buildLaps(): LapRecord[] {
  const catalog = getCatalog();

  const gamesById = new Map(catalog.games.map((game) => [game.id, game]));
  const tracksById = new Map(catalog.tracks.map((track) => [track.id, track]));
  const carsById = new Map(catalog.cars.map((car) => [car.id, car]));
  const paramsById = new Map(catalog.params.map((param) => [param.id, param]));

  const setupByLap = new Map<string, SetupEntry[]>();
  for (const row of simRepository.findAllSetupValues()) {
    const param = paramsById.get(row.paramId);
    if (!param) continue;

    const entries = setupByLap.get(row.lapId) ?? [];
    entries.push({
      paramId: param.id,
      name: param.name,
      unit: param.unit,
      value: row.value,
    });
    setupByLap.set(row.lapId, entries);
  }

  const rows = simRepository.findAllLapRows();

  // El mejor tiempo por combinación juego + circuito + auto.
  const bestByCombo = new Map<string, number>();
  for (const row of rows) {
    const key = comboKey(row.simGameId, row.trackId, row.carId);
    const current = bestByCombo.get(key);
    if (current === undefined || row.timeMs < current) bestByCombo.set(key, row.timeMs);
  }

  return rows.map((row) => {
    const simGame = gamesById.get(row.simGameId);
    const track = tracksById.get(row.trackId);
    const car = carsById.get(row.carId);

    if (!simGame) throw new NotFoundError("Simulador", row.simGameId);
    if (!track) throw new NotFoundError("Circuito", row.trackId);
    if (!car) throw new NotFoundError("Auto", row.carId);

    const best = bestByCombo.get(comboKey(row.simGameId, row.trackId, row.carId)) ?? row.timeMs;

    return {
      id: row.id,
      simGame,
      track,
      car,
      timeMs: row.timeMs,
      recordedAt: row.recordedAt,
      weather: row.weather,
      timeOfDay: row.timeOfDay,
      notes: row.notes,
      setup: (setupByLap.get(row.id) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
      isPersonalBest: row.timeMs === best,
      gapMs: row.timeMs - best,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });
}

export function listLaps(): LapRecord[] {
  return buildLaps();
}

export function createLap(input: CreateLapInput): LapRecord {
  const id = randomUUID();

  simRepository.insertLap(
    id,
    {
      simGameId: input.simGameId,
      trackId: input.trackId,
      carId: input.carId,
      timeMs: input.timeMs,
      recordedAt: input.recordedAt,
      weather: input.weather ?? null,
      timeOfDay: input.timeOfDay ?? null,
      notes: input.notes ?? null,
    },
    input.setup ?? {},
  );

  return getLapOrThrow(id);
}

export function updateLap(id: string, input: UpdateLapInput): LapRecord {
  if (!simRepository.findLapRowById(id)) throw new NotFoundError("Vuelta", id);

  simRepository.updateLap(id, toPersistableFields(input), input.setup);

  return getLapOrThrow(id);
}

export function deleteLap(id: string): void {
  if (!simRepository.findLapRowById(id)) throw new NotFoundError("Vuelta", id);
  simRepository.softDeleteLap(id);
}

/* ── Internos ──────────────────────────────────────────────────────────── */

const PERSISTABLE_KEYS = [
  "simGameId",
  "trackId",
  "carId",
  "timeMs",
  "recordedAt",
  "weather",
  "timeOfDay",
  "notes",
] as const satisfies readonly (keyof LapFields)[];

function toPersistableFields(input: UpdateLapInput): Partial<LapFields> {
  const fields: Partial<LapFields> = {};

  for (const key of PERSISTABLE_KEYS) {
    const value = input[key];
    if (value !== undefined) Object.assign(fields, { [key]: value });
  }

  return fields;
}

function getLapOrThrow(id: string): LapRecord {
  const lap = buildLaps().find((candidate) => candidate.id === id);
  if (!lap) throw new NotFoundError("Vuelta", id);
  return lap;
}

function comboKey(simGameId: string, trackId: string, carId: string): string {
  return `${simGameId}|${trackId}|${carId}`;
}

function toTrack(row: { kind: string } & Omit<Track, "kind">): Track {
  return { ...row, kind: row.kind as TrackKind };
}
