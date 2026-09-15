import type { Db } from "./db/client";
import { settle } from "./http";
import { upsertSeries, dayTs, isoDayTs, lastPoint, DAY } from "./series";
import { krakenDaily, krakenTicker, type Coin, type Candle } from "./sources/kraken";
import { coingeckoMarketChart, coingeckoSimple, type SimplePrice } from "./sources/coingecko";
import { fxLatest, fxHistory, type Fx } from "./sources/fx";
import { deribitOptions, deribitFutures, deribitDvol, deribitPerp, type OptionRow, type FutureRow, type PerpTicker } from "./sources/deribit";
import {
  okxFundingCurrent,
  okxFundingHistory,
  okxOpenInterest,
  okxOiVolumeHistory,
  okxLongShortRatio,
  okxTakerVolume,
  okxLiquidations,
  okxFutures,
} from "./sources/okx";
import { bybitTicker, bybitFundingHistory, bybitAccountRatio } from "./sources/bybit";
import { sosovalueFlows, type EtfFlow } from "./sources/sosovalue";
import { fredSeries } from "./sources/fred";
import { fearGreed, stablecoinSupply, mempoolFees, ethStaked, type Stablecoins } from "./sources/misc";

/** Alles, was ein Lauf für einen Coin frisch geholt hat (im Speicher, für Signale und Kontext). */
export interface CoinRaw {
  coin: Coin;
  candlesUsd?: Candle[];
  tickerUsd?: { last: number; volume24h: number };
  tickerEur?: { last: number };
  simple?: SimplePrice;
  options?: OptionRow[];
  futures?: FutureRow[];
  perp?: PerpTicker;
  okxFunding?: { rate: number; next: number; ts: number };
  okxOi?: { oiCoin: number; oiUsd: number };
  okxLongShort?: number;
  okxTaker?: { buy: number; sell: number };
  okxFuture?: { instId: string; basisAnnual: number; daysToExpiry: number; index: number };
  bybit?: { openInterestUsd: number; fundingRate: number };
  bybitLongRatio?: number;
  liquidations24h?: { longUsd: number; shortUsd: number; count: number };
  etf?: EtfFlow[];
  errors: Record<string, string>;
}

export interface GlobalRaw {
  fx?: Fx;
  fred: Record<string, { date: string; value: number } | undefined>;
  fng?: { value: number; label: string };
  stable?: Stablecoins;
  fees?: { fastest: number; hour: number; economy: number };
  ethStaked?: number;
  errors: Record<string, string>;
}

const FRED_IDS = ["DGS2", "DGS10", "DFF", "DTWEXBGS"] as const;

/** Globale Daten (Makro, FX, Stimmung), einmal je Lauf. */
export async function collectGlobal(db: Db, now: number): Promise<GlobalRaw> {
  const needFxBackfill = !(await lastPoint(db, "fx.usdeur.1d"));
  const r = await settle({
    fx: fxLatest(),
    fxHist: needFxBackfill ? fxHistory(new Date(now - 400 * DAY).toISOString().slice(0, 10)) : Promise.resolve([] as Fx[]),
    dgs2: fredSeries("DGS2"),
    dgs10: fredSeries("DGS10"),
    dff: fredSeries("DFF"),
    dollar: fredSeries("DTWEXBGS"),
    fng: fearGreed(400),
    stable: stablecoinSupply(),
    fees: mempoolFees(),
    ethStaked: ethStaked(),
  });
  const out: GlobalRaw = { fred: {}, errors: r.errors };

  if (r.fx) {
    out.fx = r.fx;
    await upsertSeries(db, "fx.usdeur.1d", "frankfurter", [{ ts: isoDayTs(r.fx.date), value: r.fx.usdEur }]);
    await upsertSeries(db, "fx.usdjpy.1d", "frankfurter", [{ ts: isoDayTs(r.fx.date), value: r.fx.usdJpy }]);
  }
  if (r.fxHist?.length) {
    await upsertSeries(db, "fx.usdeur.1d", "frankfurter", r.fxHist.map((f) => ({ ts: isoDayTs(f.date), value: f.usdEur })));
    await upsertSeries(db, "fx.usdjpy.1d", "frankfurter", r.fxHist.map((f) => ({ ts: isoDayTs(f.date), value: f.usdJpy })));
  }
  const fredMap = { DGS2: r.dgs2, DGS10: r.dgs10, DFF: r.dff, DTWEXBGS: r.dollar } as const;
  for (const id of FRED_IDS) {
    const s = fredMap[id];
    if (!s) continue;
    const recent = s.slice(-450);
    await upsertSeries(db, `us.${id.toLowerCase()}.1d`, "fred", recent.map((p) => ({ ts: isoDayTs(p.date), value: p.value })));
    out.fred[id] = s[s.length - 1];
  }
  if (r.fng?.length) {
    await upsertSeries(db, "fng.1d", "alternative.me", r.fng.map((p) => ({ ts: dayTs(p.ts), value: p.value })));
    const last = r.fng[r.fng.length - 1];
    out.fng = { value: last.value, label: last.label };
  }
  if (r.stable) {
    out.stable = r.stable;
    await upsertSeries(db, "stable.usdt.usd.1d", "defillama", [{ ts: dayTs(now), value: r.stable.usdt }]);
    await upsertSeries(db, "stable.usdc.usd.1d", "defillama", [{ ts: dayTs(now), value: r.stable.usdc }]);
  }
  if (r.fees) out.fees = r.fees;
  if (r.ethStaked) out.ethStaked = r.ethStaked;
  return out;
}

/** Alle Daten eines Coins holen und die Zeitreihen fortschreiben. */
export async function collectCoin(db: Db, coin: Coin, now: number, shared: { simple?: Record<Coin, SimplePrice> } = {}): Promise<CoinRaw> {
  const c = coin.toLowerCase();
  // CoinGecko drosselt streng: Marktkapitalisierung nur nachladen, wenn der heutige Tageswert fehlt.
  const mcapLast = await lastPoint(db, `${c}.mcap.usd.1d`);
  const needMcap = !mcapLast || mcapLast.ts < dayTs(now);
  const fundingKey = `${c}.funding.okx.8h`;
  const fundingLast = await lastPoint(db, fundingKey);
  // Rückwärts blättern nur beim ersten Mal, danach reicht eine Seite (100 Werte = 33 Tage).
  const fundingPages = fundingLast ? 1 : 12;

  const r = await settle({
    candlesUsd: krakenDaily(coin, "USD"),
    candlesEur: krakenDaily(coin, "EUR"),
    tickerUsd: krakenTicker(coin, "USD"),
    tickerEur: krakenTicker(coin, "EUR"),
    mcap: needMcap ? coingeckoMarketChart(coin) : Promise.resolve([]),
    simple: shared.simple ? Promise.resolve(shared.simple) : coingeckoSimple(),
    options: deribitOptions(coin),
    futures: deribitFutures(coin),
    dvol: deribitDvol(coin, 400),
    perp: deribitPerp(coin),
    okxFunding: okxFundingCurrent(coin),
    okxFundingHist: okxFundingHistory(coin, fundingPages),
    okxOi: okxOpenInterest(coin),
    okxOiHist: okxOiVolumeHistory(coin),
    okxLs: okxLongShortRatio(coin),
    okxTaker: okxTakerVolume(coin),
    okxLiq: okxLiquidations(coin),
    okxFut: okxFutures(coin),
    bybit: bybitTicker(coin),
    bybitFunding: bybitFundingHistory(coin),
    bybitRatio: bybitAccountRatio(coin),
    etf: sosovalueFlows(coin),
  });

  const out: CoinRaw = { coin, errors: r.errors };

  // Preise
  if (r.candlesUsd?.length) {
    out.candlesUsd = r.candlesUsd;
    await upsertSeries(db, `${c}.close.usd.1d`, "kraken", r.candlesUsd.map((k) => ({ ts: k.ts, value: k.close })));
    await upsertSeries(db, `${c}.volume.usd.1d`, "kraken", r.candlesUsd.map((k) => ({ ts: k.ts, value: k.volume * k.close })));
  }
  if (r.candlesEur?.length) {
    await upsertSeries(db, `${c}.close.eur.1d`, "kraken", r.candlesEur.map((k) => ({ ts: k.ts, value: k.close })));
  }
  if (r.tickerUsd) {
    out.tickerUsd = { last: r.tickerUsd.last, volume24h: r.tickerUsd.volume24h };
    await upsertSeries(db, `${c}.close.usd.1h`, "kraken", [{ ts: hourTs(now), value: r.tickerUsd.last }]);
  }
  if (r.tickerEur) {
    out.tickerEur = { last: r.tickerEur.last };
    await upsertSeries(db, `${c}.close.eur.1h`, "kraken", [{ ts: hourTs(now), value: r.tickerEur.last }]);
  }
  if (r.mcap?.length) {
    await upsertSeries(db, `${c}.mcap.usd.1d`, "coingecko", r.mcap.map((m) => ({ ts: dayTs(m.ts), value: m.marketCapUsd })));
  }
  if (r.simple) {
    out.simple = r.simple[coin];
    shared.simple = r.simple;
  }

  // Optionen und Volatilität
  if (r.options?.length) out.options = r.options;
  if (r.futures?.length) out.futures = r.futures;
  if (r.dvol?.length) {
    await upsertSeries(db, `${c}.dvol.1d`, "deribit", r.dvol.map((d) => ({ ts: dayTs(d.ts), value: d.close })));
  }
  if (r.perp) out.perp = r.perp;

  // Positionierung
  if (r.okxFunding) out.okxFunding = r.okxFunding;
  if (r.okxFundingHist?.length) {
    await upsertSeries(db, fundingKey, "okx", r.okxFundingHist.map((f) => ({ ts: f.ts, value: f.rate })));
  }
  if (r.bybitFunding?.length) {
    await upsertSeries(db, `${c}.funding.bybit.8h`, "bybit", r.bybitFunding.map((f) => ({ ts: f.ts, value: f.rate })));
  }
  if (r.okxOi) out.okxOi = { oiCoin: r.okxOi.oiCoin, oiUsd: r.okxOi.oiUsd };
  if (r.okxOiHist?.length) {
    await upsertSeries(db, `${c}.oi.okx.usd.1d`, "okx", r.okxOiHist.map((p) => ({ ts: dayTs(p.ts), value: p.oiUsd })));
    await upsertSeries(db, `${c}.vol.okx.usd.1d`, "okx", r.okxOiHist.map((p) => ({ ts: dayTs(p.ts), value: p.volUsd })));
  }
  if (r.okxLs?.length) {
    out.okxLongShort = r.okxLs[r.okxLs.length - 1].ratio;
    await upsertSeries(db, `${c}.ls.okx.1d`, "okx", r.okxLs.map((p) => ({ ts: dayTs(p.ts), value: p.ratio })));
  }
  if (r.okxTaker?.length) {
    const t = r.okxTaker[r.okxTaker.length - 1];
    out.okxTaker = { buy: t.buy, sell: t.sell };
  }
  if (r.bybit) out.bybit = { openInterestUsd: r.bybit.openInterestUsd, fundingRate: r.bybit.fundingRate };
  if (r.bybitRatio?.length) out.bybitLongRatio = r.bybitRatio[r.bybitRatio.length - 1].buy;

  // Aggregiertes offenes Interesse (OKX-Swap + Bybit + Deribit-Perpetual), stündlich
  const oiParts = [r.okxOi?.oiUsd, r.bybit?.openInterestUsd, r.perp?.openInterestUsd].filter(
    (x): x is number => typeof x === "number" && Number.isFinite(x),
  );
  if (oiParts.length === 3) {
    await upsertSeries(db, `${c}.oi.agg.usd.1h`, "okx+bybit+deribit", [{ ts: hourTs(now), value: oiParts.reduce((a, b) => a + b, 0) }]);
  }

  // Liquidationen: OKX liefert nur die jüngsten; wir summieren je Stunde und behalten je Stunde das Maximum.
  if (r.okxLiq?.length) {
    const buckets = new Map<number, { long: number; short: number }>();
    for (const l of r.okxLiq) {
      const b = hourTs(l.ts);
      const cur = buckets.get(b) ?? { long: 0, short: 0 };
      if (l.side === "long") cur.long += l.usd;
      else cur.short += l.usd;
      buckets.set(b, cur);
    }
    const longPts: { ts: number; value: number }[] = [];
    const shortPts: { ts: number; value: number }[] = [];
    for (const [ts, v] of buckets) {
      longPts.push({ ts, value: v.long });
      shortPts.push({ ts, value: v.short });
    }
    await upsertMax(db, `${c}.liq.okx.long.usd.1h`, longPts);
    await upsertMax(db, `${c}.liq.okx.short.usd.1h`, shortPts);
    const since = now - DAY;
    const last24 = r.okxLiq.filter((l) => l.ts >= since);
    out.liquidations24h = {
      longUsd: last24.filter((l) => l.side === "long").reduce((a, b) => a + b.usd, 0),
      shortUsd: last24.filter((l) => l.side === "short").reduce((a, b) => a + b.usd, 0),
      count: last24.length,
    };
  }

  // Basis der Quartalsfutures (OKX, Ziel ca. 90 Tage Restlaufzeit)
  if (r.okxFut?.futures.length) {
    const target = now + 90 * DAY;
    const f = [...r.okxFut.futures].sort((a, b) => Math.abs(a.expiryTs - target) - Math.abs(b.expiryTs - target))[0];
    const days = (f.expiryTs - now) / DAY;
    if (days > 7) {
      const basisAnnual = ((f.last / r.okxFut.index - 1) * 365) / days * 100;
      out.okxFuture = { instId: f.instId, basisAnnual, daysToExpiry: days, index: r.okxFut.index };
      await upsertSeries(db, `${c}.basis.okx.1h`, "okx", [{ ts: hourTs(now), value: basisAnnual }]);
    }
  }

  // ETF-Flows
  if (r.etf?.length) {
    out.etf = r.etf;
    await upsertSeries(db, `${c}.etf.netflow.usd.1d`, "sosovalue", r.etf.map((e) => ({ ts: isoDayTs(e.date), value: e.netInflowUsd })));
    await upsertSeries(db, `${c}.etf.aum.usd.1d`, "sosovalue", r.etf.map((e) => ({ ts: isoDayTs(e.date), value: e.netAssetsUsd })));
  }

  return out;
}

export function hourTs(ts: number): number {
  return Math.floor(ts / 3_600_000) * 3_600_000;
}

/** Wie upsertSeries, aber ein vorhandener Wert wird nur erhöht, nie verkleinert. */
async function upsertMax(db: Db, key: string, points: { ts: number; value: number }[]) {
  const { readSeries } = await import("./series");
  if (!points.length) return;
  const minTs = Math.min(...points.map((p) => p.ts));
  const existing = new Map((await readSeries(db, key, minTs)).map((p) => [p.ts, p.value]));
  const merged = points.map((p) => ({ ts: p.ts, value: Math.max(p.value, existing.get(p.ts) ?? 0) }));
  await upsertSeries(db, key, "okx", merged);
}
