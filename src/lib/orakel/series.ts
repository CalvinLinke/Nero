import { and, eq, gte, desc, sql } from "drizzle-orm";
import type { Db } from "./db/client";
import { series } from "./db/schema";

export interface Point { ts: number; value: number }

/** Schreibt Punkte einer Reihe, vorhandene Zeitpunkte werden überschrieben. */
export async function upsertSeries(db: Db, key: string, source: string, points: Point[]): Promise<number> {
  // Doppelte Zeitpunkte zusammenfassen (der letzte gewinnt), sonst lehnt Postgres das Upsert ab.
  const byTs = new Map<number, number>();
  for (const p of points) if (Number.isFinite(p.value) && Number.isFinite(p.ts)) byTs.set(p.ts, p.value);
  const rows = [...byTs.entries()].map(([ts, value]) => ({ key, ts: new Date(ts), value, source }));
  if (!rows.length) return 0;
  // In Blöcken, damit weder Neon noch PGlite zu große Anweisungen bekommen.
  for (let i = 0; i < rows.length; i += 500) {
    await db
      .insert(series)
      .values(rows.slice(i, i + 500))
      .onConflictDoUpdate({ target: [series.key, series.ts], set: { value: sql`excluded.value`, source: sql`excluded.source` } });
  }
  return rows.length;
}

/** Liest eine Reihe ab einem Zeitpunkt, aufsteigend sortiert. */
export async function readSeries(db: Db, key: string, sinceTs: number): Promise<Point[]> {
  const rows = await db
    .select({ ts: series.ts, value: series.value })
    .from(series)
    .where(and(eq(series.key, key), gte(series.ts, new Date(sinceTs))))
    .orderBy(series.ts);
  return rows.map((r) => ({ ts: r.ts.getTime(), value: r.value }));
}

export async function lastPoint(db: Db, key: string): Promise<Point | null> {
  const rows = await db
    .select({ ts: series.ts, value: series.value })
    .from(series)
    .where(eq(series.key, key))
    .orderBy(desc(series.ts))
    .limit(1);
  return rows.length ? { ts: rows[0].ts.getTime(), value: rows[0].value } : null;
}

/** Tageswert auf Mitternacht UTC runden, damit Tagesreihen deckungsgleich sind. */
export function dayTs(ts: number): number {
  return Math.floor(ts / 86_400_000) * 86_400_000;
}

export function isoDayTs(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

export const DAY = 86_400_000;
export const YEAR = 365 * DAY;
