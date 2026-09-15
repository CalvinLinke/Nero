import { fetchJson } from "../http";
import type { Coin } from "./kraken";

const BASE = "https://www.deribit.com/api/v2/public";

async function rpc<T>(method: string, params: Record<string, string | number>): Promise<T> {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const j = await fetchJson<{ result?: T; error?: { message: string } }>(`${BASE}/${method}?${qs}`, {
    timeoutMs: 15_000,
  });
  if (j.error) throw new Error(`Deribit ${method}: ${j.error.message}`);
  if (j.result === undefined) throw new Error(`Deribit ${method}: leere Antwort`);
  return j.result;
}

export interface OptionRow {
  name: string;
  expiryTs: number;
  strike: number;
  isCall: boolean;
  openInterest: number; // in Coin
  markIv: number; // Prozent
  markPrice: number; // in Coin
  underlying: number;
  volumeUsd: number;
}

/** Komplette Optionskette mit Open Interest und Mark-IV in einem Aufruf. */
export async function deribitOptions(coin: Coin): Promise<OptionRow[]> {
  type Raw = {
    instrument_name: string;
    open_interest: number;
    mark_iv: number;
    mark_price: number;
    underlying_price: number;
    volume_usd?: number;
  };
  const rows = await rpc<Raw[]>("get_book_summary_by_currency", { currency: coin, kind: "option" });
  return rows
    .map((r) => {
      const m = /^([A-Z]+)-(\d{1,2}[A-Z]{3}\d{2})-(\d+(?:d\d+)?)-([CP])$/.exec(r.instrument_name);
      if (!m) return null;
      return {
        name: r.instrument_name,
        expiryTs: parseDeribitDate(m[2]),
        strike: Number(m[3].replace("d", ".")),
        isCall: m[4] === "C",
        openInterest: r.open_interest,
        markIv: r.mark_iv,
        markPrice: r.mark_price,
        underlying: r.underlying_price,
        volumeUsd: r.volume_usd ?? 0,
      } satisfies OptionRow;
    })
    .filter((x): x is OptionRow => x !== null);
}

/** "27NOV26" → Zeitstempel des Verfalls, immer 08:00 UTC. */
export function parseDeribitDate(s: string): number {
  const m = /^(\d{1,2})([A-Z]{3})(\d{2})$/.exec(s);
  if (!m) return NaN;
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const mon = months.indexOf(m[2]);
  return Date.UTC(2000 + Number(m[3]), mon, Number(m[1]), 8, 0, 0);
}

export interface FutureRow { name: string; expiryTs: number | null; markPrice: number; index: number; openInterest: number; isPerp: boolean; funding8h?: number }

export async function deribitFutures(coin: Coin): Promise<FutureRow[]> {
  type Raw = {
    instrument_name: string;
    mark_price: number;
    estimated_delivery_price: number;
    open_interest: number;
    funding_8h?: number;
  };
  const rows = await rpc<Raw[]>("get_book_summary_by_currency", { currency: coin, kind: "future" });
  return rows.map((r) => {
    const isPerp = r.instrument_name.endsWith("PERPETUAL");
    const d = isPerp ? null : r.instrument_name.split("-")[1];
    return {
      name: r.instrument_name,
      expiryTs: d ? parseDeribitDate(d) : null,
      markPrice: r.mark_price,
      index: r.estimated_delivery_price,
      openInterest: r.open_interest,
      isPerp,
      funding8h: r.funding_8h,
    };
  });
}

export interface DvolPoint { ts: number; close: number }

/** DVOL-Tageswerte (Deribit-Volatilitätsindex) über den gewünschten Zeitraum. */
export async function deribitDvol(coin: Coin, days: number): Promise<DvolPoint[]> {
  const end = Date.now();
  const start = end - days * 86_400_000;
  const r = await rpc<{ data: number[][] }>("get_volatility_index_data", {
    currency: coin,
    start_timestamp: start,
    end_timestamp: end,
    resolution: "1D",
  });
  return r.data.map((d) => ({ ts: d[0], close: d[4] }));
}

export interface PerpTicker { markPrice: number; indexPrice: number; openInterestUsd: number; funding8h: number; currentFunding: number; volumeUsd: number }

export async function deribitPerp(coin: Coin): Promise<PerpTicker> {
  const r = await rpc<{
    mark_price: number;
    index_price: number;
    open_interest: number;
    funding_8h: number;
    current_funding: number;
    stats: { volume_usd: number };
  }>("ticker", { instrument_name: `${coin}-PERPETUAL` });
  return {
    markPrice: r.mark_price,
    indexPrice: r.index_price,
    openInterestUsd: r.open_interest,
    funding8h: r.funding_8h,
    currentFunding: r.current_funding,
    volumeUsd: r.stats.volume_usd,
  };
}
