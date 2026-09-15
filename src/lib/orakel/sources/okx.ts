import { fetchJson } from "../http";
import type { Coin } from "./kraken";

const BASE = "https://www.okx.com/api/v5";

async function okx<T>(path: string): Promise<T> {
  const j = await fetchJson<{ code: string; msg: string; data: T }>(`${BASE}/${path}`, { timeoutMs: 15_000 });
  if (j.code !== "0") throw new Error(`OKX ${path}: ${j.msg || j.code}`);
  return j.data;
}

const swap = (c: Coin) => `${c}-USDT-SWAP`;

export interface FundingPoint { ts: number; rate: number }

export async function okxFundingCurrent(coin: Coin): Promise<{ rate: number; next: number; ts: number }> {
  const d = await okx<{ fundingRate: string; nextFundingRate: string; fundingTime: string }[]>(
    `public/funding-rate?instId=${swap(coin)}`,
  );
  return { rate: Number(d[0].fundingRate), next: Number(d[0].nextFundingRate), ts: Number(d[0].fundingTime) };
}

/** Funding-Historie, blättert rückwärts, bis nichts mehr kommt oder maxPages erreicht ist. */
export async function okxFundingHistory(coin: Coin, maxPages = 12): Promise<FundingPoint[]> {
  const out: FundingPoint[] = [];
  let after = "";
  for (let i = 0; i < maxPages; i++) {
    const d = await okx<{ fundingRate: string; fundingTime: string }[]>(
      `public/funding-rate-history?instId=${swap(coin)}&limit=100${after ? `&after=${after}` : ""}`,
    );
    if (!d.length) break;
    for (const r of d) out.push({ ts: Number(r.fundingTime), rate: Number(r.fundingRate) });
    after = d[d.length - 1].fundingTime;
    if (d.length < 100) break;
  }
  return out.sort((a, b) => a.ts - b.ts);
}

export async function okxOpenInterest(coin: Coin): Promise<{ oiCoin: number; oiUsd: number; ts: number }> {
  const d = await okx<{ oiCcy: string; oiUsd: string; ts: string }[]>(
    `public/open-interest?instType=SWAP&instId=${swap(coin)}`,
  );
  return { oiCoin: Number(d[0].oiCcy), oiUsd: Number(d[0].oiUsd), ts: Number(d[0].ts) };
}

export interface OiVolPoint { ts: number; oiUsd: number; volUsd: number }

/** Offenes Interesse und Volumen aller OKX-Kontrakte je Tag, ca. 180 Tage. */
export async function okxOiVolumeHistory(coin: Coin): Promise<OiVolPoint[]> {
  const d = await okx<string[][]>(`rubik/stat/contracts/open-interest-volume?ccy=${coin}&period=1D`);
  return d.map((r) => ({ ts: Number(r[0]), oiUsd: Number(r[1]), volUsd: Number(r[2]) })).sort((a, b) => a.ts - b.ts);
}

export async function okxLongShortRatio(coin: Coin): Promise<{ ts: number; ratio: number }[]> {
  const d = await okx<string[][]>(`rubik/stat/contracts/long-short-account-ratio?ccy=${coin}&period=1D`);
  return d.map((r) => ({ ts: Number(r[0]), ratio: Number(r[1]) })).sort((a, b) => a.ts - b.ts);
}

export async function okxTakerVolume(coin: Coin): Promise<{ ts: number; sell: number; buy: number }[]> {
  const d = await okx<string[][]>(`rubik/stat/taker-volume?ccy=${coin}&instType=CONTRACTS&period=1D`);
  return d.map((r) => ({ ts: Number(r[0]), sell: Number(r[1]), buy: Number(r[2]) })).sort((a, b) => a.ts - b.ts);
}

export interface Liquidation { ts: number; side: "long" | "short"; usd: number; price: number }

/** Jüngste Liquidationen des USDT-Perpetuals (Kontraktgröße 0,01 BTC bzw. 0,1 ETH). */
export async function okxLiquidations(coin: Coin): Promise<Liquidation[]> {
  const size = coin === "BTC" ? 0.01 : 0.1;
  const d = await okx<{ details: { posSide: string; sz: string; bkPx: string; ts: string }[] }[]>(
    `public/liquidation-orders?instType=SWAP&uly=${coin}-USDT&state=filled&limit=100`,
  );
  const out: Liquidation[] = [];
  for (const g of d) {
    for (const x of g.details) {
      const price = Number(x.bkPx);
      out.push({ ts: Number(x.ts), side: x.posSide === "long" ? "long" : "short", usd: Number(x.sz) * size * price, price });
    }
  }
  return out.sort((a, b) => a.ts - b.ts);
}

export interface FutureTicker { instId: string; last: number; expiryTs: number; alias: string }

/** Coin-Margin-Futures samt Verfall, für die Basisrechnung. */
export async function okxFutures(coin: Coin): Promise<{ futures: FutureTicker[]; index: number }> {
  const [inst, tick, idx] = await Promise.all([
    okx<{ instId: string; expTime: string; alias: string }[]>(`public/instruments?instType=FUTURES&uly=${coin}-USD`),
    okx<{ instId: string; last: string }[]>(`market/tickers?instType=FUTURES&uly=${coin}-USD`),
    okx<{ idxPx: string }[]>(`market/index-tickers?instId=${coin}-USD`),
  ]);
  const last = new Map(tick.map((t) => [t.instId, Number(t.last)]));
  const futures = inst
    .filter((i) => /^[A-Z]+-USD-\d{6}$/.test(i.instId) && last.has(i.instId))
    .map((i) => ({ instId: i.instId, last: last.get(i.instId)!, expiryTs: Number(i.expTime), alias: i.alias }));
  return { futures, index: Number(idx[0].idxPx) };
}
