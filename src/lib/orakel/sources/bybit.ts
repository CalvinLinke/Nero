import { fetchJson } from "../http";
import type { Coin } from "./kraken";

const BASE = "https://api.bybit.com/v5/market";

async function bybit<T>(path: string): Promise<T> {
  const j = await fetchJson<{ retCode: number; retMsg: string; result: T }>(`${BASE}/${path}`, { timeoutMs: 12_000 });
  if (j.retCode !== 0) throw new Error(`Bybit ${path}: ${j.retMsg}`);
  return j.result;
}

export interface BybitTicker { last: number; openInterestCoin: number; openInterestUsd: number; fundingRate: number }

export async function bybitTicker(coin: Coin): Promise<BybitTicker> {
  const r = await bybit<{ list: Record<string, string>[] }>(`tickers?category=linear&symbol=${coin}USDT`);
  const t = r.list[0];
  return {
    last: Number(t.lastPrice),
    openInterestCoin: Number(t.openInterest),
    openInterestUsd: Number(t.openInterestValue),
    fundingRate: Number(t.fundingRate),
  };
}

export async function bybitFundingHistory(coin: Coin): Promise<{ ts: number; rate: number }[]> {
  const r = await bybit<{ list: { fundingRate: string; fundingRateTimestamp: string }[] }>(
    `funding/history?category=linear&symbol=${coin}USDT&limit=200`,
  );
  return r.list.map((x) => ({ ts: Number(x.fundingRateTimestamp), rate: Number(x.fundingRate) })).sort((a, b) => a.ts - b.ts);
}

export async function bybitAccountRatio(coin: Coin): Promise<{ ts: number; buy: number; sell: number }[]> {
  const r = await bybit<{ list: { buyRatio: string; sellRatio: string; timestamp: string }[] }>(
    `account-ratio?category=linear&symbol=${coin}USDT&period=1d&limit=200`,
  );
  return r.list.map((x) => ({ ts: Number(x.timestamp), buy: Number(x.buyRatio), sell: Number(x.sellRatio) })).sort((a, b) => a.ts - b.ts);
}
