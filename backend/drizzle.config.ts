import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "../database/migrations",
  dbCredentials: { url: "../database/app.db" },
});