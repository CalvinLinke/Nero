import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/orakel/db/schema.ts",
  out: "./drizzle/orakel",
  schemaFilter: ["orakel"],
  dbCredentials: {
    url: process.env.ORAKEL_DATABASE_URL || process.env.DATABASE_URL || "postgres://unused",
  },
});
