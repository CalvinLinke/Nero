import { desc, eq } from "drizzle-orm";
import { getDb } from "./db/client";
import { runs, snapshots } from "./db/schema";
import { collectGlobal, collectCoin, hourTs, type CoinRaw, type GlobalRaw } from "./collect";
import { computeSignals, type SignalSet } from "./signals";
import { computePegel, type Pegel } from "./pegel";
import { upcomingEvents, type Event } from "./calendar";
import { upsertSeries, readSeries, DAY } from "./series";
import { deriveHinweise, sendHinweise, sendStoerung, type CoinResult } from "./notify";
import { atmIvAtDays, skew25 } from "./options";
import { round } from "./stats";
import type { Coin } from "./sources/kraken";

export const COINS: Coin[] = ["BTC", "ETH"];

export interface RunReport {
  runId: number;
  status: "ok" | "partial" | "failed";
  durationMs: number;
  errors: Record<string, string>;
  pegel: Record<string, Pegel>;
  mails: { sent: number; skipped: number };
}

/** Ein kompletter Lauf: sammeln, rechnen, speichern, benachrichtigen. */
export async function runOrakel(trigger: "cron" | "manual" | "backfill" = "manual"): Promise<RunReport> {
  const db = await getDb();
  const now = Date.now();
  const [run] = await db.insert(runs).values({ startedAt: new Date(now), trigger }).returning({ id: runs.id });
  const errors: Record<string, string> = {};

  let global: GlobalRaw;
  try {
    global = await collectGlobal(db, now);
    Object.assign(errors, prefix("global", global.errors));
  } catch (e) {
    global = { fred: {}, errors: {} };
    errors["global"] = msg(e);
  }

  const results: CoinResult[] = [];
  const pegelOut: Record<string, Pegel> = {};
  let events: Event[] = [];
  const shared: Parameters<typeof collectCoin>[3] = {};

  for (const coin of COINS) {
    try {
      const raw = await collectCoin(db, coin, now, shared);
      Object.assign(errors, prefix(coin, raw.errors));
      const signals = await computeSignals(db, raw, global, now);
      await storeDerived(db, raw, signals, now);
      const coinEvents = upcomingEvents(now, raw.options);
      if (coin === "BTC") events = coinEvents;
      const pegel = computePegel(signals.spannung, signals.neigung, coinEvents, now);
      const context = buildContext(raw, global, signals, coinEvents);
      await db.insert(snapshots).values({ runId: run.id, ts: new Date(now), coin, context, signals: signals as unknown as Record<string, unknown>, pegel: pegel as unknown as Record<string, unknown> });
      await upsertSeries(db, `${coin.toLowerCase()}.pegel.spannung.1h`, "orakel", [{ ts: hourTs(now), value: pegel.spannung.score }]);
      await upsertSeries(db, `${coin.toLowerCase()}.pegel.neigung.1h`, "orakel", [{ ts: hourTs(now), value: pegel.neigung.wert }]);
      const prev = await readSeries(db, `${coin.toLowerCase()}.pegel.spannung.1h`, now - DAY - 3_600_000);
      const prevSpannung = prev.length > 1 ? prev[0].value : undefined;
      results.push({ coin, pegel, signals, priceEur: raw.tickerEur?.last, prevSpannung });
      pegelOut[coin] = pegel;
    } catch (e) {
      errors[`${coin}.lauf`] = msg(e);
    }
  }

  let mails = { sent: 0, skipped: 0 };
  try {
    const hinweise = deriveHinweise(results, events, now);
    mails = await sendHinweise(db, hinweise, now, dashboardUrl());
  } catch (e) {
    errors["mail"] = msg(e);
  }

  const failedCoins = COINS.filter((c) => errors[`${c}.lauf`]);
  const status: RunReport["status"] = failedCoins.length === COINS.length ? "failed" : Object.keys(errors).length ? "partial" : "ok";
  if (status === "failed") {
    try {
      await sendStoerung(db, `Lauf ${run.id} fehlgeschlagen.\n${Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join("\n")}`, now);
    } catch (e) {
      errors["stoerungsmail"] = msg(e);
    }
  }
  await db.update(runs).set({ finishedAt: new Date(), status, notes: { errors, mails } }).where(eq(runs.id, run.id));
  return { runId: run.id, status, durationMs: Date.now() - now, errors, pegel: pegelOut, mails };
}

/** Stündliche Ableitungen aus der Optionskette speichern, damit Perzentile wachsen können. */
async function storeDerived(db: Awaited<ReturnType<typeof getDb>>, raw: CoinRaw, signals: SignalSet, now: number) {
  const c = raw.coin.toLowerCase();
  const ts = hourTs(now);
  const iv7 = atmIvAtDays(signals.expiries, 7);
  const iv30 = atmIvAtDays(signals.expiries, 30);
  if (Number.isFinite(iv7) && Number.isFinite(iv30) && iv30 > 0) {
    await upsertSeries(db, `${c}.iv.atm7.1h`, "deribit", [{ ts, value: iv7 }]);
    await upsertSeries(db, `${c}.iv.atm30.1h`, "deribit", [{ ts, value: iv30 }]);
    await upsertSeries(db, `${c}.iv.term.1h`, "deribit", [{ ts, value: iv7 / iv30 }]);
  }
  const sk = raw.options?.length ? skew25(raw.options, signals.expiries, 30, now) : null;
  if (sk) await upsertSeries(db, `${c}.skew25.30d.1h`, "deribit", [{ ts, value: sk.skewRel }]);
  const putOi = signals.expiries.reduce((a, e) => a + e.putOi, 0);
  const callOi = signals.expiries.reduce((a, e) => a + e.callOi, 0);
  if (callOi > 0) await upsertSeries(db, `${c}.pcr.oi.1h`, "deribit", [{ ts, value: putOi / callOi }]);
}

/** Kontextdaten für die Seite (alles, was nicht in die Pegel eingeht, aber Jörg sehen will). */
export type Context = ReturnType<typeof buildContext>;

function buildContext(raw: CoinRaw, global: GlobalRaw, signals: SignalSet, events: Event[]) {
  const spot = raw.tickerUsd?.last ?? NaN;
  const closes = raw.candlesUsd ?? [];
  const closedDays = closes.filter((k) => k.ts < Date.now() - (Date.now() % DAY));
  const px = (daysAgo: number) => closedDays[closedDays.length - daysAgo]?.close;
  const nextWeekly = signals.expiries.find((e) => new Date(e.expiryTs).getUTCDay() === 5) ?? signals.expiries[0];
  const nextMonthly = signals.expiries.filter((e) => e.notionalUsd >= 3e9).sort((a, b) => b.notionalUsd - a.notionalUsd)[0];
  const fx = global.fx?.usdEur;
  const oiOkx = raw.okxOi?.oiUsd;
  return {
    preis: {
      usd: spot,
      eur: raw.tickerEur?.last ?? (fx ? spot * fx : NaN),
      aenderung24h: raw.simple?.change24h ?? null,
      aenderung7d: px(7) ? round((spot / px(7)! - 1) * 100, 2) : null,
      aenderung30d: px(30) ? round((spot / px(30)! - 1) * 100, 2) : null,
      hoch7d: closedDays.slice(-7).reduce((a, k) => Math.max(a, k.high), 0),
      tief7d: closedDays.slice(-7).reduce((a, k) => Math.min(a, k.low), Infinity),
      ma200: closedDays.length >= 200 ? round(closedDays.slice(-200).reduce((a, k) => a + k.close, 0) / 200, 0) : null,
      marktkapUsd: raw.simple?.marketCapUsd ?? null,
      volumen24hUsd: raw.simple && raw.simple.volume24hUsd < 1e13 ? raw.simple.volume24hUsd : null,
    },
    optionen: {
      naechsterVerfall: nextWeekly ? expiryView(nextWeekly) : null,
      groessterVerfall: nextMonthly ? expiryView(nextMonthly) : null,
      verfaelle: signals.expiries.slice(0, 8).map(expiryView),
      putCallOi: (() => {
        const p = signals.expiries.reduce((a, e) => a + e.putOi, 0);
        const c = signals.expiries.reduce((a, e) => a + e.callOi, 0);
        return c > 0 ? round(p / c, 2) : null;
      })(),
      gesamtOiUsd: signals.expiries.reduce((a, e) => a + e.notionalUsd, 0),
    },
    positionierung: {
      oiOkxUsd: oiOkx ?? null,
      oiBybitUsd: raw.bybit?.openInterestUsd ?? null,
      oiDeribitUsd: raw.perp?.openInterestUsd ?? null,
      fundingOkx8h: raw.okxFunding?.rate ?? null,
      fundingBybit8h: raw.bybit?.fundingRate ?? null,
      fundingDeribit8h: raw.perp?.funding8h ?? null,
      longShortOkx: raw.okxLongShort ?? null,
      longAnteilBybit: raw.bybitLongRatio ?? null,
      takerBuyUsd: raw.okxTaker?.buy ?? null,
      takerSellUsd: raw.okxTaker?.sell ?? null,
      liquidationen24h: raw.liquidations24h ?? null,
      basis: raw.okxFuture ? { kontrakt: raw.okxFuture.instId, jahresrate: round(raw.okxFuture.basisAnnual, 2), resttage: Math.round(raw.okxFuture.daysToExpiry) } : null,
    },
    makro: {
      zins2j: global.fred.DGS2 ?? null,
      zins10j: global.fred.DGS10 ?? null,
      fedFunds: global.fred.DFF ?? null,
      dollarIndex: global.fred.DTWEXBGS ?? null,
      usdEur: global.fx?.usdEur ?? null,
      usdJpy: global.fx?.usdJpy ?? null,
      fxDatum: global.fx?.date ?? null,
      fearGreed: global.fng ?? null,
      stablecoins: global.stable ? { usdtMrd: round(global.stable.usdt / 1e9, 1), usdcMrd: round(global.stable.usdc / 1e9, 1), usdtWoche: round((global.stable.usdt / global.stable.usdtPrevWeek - 1) * 100, 2), usdcWoche: round((global.stable.usdc / global.stable.usdcPrevWeek - 1) * 100, 2) } : null,
      btcGebuehren: global.fees ?? null,
      ethGestaktMio: global.ethStaked ? round(global.ethStaked / 1e6, 2) : null,
    },
    etf: raw.etf?.length
      ? {
          letzterTag: raw.etf[raw.etf.length - 1].date,
          letzterFlowMio: round(raw.etf[raw.etf.length - 1].netInflowUsd / 1e6, 1),
          summe5dMio: round(raw.etf.slice(-5).reduce((a, e) => a + e.netInflowUsd, 0) / 1e6, 1),
          summe30dMio: round(raw.etf.slice(-22).reduce((a, e) => a + e.netInflowUsd, 0) / 1e6, 1),
          vermoegenMrd: round(raw.etf[raw.etf.length - 1].netAssetsUsd / 1e9, 2),
          verlauf: raw.etf.slice(-30).map((e) => ({ d: e.date, m: round(e.netInflowUsd / 1e6, 1) })),
        }
      : null,
    termine: events.map((e) => ({ art: e.kind, label: e.label, ts: e.ts, stunden: round(e.hoursAway, 1), notionalMrd: e.notionalUsd ? round(e.notionalUsd / 1e9, 2) : null })),
    quellenFehler: raw.errors,
  };
}

function expiryView(e: SignalSet["expiries"][number]) {
  return {
    ts: e.expiryTs,
    tage: round(e.daysToExpiry, 1),
    atmIv: round(e.atmIv, 1),
    maxPain: e.maxPain,
    putWall: e.putWall,
    callWall: e.callWall,
    putCall: e.callOi > 0 ? round(e.putOi / e.callOi, 2) : null,
    notionalMrd: round(e.notionalUsd / 1e9, 2),
  };
}

export function dashboardUrl(): string {
  const base = process.env.ORAKEL_PUBLIC_URL || "https://nero-familienbesitz.de";
  const token = process.env.ORAKEL_TOKEN;
  return token ? `${base}/orakel/zugang/${token}` : `${base}/orakel`;
}

export async function latestSnapshots() {
  const db = await getDb();
  const out: Record<string, typeof snapshots.$inferSelect> = {};
  for (const coin of COINS) {
    const rows = await db.select().from(snapshots).where(eq(snapshots.coin, coin)).orderBy(desc(snapshots.ts)).limit(1);
    if (rows[0]) out[coin] = rows[0];
  }
  return out;
}

function prefix(p: string, errs: Record<string, string>) {
  return Object.fromEntries(Object.entries(errs).map(([k, v]) => [`${p}.${k}`, v]));
}
function msg(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}
