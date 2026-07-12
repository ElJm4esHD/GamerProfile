import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

const now = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

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
    createdAt: text("created_at").notNull().default(now),
    updatedAt: text("updated_at").notNull().default(now),
    // Soft delete: "borrar" es reversible. Nada se pierde de verdad.
    deletedAt: text("deleted_at"),
  },
  (table) => ({
    parentIdx: index("games_parent_idx").on(table.parentGameId),
    deletedIdx: index("games_deleted_idx").on(table.deletedAt),
  }),
);

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