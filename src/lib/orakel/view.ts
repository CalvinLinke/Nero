import { desc, eq } from "drizzle-orm";
import { getDb } from "./db/client";
import { runs, snapshots } from "./db/schema";
import { readSeries, DAY } from "./series";
import type { Context } from "./run";
import type { SignalSet } from "./signals";
import type { Pegel } from "./pegel";
import { COINS } from "./run";

export interface CoinView {
  coin: "BTC" | "ETH";
  ts: number;
  context: Context;
  signals: SignalSet;
  pegel: Pegel;
  historie: { spannung: { ts: number; value: number }[]; neigung: { ts: number; value: number }[]; preisEur: { ts: number; value: number }[] };
}

export interface DashboardData {
  coins: CoinView[];
  letzterLauf: { ts: number; status: string; errors: Record<string, string> } | null;
}

/** Alles, was die Seite braucht, aus der Datenbank. Keine externen Aufrufe. */
export async function loadDashboard(days = 90): Promise<DashboardData> {
  const db = await getDb();
  const since = Date.now() - days * DAY;
  const coins: CoinView[] = [];
  for (const coin of COINS) {
    const [snap] = await db.select().from(snapshots).where(eq(snapshots.coin, coin)).orderBy(desc(snapshots.ts)).limit(1);
    if (!snap) continue;
    const c = coin.toLowerCase();
    const [spannung, neigung, preisEur] = await Promise.all([
      readSeries(db, `${c}.pegel.spannung.1h`, since),
      readSeries(db, `${c}.pegel.neigung.1h`, since),
      readSeries(db, `${c}.close.eur.1h`, since),
    ]);
    coins.push({
      coin,
      ts: snap.ts.getTime(),
      context: snap.context as unknown as Context,
      signals: snap.signals as unknown as SignalSet,
      pegel: snap.pegel as unknown as Pegel,
      historie: { spannung, neigung, preisEur },
    });
  }
  const [run] = await db.select().from(runs).orderBy(desc(runs.startedAt)).limit(1);
  return {
    coins,
    letzterLauf: run ? { ts: run.startedAt.getTime(), status: run.status, errors: ((run.notes as { errors?: Record<string, string> })?.errors) ?? {} } : null,
  };
}
