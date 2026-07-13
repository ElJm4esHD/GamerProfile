import { and, asc, eq, isNull, sql, type InferSelectModel } from "drizzle-orm";
import { db } from "../db/client.js";
import { cars, lapRecords, lapSetupValues, setupParams, simGames, tracks } from "../db/schema.js";

export type LapRow = InferSelectModel<typeof lapRecords>;

export interface LapFields {
  simGameId: string;
  trackId: string;
  carId: string;
  timeMs: number;
  recordedAt: string;
  weather: string | null;
  timeOfDay: string | null;
  notes: string | null;
}

/** paramId -> valor tal como se escribió. */
export type SetupMap = Record<string, string>;

const nowIso = (): string => new Date().toISOString();

/* ── Catálogos ─────────────────────────────────────────────────────────── */

export function findAllSimGames() {
  return db.select().from(simGames).orderBy(asc(simGames.position)).all();
}

export function findAllTracks() {
  return db.select().from(tracks).orderBy(asc(tracks.name)).all();
}

export function findAllCars() {
  return db.select().from(cars).orderBy(asc(cars.name)).all();
}

export function findAllSetupParams() {
  return db.select().from(setupParams).orderBy(asc(setupParams.position)).all();
}

/**
 * Alta idempotente por (juego, nombre): escribir "Spa" dos veces no crea dos
 * circuitos. Es el mismo `findOrCreate` que ya usan companies y tags.
 */
export function findOrCreateTrack(
  values: { id: string; simGameId: string; name: string; kind: string },
  extra: { country: string | null; lengthM: number | null },
) {
  const existing = db
    .select()
    .from(tracks)
    .where(and(eq(tracks.simGameId, values.simGameId), eq(tracks.name, values.name)))
    .get();
  if (existing) return existing;

  const row = { ...values, ...extra };
  db.insert(tracks).values(row).run();
  return row;
}

export function findOrCreateCar(values: {
  id: string;
  simGameId: string;
  name: string;
  carClass: string | null;
}) {
  const existing = db
    .select()
    .from(cars)
    .where(and(eq(cars.simGameId, values.simGameId), eq(cars.name, values.name)))
    .get();
  if (existing) return existing;

  db.insert(cars).values(values).run();
  return values;
}

export function findOrCreateSetupParam(values: {
  id: string;
  simGameId: string;
  name: string;
  unit: string | null;
}) {
  const existing = db
    .select()
    .from(setupParams)
    .where(and(eq(setupParams.simGameId, values.simGameId), eq(setupParams.name, values.name)))
    .get();
  if (existing) return existing;

  const position = nextParamPosition(values.simGameId);
  const row = { ...values, position };
  db.insert(setupParams).values(row).run();
  return row;
}

export function insertSimGame(values: { id: string; name: string; gameId: string | null }) {
  const position = db.get<{ next: number }>(
    sql`SELECT COALESCE(MAX(position), -1) + 1 AS next FROM sim_games`,
  );

  const row = { ...values, position: position?.next ?? 0 };
  db.insert(simGames).values(row).run();
  return row;
}

function nextParamPosition(simGameId: string): number {
  const row = db.get<{ next: number }>(
    sql`SELECT COALESCE(MAX(position), -1) + 1 AS next FROM setup_params WHERE sim_game_id = ${simGameId}`,
  );
  return row?.next ?? 0;
}

/* ── Uso y borrado ─────────────────────────────────────────────────────── */

/**
 * Cuántas vueltas usan cada circuito / auto, y cuántas usan cada parámetro.
 * Es lo que permite ofrecer el borrado solo cuando es seguro.
 */
export function countLapsByTrack(): Map<string, number> {
  const rows = db
    .select({ id: lapRecords.trackId, total: sql<number>`count(*)` })
    .from(lapRecords)
    .where(isNull(lapRecords.deletedAt))
    .groupBy(lapRecords.trackId)
    .all();

  return new Map(rows.map((row) => [row.id, row.total]));
}

export function countLapsByCar(): Map<string, number> {
  const rows = db
    .select({ id: lapRecords.carId, total: sql<number>`count(*)` })
    .from(lapRecords)
    .where(isNull(lapRecords.deletedAt))
    .groupBy(lapRecords.carId)
    .all();

  return new Map(rows.map((row) => [row.id, row.total]));
}

export function countUsesByParam(): Map<string, number> {
  const rows = db
    .select({ id: lapSetupValues.paramId, total: sql<number>`count(*)` })
    .from(lapSetupValues)
    .groupBy(lapSetupValues.paramId)
    .all();

  return new Map(rows.map((row) => [row.id, row.total]));
}

/**
 * Borrado real (hard delete), no soft.
 *
 * Es seguro porque el service solo llama a esto cuando el uso es cero: no hay
 * nada que perder. Un soft delete acá solo ensuciaría los selectores con
 * entradas fantasma.
 */
export function deleteTrack(id: string): void {
  db.delete(tracks).where(eq(tracks.id, id)).run();
}

export function deleteCar(id: string): void {
  db.delete(cars).where(eq(cars.id, id)).run();
}

export function deleteSetupParam(id: string): void {
  db.delete(setupParams).where(eq(setupParams.id, id)).run();
}

export function findTrackById(id: string) {
  return db.select().from(tracks).where(eq(tracks.id, id)).get();
}

export function findCarById(id: string) {
  return db.select().from(cars).where(eq(cars.id, id)).get();
}

export function findSetupParamById(id: string) {
  return db.select().from(setupParams).where(eq(setupParams.id, id)).get();
}

/* ── Vueltas ───────────────────────────────────────────────────────────── */

export function findAllLapRows(): LapRow[] {
  return db.select().from(lapRecords).where(isNull(lapRecords.deletedAt)).all();
}

export function findLapRowById(id: string): LapRow | undefined {
  return db
    .select()
    .from(lapRecords)
    .where(and(eq(lapRecords.id, id), isNull(lapRecords.deletedAt)))
    .get();
}

export function findAllSetupValues() {
  return db.select().from(lapSetupValues).all();
}

export function insertLap(id: string, fields: LapFields, setup: SetupMap): void {
  db.transaction((tx) => {
    tx.insert(lapRecords).values({ id, ...fields }).run();
    writeSetup(tx, id, setup, true);
  });
}

export function updateLap(
  id: string,
  fields: Partial<LapFields>,
  setup: SetupMap | undefined,
): void {
  db.transaction((tx) => {
    tx.update(lapRecords)
      .set({ ...fields, updatedAt: nowIso() })
      .where(eq(lapRecords.id, id))
      .run();

    if (setup) writeSetup(tx, id, setup, true);
  });
}

/** Soft delete, igual que los juegos: nada se pierde de verdad. */
export function softDeleteLap(id: string): void {
  db.update(lapRecords).set({ deletedAt: nowIso() }).where(eq(lapRecords.id, id)).run();
}

/* ── Internos ──────────────────────────────────────────────────────────── */

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function writeSetup(tx: Tx, lapId: string, setup: SetupMap, replace: boolean): void {
  if (replace) tx.delete(lapSetupValues).where(eq(lapSetupValues.lapId, lapId)).run();

  for (const [paramId, value] of Object.entries(setup)) {
    // `valueNum` se llena solo si el valor es numérico. "Short" queda en null;
    // 26 y -3.5 quedan agregables sin migrar nada más adelante.
    const parsed = Number(value.replace(",", "."));
    const valueNum = value.trim() !== "" && Number.isFinite(parsed) ? parsed : null;

    tx.insert(lapSetupValues).values({ lapId, paramId, value, valueNum }).run();
  }
}
