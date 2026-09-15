import {
  pgSchema,
  text,
  timestamp,
  doublePrecision,
  jsonb,
  serial,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

/**
 * Eigenes Postgres-Schema "orakel", damit die Tabellen sauber von allem
 * anderen im Projekt getrennt bleiben.
 */
export const orakel = pgSchema("orakel");

/** Ein Lauf des Sammlers (stündlich, Cron oder manuell). */
export const runs = orakel.table("runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  trigger: text("trigger").notNull(), // "cron" | "manual" | "backfill"
  status: text("status").notNull().default("running"), // running | ok | partial | failed
  notes: jsonb("notes").$type<Record<string, unknown>>().notNull().default({}),
});

/**
 * Generischer Zeitreihenspeicher. Jeder Messwert bekommt einen Schlüssel
 * (z. B. "btc.price.usd.1d") und einen Zeitpunkt. Daraus rechnen wir
 * Perzentile über 365 Tage.
 */
export const series = orakel.table(
  "series",
  {
    key: text("key").notNull(),
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    value: doublePrecision("value").notNull(),
    source: text("source").notNull(),
  },
  (t) => [primaryKey({ columns: [t.key, t.ts] }), index("series_key_ts_idx").on(t.key, t.ts)],
);

/** Ergebnis eines Laufs je Coin: Rohdaten, Signale, Pegel. */
export const snapshots = orakel.table(
  "snapshots",
  {
    id: serial("id").primaryKey(),
    runId: integer("run_id").notNull(),
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    coin: text("coin").notNull(), // BTC | ETH
    context: jsonb("context").$type<Record<string, unknown>>().notNull(),
    signals: jsonb("signals").$type<Record<string, unknown>>().notNull(),
    pegel: jsonb("pegel").$type<Record<string, unknown>>().notNull(),
  },
  (t) => [index("snapshots_coin_ts_idx").on(t.coin, t.ts)],
);

/** Versendete Hinweise, damit nichts doppelt geht. */
export const alerts = orakel.table("alerts", {
  id: serial("id").primaryKey(),
  ts: timestamp("ts", { withTimezone: true }).notNull(),
  coin: text("coin"),
  kind: text("kind").notNull(), // warnung | gelegenheit | termin | stoerung
  dedupeKey: text("dedupe_key").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  sentTo: text("sent_to").notNull(),
});

/** Kleiner Schlüssel-Wert-Speicher, z. B. Lesezeiger für Liquidationen. */
export const state = orakel.table("state", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
