import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

/* ══ Biblioteca de videojuegos ═════════════════════════════════════════ */

/* ── Catálogos ─────────────────────────────────────────────────────────── */

/** Juego, DLC, Demo, Expansión... editable sin tocar código. */
export const gameTypes = sqliteTable("game_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  position: integer("position").notNull().default(0),
});

/** Los criterios de puntuación. Agregar uno nuevo = insertar una fila. */
export const criteria = sqliteTable("criteria", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  weight: real("weight").notNull().default(1),
  position: integer("position").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(now),
});

export const platforms = sqliteTable("platforms", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  position: integer("position").notNull().default(0),
});

export const genres = sqliteTable("genres", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  position: integer("position").notNull().default(0),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

/** Una sola tabla para developers y publishers: una empresa puede ser ambos. */
export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

/* ── Biblioteca ────────────────────────────────────────────────────────── */

export const games = sqliteTable(
  "games",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    typeId: text("type_id")
      .notNull()
      .references(() => gameTypes.id),
    // Un DLC cuelga de su juego base. Cuesta cero ahora, duele después.
    parentGameId: text("parent_game_id"),
    overallOverride: integer("overall_override"),

    // Slug fijo validado por Zod: 'backlog' | 'playing' | 'completed' | ...
    status: text("status").notNull().default("backlog"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),

    purchasedAt: text("purchased_at"), // YYYY-MM-DD
    startedAt: text("started_at"),
    finishedAt: text("finished_at"),
    releaseYear: integer("release_year"),

    developerId: text("developer_id").references(() => companies.id),
    publisherId: text("publisher_id").references(() => companies.id),

    difficulty: text("difficulty"),
    playthroughs: integer("playthroughs"),

    // Siempre minutos enteros. Nunca horas decimales.
    playtimeMinutes: integer("playtime_minutes"),
    mainStoryMinutes: integer("main_story_minutes"),
    completionistMinutes: integer("completionist_minutes"),

    // Solo la ruta al archivo. Las imágenes en BLOB hinchan el .db y
    // arruinan los backups.
    coverPath: text("cover_path"),

    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
    // Soft delete: la fila queda en la base, marcada. Nada se pierde.
    deletedAt: text("deleted_at"),
  },
  (table) => ({
    parentIdx: index("games_parent_idx").on(table.parentGameId),
    deletedIdx: index("games_deleted_idx").on(table.deletedAt),
    statusIdx: index("games_status_idx").on(table.status),
    finishedIdx: index("games_finished_idx").on(table.finishedAt),
  }),
);

/* ── Tablas puente ─────────────────────────────────────────────────────── */

export const gameRatings = sqliteTable(
  "game_ratings",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    criterionId: text("criterion_id")
      .notNull()
      .references(() => criteria.id, { onDelete: "cascade" }),
    value: integer("value").notNull(),
    updatedAt: text("updated_at").notNull().default(now),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.gameId, table.criterionId] }),
  }),
);

export const gamePlatforms = sqliteTable(
  "game_platforms",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    platformId: text("platform_id")
      .notNull()
      .references(() => platforms.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.gameId, table.platformId] }),
  }),
);

export const gameGenres = sqliteTable(
  "game_genres",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    genreId: text("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.gameId, table.genreId] }),
  }),
);

export const gameTags = sqliteTable(
  "game_tags",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.gameId, table.tagId] }),
  }),
);

/* ══ Sim Racing ════════════════════════════════════════════════════════ */

/** Los simuladores. `gameId` los vincula, opcionalmente, con la biblioteca. */
export const simGames = sqliteTable("sim_games", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  position: integer("position").notNull().default(0),
  gameId: text("game_id").references(() => games.id),
});

/**
 * Circuitos y stages, scopeados por juego.
 * Los stages de Dirt Rally no son los circuitos de Assetto Corsa: mezclarlos
 * en una tabla global solo fusionaría cosas que no son la misma.
 */
export const tracks = sqliteTable(
  "tracks",
  {
    id: text("id").primaryKey(),
    simGameId: text("sim_game_id")
      .notNull()
      .references(() => simGames.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind").notNull().default("circuit"), // 'circuit' | 'stage'
    country: text("country"),
    lengthM: integer("length_m"),
  },
  (table) => ({
    // Escribís "Spa-Francorchamps" una vez; después se elige de la lista.
    nameIdx: uniqueIndex("tracks_game_name_idx").on(table.simGameId, table.name),
  }),
);

export const cars = sqliteTable(
  "cars",
  {
    id: text("id").primaryKey(),
    simGameId: text("sim_game_id")
      .notNull()
      .references(() => simGames.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    carClass: text("car_class"),
  },
  (table) => ({
    nameIdx: uniqueIndex("cars_game_name_idx").on(table.simGameId, table.name),
  }),
);

/**
 * Las claves de setup. Mismo patrón que `criteria`: el setup es flexible,
 * pero las claves están normalizadas. Agregar "Camber Front" no requiere
 * migración; escribir "camber front" por segunda vez, tampoco lo duplica.
 */
export const setupParams = sqliteTable(
  "setup_params",
  {
    id: text("id").primaryKey(),
    simGameId: text("sim_game_id")
      .notNull()
      .references(() => simGames.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    unit: text("unit"),
    position: integer("position").notNull().default(0),
  },
  (table) => ({
    nameIdx: uniqueIndex("setup_params_game_name_idx").on(table.simGameId, table.name),
  }),
);

/** Todos los intentos, no solo el mejor. El mejor tiempo se calcula. */
export const lapRecords = sqliteTable(
  "lap_records",
  {
    id: text("id").primaryKey(),
    simGameId: text("sim_game_id")
      .notNull()
      .references(() => simGames.id),
    trackId: text("track_id")
      .notNull()
      .references(() => tracks.id),
    carId: text("car_id")
      .notNull()
      .references(() => cars.id),

    // Milisegundos enteros. Nunca texto, nunca decimal.
    timeMs: integer("time_ms").notNull(),
    recordedAt: text("recorded_at").notNull(), // YYYY-MM-DD

    weather: text("weather"),
    timeOfDay: text("time_of_day"),
    notes: text("notes"),

    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
    deletedAt: text("deleted_at"),
  },
  (table) => ({
    comboIdx: index("laps_combo_idx").on(table.simGameId, table.trackId, table.carId),
    deletedIdx: index("laps_deleted_idx").on(table.deletedAt),
    timeIdx: index("laps_time_idx").on(table.timeMs),
  }),
);

/**
 * El setup de cada vuelta.
 *
 * `value` es TEXT porque el setup mezcla números (-3.5) y palabras ("Short").
 * `valueNum` se llena solo cuando el valor es numérico: es lo que va a
 * permitir, sin migración, preguntar "¿mi mejor vuelta con Brake Bias > 60?".
 */
export const lapSetupValues = sqliteTable(
  "lap_setup_values",
  {
    lapId: text("lap_id")
      .notNull()
      .references(() => lapRecords.id, { onDelete: "cascade" }),
    paramId: text("param_id")
      .notNull()
      .references(() => setupParams.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
    valueNum: real("value_num"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.lapId, table.paramId] }),
  }),
);
