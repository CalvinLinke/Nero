import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

// Über globalThis, damit im Dev-Server nicht jede Route eine eigene PGlite-Instanz auf derselben Datei öffnet.
const g = globalThis as unknown as { __orakelDb?: Promise<Db> };

/**
 * Produktion: Neon Postgres über ORAKEL_DATABASE_URL (oder DATABASE_URL).
 * Lokal ohne Datenbank: PGlite, eine eingebettete Postgres-Datei unter .orakel-db/.
 */
export function getDb(): Promise<Db> {
  if (!g.__orakelDb) g.__orakelDb = open();
  return g.__orakelDb;
}

async function open(): Promise<Db> {
  const url = process.env.ORAKEL_DATABASE_URL || process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const db = drizzle(neon(url), { schema });
    return db as unknown as Db;
  }
  if (process.env.VERCEL) {
    throw new Error("ORAKEL_DATABASE_URL fehlt. Auf Vercel braucht das Orakel eine Neon-Datenbank.");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const dir = process.env.ORAKEL_PGLITE_DIR || ".orakel-db";
  const client = new PGlite(dir);
  const db = drizzle(client, { schema });
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(db, { migrationsFolder: "drizzle/orakel" });
  return db as unknown as Db;
}
